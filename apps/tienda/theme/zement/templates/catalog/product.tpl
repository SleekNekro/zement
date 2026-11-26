{**
 * Ficha de producto de Zement: igual que Hummingbird salvo la compra y las descargas.
 *
 * - Junto al resumen, la ficha técnica en PDF del idioma de la página.
 * - Mientras el producto no se vende (sin precio: TODO en el catálogo) no hay cantidad ni
 *   «Añadir al carrito» desactivado: en su lugar, un botón al formulario de contacto.
 * - En «Detalles», la ficha en PDF y enlaces a los demás idiomas (adjuntos «<clave>-<iso>.pdf»).
 *}
{extends file='parent:catalog/product.tpl'}

{block name='product_add_to_cart'}
    {if $product.available_for_order}
        {$smarty.block.parent}
    {else}
        <div class="zm-product-cta">
            <a class="btn btn-primary" href="{$urls.pages.contact}">
                {l s='Contact us' d='Shop.Theme.Global'}
            </a>
        </div>
    {/if}
    {include file='catalog/_partials/zement-sheet.tpl' buttonClass='btn-outline-primary zm-product-cta__sheet'}
{/block}

{block name='product_attachments'}
    {if $product.attachments}
        {assign var='sheetHeading' value=$product.attachments[0].name|regex_replace:'/\s*\([A-Z]{2}\)$/':''}
        {foreach from=$product.attachments item=attachment}
            {if $attachment.file_name|regex_replace:'/^.*-([a-z]{2})\.pdf$/':'$1' == $language.iso_code}
                {assign var='sheetHeading' value=$attachment.name|regex_replace:'/\s*\([A-Z]{2}\)$/':''}
            {/if}
        {/foreach}

        <div class="info accordion-item" id="product_attachments">
            <h2 class="accordion-header" id="product_attachments_heading">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#product_attachments_collapse" aria-expanded="true" aria-controls="product_attachments_collapse">
                    {$sheetHeading}
                </button>
            </h2>

            <div id="product_attachments_collapse" class="accordion-collapse collapse show" aria-labelledby="product_attachments_heading">
                <div class="accordion-body">
                    {include file='catalog/_partials/zement-sheet.tpl' withLanguages=true}
                </div>
            </div>
        </div>
    {/if}
{/block}
