{**
 * Precios de la ficha. El precio sin IVA (cuentas profesionales, B2B) usa la cadena traducida
 * «Impuestos excluidos»: la de Hummingbird («%price% tax excluded») no está en los idiomas.
 *}
{extends file='parent:catalog/_partials/product-prices.tpl'}

{block name='product_without_taxes'}
    {if $priceDisplay == 0 && $configuration.is_b2b}
        <span class="product__taxless-price">
            {$product.price_tax_excluded} {l s='Tax excluded' d='Shop.Theme.Global'}
        </span>
    {/if}
{/block}
