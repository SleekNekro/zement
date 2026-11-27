<?php

/**
 * Pie de la tienda con los datos de Zement en lugar de los de demostración de PrestaShop.
 *
 * - Nombre de la tienda: «Zement» (aparece en «Información de la tienda», títulos y correos).
 * - El correo y el teléfono de la tienda los pone setup-settings.php (config/company.php).
 * - Sustituye los bloques de enlaces de demostración (ps_linklist) por:
 *     displayFooter       «Productos»: las familias del catálogo, en su orden
 *                         «Zement»: sistema, profesionales y contacto de la web de marca
 *     displayFooterAfter  textos legales de la web y «Configurar cookies» (barra inferior)
 * - Quita blockreassurance de displayFooterAfter (esa zona pasa a ser la barra legal).
 *
 * Cada idioma enlaza a la misma página de la web en su idioma (la web está en los 8 idiomas).
 *
 * Uso: pnpm tienda:footer   (copia apps/tienda/config al contenedor; ZEMENT_WEB_URL=https://… para
 *      otra dirección de la web)
 */

declare(strict_types=1);

require '/var/www/html/config/config.inc.php';

$webUrl = rtrim(getenv('ZEMENT_WEB_URL') ?: 'http://localhost:4321', '/');

/** Rutas de la web de marca en cada idioma (config/web-routes.php). */
$webRoutes = require __DIR__ . '/../web-routes.php';

const ZEMENT_FOOTER_LABELS = [
    'products' => [
        'es' => 'Productos', 'en' => 'Products', 'de' => 'Produkte', 'fr' => 'Produits',
        'it' => 'Prodotti', 'pl' => 'Produkty', 'no' => 'Produkter', 'fi' => 'Tuotteet',
    ],
    'zement' => [
        'es' => 'Zement', 'en' => 'Zement', 'de' => 'Zement', 'fr' => 'Zement',
        'it' => 'Zement', 'pl' => 'Zement', 'no' => 'Zement', 'fi' => 'Zement',
    ],
    'legal' => [
        'es' => 'Legal', 'en' => 'Legal', 'de' => 'Rechtliches', 'fr' => 'Informations légales',
        'it' => 'Note legali', 'pl' => 'Informacje prawne', 'no' => 'Juridisk', 'fi' => 'Juridiikka',
    ],
    'system' => [
        'es' => 'Sistema', 'en' => 'System', 'de' => 'System', 'fr' => 'Système',
        'it' => 'Sistema', 'pl' => 'System', 'no' => 'System', 'fi' => 'Järjestelmä',
    ],
    'professionals' => [
        'es' => 'Profesionales', 'en' => 'Professionals', 'de' => 'Für Profis', 'fr' => 'Professionnels',
        'it' => 'Professionisti', 'pl' => 'Dla profesjonalistów', 'no' => 'Profesjonelle',
        'fi' => 'Ammattilaisille',
    ],
    'project' => [
        'es' => 'Tu proyecto', 'en' => 'Your project', 'de' => 'Ihr Projekt', 'fr' => 'Votre projet',
        'it' => 'Il tuo progetto', 'pl' => 'Twój projekt', 'no' => 'Ditt prosjekt', 'fi' => 'Projektisi',
    ],
    'web' => [
        'es' => 'Web', 'en' => 'Website', 'de' => 'Website', 'fr' => 'Site web',
        'it' => 'Sito web', 'pl' => 'Strona', 'no' => 'Nettsted', 'fi' => 'Verkkosivusto',
    ],
    'contact' => [
        'es' => 'Contacto', 'en' => 'Contact', 'de' => 'Kontakt', 'fr' => 'Contact',
        'it' => 'Contatti', 'pl' => 'Kontakt', 'no' => 'Kontakt', 'fi' => 'Yhteystiedot',
    ],
    'notice' => [
        'es' => 'Aviso legal', 'en' => 'Legal notice', 'de' => 'Impressum', 'fr' => 'Mentions légales',
        'it' => 'Note legali', 'pl' => 'Nota prawna', 'no' => 'Juridisk informasjon',
        'fi' => 'Oikeudelliset tiedot',
    ],
    'privacy' => [
        'es' => 'Privacidad', 'en' => 'Privacy', 'de' => 'Datenschutz', 'fr' => 'Confidentialité',
        'it' => 'Privacy', 'pl' => 'Prywatność', 'no' => 'Personvern', 'fi' => 'Tietosuoja',
    ],
    'cookies' => [
        'es' => 'Cookies', 'en' => 'Cookies', 'de' => 'Cookies', 'fr' => 'Cookies',
        'it' => 'Cookie', 'pl' => 'Pliki cookie', 'no' => 'Informasjonskapsler', 'fi' => 'Evästeet',
    ],
    'terms' => [
        'es' => 'Condiciones de venta', 'en' => 'Terms of sale', 'de' => 'AGB',
        'fr' => 'Conditions de vente', 'it' => 'Condizioni di vendita', 'pl' => 'Regulamin sprzedaży',
        'no' => 'Salgsvilkår', 'fi' => 'Myyntiehdot',
    ],
];

