<?php

/**
 * Cuentas profesionales (módulo zementpro):
 *
 * - Instala el módulo (solicitudes, campos del alta, «Mi cuenta» y Clientes → Solicitudes
 *   profesionales en el panel) y lo engancha.
 * - Grupos Distribuidor y Aplicador: los crea setup-commerce.php (nombres, acceso y precio sin
 *   IVA); aquí se deja su descuento general al 0 % (el de la tarifa va en cada producto: ver
 *   config/pro.php) y se guarda qué grupo corresponde a cada tipo en ZEMENT_PRO_GROUPS.
 *
 * Uso: pnpm tienda:pro   (después de pnpm tienda:commerce)
 */

declare(strict_types=1);

require '/var/www/html/config/config.inc.php';
require_once _PS_ROOT_DIR_ . '/app/AdminKernel.php';

// Instalar módulos usa el traductor de Symfony: en CLI hay que arrancar el núcleo.
global $kernel;
$kernel = new AdminKernel('prod', false);
$kernel->boot();

$pro = require __DIR__ . '/../pro.php';

$module = Module::getInstanceByName('zementpro');
if (!$module instanceof Module) {
    throw new RuntimeException('No encuentro el módulo zementpro (¿está montado en modules/? pnpm tienda:up).');
}

if (!Module::isInstalled('zementpro')) {
    $module->install() || throw new RuntimeException('No se pudo instalar zementpro.');
    echo "+ zementpro instalado\n";
}

foreach (ZementPro::HOOKS as $hook) {
    if (!$module->isRegisteredInHook($hook)) {
        $module->registerHook($hook);
        echo "+ enganchado a {$hook}\n";
    }
}

$idLang = (int) Language::getIdByIso('es');
$groups = [];
foreach ($pro as $type => $settings) {
    $idGroup = (int) Db::getInstance()->getValue(
        'SELECT `id_group` FROM `' . _DB_PREFIX_ . 'group_lang`
         WHERE `id_lang` = ' . $idLang . ' AND `name` = "' . pSQL($settings['group']) . '"'
    );
    if (!$idGroup) {
        throw new RuntimeException("No existe el grupo «{$settings['group']}»: ejecute antes pnpm tienda:commerce.");
    }
    $groups[$type] = $idGroup;

    // El descuento va en cada producto (catalog.json → discounts, pnpm tienda:catalog): el del
    // grupo, al 0 %, porque PrestaShop lo sumaría al de palé.
    $group = new Group($idGroup);
    if ((float) $group->reduction !== 0.0) {
        $group->reduction = 0;
        $group->update();
    }
    echo "· {$settings['group']} (grupo {$idGroup}): descuento en el precio de cada producto (tarifa)\n";
}

Configuration::updateValue('ZEMENT_PRO_GROUPS', json_encode($groups));

echo "Cuentas profesionales listas.\n";
