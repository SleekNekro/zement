{**
 * Sellos del producto. Sin el de «Fuera de stock» cuando el producto aún no se vende
 * (sin precio: TODO en el catálogo): ahí no aporta nada y se repetiría en todo el listado.
 *}
{$zementFlags = []}
{foreach from=$product.flags item=flag}
    {if $flag.type !== 'out_of_stock' || $product.show_price}
        {$zementFlags[] = $flag}
    {/if}
{/foreach}

{if !empty($zementFlags)}
    {block name='product_flags'}
        <ul class="product-flags js-product-flags">
            {foreach from=$zementFlags item=flag}
                <li class="badge {$flag.type}">{$flag.label nofilter}</li>
            {/foreach}
        </ul>
    {/block}
{/if}
