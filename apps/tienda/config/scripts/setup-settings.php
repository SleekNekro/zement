<?php

/**
 * Ajustes de la tienda: quita lo que la instalación de demostración deja a la vista del cliente.
 *
 * - Moneda: solo euro (desactiva USD).
 * - Tiendas físicas de demostración (Miami): desactivadas.
 * - Páginas CMS de demostración (envío, aviso legal, sobre nosotros, pago seguro, con lorem
 *   ipsum): desactivadas. La de «Términos y condiciones» se queda porque el pedido la enlaza en
 *   la casilla de aceptación, pero pasa a ser «Condiciones de venta» y remite a la web.
 * - «Recibir ofertas de nuestros socios» en el alta: desactivado (Zement no cede datos).
 * - Sello «Nuevo»: desactivado. Todo el catálogo es nuevo al abrir la tienda.
 * - blockreassurance (bloques «Security policy… edit with the module») fuera de las fichas,
 *   el carrito y el pedido.
 * - psgdpr: texto de consentimiento del alta y de la cuenta en los 8 idiomas, con enlace a la
 *   política de privacidad de la web. ps_dataprivacy (el mismo aviso, en inglés) desactivado.
 * - Títulos y URL de las páginas de PrestaShop (cuenta, carrito, contacto…), estados de pedido,
 *   tratamientos y transportistas: traducidos con los paquetes de idioma. Al instalar IT, PL,
 *   NO y FI se quedaron en inglés. En español, «Fecha de registro» → «Crear una cuenta».
 *
 * - Español de usted (config/translations/es-usted.php).
 * - Países: Europa (UE y resto de Europa salvo Rusia y Bielorrusia).
 * - Tienda «Zement» con su logotipo; módulos de terceros sin uso desactivados; alta sin fecha de
 *   nacimiento y boletín con doble confirmación; contacto «Webmaster» de demostración quitado;
 *   descripción de la portada; listados a todo el ancho.
 *
 * Salvo el contacto «Webmaster», nada se borra: todo se puede volver a activar desde el panel.
 * La web solo existe en español e inglés: el resto de idiomas enlaza a la versión inglesa.
 *
 * Uso: pnpm tienda:settings   (copia apps/tienda/config al contenedor; ZEMENT_WEB_URL=https://… para
 *      otra dirección de la web)
 */

declare(strict_types=1);

require '/var/www/html/config/config.inc.php';
require_once _PS_ROOT_DIR_ . '/app/AdminKernel.php';

// Traducir tablas y desactivar módulos usa el traductor de Symfony: en CLI hay que arrancar el núcleo.
global $kernel;
$kernel = new AdminKernel('prod', false);
$kernel->boot();

$webUrl = rtrim(getenv('ZEMENT_WEB_URL') ?: 'http://localhost:4321', '/');
$db = Db::getInstance();
$languages = Language::getLanguages(false);

/** Página de la web en el idioma de la tienda: español o, si no, inglés. */
$webPage = static function (string $iso, string $es, string $en) use ($webUrl): string {
    return $webUrl . ($iso === 'es' ? $es : $en);
};

const ZEMENT_TERMS = [
    'es' => ['Condiciones de venta', 'Consulte las condiciones de venta de la tienda de Zement.'],
    'en' => ['Terms of sale', 'Read the terms of sale of the Zement shop.'],
    'de' => ['AGB', 'Lesen Sie die Allgemeinen Geschäftsbedingungen des Zement-Shops.'],
    'fr' => ['Conditions de vente', 'Consultez les conditions de vente de la boutique Zement.'],
    'it' => ['Condizioni di vendita', 'Consulta le condizioni di vendita del negozio Zement.'],
    'pl' => ['Regulamin sprzedaży', 'Zapoznaj się z regulaminem sprzedaży sklepu Zement.'],
    'no' => ['Salgsvilkår', 'Les salgsvilkårene for Zement-butikken.'],
    'fi' => ['Myyntiehdot', 'Lue Zement-kaupan myyntiehdot.'],
];

