<?php

/**
 * Instala en PrestaShop los idiomas de las fichas técnicas de Zement con sus paquetes oficiales
 * de traducción (interfaz de la tienda, correos y datos CLDR). Se descargan de PrestaShop.
 *
 * Uso: docker exec zement-prestashop-1 php /tmp/zement-catalog/scripts/install-languages.php
 */

declare(strict_types=1);

require '/var/www/html/config/config.inc.php';
require_once _PS_ROOT_DIR_ . '/app/AdminKernel.php';

// La instalación del paquete traduce las tablas *_lang con el traductor de Symfony:
// en CLI hay que arrancar el núcleo para que SymfonyContainer::getInstance() funcione.
global $kernel;
$kernel = new AdminKernel('prod', false);
$kernel->boot();

const ZEMENT_LANGUAGES = ['es', 'en', 'de', 'fr', 'it', 'pl', 'no', 'fi'];

foreach (ZEMENT_LANGUAGES as $iso) {
    $id = (int) Language::getIdByIso($iso, true);
    $locale = $id > 0 ? Language::getLocaleByIso($iso) : null;
    $hasPack = $locale !== null && is_dir(_PS_ROOT_DIR_ . '/translations/' . $locale);

    if ($id > 0 && $hasPack) {
        $language = new Language($id);
        if (!$language->active) {
            $language->active = true;
            $language->save();
        }
        echo "= {$iso} ya instalado (id {$id})\n";
        continue;
    }

    // Crea el idioma (si falta) e instala su paquete oficial de traducciones de la interfaz.
    $result = Language::downloadAndInstallLanguagePack($iso, _PS_VERSION_, null, true);

    if ($result !== true) {
        echo "! {$iso}: " . implode(' ', (array) $result) . "\n";
        continue;
    }

    echo "+ {$iso} instalado con su paquete de traducciones (id " . (int) Language::getIdByIso($iso, true) . ")\n";
}

Tools::clearSf2Cache();
