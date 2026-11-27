<?php

/**
 * Cuentas profesionales: grupo de clientes de cada tipo.
 *
 * - `group`: nombre del grupo en español (lo crea setup-commerce.php).
 *
 * El descuento de cada grupo es el de la tarifa (catalog/catalog.json → discounts) y lo pone la
 * importación del catálogo como precio específico de cada producto, para que no se sume al de
 * palé. Por eso el descuento general del grupo se deja al 0 % (setup-pro.php).
 *
 * Los profesionales ven siempre los precios sin IVA. Lo aplica setup-pro.php (pnpm tienda:pro).
 */

declare(strict_types=1);

return [
    'distributor' => ['group' => 'Distribuidor'],
    'applicator' => ['group' => 'Aplicador'],
];
