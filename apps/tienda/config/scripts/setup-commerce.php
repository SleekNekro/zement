<?php

/**
 * Herramientas de venta (módulo zementcommerce, fase 1 del plan comercial):
 *
 * - Instala el módulo y lo engancha (miniaturas, ficha, portada, barra superior, rutas).
 * - Enlace «Profesionales» de la barra superior: sección de profesionales de la web en cada
 *   idioma (config/web-routes.php), guardado en ZEMENT_PROFESSIONALS_URL.
 * - Productos relacionados nativos (accesorios) que citan las fichas: malla entre capas,
 *   disolvente, imprimación, resina… (apps/tienda/catalog/commerce.json → related).
 * - Fase 2: datos de empresa para la barra de confianza (config/company.php → ZEMENT_COMPANY)
 *   y grupos profesionales Aplicador y Distribuidor con precio sin IVA (ver ZEMENT_PRO_GROUPS).
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

// Datos de empresa para la barra de confianza (lo pendiente va a null y no se muestra).
$company = require __DIR__ . '/../company.php';

// Aviso de cookies: política de cookies de la web en cada idioma y Google Analytics 4.
$cookies = [];
foreach (Language::getLanguages(false) as $language) {
    $cookies[(int) $language['id_lang']] = $webUrl . ($webRoutes[$language['iso_code']] ?? $webRoutes['en'])['cookies'];
}
Configuration::updateValue('ZEMENT_COOKIES_URL', $cookies);
Configuration::updateValue('ZEMENT_GA4_ID', (string) ($company['ga4Id'] ?? ''));
echo '· aviso de cookies' . (empty($company['ga4Id']) ? ' (sin Google Analytics: TODO ga4Id)' : " con Google Analytics {$company['ga4Id']}") . "\n";
Configuration::updateValue('ZEMENT_COMPANY', json_encode($company, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
echo "· barra de confianza con los datos de config/company.php\n";

/*
 * Grupos profesionales. Ven el precio sin IVA y todo el catálogo; el descuento de cada grupo
 * es TODO (tarifa de Zement): hasta entonces, 0 %. Zement revisa cada alta profesional
 * (empresa y CIF) y asigna el grupo a mano en Clientes → Clientes.
 */
const ZEMENT_PRO_GROUPS = [
    'Aplicador' => [
        'es' => 'Aplicador', 'en' => 'Applicator', 'de' => 'Verarbeiter', 'fr' => 'Applicateur',
        'it' => 'Applicatore', 'pl' => 'Wykonawca', 'no' => 'Applikatør', 'fi' => 'Asentaja',
    ],
    'Distribuidor' => [
        'es' => 'Distribuidor', 'en' => 'Distributor', 'de' => 'Händler', 'fr' => 'Distributeur',
        'it' => 'Distributore', 'pl' => 'Dystrybutor', 'no' => 'Forhandler', 'fi' => 'Jälleenmyyjä',
    ],
];
$db = Db::getInstance();
$customerGroup = (int) Configuration::get('PS_CUSTOMER_GROUP');
$idEs = (int) Language::getIdByIso('es');

foreach (ZEMENT_PRO_GROUPS as $esName => $names) {
    $id = (int) $db->getValue('SELECT id_group FROM `' . _DB_PREFIX_ . "group_lang` WHERE id_lang = {$idEs} AND name = '" . pSQL($esName) . "'");
    $group = new Group($id ?: null);
    foreach (Language::getLanguages(false) as $language) {
        $group->name[(int) $language['id_lang']] = $names[$language['iso_code']] ?? $names['en'];
    }
    $group->price_display_method = PS_TAX_EXC;
    $group->show_prices = true;
    if (!$id) {
        $group->reduction = 0; // TODO: descuento de la tarifa profesional.
    }
    $group->save();
    $groupId = (int) $group->id;

    // Mismo acceso que los clientes: categorías, módulos (pagos incluidos) y transportistas.
    $db->execute('INSERT IGNORE INTO `' . _DB_PREFIX_ . "category_group` (id_category, id_group)
        SELECT id_category, {$groupId} FROM `" . _DB_PREFIX_ . "category_group` WHERE id_group = {$customerGroup}");
    $db->execute('INSERT IGNORE INTO `' . _DB_PREFIX_ . "module_group` (id_module, id_shop, id_group)
        SELECT id_module, id_shop, {$groupId} FROM `" . _DB_PREFIX_ . "module_group` WHERE id_group = {$customerGroup}");
    $db->execute('INSERT IGNORE INTO `' . _DB_PREFIX_ . "carrier_group` (id_carrier, id_group)
        SELECT id_carrier, {$groupId} FROM `" . _DB_PREFIX_ . "carrier_group` WHERE id_group = {$customerGroup}");

    echo ($id ? '= ' : '+ ') . "grupo {$esName} (id {$groupId}, precio sin IVA)\n";
}

Tools::clearSf2Cache();
Tools::clearSmartyCache();
echo "Herramientas de venta listas.\n";
