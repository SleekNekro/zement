<?php

/**
 * Textos propios del tema Zement y cambios de redacción sobre los de PrestaShop.
 *
 * - Precios: «Impuestos incluidos» pasa a nombrar el IVA («IVA incluido», «inkl. MwSt.»…), que es
 *   lo que el cliente busca; también la versión corta de las miniaturas y la de sin impuestos.
 * - Cadenas nuevas del tema: menú de familias, «Volver a <familia>», «Información adicional» y
 *   «Ver carrito» (carrito lateral).
 *
 * Mismo formato que missing.php (iso => dominio sin puntos => [original en inglés => traducción]).
 * Lo aplica setup-settings.php después de missing.php, así que estas mandan.
 */

declare(strict_types=1);

return [
    'es' => [
        'ShopThemeCheckout' => [
            'View cart' => 'Ver carrito',
        ],
        'ShopThemeGlobal' => [
            'Tax included' => 'IVA incluido',
            '(tax incl.)' => 'IVA incl.',
            'Tax excluded' => 'sin IVA',
            '(tax excl.)' => 'sin IVA',
            'Menu' => 'Menú',
        ],
        'ShopThemeCatalog' => [
            'Back to %category%' => 'Volver a %category%',
            'Additional information' => 'Información adicional',
        ],
    ],
    'en' => [
        'ShopThemeCheckout' => [
            'View cart' => 'View cart',
        ],
        'ShopThemeGlobal' => [
            'Tax included' => 'VAT included',
            '(tax incl.)' => 'incl. VAT',
            'Tax excluded' => 'excl. VAT',
            '(tax excl.)' => 'excl. VAT',
        ],
    ],
    'de' => [
        'ShopThemeCheckout' => [
            'View cart' => 'Warenkorb ansehen',
        ],
        'ShopThemeGlobal' => [
            'Tax included' => 'inkl. MwSt.',
            '(tax incl.)' => 'inkl. MwSt.',
            'Tax excluded' => 'zzgl. MwSt.',
            '(tax excl.)' => 'zzgl. MwSt.',
            'Menu' => 'Menü',
        ],
        'ShopThemeCatalog' => [
            'Back to %category%' => 'Zurück zu %category%',
            'Additional information' => 'Weitere Informationen',
        ],
    ],
    'fr' => [
        'ShopThemeCheckout' => [
            'View cart' => 'Voir le panier',
        ],
        'ShopThemeGlobal' => [
            'Tax included' => 'TVA incluse',
            '(tax incl.)' => 'TVA incluse',
            'Tax excluded' => 'HT',
            '(tax excl.)' => 'HT',
            'Menu' => 'Menu',
        ],
        'ShopThemeCatalog' => [
            'Back to %category%' => 'Retour à %category%',
            'Additional information' => 'Informations complémentaires',
        ],
    ],
    'it' => [
        'ShopThemeCheckout' => [
            'View cart' => 'Vedi carrello',
        ],
        'ShopThemeGlobal' => [
            'Tax included' => 'IVA inclusa',
            '(tax incl.)' => 'IVA incl.',
            'Tax excluded' => 'IVA esclusa',
            '(tax excl.)' => 'IVA esclusa',
            'Menu' => 'Menu',
        ],
        'ShopThemeCatalog' => [
            'Back to %category%' => 'Torna a %category%',
            'Additional information' => 'Informazioni aggiuntive',
        ],
    ],
    'pl' => [
        'ShopThemeCheckout' => [
            'View cart' => 'Zobacz koszyk',
        ],
        'ShopThemeGlobal' => [
            'Tax included' => 'Cena z VAT',
            '(tax incl.)' => 'z VAT',
            'Tax excluded' => 'bez VAT',
            '(tax excl.)' => 'bez VAT',
            'Menu' => 'Menu',
        ],
        'ShopThemeCatalog' => [
            'Back to %category%' => 'Wróć do: %category%',
            'Additional information' => 'Informacje dodatkowe',
        ],
    ],
    'no' => [
        'ShopThemeCheckout' => [
            'View cart' => 'Se handlekurven',
        ],
        'ShopThemeGlobal' => [
            'Tax included' => 'Inkl. mva',
            '(tax incl.)' => 'inkl. mva',
            'Tax excluded' => 'eks. mva',
            '(tax excl.)' => 'eks. mva',
            'Menu' => 'Meny',
        ],
        'ShopThemeCatalog' => [
            'Back to %category%' => 'Tilbake til %category%',
            'Additional information' => 'Mer informasjon',
        ],
    ],
    'fi' => [
        'ShopThemeCheckout' => [
            'View cart' => 'Näytä ostoskori',
        ],
        'ShopThemeGlobal' => [
            'Tax included' => 'Sis. ALV',
            '(tax incl.)' => 'sis. ALV',
            'Tax excluded' => 'ALV 0 %',
            '(tax excl.)' => 'ALV 0 %',
            'Menu' => 'Valikko',
        ],
        'ShopThemeCatalog' => [
            'Back to %category%' => 'Takaisin: %category%',
            'Additional information' => 'Lisätietoja',
        ],
    ],
];