/** Consentimiento de privacidad: %s = enlace a la política de privacidad. */
const ZEMENT_PRIVACY_CONSENT = [
    'es' => ['He leído y acepto la %s.', 'política de privacidad'],
    'en' => ['I have read and accept the %s.', 'privacy policy'],
    'de' => ['Ich habe die %s gelesen und akzeptiere sie.', 'Datenschutzerklärung'],
    'fr' => ["J'ai lu et j'accepte la %s.", 'politique de confidentialité'],
    'it' => ["Ho letto e accetto l'%s.", 'informativa sulla privacy'],
    'pl' => ['Przeczytałem(-am) i akceptuję %s.', 'politykę prywatności'],
    'no' => ['Jeg har lest og godtar %s.', 'personvernerklæringen'],
    'fi' => ['Olen lukenut ja hyväksyn %s.', 'tietosuojakäytännön'],
];

// Moneda: solo euro.
$euro = (int) Currency::getIdByIsoCode('EUR');
$db->update('currency', ['active' => 0], 'id_currency <> ' . $euro);
Configuration::updateValue('PS_CURRENCY_DEFAULT', $euro);
echo "· solo euro\n";

// Tiendas físicas de demostración.
$db->update('store', ['active' => 0]);
echo "· tiendas de demostración desactivadas\n";

// Páginas CMS: solo la de condiciones (la enlaza el pedido).
$conditions = (int) Configuration::get('PS_CONDITIONS_CMS_ID');
$db->update('cms', ['active' => 0], 'id_cms <> ' . $conditions);

$cms = new CMS($conditions);
foreach ($languages as $language) {
    $iso = $language['iso_code'];
    [$title, $text] = ZEMENT_TERMS[$iso] ?? ZEMENT_TERMS['en'];
    $url = $webPage($iso, '/condiciones-de-venta/', '/en/terms-of-sale/');
    $cms->meta_title[$language['id_lang']] = $title;
    $cms->head_seo_title[$language['id_lang']] = $title;
    $cms->link_rewrite[$language['id_lang']] = Tools::str2url($title);
    $cms->content[$language['id_lang']] = '<p><a href="' . htmlspecialchars($url, ENT_QUOTES) . '">'
        . htmlspecialchars($text, ENT_QUOTES) . '</a></p>';
}
$cms->active = true;
$cms->save();
echo "· páginas CMS de demostración desactivadas; condiciones → web\n";

// Alta de clientes y sellos del catálogo.
Configuration::updateValue('PS_CUSTOMER_OPTIN', 0);
Configuration::updateValue('PS_NB_DAYS_NEW_PRODUCT', 0);
echo "· sin «ofertas de socios» ni sello «Nuevo»\n";

$reassurance = Module::getInstanceByName('blockreassurance');
if ($reassurance instanceof Module && $reassurance->isRegisteredInHook('displayReassurance')) {
    $reassurance->unregisterHook('displayReassurance');
    echo "- blockreassurance quitado de fichas, carrito y pedido\n";
}

// Consentimiento de privacidad (psgdpr) en los 8 idiomas.
if (Module::isInstalled('psgdpr')) {
    $consent = [];
    foreach ($languages as $language) {
        $iso = $language['iso_code'];
        [$sentence, $label] = ZEMENT_PRIVACY_CONSENT[$iso] ?? ZEMENT_PRIVACY_CONSENT['en'];
        $url = $webPage($iso, '/privacidad/', '/en/privacy/');
        $link = '<a href="' . htmlspecialchars($url, ENT_QUOTES) . '" target="_blank" rel="noopener">'
            . htmlspecialchars($label, ENT_QUOTES) . '</a>';
        $consent[(int) $language['id_lang']] = sprintf(htmlspecialchars($sentence, ENT_QUOTES), $link);
    }
    Configuration::updateValue('PSGDPR_CREATION_FORM', $consent, true);
    Configuration::updateValue('PSGDPR_CUSTOMER_FORM', $consent, true);
    echo "· consentimiento de privacidad en " . count($consent) . " idiomas\n";
}

$dataPrivacy = Module::getInstanceByName('ps_dataprivacy');
if ($dataPrivacy instanceof Module && Module::isEnabled('ps_dataprivacy')) {
    $dataPrivacy->disable();
    echo "- ps_dataprivacy desactivado (aviso en inglés repetido; psgdpr ya pide el consentimiento)\n";
}

