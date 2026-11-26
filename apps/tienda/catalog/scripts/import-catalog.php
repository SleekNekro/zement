<?php

/**
 * Importa el catálogo de Zement en PrestaShop a partir de las fichas técnicas extraídas.
 *
 * Lee la carpeta preparada por import.sh dentro del contenedor:
 *   catalog.json         familias y datos comerciales (precio y referencia; null = TODO)
 *   products/<key>.json  contenido de la ficha en los 8 idiomas (extract_sheets.py)
 *   images/<key>.jpg     muestra del efecto acabado, si la ficha la trae
 *   pdfs/<key>-<iso>.pdf ficha técnica original de cada idioma
 *
 * Es idempotente: el producto se reconoce por su URL amigable en español (= clave del JSON).
 * Al repetirlo se actualizan textos, familias, imagen y fichas PDF; no toca precio ni
 * referencia si ya se han puesto en el panel y catalog.json no trae otros.
 *
 * Uso: docker exec zement-prestashop-1 php /tmp/zement-catalog/scripts/import-catalog.php
 *      [--deactivate-others]  desactiva los productos y categorías de demostración
 */

declare(strict_types=1);

require '/var/www/html/config/config.inc.php';
require __DIR__ . '/ZementSheetHtml.php';

final class ZementCatalogImporter
{
    private const ROOT = '/tmp/zement-catalog';
    private const ATTACHMENT_NAME_SIZE = 32;

    /** @var array<string, int> iso => id_lang */
    private array $languages = [];

    /** @var array<string, int> clave de familia => id_category */
    private array $categories = [];

    /** @var list<int> */
    private array $importedProducts = [];

    private int $homeCategory;

    public function __construct(private readonly bool $deactivateOthers)
    {
        $this->homeCategory = (int) Configuration::get('PS_HOME_CATEGORY');
    }

    public function run(): void
    {
        $catalog = $this->readJson(self::ROOT . '/catalog.json');

        foreach ($catalog['languages'] as $iso) {
            $id = (int) Language::getIdByIso($iso, true);
            if ($id === 0) {
                throw new RuntimeException("Idioma {$iso} sin instalar: ejecutar install-languages.php");
            }
            $this->languages[$iso] = $id;
        }

        foreach ($catalog['categories'] as $position => $category) {
            $this->categories[$category['key']] = $this->saveCategory($category, $position);
        }

        $this->orderCategories();

        foreach ($catalog['products'] as $entry) {
            $sheet = $this->readJson(self::ROOT . "/products/{$entry['key']}.json");
            $this->importedProducts[] = $this->saveProduct($entry, $sheet);
        }

        if ($this->deactivateOthers) {
            $this->deactivateOthers();
        }

        Tools::clearSf2Cache();
        echo count($this->importedProducts) . " productos importados.\n";
    }

    /** @param array<string, mixed> $data */
    private function saveCategory(array $data, int $position): int
    {
        $idEs = $this->languages['es'];
        $existing = Category::searchByNameAndParentCategoryId($idEs, $data['name']['es'], $this->homeCategory);
        $category = new Category($existing ? (int) $existing['id_category'] : null);

        $category->id_parent = $this->homeCategory;
        $category->active = true;
        $category->position = $position;

        foreach ($this->languages as $iso => $idLang) {
            $name = $data['name'][$iso] ?? $data['name']['es'];
            $category->name[$idLang] = $name;
            $category->link_rewrite[$idLang] = Tools::str2url($name);
        }

        $category->save();
        echo ($existing ? '= ' : '+ ') . "familia {$data['key']} (id {$category->id})\n";

        return (int) $category->id;
    }

    /** Orden de catalog.json en el árbol de categorías y en el menú principal (ps_mainmenu). */
    private function orderCategories(): void
    {
        $db = Db::getInstance();
        $position = 0;

        foreach ($this->categories as $id) {
            $db->update('category', ['position' => $position], 'id_category = ' . (int) $id);
            $db->update('category_shop', ['position' => $position], 'id_category = ' . (int) $id);
            ++$position;
        }

        $items = implode(',', array_map(static fn (int $id): string => 'CAT' . $id, $this->categories));
        Configuration::updateValue('MOD_BLOCKTOPMENU_ITEMS', $items);
    }

    /**
     * @param array<string, mixed> $entry
     * @param array<string, mixed> $sheet
     */
    private function saveProduct(array $entry, array $sheet): int
    {
        $key = $entry['key'];
        $idEs = $this->languages['es'];
        $existingId = (int) Db::getInstance()->getValue(
            'SELECT id_product FROM `' . _DB_PREFIX_ . 'product_lang`
            WHERE id_lang = ' . $idEs . " AND link_rewrite = '" . pSQL($key) . "'"
        );
        $product = new Product($existingId ?: null, false);
        $categoryId = $this->categories[$entry['category']];
        $hasPrice = $entry['price'] !== null;

        foreach ($this->languages as $iso => $idLang) {
            $content = $sheet['languages'][$iso] ?? $sheet['languages']['es'];
            $html = new ZementSheetHtml($content);

            $product->name[$idLang] = $content['name'];
            $product->link_rewrite[$idLang] = $iso === 'es' ? $key : Tools::str2url($content['name']);
            $product->description_short[$idLang] = $html->summary();
            $product->description[$idLang] = $html->body();
            $product->meta_title[$idLang] = $content['name'];
            $product->meta_description[$idLang] = $html->metaDescription();
        }

        $product->id_category_default = $categoryId;
        $product->state = Product::STATE_SAVED;
        $product->visibility = 'both';
        $product->condition = 'new';
        // Sin precio (TODO) no se enseña «0,00 €» ni el botón de compra: solo la ficha.
        $product->available_for_order = $hasPrice;
        $product->show_price = $hasPrice;
        $product->minimal_quantity = 1;

        // TODO: contenido real. Sin precio no se puede vender: se deja desactivado.
        if ($hasPrice) {
            $product->price = (float) $entry['price'];
        } elseif (!$existingId) {
            $product->price = 0;
        }
        if ($entry['reference'] !== null) {
            $product->reference = (string) $entry['reference'];
        }
        if (!$existingId) {
            // Impuestos aún sin configurar en la tienda (fase B2C): TODO asignar regla de IVA.
            $product->id_tax_rules_group = 0;
            $product->active = $hasPrice;
        }

        $product->save();
        $product->updateCategories([$categoryId]);
        $this->replaceImages($product, $sheet['images'] ?? [], $key);
        $this->replaceAttachments($product, $sheet, $key);
        Search::indexation(false, (int) $product->id);

        echo ($existingId ? '= ' : '+ ') . "{$key} (id {$product->id})" . ($hasPrice ? '' : ' · sin precio: se ve la ficha, sin precio ni compra') . "\n";

        return (int) $product->id;
    }

