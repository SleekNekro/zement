<?php

/**
 * Formas de pago de la tienda: tarjeta con Stripe y transferencia bancaria.
 *
 * - Desactiva (no desinstala) los métodos de ejemplo de PrestaShop: cheque, contra reembolso y
 *   PrestaShop Checkout. Se pueden volver a activar desde el back office.
 * - Transferencia (ps_wirepayment): titular, IBAN, BIC y banco de config/company.php → bank.
 *   Mientras falte el titular o el IBAN, se desactiva (TODO: datos reales de la cuenta).
 * - Stripe: ver la sección «Formas de pago» de config/README.md. Las claves se introducen en el
 *   back office del módulo (nunca en el repositorio).
 *
 * Uso: pnpm tienda:payments
 */

declare(strict_types=1);

require '/var/www/html/config/config.inc.php';
require_once _PS_ROOT_DIR_ . '/app/AdminKernel.php';

// Activar y desactivar módulos usa el traductor de Symfony: en CLI hay que arrancar el núcleo.
global $kernel;
$kernel = new AdminKernel('prod', false);
$kernel->boot();

$company = require __DIR__ . '/../company.php';

/** Activa o desactiva un módulo instalado; sin instalar, no hace nada. */
$setActive = static function (string $name, bool $active): void {
    $module = Module::getInstanceByName($name);
    if (!$module instanceof Module || !Module::isInstalled($name)) {
        return;
    }
    if ($active && !$module->active) {
        $module->enable(true);
        echo "+ {$name} activado\n";
    } elseif (!$active && $module->active) {
        $module->disable(true);
        echo "- {$name} desactivado\n";
    } else {
        echo '= ' . $name . ($active ? ' activo' : ' desactivado') . "\n";
    }
};

// Métodos de ejemplo que Zement no ofrece.
foreach (['ps_checkpayment', 'ps_cashondelivery', 'ps_checkout'] as $name) {
    $setActive($name, false);
}

// Transferencia bancaria.
$bank = $company['bank'] ?? [];
if (!empty($bank['owner']) && !empty($bank['iban'])) {
    $details = array_filter([
        'IBAN: ' . $bank['iban'],
        empty($bank['bic']) ? null : 'BIC: ' . $bank['bic'],
    ]);
    Configuration::updateValue('BANK_WIRE_OWNER', $bank['owner']);
    Configuration::updateValue('BANK_WIRE_DETAILS', implode("\n", $details));
    Configuration::updateValue('BANK_WIRE_ADDRESS', (string) ($bank['bankName'] ?? ''));
    $setActive('ps_wirepayment', true);
} else {
    $setActive('ps_wirepayment', false);
    echo "  TODO: titular e IBAN en config/company.php → bank para ofrecer la transferencia\n";
}

// Stripe (módulo de pago con tarjeta): solo se informa del estado.
$stripe = Module::getInstanceByName('stripe_official');
if ($stripe instanceof Module && Module::isInstalled('stripe_official')) {
    echo '= stripe_official ' . ($stripe->active ? 'activo' : 'desactivado') . " (claves en el back office del módulo)\n";
} else {
    echo "  TODO: instalar el módulo de Stripe (ver config/README.md → Formas de pago)\n";
}

echo "Formas de pago listas.\n";
