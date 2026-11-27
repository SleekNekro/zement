{**
 * Ficha de producto de Zement: igual que Hummingbird salvo la compra y las descargas.
 *
 * - Junto al resumen, la ficha técnica en PDF del idioma de la página.
 * - Mientras el producto no se vende (sin precio: TODO en el catálogo) no hay cantidad ni
 *   «Añadir al carrito» desactivado: en su lugar, «Solicitar presupuesto» (zementcommerce), que
 *   abre el formulario de contacto con el producto y las cantidades calculadas ya escritos.
 * - En «Detalles», la ficha en PDF y enlaces a los demás idiomas (adjuntos «<clave>-<iso>.pdf»).
 * - Módulo zementcommerce: normas de la ficha bajo el resumen (displayZementProductBadges) y,
 *   tras la compra, calculadora y «Complete su sistema» (displayZementProductTools).
 * - Encima de la ficha, «Volver a <familia>»: vuelve a la página anterior si era de la tienda
 *   (conserva filtros y posición) y, si no, abre la familia del producto.
 * - La descripción larga (12 apartados de la ficha técnica) va plegada como «Información
 *   adicional», con cada apartado en su propio desplegable: la ficha cabe en menos pantallas.
 *}
{extends file='parent:catalog/product.tpl'}

{block name='content' prepend}
    {if $product.id_category_default}
        <a class="zm-back" href="{url entity='category' id=$product.id_category_default}" data-zm-back>
            <i class="material-icons rtl-flip" aria-hidden="true">&#xE5C4;</i>
            <span>{l s='Back to %category%' sprintf=['%category%' => $product.category_name] d='Shop.Theme.Catalog'}</span>
        </a>
        <script>
            document.querySelector('[data-zm-back]').addEventListener('click', function (event) {
                var ref = document.referrer;
                if (ref && new URL(ref).host === location.host && history.length > 1) {
                    event.preventDefault();
                    history.back();
                }
            });
        </script>
    {/if}
{/block}

{block name='product_description'}
    {if $product.description}
        <div class="accordion-item" id="product_description">
            <h2 class="accordion-header" id="product_description_heading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#product_description_collapse" aria-expanded="false" aria-controls="product_description_collapse">
                    {l s='Additional information' d='Shop.Theme.Catalog'}
                </button>
            </h2>

            <div id="product_description_collapse" class="accordion-collapse collapse" aria-labelledby="product_description_heading">
                <div class="accordion-body">
                    <div class="product__description rich-text" data-zm-sections>
                        {$product.description nofilter}
                    </div>
                </div>
            </div>
        </div>
        <script>
            {* Cada <h3> de la descripción pasa a ser un desplegable con lo que le sigue hasta el siguiente <h3>. *}
            (function () {
                var root = document.querySelector('[data-zm-sections]');
                if (!root || !root.querySelector('h3')) return;
                Array.prototype.slice.call(root.querySelectorAll('h3')).forEach(function (heading) {
                    var details = document.createElement('details');
                    var summary = document.createElement('summary');
                    details.className = 'zm-section';
                    summary.className = 'zm-section__title';
                    summary.textContent = heading.textContent;
                    details.appendChild(summary);
                    while (heading.nextSibling && heading.nextSibling.nodeName !== 'H3') {
                        details.appendChild(heading.nextSibling);
                    }
                    heading.parentNode.replaceChild(details, heading);
                });
                var first = root.querySelector('details');
                if (first) first.open = true;
            })();
        </script>
    {/if}
{/block}

{* Sin foto: casilla con la capa y el envase (zementcommerce), baja en móvil, en vez de la imagen vacía. *}
{block name='product_cover_thumbnails'}
    {if $product.images|@count > 0}
        {$smarty.block.parent}
    {else}
        {hook h='displayZementNoPhoto' product=$product variant='product'}
    {/if}
{/block}

{block name='product_description_short' append}
    {hook h='displayZementProductBadges' product=$product}
{/block}

{block name='product_add_to_cart'}
    {if $product.available_for_order}
        {$smarty.block.parent}
    {else}
        {* Sin precio todavía: «Solicitar presupuesto» con el pedido escrito (módulo zementcommerce). *}
        {hook h='displayZementQuote' product=$product}
    {/if}
    {include file='catalog/_partials/zement-sheet.tpl' buttonClass='btn-outline-primary'}
    {hook h='displayZementProductTools' product=$product}
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
