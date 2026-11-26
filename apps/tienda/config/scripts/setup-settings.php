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
 * Nada se borra: todo se puede volver a activar desde el panel.
 * La web solo existe en español e inglés: el resto de idiomas enlaza a la versión inglesa.
 *
 * Uso: pnpm tienda:settings   (ZEMENT_WEB_URL=https://… para otra dirección de la web)
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
    'es' => ['Condiciones de venta', 'Consulta las condiciones de venta de la tienda de Zement.'],
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

Tools::clearSf2Cache();
Tools::clearSmartyCache();
echo "Ajustes aplicados (web: {$webUrl}).\n";
