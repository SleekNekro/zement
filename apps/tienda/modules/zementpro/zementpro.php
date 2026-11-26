<?php

/**
 * Alta profesional de Zement (fase 1 de cuentas y compra):
 *
 * - En el registro (y en «Información» de la cuenta), la casilla «Soy profesional» con el tipo
 *   (Distribuidor o Aplicador), la razón social y el CIF / NIF-IVA, obligatorios si se marca.
 * - Cada alta profesional queda como solicitud en revisión; el cliente compra con precios públicos
 *   hasta que se aprueba. Aviso por correo a la tienda (PS_SHOP_EMAIL).
 * - Panel → Clientes → Solicitudes profesionales: aprobar pasa al cliente a su grupo (tarifa sin
 *   IVA) y le escribe en su idioma; rechazar también le avisa; retirar devuelve una cuenta aprobada
 *   a los precios públicos y le avisa.
 * - «Mi cuenta» muestra el estado de la cuenta profesional según el grupo real del cliente (si se
 *   cambia el grupo a mano en la ficha del cliente, también cuadra).
 *
 * Grupos y descuentos: config/pro.php, aplicados con `pnpm tienda:pro` (guarda ZEMENT_PRO_GROUPS).
 */

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

require_once __DIR__ . '/ZementProStrings.php';
require_once __DIR__ . '/classes/ZementProRequest.php';

class ZementPro extends Module
{
    public const HOOKS = [
        'additionalCustomerFormFields',
        'validateCustomerFormFields',
        'actionCustomerAccountAdd',
        'actionCustomerAccountUpdate',
        'displayCustomerAccountTop',
        'actionFrontControllerSetMedia',
    ];

    /** Páginas con el formulario de cliente en las que se puede pedir la cuenta profesional. */
    private const FORM_PAGES = ['registration', 'authentication', 'identity'];

    private const ADMIN_TAB = 'AdminZementProRequests';

    public function __construct()
    {
        $this->name = 'zementpro';
        $this->tab = 'administration';
        $this->version = '0.1.0';
        $this->author = 'Zement';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = ['min' => '9.0.0', 'max' => _PS_VERSION_];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = 'Zement · Profesionales';
        $this->description = 'Alta de distribuidores y aplicadores con solicitud y aprobación en el panel.';
    }

    public function install(): bool
    {
        return parent::install()
            && ZementProRequest::createTable()
            && $this->registerHook(self::HOOKS)
            && $this->installTab();
    }

    public function uninstall(): bool
    {
        $idTab = (int) Tab::getIdFromClassName(self::ADMIN_TAB);
        if ($idTab) {
            (new Tab($idTab))->delete();
        }

        // Las solicitudes se conservan: son el registro de qué cliente pidió qué y quién lo aprobó.
        return parent::uninstall();
    }

    private function installTab(): bool
    {
        if (Tab::getIdFromClassName(self::ADMIN_TAB)) {
            return true;
        }

        $tab = new Tab();
        $tab->class_name = self::ADMIN_TAB;
        $tab->module = $this->name;
        $tab->id_parent = (int) Tab::getIdFromClassName('AdminParentCustomer');
        $tab->active = true;
        foreach (Language::getLanguages(false) as $language) {
            $tab->name[(int) $language['id_lang']] = $language['iso_code'] === 'es'
                ? 'Solicitudes profesionales'
                : 'Professional requests';
        }

        return (bool) $tab->add();
    }

    /* ---------- Formulario de cliente ---------- */

