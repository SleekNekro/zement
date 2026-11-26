<?php

/**
 * Cuentas profesionales: grupo de clientes de cada tipo y su descuento sobre el precio público.
 *
 * - `group`: nombre del grupo en español (lo crea setup-commerce.php).
 * - `reduction`: % de descuento del grupo sobre el precio público, o null = pendiente
 *   (TODO: tarifa real de Zement). Con null no se toca el descuento del grupo (0 % al crearlo).
 *
 * Los profesionales ven siempre los precios sin IVA. Lo aplica setup-pro.php (pnpm tienda:pro).
 */

declare(strict_types=1);

return [
    'distributor' => ['group' => 'Distribuidor', 'reduction' => null],
    'applicator' => ['group' => 'Aplicador', 'reduction' => null],
];
