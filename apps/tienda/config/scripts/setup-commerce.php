<?php

/**
 * Herramientas de venta (módulo zementcommerce, fase 1 del plan comercial):
 *
 * - Instala el módulo y lo engancha (miniaturas, ficha, portada, barra superior, rutas).
 * - Enlace «Profesionales» de la barra superior: sección de profesionales de la web en cada
 *   idioma (config/web-routes.php), guardado en ZEMENT_PROFESSIONALS_URL.
 * - Productos relacionados nativos (accesorios) que citan las fichas: malla entre capas,
 *   disolvente, imprimación, resina… (apps/tienda/catalog/commerce.json → related).
 *
 * Antes: python3 apps/tienda/catalog/scripts/build_commerce.py (lo hace pnpm tienda:commerce).
 * Uso: pnpm tienda:commerce   (ZEMENT_WEB_URL=https://… para otra dirección de la web)
 */

declare(strict_types=1);

require '/var/www/html/config/config.inc.php';
require_once _PS_ROOT_DIR_ . '/app/AdminKernel.php';

// Instalar módulos usa el traductor de Symfony: en CLI hay que arrancar el núcleo.
global $kernel;
$kernel = new AdminKernel('prod', false);
$kernel->boot();

$webUrl = rtrim(getenv('ZEMENT_WEB_URL') ?: 'http://localhost:4321', '/');
$webRoutes = require __DIR__ . '/../web-routes.php';

$module = Module::getInstanceByName('zementcommerce');
if (!$module instanceof Module) {
    throw new RuntimeException('No encuentro el módulo zementcommerce (¿está montado en modules/? pnpm tienda:up).');
}

if (!Module::isInstalled('zementcommerce')) {
    $module->install() || throw new RuntimeException('No se pudo instalar zementcommerce.');
    echo "+ zementcommerce instalado\n";
}

foreach (ZementCommerce::HOOKS as $hook) {
    if (!$module->isRegisteredInHook($hook)) {
        $module->registerHook($hook);
        echo "+ enganchado a {$hook}\n";
    }
}

// «Profesionales» en la barra superior, a la derecha de «Contacte con nosotros».
$nav = (int) Hook::getIdByName('displayNav1');
$module->updatePosition($nav, true, 99);

$professionals = [];
foreach (Language::getLanguages(false) as $language) {
    $routes = $webRoutes[$language['iso_code']] ?? $webRoutes['en'];
    $professionals[(int) $language['id_lang']] = $webUrl . $routes['professionals'];
}
Configuration::updateValue('ZEMENT_PROFESSIONALS_URL', $professionals);
echo "· «Profesionales» → {$webUrl}{$webRoutes['es']['professionals']} (y el resto de idiomas)\n";

// Productos relacionados (accesorios nativos), por clave del catálogo (= URL amigable en español).
$data = json_decode((string) file_get_contents(_PS_MODULE_DIR_ . 'zementcommerce/data/commerce.json'), true, 512, JSON_THROW_ON_ERROR);
$ids = array_column(
    Db::getInstance()->executeS(
        'SELECT id_product, link_rewrite FROM `' . _DB_PREFIX_ . 'product_lang` WHERE id_lang = ' . (int) Language::getIdByIso('es')
    ),
    'id_product',
    'link_rewrite'
);

$count = 0;
foreach ($data['related'] as $key => $relatedKeys) {
    if (!isset($ids[$key])) {
        continue;
    }
    $product = new Product((int) $ids[$key]);
    $product->deleteAccessories();
    $accessories = array_values(array_filter(array_map(static fn (string $related) => $ids[$related] ?? null, $relatedKeys)));
    $product->changeAccessories(array_map('intval', $accessories));
    ++$count;
}
echo "· productos relacionados en {$count} fichas\n";

Tools::clearSf2Cache();
Tools::clearSmartyCache();
echo "Herramientas de venta listas.\n";
