<?php

/**
 * Solicitud de cuenta profesional: un cliente pide pasar al grupo Distribuidor o Aplicador.
 * Estados: pending (en revisión), approved (grupo activado) y rejected.
 */

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

class ZementProRequest extends ObjectModel
{
    public const PENDING = 'pending';
    public const APPROVED = 'approved';
    public const REJECTED = 'rejected';

    /** Tipos de cuenta profesional (clave interna → grupo en config/pro.php). */
    public const TYPES = ['distributor', 'applicator'];

    /** @var int */
    public $id_customer;

    /** @var string distributor | applicator */
    public $type;

    /** @var string pending | approved | rejected */
    public $status = self::PENDING;

    /** @var int Empleado que aprobó o rechazó (0 mientras está en revisión) */
    public $id_employee = 0;

    /** @var string */
    public $date_add;

    /** @var string */
    public $date_upd;

    public static $definition = [
        'table' => 'zementpro_request',
        'primary' => 'id_zementpro_request',
        'fields' => [
            'id_customer' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true],
            'type' => ['type' => self::TYPE_STRING, 'validate' => 'isGenericName', 'required' => true, 'size' => 16],
            'status' => ['type' => self::TYPE_STRING, 'validate' => 'isGenericName', 'required' => true, 'size' => 16],
            'id_employee' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedInt'],
            'date_add' => ['type' => self::TYPE_DATE, 'validate' => 'isDate'],
            'date_upd' => ['type' => self::TYPE_DATE, 'validate' => 'isDate'],
        ],
    ];

    /** Última solicitud del cliente, o null si no ha pedido nunca la cuenta profesional. */
    public static function forCustomer(int $idCustomer): ?self
    {
        $id = (int) Db::getInstance()->getValue(
            'SELECT `id_zementpro_request` FROM `' . _DB_PREFIX_ . 'zementpro_request`
             WHERE `id_customer` = ' . $idCustomer . ' ORDER BY `id_zementpro_request` DESC'
        );

        return $id ? new self($id) : null;
    }

    public static function createTable(): bool
    {
        return Db::getInstance()->execute(
            'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'zementpro_request` (
                `id_zementpro_request` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `id_customer` INT UNSIGNED NOT NULL,
                `type` VARCHAR(16) NOT NULL,
                `status` VARCHAR(16) NOT NULL DEFAULT "pending",
                `id_employee` INT UNSIGNED NOT NULL DEFAULT 0,
                `date_add` DATETIME NOT NULL,
                `date_upd` DATETIME NOT NULL,
                PRIMARY KEY (`id_zementpro_request`),
                KEY `id_customer` (`id_customer`),
                KEY `status` (`status`)
            ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4'
        );
    }
}
