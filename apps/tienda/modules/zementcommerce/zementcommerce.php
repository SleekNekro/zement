<?php

/**
 * Herramientas de venta de Zement en la tienda (fase 1 del plan comercial):
 *
 * - Miniaturas con el tipo de producto, el formato y el dato clave de la ficha (P7).
 * - Sellos de norma (EN 13813, EN 13501-1) junto al resumen del producto (P8).
 * - Calculadora de cantidades con los consumos de la ficha (P2).
 * - «Complete su sistema»: los productos del sistema en orden de aplicación (P1).
 * - Asesor «¿Qué va a hacer?» en la portada (P10) y enlace «Profesionales» en la barra (P14).
 * - Enlaces estables /z/p/<clave> y /z/c/<familia> para la web de marca (P19).
 * - Fase 2: barra de confianza con datos reales en ficha, carrito y pedido, y aviso de envío
 *   gratuito en el carrito. Datos: ZEMENT_COMPANY (apps/tienda/config/company.php).
 * - Presupuesto: mientras un producto no se vende, «Solicitar presupuesto» abre el formulario
 *   de contacto con el producto, el formato y las cantidades calculadas ya escritos.
 * - Productos sin foto: casilla con la capa del sistema y el envase en lugar de la imagen vacía.
 * - Listados de familia: filtros rápidos por capa y tipo, y vista en tabla para comparar.
 * - Fase 3: aviso de cookies (packages/consent, copiado en views/consent con pnpm consent:sync).
 *   Google Analytics 4 (ZEMENT_GA4_ID) solo se carga si el visitante acepta la analítica.
 *
 * Datos: data/commerce.json, generado con apps/tienda/catalog/scripts/build_commerce.py desde
 * las fichas técnicas y apps/tienda/catalog/commerce.json. Los productos se reconocen por su
 * URL amigable en español (= clave del catálogo), que no cambia entre instalaciones.
 */

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

require_once __DIR__ . '/ZementCommerceStrings.php';

class ZementCommerce extends Module
{
    public const HOOKS = [
        'displayProductListReviews',
        'displayZementProductBadges',
        'displayZementProductTools',
        'displayZementHomeProjects',
        'displayNav1',
        'actionFrontControllerSetMedia',
        'moduleRoutes',
        'displayReassurance',
        'displayShoppingCart',
        'displayAfterBodyOpeningTag',
        'displayZementQuote',
        'displayZementNoPhoto',
        'displayZementListingTools',
    ];

    /** Sube al añadir finalidades nuevas al aviso de cookies: se vuelve a pedir el consentimiento. */
    private const CONSENT_VERSION = 1;

    /** @var array<string, mixed>|null */
    private static ?array $data = null;

    /** @var array<int, string>|null id_product => clave */
    private static ?array $productKeys = null;

    public function __construct()
    {
        $this->name = 'zementcommerce';
        $this->tab = 'front_office_features';
        $this->version = '0.6.0';
        $this->author = 'Zement';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = ['min' => '9.0.0', 'max' => _PS_VERSION_];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = 'Zement · Venta';
        $this->description = 'Calculadora, sistema completo, datos de ficha en los listados, asesor de proyecto y enlaces estables.';
    }

    public function install(): bool
    {
        return parent::install() && $this->registerHook(self::HOOKS);
    }

    /** Enlaces estables: /z/p/<clave-de-producto> y /z/c/<clave-de-familia>. */
    public function hookModuleRoutes(): array
    {
        return [
            'module-zementcommerce-go' => [
                'controller' => 'go',
                'rule' => 'z/{kind}/{key}',
                'keywords' => [
                    'kind' => ['regexp' => '[pc]', 'param' => 'kind'],
                    'key' => ['regexp' => '[a-z0-9-]+', 'param' => 'key'],
                ],
                'params' => ['fc' => 'module', 'module' => $this->name],
            ],
        ];
    }