    /** @param list<string> $files */
    private function replaceImages(Product $product, array $files, string $key): void
    {
        $product->deleteImages();

        foreach ($files as $position => $file) {
            $source = self::ROOT . "/images/{$file}";
            if (!is_file($source)) {
                continue;
            }

            $image = new Image();
            $image->id_product = (int) $product->id;
            $image->position = $position + 1;
            $image->cover = $position === 0;

            foreach ($this->languages as $idLang) {
                $image->legend[$idLang] = mb_substr((string) $product->name[$idLang], 0, 128);
            }

            $image->add();
            $base = $image->getPathForCreation();
            copy($source, $base . '.jpg');

            foreach (ImageType::getImagesTypes('products') as $type) {
                ImageManager::resize(
                    $source,
                    $base . '-' . stripslashes($type['name']) . '.jpg',
                    (int) $type['width'],
                    (int) $type['height'],
                    'jpg'
                );
            }
        }

        if (!$files) {
            echo "  · {$key}: sin imagen en la ficha (TODO: foto de producto)\n";
        }
    }

    /** @param array<string, mixed> $sheet */
    private function replaceAttachments(Product $product, array $sheet, string $key): void
    {
        $productId = (int) $product->id;
        $old = Db::getInstance()->executeS(
            'SELECT id_attachment FROM `' . _DB_PREFIX_ . "attachment` WHERE file_name LIKE '"
            . pSQL($key) . "-%.pdf'"
        );

        foreach ($old as $row) {
            (new Attachment((int) $row['id_attachment']))->delete();
        }

        $ids = [];

        foreach (array_keys($this->languages) as $iso) {
            $source = self::ROOT . "/pdfs/{$key}-{$iso}.pdf";
            if (!is_file($source)) {
                echo "  ! falta la ficha {$key}-{$iso}.pdf\n";
                continue;
            }

            $content = $sheet['languages'][$iso];
            // «FICHA TÉCNICA» → «Ficha técnica»; en alemán los sustantivos van en mayúscula.
            $label = mb_strtolower($content['label']);
            $label = $iso === 'de'
                ? mb_convert_case($label, MB_CASE_TITLE)
                : mb_strtoupper(mb_substr($label, 0, 1)) . mb_substr($label, 1);
            $label = mb_substr($label, 0, self::ATTACHMENT_NAME_SIZE - 5) . ' (' . strtoupper($iso) . ')';

            $attachment = new Attachment();
            $attachment->file = sha1(uniqid($key . $iso, true));
            $attachment->file_name = "{$key}-{$iso}.pdf";
            $attachment->mime = 'application/pdf';
            $attachment->file_size = (int) filesize($source);

            foreach ($this->languages as $idLang) {
                $attachment->name[$idLang] = $label;
                $attachment->description[$idLang] = $content['name'] . ' · ' . $content['subtitle'];
            }

            copy($source, _PS_DOWNLOAD_DIR_ . $attachment->file);
            $attachment->add();
            $ids[] = (int) $attachment->id;
        }

        Attachment::attachToProduct($productId, $ids);
        Product::updateCacheAttachment($productId);
    }

    private function deactivateOthers(): void
    {
        $db = Db::getInstance();
        $keep = implode(',', array_map('intval', $this->importedProducts));
        $categories = implode(',', array_map('intval', $this->categories));
        $protected = (int) Configuration::get('PS_ROOT_CATEGORY') . ',' . $this->homeCategory;

        $db->execute('UPDATE `' . _DB_PREFIX_ . "product` SET active = 0 WHERE id_product NOT IN ({$keep})");
        $db->execute('UPDATE `' . _DB_PREFIX_ . "product_shop` SET active = 0 WHERE id_product NOT IN ({$keep})");
        $db->execute(
            'UPDATE `' . _DB_PREFIX_ . "category` SET active = 0
            WHERE id_category NOT IN ({$categories},{$protected})"
        );

        echo "Productos y categorías de demostración desactivados (no borrados).\n";
    }

    /** @return array<string, mixed> */
    private function readJson(string $path): array
    {
        $data = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($data)) {
            throw new RuntimeException("JSON no válido: {$path}");
        }

        return $data;
    }
}

(new ZementCatalogImporter(in_array('--deactivate-others', $argv, true)))->run();
