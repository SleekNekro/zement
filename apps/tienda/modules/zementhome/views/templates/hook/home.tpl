{**
 * Portada: bloque principal (primera familia, el microcemento) y rejilla de familias.
 *}
{if $zementHero}
    <section class="zm-home-hero" aria-labelledby="zm-home-hero-title">
        {if $zementHero.image}
            <img class="zm-home-hero__image" src="{$zementHero.image}" alt="" loading="eager" width="500" height="500">
        {/if}
        <div class="zm-home-hero__content container">
            <h2 class="zm-home-hero__title" id="zm-home-hero-title">
                <span>{$zementHero.name}</span>
                <span>&amp; Materials</span>
            </h2>
            <div class="zm-home-hero__actions">
                <a class="btn zm-btn-light" href="{$zementHero.url}">{$zementHero.name}</a>
                {if !$customer.is_logged}
                    <a class="btn zm-btn-outline-light" href="{$urls.pages.authentication}" rel="nofollow">
                        {l s='Sign in' d='Shop.Theme.Actions'}
                    </a>
                {/if}
            </div>
        </div>
    </section>
{/if}

{if $zementFamilies}
    <section class="zm-home-families container" aria-label="{l s='Categories' d='Shop.Theme.Catalog'}">
        <ul class="zm-home-families__grid">
            {foreach from=$zementFamilies item=family}
                <li class="zm-family">
                    <a class="zm-family__link" href="{$family.url}">
                        <span class="zm-family__media{if !$family.image} zm-family__media--empty{/if}">
                            {if $family.image}
                                <img src="{$family.image}" alt="" loading="lazy" width="500" height="500">
                            {/if}
                        </span>
                        <span class="zm-family__name">{$family.name}</span>
                        <span class="zm-family__count">
                            {if $family.count == 1}
                                {l s='There is 1 product.' d='Shop.Theme.Catalog'}
                            {else}
                                {l s='There are %product_count% products.' d='Shop.Theme.Catalog' sprintf=['%product_count%' => $family.count]}
                            {/if}
                        </span>
                    </a>
                    {if $family.products}
                        <ul class="zm-family__products">
                            {foreach from=$family.products item=product}
                                <li><a href="{$product.url}">{$product.name}</a></li>
                            {/foreach}
                        </ul>
                    {/if}
                </li>
            {/foreach}
        </ul>
    </section>
{/if}