// Contenido que PrestaShop traduce con sus paquetes de idioma (nunca categorías, CMS ni ajustes).
$translatable = ['meta_lang', 'gender_lang', 'contact_lang', 'group_lang', 'carrier_lang', 'order_state_lang', 'order_return_state_lang'];
foreach (['it', 'pl', 'no', 'fi'] as $iso) {
    $language = new Language((int) Language::getIdByIso($iso));
    if (Validate::isLoadedObject($language)) {
        Language::updateMultilangTables($language, array_map(static fn (string $table): string => _DB_PREFIX_ . $table, $translatable));
    }
}
echo "· páginas, estados de pedido y transportistas traducidos (it, pl, no, fi)\n";

// Las URL traducidas pueden traer letras con tilde («rekisteröityminen»): solo ASCII, como el resto.
foreach (['it', 'pl', 'no', 'fi'] as $iso) {
    $idLang = (int) Language::getIdByIso($iso);
    foreach ($db->executeS('SELECT id_meta, url_rewrite FROM `' . _DB_PREFIX_ . 'meta_lang` WHERE id_lang = ' . $idLang) as $row) {
        $clean = Tools::str2url((string) $row['url_rewrite']);
        if ($row['url_rewrite'] !== '' && $clean !== $row['url_rewrite']) {
            $db->update('meta_lang', ['url_rewrite' => pSQL($clean)], 'id_meta = ' . (int) $row['id_meta'] . ' AND id_lang = ' . $idLang);
        }
    }
}

$idEs = (int) Language::getIdByIso('es');
$registration = Meta::getMetaByPage('registration', $idEs);
if ($registration) {
    $db->update('meta_lang', ['title' => pSQL('Crear una cuenta')], 'id_lang = ' . $idEs . ' AND id_meta = ' . (int) $registration['id_meta']);
}

// Nombre y logotipo: la tabla de tiendas también guarda el nombre (datos estructurados, correos).
$db->update('shop', ['name' => pSQL('Zement')]);
$db->update('shop_group', ['name' => pSQL('Zement')]);
$logo = _PS_ROOT_DIR_ . '/themes/zement/assets/img/zement-logo-navy.png';
if (is_file($logo) && copy($logo, _PS_IMG_DIR_ . 'zement-logo.png')) {
    [$width, $height] = getimagesize($logo);
    foreach (['PS_LOGO', 'PS_LOGO_MAIL', 'PS_LOGO_INVOICE'] as $key) {
        Configuration::updateValue($key, 'zement-logo.png');
    }
    Configuration::updateValue('SHOP_LOGO_WIDTH', (int) $width);
    Configuration::updateValue('SHOP_LOGO_HEIGHT', (int) $height);
    echo "· tienda «Zement» con su logotipo (web, correos y facturas)\n";
}

// Módulos de terceros que envían datos o ponen cookies y no se usan (sin aviso de cookies aún).
// ps_accounts y ps_checkout se quedan hasta decidir la pasarela de pago (TODO: Redsys o Stripe).
// productcomments: sin reseñas, la ficha mostraba «Comentarios (0)».
const ZEMENT_UNUSED_MODULES = [
    'klaviyopsautomation', 'ps_facebook', 'psxmarketingwithgoogle', 'ps_googleanalytics',
    'ps_eventbus', 'ps_mbo', 'ps_ask_ai', 'ps_mcp_server', 'ps_mcp_tools',
    'ps_distributionapiclient', 'productcomments',
];
foreach (ZEMENT_UNUSED_MODULES as $name) {
    $module = Module::getInstanceByName($name);
    if ($module instanceof Module && Module::isEnabled($name)) {
        $module->disable();
        echo "- {$name} desactivado\n";
    }
}

// Español de usted: cadenas del escaparate que en el paquete de idioma tutean.
// Se guardan como traducciones propias (tabla `translation`), para el núcleo y para el tema.
$idEs = (int) Language::getIdByIso('es');
$usted = require __DIR__ . '/../translations/es-usted.php';
$count = 0;
foreach ($usted as $domain => $strings) {
    foreach ($strings as $source => $target) {
        foreach ([null, 'zement'] as $theme) {
            $where = 'id_lang = ' . $idEs . " AND domain = '" . pSQL($domain) . "' AND `key` = '" . pSQL($source) . "'"
                . ($theme === null ? ' AND theme IS NULL' : " AND theme = '" . pSQL($theme) . "'");
            $db->delete('translation', $where);
            $db->insert('translation', [
                'id_lang' => $idEs,
                'key' => pSQL($source),
                'translation' => pSQL($target),
                'domain' => pSQL($domain),
                'theme' => $theme === null ? null : pSQL($theme),
            ], true);
        }
        ++$count;
    }
}
echo "· {$count} cadenas en español pasadas a usted\n";

