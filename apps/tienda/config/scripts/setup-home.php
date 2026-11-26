<?php

/**
 * Portada de la tienda: instala el módulo zementhome y quita de la portada los bloques de
 * demostración de PrestaShop (carrusel, banner, texto, destacados y novedades) y la pone primera.
 * Solo los desengancha de displayHome: los módulos siguen instalados y se pueden volver a enganchar.
 *
 * Uso: pnpm tienda:home
 */

declare(strict_types=1);

require '/var/www/html/config/config.inc.php';
require_once _PS_ROOT_DIR_ . '/app/AdminKernel.php';

// Instalar un módulo actualiza traducciones con el traductor de Symfony: en CLI hay que
// arrancar el núcleo para que SymfonyContainer::getInstance() funcione.
global $kernel;
$kernel = new AdminKernel('prod', false);
$kernel->boot();

// ps_newproducts: con todo el catálogo recién importado, «novedades» repetiría la tienda entera.
// ps_bestsellers y ps_specials se quedan: no muestran nada hasta que haya ventas u ofertas.
const ZEMENT_HOME_DEMO_MODULES = [
    'ps_imageslider',
    'ps_banner',
    'ps_customtext',
    'ps_featuredproducts',
    'ps_newproducts',
];

$home = Module::getInstanceByName('zementhome');

if (!$home instanceof Module) {
    throw new RuntimeException('No encuentro el módulo zementhome (¿está montado en modules/?).');
}

if (!Module::isInstalled('zementhome')) {
    $home->install() || throw new RuntimeException('No se pudo instalar zementhome.');
    echo "+ zementhome instalado\n";
} else {
    echo "= zementhome ya instalado\n";
}

if (!$home->isRegisteredInHook('displayHome')) {
    $home->registerHook('displayHome');
    echo "+ zementhome enganchado a displayHome\n";
}

// Ganchos que vacían la caché de la portada (instalaciones anteriores a la 0.2.0).
foreach (ZementHome::CACHE_HOOKS as $hook) {
    if (!$home->isRegisteredInHook($hook)) {
        $home->registerHook($hook);
        echo "+ zementhome enganchado a {$hook}\n";
    }
}

// La portada de Zement, la primera en displayHome.
$home->updatePosition((int) Hook::getIdByName('displayHome'), false, 1);

foreach (ZEMENT_HOME_DEMO_MODULES as $name) {
    $module = Module::getInstanceByName($name);
    if ($module instanceof Module && $module->isRegisteredInHook('displayHome')) {
        $module->unregisterHook('displayHome');
        echo "- {$name} quitado de la portada\n";
    }
}

Tools::clearSf2Cache();
Tools::clearSmartyCache();