$db = Db::getInstance();
$languages = Language::getLanguages(false);

// Datos de la tienda.
Configuration::updateValue('PS_SHOP_NAME', 'Zement');

$linklist = Module::getInstanceByName('ps_linklist');
if (!$linklist instanceof Module || !Module::isInstalled('ps_linklist')) {
    throw new RuntimeException('ps_linklist no está instalado.');
}

$hooks = ['displayFooter' => 0, 'displayFooterAfter' => 0];
foreach (array_keys($hooks) as $hook) {
    if (!$linklist->isRegisteredInHook($hook)) {
        $linklist->registerHook($hook);
    }
    $hooks[$hook] = (int) Hook::getIdByName($hook);
}

$reassurance = Module::getInstanceByName('blockreassurance');
if ($reassurance instanceof Module && $reassurance->isRegisteredInHook('displayFooterAfter')) {
    $reassurance->unregisterHook('displayFooterAfter');
    echo "- blockreassurance quitado de displayFooterAfter\n";
}

// Se rehacen todos los bloques del pie: los de demostración y los de ejecuciones anteriores.
$ids = array_map('intval', array_column(
    $db->executeS('SELECT id_link_block FROM `' . _DB_PREFIX_ . 'link_block` WHERE id_hook IN (' . implode(',', $hooks) . ')'),
    'id_link_block'
));
if ($ids) {
    $in = implode(',', $ids);
    foreach (['link_block_lang', 'link_block_shop', 'link_block'] as $table) {
        $db->delete($table, "id_link_block IN ({$in})");
    }
}

// «Configurar cookies»: reabre el aviso (módulo zementcommerce, enlaces a «#zm-cookies»).
$consentStrings = json_decode((string) @file_get_contents(_PS_MODULE_DIR_ . 'zementcommerce/views/consent/strings.json'), true) ?: [];

$webLinks = static function (array $keys, string $iso) use ($webUrl, $webRoutes, $consentStrings): array {
    $routes = $webRoutes[$iso] ?? $webRoutes['en'];

    return array_map(static fn (string $key): array => $key === 'cookieSettings'
        ? ['title' => ($consentStrings[$iso] ?? $consentStrings['en'])['footerLink'], 'url' => '#zm-cookies']
        : ['title' => ZEMENT_FOOTER_LABELS[$key][$iso], 'url' => $webUrl . $routes[$key === 'web' ? 'home' : $key]], $keys);
};

$blocks = [
    ['hook' => 'displayFooter', 'name' => 'zement', 'category' => [], 'custom' => ['system', 'professionals', 'project', 'contact', 'web']],
    ['hook' => 'displayFooterAfter', 'name' => 'legal', 'category' => [], 'custom' => array_merge(['notice', 'privacy', 'cookies', 'terms'], $consentStrings ? ['cookieSettings'] : [])],
];

$shops = Shop::getShops(false, null, true);

foreach ($blocks as $position => $block) {
    $content = ['cms' => [], 'product' => [], 'static' => [], 'category' => $block['category']];
    $db->insert('link_block', [
        'id_hook' => $hooks[$block['hook']],
        'position' => $position,
        'content' => pSQL(json_encode($content)),
    ]);
    $id = (int) $db->Insert_ID();

    foreach ($languages as $language) {
        $iso = $language['iso_code'];
        $custom = $block['custom'] ? json_encode($webLinks($block['custom'], $iso), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
        $db->insert('link_block_lang', [
            'id_link_block' => $id,
            'id_lang' => (int) $language['id_lang'],
            'name' => pSQL(ZEMENT_FOOTER_LABELS[$block['name']][$iso] ?? ZEMENT_FOOTER_LABELS[$block['name']]['en']),
            'custom_content' => $custom === null ? null : pSQL($custom),
        ], true);
    }

    foreach ($shops as $idShop) {
        $db->insert('link_block_shop', ['id_link_block' => $id, 'id_shop' => (int) $idShop, 'position' => $position]);
    }

    echo "+ bloque {$block['name']} en {$block['hook']}\n";
}

Tools::clearSf2Cache();
Tools::clearSmartyCache();
echo "Pie listo (web: {$webUrl}).\n";
