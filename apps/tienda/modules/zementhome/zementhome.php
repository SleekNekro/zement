<?php

/**
 * Portada de la tienda Zement, al estilo de una tienda clásica: bloque principal, accesos a las
 * familias y, debajo, una fila de productos de cada familia (los productos, a la vista).
 *
 * Solo usa contenido que ya existe en los 8 idiomas (nombres de familia y de producto,
 * imágenes de las fichas y cadenas traducidas de PrestaShop): no añade textos de marca.
 * Estilos en el tema hijo (apps/tienda/theme/zement/assets/css/zement.css).
 */

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

use PrestaShop\PrestaShop\Adapter\Image\ImageRetriever;
use PrestaShop\PrestaShop\Adapter\Presenter\Product\ProductListingPresenter;
use PrestaShop\PrestaShop\Adapter\Product\PriceFormatter;
use PrestaShop\PrestaShop\Adapter\Product\ProductColorsRetriever;

class ZementHome extends Module
{
    /** Filas de catálogo en la portada (las demás familias, en el menú). */
    private const HOME_FAMILIES = 4;

    /**
     * Textos de la portada en los 8 idiomas. El titular y la acción profesional son los de la web
     * de marca (apps/web: data/home.ts e i18n/translations/<iso>.ts → hero), para no contradecirla.
     */
    private const STRINGS = [
        'es' => ['title' => ['La materia', 'lo transforma todo.'], 'pro' => 'Solicitar acceso profesional', 'system' => 'Ver el sistema',
            'proof' => ['Fichas técnicas en 8 idiomas', 'Normas EN 13813 y EN 13501-1', 'Sistema por capas Z.01–Z.04', 'Asesoramiento técnico']],
        'en' => ['title' => ['Material', 'transforms everything.'], 'pro' => 'Request professional access', 'system' => 'See the system',
            'proof' => ['Technical data sheets in 8 languages', 'EN 13813 and EN 13501-1 standards', 'Layered system Z.01–Z.04', 'Technical advice']],
        'de' => ['title' => ['Die Materie', 'verwandelt alles.'], 'pro' => 'Profi-Zugang beantragen', 'system' => 'Das System ansehen',
            'proof' => ['Technische Datenblätter in 8 Sprachen', 'Normen EN 13813 und EN 13501-1', 'Schichtsystem Z.01–Z.04', 'Technische Beratung']],
        'fr' => ['title' => ['La matière', 'transforme tout.'], 'pro' => 'Demander un accès professionnel', 'system' => 'Voir le système',
            'proof' => ['Fiches techniques en 8 langues', 'Normes EN 13813 et EN 13501-1', 'Système par couches Z.01–Z.04', 'Conseil technique']],
        'it' => ['title' => ['La materia', 'trasforma tutto.'], 'pro' => 'Richiedi l’accesso professionale', 'system' => 'Scopri il sistema',
            'proof' => ['Schede tecniche in 8 lingue', 'Norme EN 13813 ed EN 13501-1', 'Sistema a strati Z.01–Z.04', 'Consulenza tecnica']],
        'pl' => ['title' => ['Materiał', 'zmienia wszystko.'], 'pro' => 'Poproś o dostęp profesjonalny', 'system' => 'Zobacz system',
            'proof' => ['Karty techniczne w 8 językach', 'Normy EN 13813 i EN 13501-1', 'System warstwowy Z.01–Z.04', 'Doradztwo techniczne']],
        'no' => ['title' => ['Materialet', 'forandrer alt.'], 'pro' => 'Be om profesjonell tilgang', 'system' => 'Se systemet',
            'proof' => ['Tekniske datablad på 8 språk', 'Standardene EN 13813 og EN 13501-1', 'Lagvis system Z.01–Z.04', 'Teknisk rådgivning']],
        'fi' => ['title' => ['Materiaali', 'muuttaa kaiken.'], 'pro' => 'Hae ammattilaistiliä', 'system' => 'Tutustu järjestelmään',
            'proof' => ['Tekniset tuotekortit 8 kielellä', 'Standardit EN 13813 ja EN 13501-1', 'Kerroksittainen järjestelmä Z.01–Z.04', 'Tekninen neuvonta']],
    ];

    private const TEMPLATE = 'module:zementhome/views/templates/hook/home.tpl';

    /** Cambios de catálogo que vacían la caché de la portada. */
    public const CACHE_HOOKS = [
        'actionProductAdd',
        'actionProductUpdate',
        'actionProductDelete',
        'actionCategoryAdd',
        'actionCategoryUpdate',
        'actionCategoryDelete',
    ];

