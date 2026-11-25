<?php

/**
 * Portada de la tienda Zement: bloque principal y las familias del catálogo.
 *
 * Solo usa contenido que ya existe en los 8 idiomas (nombres de familia y de producto,
 * imágenes de las fichas y cadenas traducidas de PrestaShop): no añade textos de marca.
 * Estilos en el tema hijo (apps/tienda/theme/zement/assets/css/zement.css).
 */

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

class ZementHome extends Module
{
    private const PRODUCTS_PER_FAMILY = 3;

    public function __construct()
    {
        $this->name = 'zementhome';
        $this->tab = 'front_office_features';
        $this->version = '0.1.0';
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
            && $this->registerHook('displayHome')
            && $this->updatePosition((int) Hook::getIdByName('displayHome'), false, 1);
    }

    public function hookDisplayHome(): string
    {
        $idLang = (int) $this->context->language->id;
        $families = $this->getFamilies($idLang);

        $this->context->smarty->assign([
            'zementFamilies' => $families,
            'zementHero' => $families[0] ?? null,
        ]);

        return $this->fetch('module:zementhome/views/templates/hook/home.tpl');
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
                'name' => $category->name,
                'url' => $link->getCategoryLink($category),
                'count' => count($products),
                'image' => $image,
                'products' => array_map(
                    static fn (array $product): array => [
                        'name' => $product['name'],
                        'url' => $link->getProductLink((int) $product['id_product']),
                    ],
                    array_slice($products, 0, self::PRODUCTS_PER_FAMILY)
                ),
            ];
        }

        return $families;
    }
}
