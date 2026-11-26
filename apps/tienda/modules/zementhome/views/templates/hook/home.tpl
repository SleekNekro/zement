{**
 * Portada al estilo de una tienda clásica:
 * 1. bloque principal (primera familia, el microcemento), más bajo que un hero de marca;
 * 2. asesor «¿Qué va a hacer?» (módulo zementcommerce; las familias ya están en el menú);
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
    {* Asesor «¿Qué va a hacer?» (módulo zementcommerce): un acceso por proyecto. *}
    {hook h='displayZementHomeProjects'}

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