    /**
     * Añade «Soy profesional» y el tipo justo antes de la razón social (modo B2B), y pone a la razón
     * social y al número fiscal nombres claros. Solo en registro e «Información», y solo si el
     * cliente no tiene ya una solicitud en revisión o aprobada.
     *
     * @param array{fields: array<string, FormField>} $params
     */
    public function hookAdditionalCustomerFormFields(array $params): array
    {
        $strings = $this->strings();
        $fields = &$params['fields'];

        if (isset($fields['company'])) {
            $fields['company']->setLabel($strings['company']);
        }
        if (isset($fields['siret'])) {
            $fields['siret']->setLabel($strings['vat']);
        }

        if (!$this->canRequest()) {
            return [];
        }

        $pro = (new FormField())
            ->setName('zm_pro')
            ->setType('checkbox')
            ->setLabel($strings['pro'])
            ->setValue((bool) Tools::getValue('zm_pro'));
        $type = (new FormField())
            ->setName('zm_pro_type')
            ->setType('radio-buttons')
            ->setLabel($strings['type'])
            ->addAvailableValue('distributor', $strings['distributor'])
            ->addAvailableValue('applicator', $strings['applicator'])
            ->setValue((string) Tools::getValue('zm_pro_type'));

        // Delante de la razón social; el núcleo las validaría al final, así que van marcadas como
        // campos de este módulo para recibir validateCustomerFormFields.
        $pro->moduleName = $this->name;
        $type->moduleName = $this->name;
        $insert = [$this->name . '_zm_pro' => $pro, $this->name . '_zm_pro_type' => $type];
        $position = array_search('company', array_keys($fields), true);
        $fields = $position === false
            ? $fields + $insert
            : array_slice($fields, 0, $position, true) + $insert + array_slice($fields, $position, null, true);

        return [];
    }

    /**
     * Si se marca «Soy profesional», el tipo, la razón social y el número fiscal son obligatorios.
     * Los dos últimos son campos del núcleo: el error se muestra en el tipo, que es de este módulo.
     *
     * @param array{fields: FormField[]} $params
     */
    public function hookValidateCustomerFormFields(array $params): array
    {
        if (!Tools::getValue('zm_pro')) {
            return $params['fields'];
        }

        $strings = $this->strings();
        foreach ($params['fields'] as $field) {
            if ($field->getName() !== 'zm_pro_type') {
                continue;
            }
            if (!in_array(Tools::getValue('zm_pro_type'), ZementProRequest::TYPES, true)) {
                $field->addError($strings['errorType']);
            }
            if (trim((string) Tools::getValue('company')) === '') {
                $field->addError($strings['errorCompany']);
            }
            if (trim((string) Tools::getValue('siret')) === '') {
                $field->addError($strings['errorVat']);
            }
        }

        return $params['fields'];
    }

    /** @param array{newCustomer: Customer} $params */
    public function hookActionCustomerAccountAdd(array $params): void
    {
        $this->createRequest($params['newCustomer']);
    }

    /** @param array{customer: Customer} $params */
    public function hookActionCustomerAccountUpdate(array $params): void
    {
        $this->createRequest($params['customer']);
    }

    private function createRequest(Customer $customer): void
    {
        $type = (string) Tools::getValue('zm_pro_type');
        if (
            !Tools::getValue('zm_pro')
            || $customer->is_guest
            || !in_array($type, ZementProRequest::TYPES, true)
            || !$this->canRequest((int) $customer->id)
        ) {
            return;
        }

        $request = new ZementProRequest();
        $request->id_customer = (int) $customer->id;
        $request->type = $type;
        $request->status = ZementProRequest::PENDING;
        if ($request->add()) {
            $this->notifyShop($customer, $request);
        }
    }

    /** Se puede pedir la cuenta en el formulario si no hay ya una solicitud en revisión o aprobada. */
    private function canRequest(?int $idCustomer = null): bool
    {
        $page = $this->context->controller->php_self ?? '';
        if ($idCustomer === null && !in_array($page, self::FORM_PAGES, true)) {
            return false;
        }

        $idCustomer ??= (int) $this->context->customer->id;
        if (!$idCustomer) {
            return true;
        }

        $request = ZementProRequest::forCustomer($idCustomer);

        // Se puede volver a pedir tras un rechazo o una retirada, o si ya no está en su grupo.
        return $request === null
            || in_array($request->status, [ZementProRequest::REJECTED, ZementProRequest::REVOKED], true)
            || ($request->status === ZementProRequest::APPROVED && $this->proTypeOf($idCustomer) === null);
    }