    public function hookActionFrontControllerSetMedia(): void
    {
        $this->fingerprintAssets();

        $this->context->controller->registerStylesheet(
            'zementcommerce-consent',
            'modules/' . $this->name . '/views/consent/consent.css',
            ['media' => 'all', 'priority' => 250]
        );
        $this->context->controller->registerJavascript(
            'zementcommerce-consent',
            'modules/' . $this->name . '/views/consent/consent.js',
            ['position' => 'bottom', 'priority' => 10]
        );

        if ($this->context->controller->php_self === 'category') {
            $this->context->controller->registerJavascript(
                'zementcommerce-listing',
                'modules/' . $this->name . '/views/js/listing.js',
                ['position' => 'bottom', 'priority' => 200]
            );
        }

        if ($this->context->controller->php_self === 'product') {
            $this->context->controller->registerJavascript(
                'zementcommerce-calculator',
                'modules/' . $this->name . '/views/js/calculator.js',
                ['position' => 'bottom', 'priority' => 200]
            );
        }
    }

    /** Miniatura: tipo de producto, formato y dato clave (sale en el hueco de las reseñas). */
    public function hookDisplayProductListReviews(array $params): string
    {
        $info = $this->productInfo($this->productId($params));

        if ($info === null) {
            return '';
        }

        $this->context->smarty->assign(['zementInfo' => $info]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/miniature.tpl');
    }

    public function hookDisplayZementProductBadges(array $params): string
    {
        $info = $this->productInfo($this->productId($params));

        if ($info === null || !$info['norms']) {
            return '';
        }

        $this->context->smarty->assign(['zementNorms' => $info['norms']]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/badges.tpl');
    }

    /** Ficha: calculadora del producto y «Complete su sistema». */
    public function hookDisplayZementProductTools(array $params): string
    {
        $productId = $this->productId($params);
        $key = $this->keyOf($productId);

        if ($key === null) {
            return '';
        }

        $data = $this->data();
        $calculator = $data['calculator'][$key] ?? null;
        $system = $this->systemFor($key);

        if ($calculator === null && $system === null) {
            return '';
        }

        $this->context->smarty->assign([
            'zementStrings' => ZementCommerceStrings::forLanguage($this->context->language->iso_code),
            'zementCalculator' => $this->withFormatIds($calculator, $productId),
            'zementSystem' => $system,
            'zementProductKey' => $key,
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/tools.tpl');
    }

    /** Portada: asesor «¿Qué va a hacer?», un acceso por proyecto a su familia. */
    public function hookDisplayZementHomeProjects(): string
    {
        $iso = $this->context->language->iso_code;
        $link = $this->context->link;
        $projects = [];

        foreach ($this->data()['projects'] as $project) {
            // Un proyecto con sistema lleva a su ficha principal («Complete su sistema»); el resto, a su familia.
            $target = $project['target'];
            $url = isset($target['product'])
                ? $this->stableUrl('p', $target['product'])
                : $this->stableUrl('c', $target['category'] ?? '');
            if ($url === null) {
                continue;
            }
            $projects[] = [
                'label' => $project['label'][$iso] ?? $project['label']['en'],
                'url' => $url,
                'image' => $this->projectPhoto($project['key'])
                    ?? ($project['image'] ? $this->coverUrl($this->idOf($project['image']), null) : null),
            ];
        }

        $this->context->smarty->assign([
            'zementProjects' => $projects,
            'zementStrings' => ZementCommerceStrings::forLanguage($iso),
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/projects.tpl');
    }

    /**
     * Barra superior: «Volver a la web» (portada de la web) y «Profesionales» (sección de
     * profesionales de la web), en el idioma de la tienda. En móvil pasan al menú lateral.
     */
    public function hookDisplayNav1(): string
    {
        $idLang = (int) $this->context->language->id;
        $webUrl = (string) Configuration::get('ZEMENT_WEB_HOME_URL', $idLang);
        $professionalsUrl = (string) Configuration::get('ZEMENT_PROFESSIONALS_URL', $idLang);

        if ($webUrl === '' && $professionalsUrl === '') {
            return '';
        }

        $this->context->smarty->assign([
            'zementWebUrl' => $webUrl,
            'zementProfessionalsUrl' => $professionalsUrl,
            'zementStrings' => ZementCommerceStrings::forLanguage($this->context->language->iso_code),
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/nav.tpl');
    }

    /**
     * Barra de confianza en la ficha, el carrito y el pedido: solo datos reales de Zement
     * (config/company.php). Lo pendiente (null) no se muestra.
     */
    public function hookDisplayReassurance(): string
    {
        $company = $this->company();
        $iso = $this->context->language->iso_code;
        $strings = ZementCommerceStrings::forLanguage($iso);
        $local = static fn (?array $values): ?string => $values === null ? null : ($values[$iso] ?? $values['en'] ?? null);
        $items = [];

        if (!empty($company['phone'])) {
            $items[] = [
                'label' => $strings['trustAdvice'],
                'value' => $company['phone'],
                'href' => 'tel:' . preg_replace('/[^0-9+]/', '', (string) $company['phone']),
                'detail' => $local($company['hours'] ?? null),
            ];
        }
        if ($response = $local($company['responseTime'] ?? null)) {
            $items[] = ['label' => $strings['trustResponse'], 'value' => $response, 'href' => null, 'detail' => null];
        }
        if ($area = $local($company['area'] ?? null)) {
            $items[] = ['label' => $strings['trustArea'], 'value' => $area, 'href' => null, 'detail' => null];
        }
        if ($threshold = $this->freeShippingThreshold()) {
            $items[] = [
                'label' => sprintf($strings['freeShippingFrom'], $this->formatPrice($threshold)),
                'value' => null,
                'href' => null,
                'detail' => null,
            ];
        }
        if ($delivery = $local($company['delivery'] ?? null)) {
            $items[] = ['label' => $strings['trustDelivery'], 'value' => $delivery, 'href' => null, 'detail' => null];
        }
        if ($returns = $local($company['returns'] ?? null)) {
            $items[] = ['label' => $strings['trustReturns'], 'value' => $returns, 'href' => null, 'detail' => null];
        }

        if (!$items) {
            return '';
        }

        $this->context->smarty->assign(['zementTrust' => $items, 'zementStrings' => $strings]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/trust.tpl');
    }

    /** Carrito: cuánto falta para el envío gratuito (solo si hay importe configurado). */
    public function hookDisplayShoppingCart(): string
    {
        $threshold = $this->freeShippingThreshold();
        $cart = $this->context->cart;

        if (!$threshold || !Validate::isLoadedObject($cart) || !$cart->nbProducts()) {
            return '';
        }

        $total = (float) $cart->getOrderTotal(true, Cart::BOTH_WITHOUT_SHIPPING);
        $missing = max(0.0, $threshold - $total);
        $strings = ZementCommerceStrings::forLanguage($this->context->language->iso_code);

        $this->context->smarty->assign([
            'zementFreeShipping' => [
                'text' => $missing > 0 ? sprintf($strings['freeShippingLeft'], $this->formatPrice($missing)) : $strings['freeShippingDone'],
                'progress' => (int) round(min(1, $total / $threshold) * 100),
            ],
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/free-shipping.tpl');
    }

    /**
     * Configuración del aviso de cookies (la lee views/consent/consent.js): textos del idioma,
     * política de cookies de la web en ese idioma e identificador de Google Analytics 4.
     */
    public function hookDisplayAfterBodyOpeningTag(): string
    {
        $iso = $this->context->language->iso_code;
        $strings = json_decode((string) file_get_contents(__DIR__ . '/views/consent/strings.json'), true) ?: [];
        $config = [
            'version' => self::CONSENT_VERSION,
            'gaId' => (string) Configuration::get('ZEMENT_GA4_ID'),
            'policyUrl' => (string) Configuration::get('ZEMENT_COOKIES_URL', (int) $this->context->language->id),
            'strings' => $strings[$iso] ?? $strings['en'] ?? null,
        ];

        // JSON en <script>: «</» escapado para que el texto no pueda cerrar la etiqueta.
        $json = json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);

        return '<script type="application/json" id="zm-consent-config">' . $json . '</script>';
    }

    /**
     * Ficha de un producto que aún no se vende: «Solicitar presupuesto». El enlace lleva el mensaje
     * escrito (producto y línea de entrega); views/js/calculator.js le añade el formato elegido y
     * las cantidades calculadas en cuanto cambian.
     */
    public function hookDisplayZementQuote(array $params): string
    {
        $productId = $this->productId($params);
        $iso = $this->context->language->iso_code;
        $strings = ZementCommerceStrings::forLanguage($iso);
        $name = (string) Product::getProductName($productId, null, (int) $this->context->language->id);
        $lines = [$strings['quoteRequest'], $strings['quoteProduct'] . ': ' . $name];

        $this->context->smarty->assign([
            'zementQuote' => [
                'url' => $this->context->link->getPageLink('contact'),
                'productId' => $productId,
                'base' => $lines,
                'delivery' => $strings['quoteDelivery'] . ': ',
                // En una sola línea: la redirección canónica de PrestaShop no admite saltos de línea
                // en la URL (se perdería el mensaje). El formulario los vuelve a poner (contactform.tpl).
                'message' => implode(' | ', [...$lines, $strings['quoteDelivery'] . ': ']),
                'labels' => [
                    'format' => $strings['quoteFormat'],
                    'area' => $strings['quoteArea'],
                    'coats' => $strings['quoteCoats'],
                    'thickness' => $strings['quoteThickness'],
                    'quantity' => $strings['quoteQuantity'],
                    'system' => $strings['quoteSystem'],
                ],
            ],
            'zementStrings' => $strings,
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/quote.tpl');
    }

    /**
     * Producto sin foto (TODO: fotos reales): en lugar de la imagen por defecto, una casilla con lo
     * que lo identifica, el código de su capa en el sistema (Z.01…) o su capa, y su envase.
     * `variant`: «product» (ficha) o «miniature» (tarjeta).
     */
    public function hookDisplayZementNoPhoto(array $params): string
    {
        $productId = $this->productId($params);
        $key = $this->keyOf($productId);
        $info = $this->productInfo($productId);

        $code = null;
        foreach ($key === null ? [] : $this->data()['systems'] as $system) {
            foreach ($system['steps'] as $step) {
                if ($step['product'] === $key && str_starts_with($step['code'], 'Z.')) {
                    $code = $step['code'];
                }
            }
        }

        $this->context->smarty->assign([
            'zementNoPhoto' => [
                'variant' => ($params['variant'] ?? 'product') === 'miniature' ? 'miniature' : 'product',
                'label' => $code ?? ($info['layer'] ?? null),
                'format' => $info['formats'] ?? $info['format'] ?? null,
                'logo' => $this->context->link->getBaseLink() . 'themes/zement/assets/img/zement-logo-paper.svg',
            ],
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/no-photo.tpl');
    }

    /**
     * Listado de una familia: filtros rápidos (capa, tipo) y la vista en tabla con los datos de
     * ficha de cada producto. Un filtro solo sale si separa la familia en grupos de dos o más
     * productos; una columna, si algún producto tiene el dato.
     */
    public function hookDisplayZementListingTools(array $params): string
    {
        $category = $params['category'] ?? null;
        $categoryId = (int) (is_array($category) ? ($category['id'] ?? 0) : ($category->id ?? 0));

        if ($categoryId === 0) {
            return '';
        }

        $idLang = (int) $this->context->language->id;
        $rows = Db::getInstance()->executeS(
            'SELECT cp.id_product FROM `' . _DB_PREFIX_ . 'category_product` cp
            INNER JOIN `' . _DB_PREFIX_ . 'product_shop` ps
                ON ps.id_product = cp.id_product AND ps.id_shop = ' . (int) $this->context->shop->id . '
            WHERE cp.id_category = ' . $categoryId . ' AND ps.active = 1 AND ps.visibility IN ("both", "catalog")
            ORDER BY cp.position'
        ) ?: [];

        $products = [];
        foreach (array_column($rows, 'id_product') as $id) {
            $id = (int) $id;
            $info = $this->productInfo($id);
            if ($info === null) {
                continue;
            }
            $products[] = [
                'id' => $id,
                'name' => Product::getProductName($id, null, $idLang),
                'url' => $this->context->link->getProductLink($id),
                'type' => $info['subtitle'] ?? null,
                'layer' => $info['layer'] ?? null,
                'aggregate' => $info['aggregateValue'] ?? null,
                'thickness' => $info['thickness'] ?? null,
                'formats' => $info['formats'] ?? $info['format'] ?? null,
            ];
        }

        if (count($products) < 2) {
            return '';
        }

        $strings = ZementCommerceStrings::forLanguage($this->context->language->iso_code);

        $facets = [];
        foreach (['layer' => 'filterLayer', 'type' => 'filterType'] as $field => $label) {
            $counts = array_count_values(array_filter(array_column($products, $field), 'is_string'));
            if (count($counts) >= 2 && count($counts) <= 5 && min($counts) >= 2
                && array_sum($counts) === count($products)) {
                $values = array_map('strval', array_keys($counts));
                $facets[] = [
                    'field' => $field,
                    'label' => $strings[$label],
                    'values' => array_combine($values, $this->shortLabels($values)),
                ];
            }
        }

        $columns = [];
        foreach (['type' => 'colType', 'layer' => 'colLayer', 'aggregate' => 'colAggregate',
            'thickness' => 'colThickness', 'formats' => 'colFormats'] as $field => $label) {
            if (array_filter(array_column($products, $field))) {
                $columns[] = ['field' => $field, 'label' => $strings[$label]];
            }
        }

        $this->context->smarty->assign([
            'zementListing' => [
                'id' => $categoryId,
                'facets' => $facets,
                'columns' => $columns,
                'products' => $products,
                // Para filtrar las tarjetas del tema (data-id-product) sin tocar su plantilla.
                'index' => json_encode(
                    array_map(fn ($p) => ['id' => $p['id'], 'layer' => $p['layer'], 'type' => $p['type']], $products),
                    JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE
                ),
                'strings' => $strings,
            ],
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/listing.tpl');
    }

    /**
     * Etiquetas cortas para los filtros: quita las palabras que comparten todos los valores, estén
     * donde estén («MICROCEMENTO BICOMPONENTE» → «Bicomponente»; «TOKOMPONENTS MIKROSEMENT KLAR
     * TIL BRUK» → «Tokomponents klar til bruk»), y el final común de los compuestos con guion
     * («ZWEIKOMPONENTEN-MIKROZEMENT» → «Zweikomponenten»). Lo que queda son adjetivos: va en
     * minúscula con la inicial en mayúscula (y la del compuesto, que en alemán es sustantivo).
     *
     * @param list<string> $values
     *
     * @return list<string>
     */
    private function shortLabels(array $values): array
    {
        $words = array_map(fn (string $value) => preg_split('/\s+/u', trim($value)), $values);
        $shared = array_values(array_intersect(...array_map('array_unique', $words)));

        if ($shared) {
            $trimmed = array_map(fn ($w) => array_values(array_diff($w, $shared)), $words);
            if (min(array_map('count', $trimmed)) > 0) {
                $words = $trimmed;
            }
        }

        $labels = array_map(fn ($w) => implode(' ', $w), $words);
        $compound = false;

        $suffixes = array_map(fn ($label) => preg_match('/(-[^\s-]+)$/u', $label, $m) ? $m[1] : null, $labels);
        if ($suffixes[0] !== null && count(array_unique($suffixes)) === 1) {
            $labels = array_map(fn ($label) => mb_substr($label, 0, -mb_strlen($suffixes[0])), $labels);
            $compound = true;
        }

        if ($labels === $values) {
            return $values;
        }

        $capital = fn (string $word) => mb_strtoupper(mb_substr($word, 0, 1)) . mb_substr($word, 1);

        return array_map(function (string $label) use ($capital, $compound): string {
            $label = $capital(mb_strtolower($label));
            if ($compound) {
                $label = preg_replace_callback('/(\S+)$/u', fn ($m) => $capital($m[1]), $label);
            }

            return $label;
        }, $labels);
    }

    /**
     * Huella de los paquetes CSS y JS del tema (CCC). PrestaShop los nombra por la lista de
     * archivos más un número de versión que solo sube al vaciar la caché desde el back office: si
     * cambia el contenido pero no la lista, el nombre no cambia y el navegador sigue usando el
     * paquete viejo (y la tienda, el paquete ya generado). Aquí la versión de esta petición lleva
     * además la fecha y el tamaño de nuestros CSS y JS: al editar un archivo o cambiar de rama, el
     * nombre cambia, la tienda genera el paquete nuevo y el navegador lo descarga.
     */
    private function fingerprintAssets(): void
    {
        $roots = [
            _PS_THEME_DIR_ . 'assets',
            _PS_MODULE_DIR_ . 'zementcommerce/views',
            _PS_MODULE_DIR_ . 'zementhome/views',
        ];
        $files = ['css' => [], 'js' => []];

        foreach ($roots as $root) {
            if (!is_dir($root)) {
                continue;
            }
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
            );
            foreach ($iterator as $file) {
                $extension = $file->getExtension();
                if (isset($files[$extension]) && !str_contains($file->getPathname(), '/assets/cache/')) {
                    $files[$extension][] = $file->getPathname() . ':' . $file->getMTime() . ':' . $file->getSize();
                }
            }
        }

        foreach (['css' => 'PS_CCCCSS_VERSION', 'js' => 'PS_CCCJS_VERSION'] as $extension => $key) {
            sort($files[$extension]);
            $base = (string) Configuration::get($key);
            // Solo en esta petición (no se guarda): se conserva el número del back office delante.
            Configuration::set($key, $base . '-' . substr(sha1(implode('|', $files[$extension])), 0, 8));
        }
    }

    /**
     * Añade a cada envase de la calculadora el valor «Formato» (id_attribute) de su combinación,
     * para que views/js/calculator.js cuente con el formato elegido aunque la ficha ordene los
     * formatos de otra manera. Las combinaciones se crean en el orden de la tarifa (= packs).
     *
     * @param array<string, mixed>|null $calculator
     *
     * @return array<string, mixed>|null
     */
    private function withFormatIds(?array $calculator, int $productId): ?array
    {
        if ($calculator === null || empty($calculator['packs'])) {
            return $calculator;
        }

        $attributes = array_column(Db::getInstance()->executeS(
            'SELECT pac.id_attribute FROM `' . _DB_PREFIX_ . 'product_attribute` pa
            JOIN `' . _DB_PREFIX_ . 'product_attribute_combination` pac ON pac.id_product_attribute = pa.id_product_attribute
            WHERE pa.id_product = ' . $productId . ' ORDER BY pa.id_product_attribute'
        ) ?: [], 'id_attribute');

        foreach ($calculator['packs'] as $index => &$pack) {
            $pack['attribute'] = isset($attributes[$index]) ? (int) $attributes[$index] : null;
        }

        return $calculator;
    }

    /** URL de la ficha o de la familia a partir de su clave (controlador «go»). */
    public function stableUrl(string $kind, string $key): ?string
    {
        if ($kind === 'p') {
            $id = $this->idOf($key);

            return $id ? $this->context->link->getProductLink($id) : null;
        }

        $id = $this->categoryId($key);

        return $id ? $this->context->link->getCategoryLink($id) : null;
    }

    /** @return array<string, mixed> Datos de empresa (config/company.php vía setup-commerce). */
    private function company(): array
    {
        $json = (string) Configuration::get('ZEMENT_COMPANY');

        return $json === '' ? [] : (json_decode($json, true) ?: []);
    }

    /** Importe para el envío gratuito en la moneda del cliente (0 = no hay envío gratuito). */
    private function freeShippingThreshold(): float
    {
        $threshold = (float) Configuration::get('PS_SHIPPING_FREE_PRICE');

        return $threshold > 0 ? (float) Tools::convertPrice($threshold, $this->context->currency) : 0.0;
    }

    private function formatPrice(float $amount): string
    {
        return $this->context->getCurrentLocale()->formatPrice($amount, $this->context->currency->iso_code);
    }

    /** @return array<string, mixed> */
    private function data(): array
    {
        if (self::$data === null) {
            $json = (string) file_get_contents(__DIR__ . '/data/commerce.json');
            self::$data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        }

        return self::$data;
    }

    private function productId(array $params): int
    {
        $product = $params['product'] ?? null;

        if (is_object($product) && isset($product->id)) {
            return (int) $product->id;
        }

        return (int) ($product['id_product'] ?? $product['id'] ?? 0);
    }

    /** @return array<int, string> */
    private function productKeys(): array
    {
        if (self::$productKeys === null) {
            $rows = Db::getInstance()->executeS(
                'SELECT id_product, link_rewrite FROM `' . _DB_PREFIX_ . 'product_lang`
                WHERE id_lang = ' . (int) Language::getIdByIso('es') . ' AND id_shop = ' . (int) $this->context->shop->id
            ) ?: [];
            self::$productKeys = array_column($rows, 'link_rewrite', 'id_product');
        }

        return self::$productKeys;
    }

    private function keyOf(int $productId): ?string
    {
        $key = $this->productKeys()[$productId] ?? null;

        return $key !== null && isset($this->data()['products'][$key]) ? $key : null;
    }

    private function idOf(string $key): ?int
    {
        $id = array_search($key, $this->productKeys(), true);

        return $id === false ? null : (int) $id;
    }

    private function categoryId(string $key): ?int
    {
        $name = $this->data()['categories'][$key] ?? null;

        if ($name === null) {
            return null;
        }

        $row = Category::searchByNameAndParentCategoryId(
            (int) Language::getIdByIso('es'),
            $name,
            (int) Configuration::get('PS_HOME_CATEGORY')
        );

        return $row ? (int) $row['id_category'] : null;
    }

    /** @return array<string, mixed>|null */
    private function productInfo(int $productId): ?array
    {
        $key = $this->keyOf($productId);

        if ($key === null) {
            return null;
        }

        $languages = $this->data()['products'][$key];

        return $languages[$this->context->language->iso_code] ?? $languages['en'];
    }

    /** Sistema al que pertenece el producto, con nombre, enlace y formato de cada paso. */
    private function systemFor(string $key): ?array
    {
        $iso = $this->context->language->iso_code;
        $idLang = (int) $this->context->language->id;
        $data = $this->data();

        foreach ($data['systems'] as $system) {
            if (!in_array($key, array_column($system['steps'], 'product'), true)) {
                continue;
            }

            $steps = [];
            foreach ($system['steps'] as $step) {
                $id = $this->idOf($step['product']);
                if ($id === null) {
                    continue;
                }
                $info = $data['products'][$step['product']][$iso] ?? $data['products'][$step['product']]['en'];
                $steps[] = [
                    'code' => $step['code'],
                    'key' => $step['product'],
                    'name' => Product::getProductName($id, null, $idLang),
                    'subtitle' => $info['subtitle'],
                    'format' => $info['format'],
                    'url' => $this->context->link->getProductLink($id),
                    'image' => $this->coverUrl($id),
                    'calculator' => $this->withFormatIds($data['calculator'][$step['product']] ?? null, $id),
                    'current' => $step['product'] === $key,
                ];
            }

            return [
                'name' => $system['name'][$iso] ?? $system['name']['en'],
                'steps' => $steps,
            ];
        }

        return null;
    }

    /**
     * Foto de un proyecto del asesor: la del tema (assets/img/proyectos/<clave>.jpg) o, si no
     * está, la portada del producto de `image` en commerce.json.
     */
    private function projectPhoto(string $key): ?string
    {
        $path = 'themes/' . _THEME_NAME_ . '/assets/img/proyectos/' . $key . '.jpg';

        return is_file(_PS_ROOT_DIR_ . '/' . $path) ? $this->context->link->getBaseLink() . $path : null;
    }

    /**
     * Foto de portada del producto. Sin tipo ($type = null), la original: los tipos de imagen
     * rellenan con blanco las fotos que no son cuadradas y aquí se recortan con object-fit.
     */
    private function coverUrl(?int $productId, ?string $type = 'small_default'): ?string
    {
        if (!$productId) {
            return null;
        }

        $cover = Product::getCover($productId);

        if (!$cover) {
            return null;
        }

        $rewrite = $this->productKeys()[$productId] ?? '';

        return $this->context->link->getImageLink($rewrite, $productId . '-' . (int) $cover['id_image'], $type);
    }
}
