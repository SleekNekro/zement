<?php

/**
 * Panel → Clientes → Solicitudes profesionales: lista de solicitudes (las pendientes primero) con
 * los datos de empresa del cliente, y acciones para aprobar (pasa al grupo y avisa), rechazar y
 * retirar una cuenta ya aprobada (vuelve a los precios públicos y avisa).
 */

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

require_once _PS_MODULE_DIR_ . 'zementpro/classes/ZementProRequest.php';

class AdminZementProRequestsController extends ModuleAdminController
{
    /** @var ZementPro */
    public $module;

    public function __construct()
    {
        $this->bootstrap = true;
        $this->table = 'zementpro_request';
        $this->className = 'ZementProRequest';
        $this->identifier = 'id_zementpro_request';
        $this->lang = false;
        $this->list_no_link = true;
        $this->explicitSelect = true;

        parent::__construct();

        $this->_select = 'c.`firstname`, c.`lastname`, c.`email`, c.`company`, c.`siret`,
            (CASE a.`status` WHEN "pending" THEN 0 WHEN "approved" THEN 1 WHEN "revoked" THEN 2 ELSE 3 END) AS `status_order`';
        $this->_join = 'LEFT JOIN `' . _DB_PREFIX_ . 'customer` c ON (c.`id_customer` = a.`id_customer`)';
        $this->_defaultOrderBy = 'status_order';
        $this->_defaultOrderWay = 'ASC';

        $statuses = [
            ZementProRequest::PENDING => 'En revisión',
            ZementProRequest::APPROVED => 'Aprobada',
            ZementProRequest::REJECTED => 'Rechazada',
            ZementProRequest::REVOKED => 'Retirada',
        ];
        $types = ['distributor' => 'Distribuidor', 'applicator' => 'Aplicador'];

        $this->fields_list = [
            'id_zementpro_request' => ['title' => 'ID', 'align' => 'center', 'class' => 'fixed-width-xs'],
            'date_add' => ['title' => 'Fecha', 'type' => 'datetime', 'filter_key' => 'a!date_add'],
            'company' => ['title' => 'Razón social', 'filter_key' => 'c!company'],
            'siret' => ['title' => 'CIF / NIF-IVA', 'filter_key' => 'c!siret'],
            'firstname' => ['title' => 'Nombre', 'filter_key' => 'c!firstname'],
            'lastname' => ['title' => 'Apellidos', 'filter_key' => 'c!lastname'],
            'email' => ['title' => 'Correo', 'filter_key' => 'c!email'],
            'type' => [
                'title' => 'Tipo',
                'type' => 'select',
                'list' => $types,
                'filter_key' => 'a!type',
                'callback' => 'typeLabel',
            ],
            'status' => [
                'title' => 'Estado',
                'type' => 'select',
                'list' => $statuses,
                'filter_key' => 'a!status',
                'callback' => 'statusLabel',
            ],
        ];

        $this->addRowAction('approve');
        $this->addRowAction('reject');
        $this->addRowAction('revoke');
    }

    public function initProcess(): void
    {
        parent::initProcess();

        if (Tools::getIsset('approve' . $this->table)) {
            $this->action = 'approve';
        } elseif (Tools::getIsset('reject' . $this->table)) {
            $this->action = 'reject';
        } elseif (Tools::getIsset('revoke' . $this->table)) {
            $this->action = 'revoke';
        }
    }

    public function processApprove(): void
    {
        $this->decide('approve');
    }

    public function processReject(): void
    {
        $this->decide('reject');
    }

    public function processRevoke(): void
    {
        $this->decide('revoke');
    }

    private function decide(string $decision): void
    {
        $request = $this->loadObject();
        if (!$request instanceof ZementProRequest) {
            return;
        }

        // Cada acción solo tiene sentido desde ciertos estados (los botones ya se ocultan).
        $allowed = [
            'approve' => [ZementProRequest::PENDING, ZementProRequest::REJECTED, ZementProRequest::REVOKED],
            'reject' => [ZementProRequest::PENDING],
            'revoke' => [ZementProRequest::APPROVED],
        ];
        if (!in_array($request->status, $allowed[$decision], true)) {
            $this->errors[] = 'Esta acción no se puede aplicar a una solicitud en este estado.';

            return;
        }

        $idEmployee = (int) $this->context->employee->id;
        $ok = match ($decision) {
            'approve' => $this->module->approve($request, $idEmployee),
            'reject' => $this->module->reject($request, $idEmployee),
            'revoke' => $this->module->revoke($request, $idEmployee),
        };

        if (!$ok) {
            $this->errors[] = $decision === 'approve'
                ? 'No se ha podido aprobar: revise que el cliente existe y que los grupos están configurados (pnpm tienda:pro).'
                : 'No se ha podido completar: el cliente ya no existe.';

            return;
        }

        $this->redirect_after = self::$currentIndex . '&conf=4&token=' . $this->token;
    }

    /** Aprobar: en revisión, rechazadas o retiradas. */
    public function displayApproveLink(?string $token, int $id): string
    {
        return $this->actionLink($id, 'approve', 'Aprobar', 'icon-check', ZementProRequest::APPROVED);
    }

    /** Rechazar: solo en las que estén en revisión. */
    public function displayRejectLink(?string $token, int $id): string
    {
        return $this->actionLink($id, 'reject', 'Rechazar', 'icon-remove', ZementProRequest::APPROVED, ZementProRequest::REJECTED, ZementProRequest::REVOKED);
    }

    /** Retirar: solo en las aprobadas (el cliente vuelve a los precios públicos). */
    public function displayRevokeLink(?string $token, int $id): string
    {
        return $this->actionLink($id, 'revoke', 'Retirar', 'icon-ban', ZementProRequest::PENDING, ZementProRequest::REJECTED, ZementProRequest::REVOKED);
    }

    private function actionLink(int $id, string $action, string $label, string $icon, string ...$hiddenFor): string
    {
        $request = new ZementProRequest($id);
        if (in_array($request->status, $hiddenFor, true)) {
            return '';
        }

        $href = self::$currentIndex . '&' . $this->identifier . '=' . $id . '&' . $action . $this->table
            . '&token=' . $this->token;

        return '<a href="' . htmlspecialchars($href) . '" class="btn btn-default" title="' . $label . '">'
            . '<i class="' . $icon . '"></i> ' . $label . '</a>';
    }

    public function typeLabel(?string $type): string
    {
        return ['distributor' => 'Distribuidor', 'applicator' => 'Aplicador'][$type] ?? (string) $type;
    }

    public function statusLabel(?string $status): string
    {
        $labels = [
            ZementProRequest::PENDING => ['En revisión', 'warning'],
            ZementProRequest::APPROVED => ['Aprobada', 'success'],
            ZementProRequest::REJECTED => ['Rechazada', 'danger'],
            ZementProRequest::REVOKED => ['Retirada', 'default'],
        ];
        [$label, $class] = $labels[$status] ?? [(string) $status, 'default'];

        return '<span class="badge badge-' . $class . '">' . $label . '</span>';
    }

    public function initToolbar(): void
    {
        parent::initToolbar();
        // Las solicitudes nacen en la tienda: sin botón «Añadir».
        unset($this->toolbar_btn['new']);
    }
}