    public function __construct()
    {
        $this->name = 'zementhome';
        $this->tab = 'front_office_features';
        $this->version = '0.4.0';
        $this->author = 'Zement';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = ['min' => '9.0.0', 'max' => _PS_VERSION_];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = 'Zement · Portada';
        $this->description = 'Bloque principal y familias del catálogo en la portada de la tienda.';
    }

    public function install(): bool
    {
        return parent::install()
            && $this->registerHook(['displayHome', ...self::CACHE_HOOKS])
            && $this->updatePosition((int) Hook::getIdByName('displayHome'), false, 1);
    }

    public function uninstall(): bool
    {
        $this->clearHomeCache();

        return parent::uninstall();
    }

    /**
     * La portada se cachea por idioma (y tienda y moneda, en getCacheId): sin caché eran
     * 8 consultas de productos en cada visita.
     */
    public function hookDisplayHome(): string
    {
        $cacheId = $this->getCacheId('zementhome');

        if (!$this->isCached(self::TEMPLATE, $cacheId)) {
            $families = $this->getFamilies((int) $this->context->language->id);
            $iso = $this->context->language->iso_code;
            $strings = self::STRINGS[$iso] ?? self::STRINGS['en'];
            $company = json_decode((string) Configuration::get('ZEMENT_COMPANY'), true) ?: [];
            $phone = (string) ($company['phone'] ?? '');

            $this->context->smarty->assign([
                'zementFamilies' => array_slice($families, 0, self::HOME_FAMILIES),
                'zementHero' => [
                    'image' => $families[0]['image'] ?? null,
                    'title' => $strings['title'],
                    'pro' => ['label' => $strings['pro'], 'url' => $this->context->link->getPageLink('registration')],
                    // Página del sistema de microcemento en la web, en este idioma (setup-home.php).
                    'system' => ['label' => $strings['system'], 'url' => (string) Configuration::get('ZEMENT_SYSTEM_URL', (int) $this->context->language->id)],
                ],
                'zementProof' => [
                    'items' => array_slice($strings['proof'], 0, 3),
                    'advice' => $strings['proof'][3],
                    'phone' => $phone,
                    'tel' => preg_replace('/[^0-9+]/', '', $phone),
                ],
            ]);
        }

        return $this->fetch(self::TEMPLATE, $cacheId);
    }

    public function hookActionProductAdd(): void
    {
        $this->clearHomeCache();
    }

    public function hookActionProductUpdate(): void
    {
        $this->clearHomeCache();
    }

    public function hookActionProductDelete(): void
    {
        $this->clearHomeCache();
    }

    public function hookActionCategoryAdd(): void
    {
        $this->clearHomeCache();
    }

    public function hookActionCategoryUpdate(): void
    {
        $this->clearHomeCache();
    }

    public function hookActionCategoryDelete(): void
    {
        $this->clearHomeCache();
    }

    private function clearHomeCache(): void
    {
        $this->_clearCache(self::TEMPLATE);
    }

    /** @return list<array<string, mixed>> */
    private function getFamilies(int $idLang): array
    {
        $home = (int) Configuration::get('PS_HOME_CATEGORY');
        $link = $this->context->link;
        $families = [];

        foreach (Category::getChildren($home, $idLang, true) as $row) {
            $category = new Category((int) $row['id_category'], $idLang);
            $products = $category->getProducts($idLang, 1, 100, 'position', 'asc') ?: [];
            $image = null;

            foreach ($products as $product) {
                if (!empty($product['id_image']) && !str_ends_with((string) $product['id_image'], '-default')) {
                    // Imagen original (sin tipo): las miniaturas rellenan con blanco las fotos no
                    // cuadradas y aquí se recorta con object-fit.
                    $image = $link->getImageLink(
                        (string) $product['link_rewrite'],
                        (string) $product['id_image']
                    );
                    break;
                }
            }

            $families[] = [
                'id' => (int) $category->id,
                'name' => $category->name,
                'url' => $link->getCategoryLink($category),
                'count' => count($products),
                'image' => $image,
                'products' => $this->presentProducts($products),
            ];
        }

        return $families;
    }

    /**
     * Productos listos para la miniatura del tema (catalog/_partials/miniatures/product.tpl),
     * igual que los presenta ps_featuredproducts.
     *
     * @param list<array<string, mixed>> $rawProducts
     *
     * @return list<mixed>
     */
    private function presentProducts(array $rawProducts): array
    {
        $assembler = new ProductAssembler($this->context);
        $settings = (new ProductPresenterFactory($this->context))->getPresentationSettings();
        $presenter = new ProductListingPresenter(
            new ImageRetriever($this->context->link),
            $this->context->link,
            new PriceFormatter(),
            new ProductColorsRetriever(),
            $this->context->getTranslator()
        );

        return array_map(
            fn (array $product) => $presenter->present($settings, $product, $this->context->language),
            $assembler->assembleProducts($rawProducts)
        );
    }
}