    /** Tipo profesional del grupo por defecto del cliente (su tarifa real), o null si no es profesional. */
    private function proTypeOf(int $idCustomer): ?string
    {
        $idGroup = (int) Customer::getDefaultGroupId($idCustomer);
        $groups = json_decode((string) Configuration::get('ZEMENT_PRO_GROUPS'), true) ?: [];
        $type = array_search($idGroup, array_map('intval', $groups), true);

        return $type === false ? null : (string) $type;
    }

    /* ---------- Mi cuenta ---------- */

    public function hookDisplayCustomerAccountTop(): string
    {
        $customer = $this->context->customer;
        $strings = $this->strings();
        $request = ZementProRequest::forCustomer((int) $customer->id);
        // Lo que manda es el grupo real del cliente (la tarifa que ve), no solo la solicitud.
        $proType = $this->proTypeOf((int) $customer->id);

        if ($proType !== null) {
            $status = 'approved';
            $text = sprintf($strings['statusApproved'], $strings[$proType] ?? $proType);
        } elseif ($request?->status === ZementProRequest::PENDING) {
            $status = 'pending';
            $text = $strings['statusPending'];
        } elseif ($request?->status === ZementProRequest::REJECTED) {
            $status = 'rejected';
            $text = $strings['statusRejected'];
        } elseif ($request !== null) {
            // Retirada desde el panel, o aprobada y cambiada de grupo a mano en la ficha.
            $status = 'revoked';
            $text = $strings['statusRevoked'];
        } else {
            $status = 'none';
            $text = $strings['statusNone'];
        }

        $this->context->smarty->assign([
            'zementProStatus' => $status,
            'zementProText' => $text,
            'zementProAgain' => $strings['statusNone'],
            'zementProUrl' => $this->context->link->getPageLink('identity'),
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/account-status.tpl');
    }

    /** Muestra u oculta los datos de empresa según la casilla, y el texto de ayuda con el plazo. */
    public function hookActionFrontControllerSetMedia(): void
    {
        $page = $this->context->controller->php_self ?? '';
        $isForm = in_array($page, self::FORM_PAGES, true);
        if (!$isForm && $page !== 'my-account') {
            return;
        }

        $this->context->controller->registerStylesheet(
            'zementpro',
            'modules/' . $this->name . '/views/css/zementpro.css',
            ['media' => 'all', 'priority' => 200]
        );

        if ($isForm) {
            $strings = $this->strings();
            Media::addJsDef(['zementPro' => ['help' => sprintf($strings['help'], $this->responseTime())]]);
            $this->context->controller->registerJavascript(
                'zementpro',
                'modules/' . $this->name . '/views/js/zementpro.js',
                ['position' => 'bottom', 'priority' => 200]
            );
        }
    }

    /* ---------- Aprobar y rechazar (panel) ---------- */

    public function approve(ZementProRequest $request, int $idEmployee): bool
    {
        $idGroup = $this->groupFor($request->type);
        $customer = new Customer((int) $request->id_customer);
        if (!$idGroup || !Validate::isLoadedObject($customer)) {
            return false;
        }

        // El grupo por defecto decide los precios (tarifa del grupo, sin IVA).
        $customer->id_default_group = $idGroup;
        if (!$customer->update()) {
            return false;
        }
        $customer->updateGroup([$idGroup]);

        $request->status = ZementProRequest::APPROVED;
        $request->id_employee = $idEmployee;
        $request->update();

        $this->mailCustomer($customer, 'zementpro_approved', 'mailApproved', [
            '{type}' => $this->strings($this->customerIso($customer))[$request->type] ?? $request->type,
        ]);

        return true;
    }

    public function reject(ZementProRequest $request, int $idEmployee): bool
    {
        $customer = new Customer((int) $request->id_customer);
        if (!Validate::isLoadedObject($customer)) {
            return false;
        }

        $request->status = ZementProRequest::REJECTED;
        $request->id_employee = $idEmployee;
        $request->update();

        $this->mailCustomer($customer, 'zementpro_rejected', 'mailRejected');

        return true;
    }

    /** Retira una cuenta aprobada: el cliente vuelve al grupo de clientes (precios públicos). */
    public function revoke(ZementProRequest $request, int $idEmployee): bool
    {
        $customer = new Customer((int) $request->id_customer);
        $idCustomerGroup = (int) Configuration::get('PS_CUSTOMER_GROUP');
        if (!Validate::isLoadedObject($customer) || !$idCustomerGroup) {
            return false;
        }

        $customer->id_default_group = $idCustomerGroup;
        if (!$customer->update()) {
            return false;
        }
        $customer->updateGroup([$idCustomerGroup]);

        $request->status = ZementProRequest::REVOKED;
        $request->id_employee = $idEmployee;
        $request->update();

        $this->mailCustomer($customer, 'zementpro_revoked', 'mailRevoked');

        return true;
    }

    /** Grupo de clientes de cada tipo (ZEMENT_PRO_GROUPS, guardado por config/scripts/setup-pro.php). */
    public function groupFor(string $type): int
    {
        $groups = json_decode((string) Configuration::get('ZEMENT_PRO_GROUPS'), true) ?: [];

        return (int) ($groups[$type] ?? 0);
    }

    /* ---------- Correos ---------- */

    /** @param array<string, string> $vars */
    private function mailCustomer(Customer $customer, string $template, string $subjectKey, array $vars = []): void
    {
        $iso = $this->customerIso($customer);
        $strings = $this->strings($iso);

        Mail::send(
            (int) $customer->id_lang,
            $template,
            $strings[$subjectKey],
            $vars + [
                '{firstname}' => $customer->firstname,
                '{lastname}' => $customer->lastname,
                '{shop_url}' => $this->context->link->getPageLink('index', null, (int) $customer->id_lang),
                '{contact_email}' => (string) Configuration::get('PS_SHOP_EMAIL'),
            ],
            $customer->email,
            $customer->firstname . ' ' . $customer->lastname,
            null,
            null,
            null,
            null,
            __DIR__ . '/mails/'
        );
    }

    /** Aviso a la tienda (en español) con los datos para revisar la solicitud. */
    private function notifyShop(Customer $customer, ZementProRequest $request): void
    {
        $idLang = (int) Language::getIdByIso('es') ?: (int) Configuration::get('PS_LANG_DEFAULT');
        $strings = $this->strings('es');

        Mail::send(
            $idLang,
            'zementpro_request',
            'Nueva solicitud profesional: ' . ($customer->company ?: $customer->email),
            [
                '{firstname}' => $customer->firstname,
                '{lastname}' => $customer->lastname,
                '{email}' => $customer->email,
                '{company}' => (string) $customer->company,
                '{vat}' => (string) $customer->siret,
                '{type}' => $strings[$request->type] ?? $request->type,
                '{language}' => (string) Language::getIsoById((int) $customer->id_lang),
            ],
            (string) Configuration::get('PS_SHOP_EMAIL'),
            (string) Configuration::get('PS_SHOP_NAME'),
            null,
            null,
            null,
            null,
            __DIR__ . '/mails/'
        );
    }

    /* ---------- Utilidades ---------- */

    /** @return array<string, string> */
    private function strings(?string $iso = null): array
    {
        return ZementProStrings::forLanguage($iso ?? (string) $this->context->language->iso_code);
    }

    private function customerIso(Customer $customer): string
    {
        return (string) Language::getIsoById((int) $customer->id_lang) ?: 'es';
    }

    /** Plazo de respuesta en el idioma actual (config/company.php → ZEMENT_COMPANY). */
    private function responseTime(): string
    {
        $company = json_decode((string) Configuration::get('ZEMENT_COMPANY'), true) ?: [];
        $values = $company['responseTime'] ?? [];
        $iso = (string) $this->context->language->iso_code;

        return (string) ($values[$iso] ?? $values['en'] ?? '24 h');
    }
}
