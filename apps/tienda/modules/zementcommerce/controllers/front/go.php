<?php

/**
 * Enlaces estables para la web de marca: /z/p/<clave> lleva a la ficha y /z/c/<familia> a la
 * familia, en el idioma de la URL. Los identificadores de PrestaShop cambian entre
 * instalaciones; las claves del catálogo, no.
 */

declare(strict_types=1);

class ZementCommerceGoModuleFrontController extends ModuleFrontController
{
    public function initContent(): void
    {
        $kind = (string) Tools::getValue('kind');
        $key = (string) Tools::getValue('key');
        /** @var ZementCommerce $module */
        $module = $this->module;
        $url = in_array($kind, ['p', 'c'], true) && preg_match('/^[a-z0-9-]+$/', $key)
            ? $module->stableUrl($kind, $key)
            : null;

        if ($url === null) {
            Tools::redirect('index.php?controller=404');
        }

        header('Cache-Control: no-cache');
        Tools::redirect($url, __PS_BASE_URI__, null, ['HTTP/1.1 302 Found']);
    }
}
