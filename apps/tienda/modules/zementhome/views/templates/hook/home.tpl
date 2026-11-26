{**
 * Portada al estilo de una tienda clásica:
 * 1. bloque principal: titular de la marca (el <h1>), acceso profesional y el sistema en la web;
 *    debajo, una franja de pruebas (fichas, normas, sistema por capas y asesoramiento);
 * 2. asesor «¿Qué va a hacer?» (módulo zementcommerce; las familias ya están en el menú);
 * 3. una fila de productos de cada una de las cuatro primeras familias (el resto, en el menú),
 *    con las miniaturas del tema y un enlace a todos los productos de la familia.
 *}
{if $zementHero}
    <section class="zm-home-hero" aria-labelledby="zm-home-hero-title">
        {if $zementHero.image}
            <img class="zm-home-hero__image" src="{$zementHero.image}" alt="" loading="eager" fetchpriority="high">
        {/if}
        <div class="zm-home-hero__content container">
            {* El titular es el <h1> de la portada (la cabecera ya no envuelve el logotipo en <h1>). *}
            <h1 class="zm-home-hero__title" id="zm-home-hero-title">
                {foreach from=$zementHero.title item=line}<span>{$line}</span>{if !$line@last} {/if}{/foreach}
            </h1>
            <div class="zm-home-hero__actions">
                <a class="btn zm-btn-light" href="{$zementHero.pro.url}">{$zementHero.pro.label}</a>
                {if $zementHero.system.url}
                    <a class="btn zm-btn-outline-light" href="{$zementHero.system.url}">{$zementHero.system.label}</a>
                {/if}
            </div>
        </div>
    </section>

    {* Pruebas, no adjetivos: lo que cualquier comprador puede comprobar. *}
    <div class="container">
        <ul class="zm-proof">
            {foreach from=$zementProof.items item=item}
                <li class="zm-proof__item">{$item}</li>
            {/foreach}
            {if $zementProof.phone}
                <li class="zm-proof__item">
                    {$zementProof.advice}
                    <a class="zm-proof__phone" href="tel:{$zementProof.tel}">{$zementProof.phone}</a>
                </li>
            {/if}
        </ul>
    </div>
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
