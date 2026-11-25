{**
 * Ficha de producto de Zement: igual que Hummingbird salvo las descargas.
 * Cada producto lleva su ficha técnica en PDF en los 8 idiomas (adjuntos «<clave>-<iso>.pdf»):
 * se muestra la del idioma de la página y, debajo, enlaces a los demás idiomas.
 *}
{extends file='parent:catalog/product.tpl'}

{block name='product_attachments'}
    {if $product.attachments}
        {assign var='sheetCurrent' value=null}
        {assign var='sheetOthers' value=[]}
        {foreach from=$product.attachments item=attachment}
            {assign var='sheetIso' value=$attachment.file_name|regex_replace:'/^.*-([a-z]{2})\.pdf$/':'$1'}
            {if $sheetIso == $language.iso_code}
                {assign var='sheetCurrent' value=$attachment}
            {else}
                {append var='sheetOthers' value=['iso' => $sheetIso, 'attachment' => $attachment]}
            {/if}
        {/foreach}
        {if !$sheetCurrent}
            {assign var='sheetCurrent' value=$product.attachments[0]}
        {/if}
        {assign var='sheetTitle' value=$sheetCurrent.name|regex_replace:'/\s*\([A-Z]{2}\)$/':''}

        <div class="info accordion-item" id="product_attachments">
            <h2 class="accordion-header" id="product_attachments_heading">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#product_attachments_collapse" aria-expanded="true" aria-controls="product_attachments_collapse">
                    {$sheetTitle}
                </button>
            </h2>

            <div id="product_attachments_collapse" class="accordion-collapse collapse show" aria-labelledby="product_attachments_heading">
                <div class="accordion-body">
                    <div class="zm-sheet-download">
                        <a class="btn btn-primary zm-sheet-download__main"
                            href="{url entity='attachment' params=['id_attachment' => $sheetCurrent.id_attachment]}"
                            aria-label="{l s='Download %attachment_name%' sprintf=['%attachment_name%' => $sheetCurrent.name] d='Shop.Theme.Actions'}"
                        >
                            <i class="material-icons" aria-hidden="true">&#xE2C4;</i>
                            {$sheetTitle} · PDF ({$sheetCurrent.file_size_formatted})
                        </a>

                        {if $sheetOthers}
                            <ul class="zm-sheet-download__languages">
                                {foreach from=$sheetOthers item=other}
                                    <li>
                                        <a href="{url entity='attachment' params=['id_attachment' => $other.attachment.id_attachment]}"
                                            hreflang="{$other.iso}"
                                            lang="{$other.iso}"
                                            title="{$other.attachment.name}"
                                            aria-label="{l s='Download %attachment_name%' sprintf=['%attachment_name%' => $other.attachment.name] d='Shop.Theme.Actions'}"
                                        >{$other.iso|upper}</a>
                                    </li>
                                {/foreach}
                            </ul>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
{/block}
