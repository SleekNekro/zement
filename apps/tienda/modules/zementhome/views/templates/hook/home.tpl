{**
 * Portada al estilo de una tienda clásica:
 * 1. bloque principal (primera familia, el microcemento), más bajo que un hero de marca;
 * 2. accesos compactos a las 8 familias;
 * 3. una fila de productos por familia, con las miniaturas del tema (precio y compra cuando los
 *    haya) y un enlace a todos los productos de la familia.
 *}
{if $zementHero}
    <section class="zm-home-hero" aria-labelledby="zm-home-hero-title">
        {if $zementHero.image}
            <img class="zm-home-hero__image" src="{$zementHero.image}" alt="" loading="eager" fetchpriority="high">
        {/if}
        <div class="zm-home-hero__content container">
            <h2 class="zm-home-hero__title" id="zm-home-hero-title">
                <span>{$zementHero.name}</span>
                <span>&amp; Materials</span>
            </h2>
            <div class="zm-home-hero__actions">
                <a class="btn zm-btn-light" href="{$zementHero.url}">{$zementHero.name}</a>
            </div>
        </div>
    </section>
{/if}

{if $zementFamilies}
    <nav class="zm-home-families container" aria-label="{l s='Categories' d='Shop.Theme.Catalog'}">
        <ul class="zm-home-families__list">
            {foreach from=$zementFamilies item=family}
                <li>
                    <a class="zm-family-chip" href="{$family.url}">
                        <span class="zm-family-chip__media{if !$family.image} zm-family-chip__media--empty{/if}">
                            {if $family.image}
                                <img src="{$family.image}" alt="" loading="lazy" width="96" height="96">
                            {/if}
                        </span>
                        <span class="zm-family-chip__text">
                            <span class="zm-family-chip__name">{$family.name}</span>
                            <span class="zm-family-chip__count">
                                {if $family.count == 1}
                                    {l s='There is 1 product.' d='Shop.Theme.Catalog'}
                                {else}
                                    {l s='There are %product_count% products.' d='Shop.Theme.Catalog' sprintf=['%product_count%' => $family.count]}
                                {/if}
                            </span>
                        </span>
                    </a>
                </li>
            {/foreach}
        </ul>
    </nav>

    {foreach from=$zementFamilies item=family}
        {if $family.products}
            <section class="zm-home-row container" aria-labelledby="zm-home-row-{$family.id}">
                <div class="zm-home-row__head">
                    <h2 class="zm-home-row__title" id="zm-home-row-{$family.id}">{$family.name}</h2>
                    <a class="zm-home-row__all" href="{$family.url}">
                        {l s='All products' d='Shop.Theme.Catalog'} ({$family.count})
                        <span class="visually-hidden">· {$family.name}</span>
                    </a>
                </div>
                {include file='catalog/_partials/productlist.tpl' products=$family.products}
            </section>
        {/if}
    {/foreach}
{/if}