// Países: de momento, Europa (zonas «Europe» y «Europe (non-EU)» de PrestaShop). Fuera Rusia y
// Bielorrusia (sanciones de la UE a la exportación). El resto del mundo, desactivado.
// TODO: fuera de la UE hay aduana e IVA de importación (Noruega, Suiza, Reino Unido…): revisar
// con Zement antes de vender allí.
const ZEMENT_EXCLUDED_COUNTRIES = ['RU', 'BY'];
$europe = array_map('intval', array_column(
    $db->executeS('SELECT id_zone FROM `' . _DB_PREFIX_ . "zone` WHERE name IN ('Europe', 'Europe (non-EU)')"),
    'id_zone'
));
if ($europe) {
    $excluded = implode(',', array_map(static fn (string $iso): string => "'" . pSQL($iso) . "'", ZEMENT_EXCLUDED_COUNTRIES));
    $db->update('country', ['active' => 0]);
    $db->update('country', ['active' => 1], 'id_zone IN (' . implode(',', $europe) . ") AND iso_code NOT IN ({$excluded})");
    echo '· países activos: ' . (int) $db->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'country` WHERE active = 1') . " de Europa\n";
}

// Búsqueda exacta: la aproximada devolvía 32 productos para «xyzxyz». Las búsquedas reales
// (imprimacion, barnices, corcho…) dan lo mismo sin ella.
Configuration::updateValue('PS_SEARCH_FUZZY', 0);

// RGPD: sin fecha de nacimiento y boletín con doble confirmación.
Configuration::updateValue('PS_CUSTOMER_BIRTHDATE', 0);
Configuration::updateValue('NW_VERIFICATION_EMAIL', 1);
echo "· alta sin fecha de nacimiento; boletín con doble confirmación\n";

// Formulario de contacto: un solo destinatario (el de «Webmaster» es de la demostración).
$webmaster = (int) $db->getValue('SELECT id_contact FROM `' . _DB_PREFIX_ . 'contact_lang` WHERE name = \'Webmaster\'');
if ($webmaster) {
    (new Contact($webmaster))->delete();
    echo "- contacto «Webmaster» de demostración quitado\n";
}

// Descripción de la portada para buscadores: nombre de la tienda y sus familias (sin texto inventado).
$index = Meta::getMetaByPage('index', $idEs);
if ($index) {
    foreach ($languages as $language) {
        $names = array_column(Category::getChildren((int) Configuration::get('PS_HOME_CATEGORY'), (int) $language['id_lang'], true), 'name');
        $db->update(
            'meta_lang',
            ['description' => pSQL(mb_substr('Zement: ' . implode(', ', $names) . '.', 0, 255))],
            'id_meta = ' . (int) $index['id_meta'] . ' AND id_lang = ' . (int) $language['id_lang']
        );
    }
    echo "· descripción de la portada con las familias\n";
}

// Listados a todo el ancho: la columna izquierda repetía el menú de familias.
// theme.yml lo fija para instalaciones nuevas; aquí se aplica a la tienda ya instalada.
$themeConfig = _PS_CONFIG_DIR_ . 'themes/zement/shop' . (int) Configuration::get('PS_SHOP_DEFAULT') . '.json';
if (is_file($themeConfig)) {
    $theme = json_decode((string) file_get_contents($themeConfig), true, 512, JSON_THROW_ON_ERROR);
    $theme['theme_settings']['layouts'] = array_map(static fn (): string => 'layout-full-width', $theme['theme_settings']['layouts'] ?? []);
    file_put_contents($themeConfig, json_encode($theme, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    echo "· listados a todo el ancho\n";
}

Tools::clearSf2Cache();
Tools::clearSmartyCache();
echo "Ajustes aplicados (web: {$webUrl}).\n";
