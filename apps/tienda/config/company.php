<?php

/**
 * Datos de empresa y condiciones de compra para la tienda, en los 8 idiomas.
 *
 * Copia de la fuente única de la web: apps/web/src/data/company.ts (español e inglés) y
 * apps/web/src/i18n/translations/<iso>.ts → company (resto de idiomas). Si cambian allí,
 * cambiarlos aquí: la tienda y la web no deben contradecirse.
 *
 * null = pendiente (TODO: contenido real): lo que depende de ese dato no se muestra.
 * Lo usan setup-settings.php (contacto de la tienda) y setup-commerce.php (barra de confianza).
 */

declare(strict_types=1);

return [
    'email' => 'info@zement.es',
    'phone' => '+34 607 800 028',
    /** Formato internacional sin espacios, p. ej. 34600000000 (null = sin WhatsApp). */
    'whatsapp' => null,
    'hours' => [
        'es' => 'De lunes a viernes, de 9:00 a 17:00',
        'en' => 'Monday to Friday, 9:00–17:00 (Spanish time)',
        'de' => 'Montag bis Freitag, 9–17 Uhr (spanische Zeit)',
        'fr' => 'Du lundi au vendredi, de 9 h à 17 h (heure espagnole)',
        'it' => 'Dal lunedì al venerdì, dalle 9 alle 17 (ora spagnola)',
        'pl' => 'Od poniedziałku do piątku, 9:00–17:00 (czasu hiszpańskiego)',
        'no' => 'Mandag til fredag, kl. 9–17 (spansk tid)',
        'fi' => 'Maanantaista perjantaihin klo 9–17 (Espanjan aikaa)',
    ],
    'responseTime' => [
        'es' => '24 horas en días laborables',
        'en' => '24 hours on working days',
        'de' => '24 Stunden an Werktagen',
        'fr' => '24 heures, jours ouvrés',
        'it' => '24 ore nei giorni lavorativi',
        'pl' => '24 godziny w dni robocze',
        'no' => '24 timer på hverdager',
        'fi' => '24 tuntia arkipäivisin',
    ],
    'area' => [
        'es' => 'España y Europa',
        'en' => 'Spain and Europe',
        'de' => 'Spanien und Europa',
        'fr' => 'Espagne et Europe',
        'it' => 'Spagna ed Europa',
        'pl' => 'Hiszpania i Europa',
        'no' => 'Spania og Europa',
        'fi' => 'Espanja ja muu Eurooppa',
    ],
    /**
     * Google Analytics 4 (identificador «G-…»). Solo se carga si el visitante acepta la analítica
     * en el aviso de cookies. TODO: identificador real de Zement (null = no se carga nada).
     */
    'ga4Id' => null,
    // TODO: contenido real (company.ts → shopTerms): mientras sean null no se muestran.
    'freeShippingFrom' => null,
    'delivery' => null,
    'returns' => null,
];
