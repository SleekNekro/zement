<?php

/**
 * Rutas de la web de marca (apps/web) en los 8 idiomas, para los enlaces de la tienda hacia la
 * web (pie, consentimiento de privacidad, condiciones, «Profesionales»).
 *
 * Copia de las rutas de la web: si cambian allí, cambiarlas aquí.
 *   - Prefijo de idioma: apps/web/src/i18n/locales.ts (es sin prefijo; el resto /<iso>/)
 *   - Sistemas y textos legales: apps/web/src/lib/systems.ts, apps/web/src/lib/legal.ts y
 *     apps/web/src/i18n/translations/<iso>.ts → routes
 *   - Secciones de la portada: #profesionales y #contacto (mismo id en todos los idiomas)
 */

declare(strict_types=1);

$segments = [
    'es' => ['systems' => 'sistemas', 'notice' => 'aviso-legal', 'privacy' => 'privacidad', 'cookies' => 'cookies', 'terms' => 'condiciones-de-venta'],
    'en' => ['systems' => 'systems', 'notice' => 'legal-notice', 'privacy' => 'privacy', 'cookies' => 'cookies', 'terms' => 'terms-of-sale'],
    'de' => ['systems' => 'systeme', 'notice' => 'impressum', 'privacy' => 'datenschutz', 'cookies' => 'cookies', 'terms' => 'agb'],
    'fr' => ['systems' => 'systemes', 'notice' => 'mentions-legales', 'privacy' => 'confidentialite', 'cookies' => 'cookies', 'terms' => 'conditions-de-vente'],
    'it' => ['systems' => 'sistemi', 'notice' => 'note-legali', 'privacy' => 'privacy', 'cookies' => 'cookie', 'terms' => 'condizioni-di-vendita'],
    'pl' => ['systems' => 'systemy', 'notice' => 'nota-prawna', 'privacy' => 'polityka-prywatnosci', 'cookies' => 'cookies', 'terms' => 'warunki-sprzedazy'],
    'no' => ['systems' => 'systemer', 'notice' => 'juridisk-informasjon', 'privacy' => 'personvern', 'cookies' => 'informasjonskapsler', 'terms' => 'salgsvilkar'],
    'fi' => ['systems' => 'jarjestelmat', 'notice' => 'oikeudelliset-tiedot', 'privacy' => 'tietosuoja', 'cookies' => 'evasteet', 'terms' => 'myyntiehdot'],
];

$routes = [];
foreach ($segments as $iso => $segment) {
    $prefix = $iso === 'es' ? '' : '/' . $iso;
    $routes[$iso] = [
        'system' => "{$prefix}/{$segment['systems']}/",
        'professionals' => "{$prefix}/#profesionales",
        'contact' => "{$prefix}/#contacto",
        'notice' => "{$prefix}/{$segment['notice']}/",
        'privacy' => "{$prefix}/{$segment['privacy']}/",
        'cookies' => "{$prefix}/{$segment['cookies']}/",
        'terms' => "{$prefix}/{$segment['terms']}/",
    ];
}

return $routes;
