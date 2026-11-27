{**
 * Miniatura de producto de Hummingbird. Único cambio (Zement): bajo el precio, «IVA incl.» (o
 * «sin IVA» en cuentas que ven precios sin impuestos), para que quede claro en cada producto.
 * Textos: config/translations/zement.php («(tax incl.)» / «(tax excl.)»).
 *}
{extends file='parent:catalog/_partials/miniatures/product.tpl'}

{block name='product_price' append}
  {if $configuration.display_taxes_label && $configuration.taxes_enabled}
    <span class="product-miniature__tax">{$product.labels.tax_short}</span>
  {/if}
{/block}
