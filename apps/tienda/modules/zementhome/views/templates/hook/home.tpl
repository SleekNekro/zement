{**
 * Portada al estilo de una tienda clásica:
 * 1. bloque principal: titular de la marca (el <h1>), acceso profesional y el sistema en la web;
 *    debajo, una franja de pruebas (fichas, normas, sistema por capas y asesoramiento);
 * 2. asesor «¿Qué va a hacer?» (módulo zementcommerce; las familias ya están en el menú);
 * 3. una fila de productos de cada una de las cuatro primeras familias (el resto, en el menú),
 *    con las miniaturas del tema y un enlace a todos los productos de la familia. La fila lleva
 *    todos los productos de la familia y se desliza en horizontal (flechas en la cabecera, que
 *    se desactivan en los extremos; sin JavaScript, la barra de desplazamiento).
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
                    <div class="zm-home-row__nav">
                        <a class="zm-home-row__all" href="{$family.url}">
                            {l s='All products' d='Shop.Theme.Catalog'} ({$family.count})
                            <span class="visually-hidden">· {$family.name}</span>
                        </a>
                        <button class="zm-home-row__arrow" type="button" data-zm-row-prev hidden aria-label="{l s='Previous' d='Shop.Theme.Actions'} · {$family.name}">
                            <i class="material-icons rtl-flip" aria-hidden="true">&#xE5CB;</i>
                        </button>
                        <button class="zm-home-row__arrow" type="button" data-zm-row-next hidden aria-label="{l s='Next' d='Shop.Theme.Actions'} · {$family.name}">
                            <i class="material-icons rtl-flip" aria-hidden="true">&#xE5CC;</i>
                        </button>
                    </div>
                </div>
                <div class="zm-home-row__track" data-zm-row-track>
                    {include file='catalog/_partials/productlist.tpl' products=$family.products}
                </div>
            </section>
        {/if}
    {/foreach}

    <script>
        {* Flechas de cada fila: desplazan una pantalla de la fila y se desactivan en los extremos. *}
        document.querySelectorAll('.zm-home-row').forEach(function (row) {
            var list = row.querySelector('[data-zm-row-track] .products');
            var prev = row.querySelector('[data-zm-row-prev]');
            var next = row.querySelector('[data-zm-row-next]');
            if (!list || !prev || !next) return;
            var update = function () {
                var max = list.scrollWidth - list.clientWidth;
                var scrollable = max > 4;
                prev.hidden = next.hidden = !scrollable;
                prev.disabled = Math.abs(list.scrollLeft) < 4;
                next.disabled = Math.abs(list.scrollLeft) > max - 4;
            };
            var step = function (direction) {
                var dir = getComputedStyle(list).direction === 'rtl' ? -1 : 1;
                list.scrollBy({ left: direction * dir * list.clientWidth * 0.9, behavior: 'smooth' });
            };
            prev.addEventListener('click', function () { step(-1); });
            next.addEventListener('click', function () { step(1); });
            list.addEventListener('scroll', update, { passive: true });
            window.addEventListener('resize', update);
            update();
        });
    </script>
{/if}
