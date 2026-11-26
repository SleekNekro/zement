{**
 * Barra de confianza (ficha, carrito y pedido): datos reales de Zement, sin adjetivos.
 *}
<section class="zm-trust" aria-label="{$zementStrings.trustTitle}">
    <ul class="zm-trust__list">
        {foreach from=$zementTrust item=item}
            <li class="zm-trust__item">
                <span class="zm-trust__label">{$item.label}</span>
                {if $item.value}
                    {if $item.href}
                        <a class="zm-trust__value" href="{$item.href}">{$item.value}</a>
                    {else}
                        <span class="zm-trust__value">{$item.value}</span>
                    {/if}
                {/if}
                {if $item.detail}<span class="zm-trust__detail">{$item.detail}</span>{/if}
            </li>
        {/foreach}
    </ul>
</section>
