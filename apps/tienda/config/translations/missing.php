<?php

/**
 * Cadenas del tema Hummingbird que faltan en los paquetes de idioma de PrestaShop (salían en
 * inglés). Formato: iso => dominio (sin puntos) => [original en inglés => traducción].
 * Lo aplica setup-settings.php (pnpm tienda:settings), igual que es-usted.php.
 *
 * TODO: faltan más (unas 170 en DE, NO y FI; 140 en FR; 130 en PL), sobre todo etiquetas para
 * lectores de pantalla. Aquí, de momento, las visibles en la cabecera.
 */

declare(strict_types=1);

return [
    'de' => [
        'ShopThemeGlobal' => [
            'Call us: %phone%' => 'Rufen Sie uns an: %phone%',
            'Call us at: %phone%' => 'Rufen Sie uns an unter: %phone%',
        ],
        'ShopThemeCatalog' => [
            'Search products...' => 'Produkte suchen …',
        ],
    ],
    'fr' => [
        'ShopThemeGlobal' => [
            'Call us: %phone%' => 'Appelez-nous : %phone%',
            'Call us at: %phone%' => 'Appelez-nous au %phone%',
        ],
        'ShopThemeCatalog' => [
            'Search products...' => 'Rechercher des produits…',
        ],
    ],
    'pl' => [
        'ShopThemeGlobal' => [
            'Call us: %phone%' => 'Zadzwoń do nas: %phone%',
            'Call us at: %phone%' => 'Zadzwoń do nas pod numer %phone%',
        ],
    ],
    'no' => [
        'ShopThemeGlobal' => [
            'Call us: %phone%' => 'Ring oss: %phone%',
            'Call us at: %phone%' => 'Ring oss på %phone%',
        ],
        'ShopThemeCatalog' => [
            'Search products...' => 'Søk etter produkter …',
        ],
    ],
    'fi' => [
        'ShopThemeGlobal' => [
            'Call us: %phone%' => 'Soita meille: %phone%',
            'Call us at: %phone%' => 'Soita meille numeroon %phone%',
        ],
        'ShopThemeCatalog' => [
            'Search products...' => 'Hae tuotteita…',
        ],
    ],
];
