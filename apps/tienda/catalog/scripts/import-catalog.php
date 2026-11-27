<?php

/**
 * Importa el catálogo de Zement en PrestaShop a partir de las fichas técnicas extraídas.
 *
 * Lee la carpeta preparada por import.sh dentro del contenedor:
 *   catalog.json         familias, tarifa (formatos con su PVP web sin IVA), descuentos e IVA
 *   products/<key>.json  contenido de la ficha en los 8 idiomas (extract_sheets.py)
 *   images/<key>.jpg     muestra del efecto acabado, si la ficha la trae
 *   images/envases/<key>--<envase>-<tamaño>.jpg  foto del envase de cada formato
 *                        (generate-packaging.mjs; no hay de los kits)
 *   pdfs/<key>-<iso>.pdf ficha técnica original de cada idioma
 *
 * Formatos («formats» en catalog.json): el primero da el precio del producto; con varios, se
 * crean como combinaciones del atributo «Formato», con el nombre del envase en cada idioma
 * (formatNames). Sin formatos no hay precio: se ve la ficha sin compra («Solicitar presupuesto»).
 *
 * Descuentos (discounts): precios específicos por producto, porque no se suman. PrestaShop aplica
 * un solo precio específico por línea (primero el del formato, luego el de mayor cantidad, luego
 * el del grupo) y el descuento del grupo se sumaría encima; por eso los grupos profesionales
 * quedan al 0 % (setup-pro.php) y aquí se crean, para cada producto con precio:
 *   - cada grupo profesional, desde 1 unidad: su descuento;
 *   - todos, desde el palé del formato principal («pallet»): el de palé;
 *   - cada grupo profesional, desde el palé: el mayor entre el suyo y el de palé.
 * Se rehacen en cada importación (se borran los precios específicos del producto que no son de
 * un cliente, un carrito o una regla de catálogo).
 *
 * IVA (tax): un grupo de reglas con el mismo tipo para los países de la lista; el resto, sin IVA.
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

    /** Atributo de los formatos de venta, en los 8 idiomas. */
    private const FORMAT_GROUP = [
        'es' => 'Formato', 'en' => 'Format', 'de' => 'Gebinde', 'fr' => 'Format',
        'it' => 'Formato', 'pl' => 'Opakowanie', 'no' => 'Pakning', 'fi' => 'Pakkaus',
    ];

    private ?int $formatGroup = null;

    /** @var array<string, array<string, string>> envase => iso => «Cubo de {size}» */
    private array $formatNames = [];

    /** @var array<string, mixed> */
    private array $discounts = [];

    /** @var array<string, int> nombre del grupo en español => id_group */
    private array $groups = [];

    private int $taxGroup = 0;

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

        $this->formatNames = array_filter($catalog['formatNames'], 'is_array');
        $this->discounts = $catalog['discounts'];
        foreach (array_keys($this->discounts['groups']) as $name) {
            $this->groups[$name] = $this->groupId($name);
        }
        $this->taxGroup = $this->saveTaxGroup($catalog['tax']);

        foreach ($catalog['products'] as $entry) {
            // Sin ficha técnica todavía («sheet»: false): solo nombre y formatos.
            $sheet = ($entry['sheet'] ?? true) === false
                ? null
                : $this->readJson(self::ROOT . "/products/{$entry['key']}.json");
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
            // Texto de la familia (opcional): explica los nombres de los productos para elegir.
            $description = $data['description'][$iso] ?? $data['description']['es'] ?? null;
            $category->description[$idLang] = $description === null
                ? ''
                : '<p>' . htmlspecialchars($description, ENT_QUOTES | ENT_HTML5, 'UTF-8') . '</p>';
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
    private function saveProduct(array $entry, ?array $sheet): int
    {
        $key = $entry['key'];
        $idEs = $this->languages['es'];
        $existingId = (int) Db::getInstance()->getValue(
            'SELECT id_product FROM `' . _DB_PREFIX_ . 'product_lang`
            WHERE id_lang = ' . $idEs . " AND link_rewrite = '" . pSQL($key) . "'"
        );
        $product = new Product($existingId ?: null, false);
        $categoryId = $this->categories[$entry['category']];
        $formats = $entry['formats'] ?? [];
        $hasPrice = $formats !== [];

        foreach ($this->languages as $iso => $idLang) {
            if ($sheet === null) {
                // TODO: ficha técnica. Sin ella no hay descripción: solo el nombre.
                $product->name[$idLang] = $entry['name'];
                $product->link_rewrite[$idLang] = $iso === 'es' ? $key : Tools::str2url($entry['name']);
                $product->description_short[$idLang] = '';
                $product->description[$idLang] = '';
                $product->meta_title[$idLang] = $entry['name'];
                $product->meta_description[$idLang] = '';
                continue;
            }

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

        // Precio del producto = PVP web (sin IVA) del formato principal; sin tarifa, 0 y sin compra.
        $product->price = $hasPrice ? (float) $formats[0]['price'] : 0;
        if (($entry['reference'] ?? null) !== null) {
            $product->reference = (string) $entry['reference'];
        }
        $product->id_tax_rules_group = $this->taxGroup;
        if (!$existingId || $hasPrice) {
            // Con precio se publica; uno nuevo sin precio también (se ve la ficha, sin compra).
            $product->active = true;
        }

        $product->save();
        $product->updateCategories([$categoryId]);
        // Fotos: primero el envase de cada formato (la del principal es la portada), después la
        // muestra del acabado de la ficha.
        $packaging = array_map(fn (array $format): ?string => $this->packagingFile($key, $format), $formats);
        $imageIds = $this->replaceImages(
            $product,
            [...array_values(array_filter($packaging)), ...($sheet['images'] ?? [])],
            $key
        );
        if ($sheet !== null) {
            $this->replaceAttachments($product, $sheet, $key);
        } else {
            echo "  · {$key}: sin ficha técnica (TODO: ficha, textos e imagen)\n";
        }
        $main = $this->replaceFormats($product, $formats, $packaging, $imageIds);
        $this->replaceSpecificPrices($product, $hasPrice, $entry['pallet'] ?? null, $main);
        Search::indexation(false, (int) $product->id);

        echo ($existingId ? '= ' : '+ ') . "{$key} (id {$product->id})"
            . ($hasPrice ? ' · ' . number_format((float) $formats[0]['price'], 2, ',', '') . ' € sin IVA' : ' · sin precio: se ve la ficha con «Solicitar presupuesto»') . "\n";

        return (int) $product->id;
    }

    /**
     * Formatos de venta como combinaciones (atributo «Formato»), si hay más de uno. El nombre
     * sale de formatNames (envase + tamaño) en cada idioma; el precio de cada combinación es la
     * diferencia con el del formato principal.
     *
     * @param list<array<string, mixed>> $formats
     *
     * @return int combinación del formato principal (0 si el producto no tiene combinaciones)
     */
    private function replaceFormats(Product $product, array $formats, array $packaging = [], array $imageIds = []): int
    {
        $product->deleteProductAttributes();

        if (count($formats) < 2) {
            return 0;
        }

        $base = (float) $product->price;
        $main = 0;

        foreach ($formats as $position => $format) {
            $names = [];
            foreach ($this->languages as $iso => $idLang) {
                $names[$idLang] = $this->formatName($format, $iso);
            }

            $combination = new Combination();
            $combination->id_product = (int) $product->id;
            $combination->reference = (string) ($format['reference'] ?? '');
            $combination->price = (float) $format['price'] - $base;
            $combination->minimal_quantity = 1;
            $combination->default_on = $position === 0;
            $combination->add();
            $combination->setAttributes([$this->formatAttribute($names)]);
            StockAvailable::setQuantity((int) $product->id, (int) $combination->id, 0);
            // Cada formato enseña la foto de su envase y la muestra del acabado (no los otros envases).
            $own = $packaging[$position] ?? null;
            $others = array_filter($packaging);
            $images = array_values(array_filter(
                $imageIds,
                static fn (string $file): bool => $file === $own || !in_array($file, $others, true),
                ARRAY_FILTER_USE_KEY
            ));
            if ($own !== null) {
                $combination->setImages($images);
            }
            $main = $main ?: (int) $combination->id;
        }

        Product::updateDefaultAttribute((int) $product->id);
        echo '  · ' . count($formats) . " formatos\n";

        return $main;
    }

    /** @param array<string, mixed> $format «Cubo de 20 kg», «20 kg bucket»… */
    private function formatName(array $format, string $iso): string
    {
        $names = $this->formatNames[$format['container']]
            ?? throw new RuntimeException("Envase sin nombre en formatNames: {$format['container']}");

        return str_replace('{size}', (string) $format['size'], $names[$iso] ?? $names['es']);
    }

    /** @param array<int, string> $names id_lang => nombre del formato */
    private function formatAttribute(array $names): int
    {
        $db = Db::getInstance();
        $idEs = $this->languages['es'];

        if ($this->formatGroup === null) {
            $id = (int) $db->getValue('SELECT id_attribute_group FROM `' . _DB_PREFIX_ . "attribute_group_lang`
                WHERE id_lang = {$idEs} AND name = '" . pSQL(self::FORMAT_GROUP['es']) . "'");
            $group = new AttributeGroup($id ?: null);
            foreach ($this->languages as $iso => $idLang) {
                $group->name[$idLang] = self::FORMAT_GROUP[$iso];
                $group->public_name[$idLang] = self::FORMAT_GROUP[$iso];
            }
            $group->group_type = 'radio';
            $group->save();
            $this->formatGroup = (int) $group->id;
        }

        $id = (int) $db->getValue('SELECT a.id_attribute FROM `' . _DB_PREFIX_ . 'attribute` a
            JOIN `' . _DB_PREFIX_ . "attribute_lang` al ON al.id_attribute = a.id_attribute AND al.id_lang = {$idEs}
            WHERE a.id_attribute_group = {$this->formatGroup} AND al.name = '" . pSQL($names[$idEs]) . "'");
        $attribute = new ProductAttribute($id ?: null);
        $attribute->id_attribute_group = $this->formatGroup;
        foreach ($names as $idLang => $name) {
            $attribute->name[$idLang] = mb_substr($name, 0, 128);
        }
        $attribute->save();

        return (int) $attribute->id;
    }

    /**
     * Descuentos de la tarifa como precios específicos (ver la cabecera: no se suman).
     *
     * @param int $main combinación del formato principal, al que se refiere el palé (0 = producto)
     */
    private function replaceSpecificPrices(Product $product, bool $hasPrice, ?int $pallet, int $main): void
    {
        $productId = (int) $product->id;
        Db::getInstance()->delete(
            'specific_price',
            "id_product = {$productId} AND id_customer = 0 AND id_cart = 0 AND id_specific_price_rule = 0"
        );

        if (!$hasPrice) {
            return;
        }

        $palletDiscount = (float) $this->discounts['pallet'];

        foreach ($this->discounts['groups'] as $name => $discount) {
            $this->addDiscount($productId, 0, $this->groups[$name], 1, (float) $discount);
        }

        if ($pallet === null) {
            return;
        }

        // TODO: palé de los demás formatos (la ficha solo da el del formato principal).
        $this->addDiscount($productId, $main, 0, $pallet, $palletDiscount);
        foreach ($this->discounts['groups'] as $name => $discount) {
            $this->addDiscount($productId, $main, $this->groups[$name], $pallet, max((float) $discount, $palletDiscount));
        }
        echo "  · palé: desde {$pallet} uds., −{$palletDiscount} %\n";
    }

    private function addDiscount(int $productId, int $combination, int $group, int $fromQuantity, float $percent): void
    {
        $price = new SpecificPrice();
        $price->id_product = $productId;
        $price->id_product_attribute = $combination;
        $price->id_shop = 0;
        $price->id_currency = 0;
        $price->id_country = 0;
        $price->id_group = $group;
        $price->id_customer = 0;
        $price->from_quantity = $fromQuantity;
        $price->price = -1;
        $price->reduction = $percent / 100;
        $price->reduction_type = 'percentage';
        $price->reduction_tax = 1;
        $price->from = '0000-00-00 00:00:00';
        $price->to = '0000-00-00 00:00:00';
        $price->add();
    }

    private function groupId(string $name): int
    {
        $id = (int) Db::getInstance()->getValue(
            'SELECT id_group FROM `' . _DB_PREFIX_ . 'group_lang`
            WHERE id_lang = ' . $this->languages['es'] . " AND name = '" . pSQL($name) . "'"
        );

        return $id ?: throw new RuntimeException("No existe el grupo «{$name}»: ejecutar antes pnpm tienda:commerce.");
    }

    /**
     * Grupo de reglas de IVA de catalog.json → tax: el mismo tipo en cada país de la lista.
     * Las reglas se rehacen en cada importación.
     *
     * @param array<string, mixed> $tax
     */
    private function saveTaxGroup(array $tax): int
    {
        $db = Db::getInstance();
        $rate = (float) $tax['rate'];

        $idTax = (int) $db->getValue('SELECT id_tax FROM `' . _DB_PREFIX_ . "tax`
            WHERE deleted = 0 AND active = 1 AND rate = {$rate} ORDER BY id_tax");
        if (!$idTax) {
            $newTax = new Tax();
            foreach ($this->languages as $idLang) {
                $newTax->name[$idLang] = 'IVA ' . rtrim(rtrim(number_format($rate, 2, ',', ''), '0'), ',') . ' %';
            }
            $newTax->rate = $rate;
            $newTax->active = true;
            $newTax->add();
            $idTax = (int) $newTax->id;
        }

        $idGroup = (int) $db->getValue('SELECT id_tax_rules_group FROM `' . _DB_PREFIX_ . "tax_rules_group`
            WHERE deleted = 0 AND name = '" . pSQL($tax['name']) . "'");
        $group = new TaxRulesGroup($idGroup ?: null);
        $group->name = $tax['name'];
        $group->active = true;
        $group->save();

        $db->delete('tax_rule', 'id_tax_rules_group = ' . (int) $group->id);
        foreach ($tax['countries'] as $iso) {
            $idCountry = (int) Country::getByIso($iso);
            if (!$idCountry) {
                throw new RuntimeException("País desconocido en tax.countries: {$iso}");
            }
            $rule = new TaxRule();
            $rule->id_tax_rules_group = (int) $group->id;
            $rule->id_country = $idCountry;
            $rule->id_state = 0;
            $rule->zipcode_from = '0';
            $rule->zipcode_to = '0';
            $rule->id_tax = $idTax;
            $rule->behavior = 0;
            $rule->description = '';
            $rule->add();
        }

        echo "IVA: «{$tax['name']}», {$rate} % en " . count($tax['countries']) . " países\n";

        return (int) $group->id;
    }

    /**
     * Foto del envase de un formato (generate-packaging.mjs), si existe: «envases/<clave>--cubo-20-kg.jpg».
     *
     * @param array<string, mixed> $format
     */
    private function packagingFile(string $key, array $format): ?string
    {
        $size = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower((string) $format['size'])), '-');
        $file = "envases/{$key}--{$format['container']}-{$size}.jpg";

        return is_file(self::ROOT . "/images/{$file}") ? $file : null;
    }

    /**
     * @param list<string> $files
     *
     * @return array<string, int> archivo => id_image
     */
    private function replaceImages(Product $product, array $files, string $key): array
    {
        $product->deleteImages();
        $ids = [];

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
            $ids[$file] = (int) $image->id;
        }

        if (!$files) {
            echo "  · {$key}: sin imagen (TODO: foto de producto)\n";
        }

        return $ids;
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
