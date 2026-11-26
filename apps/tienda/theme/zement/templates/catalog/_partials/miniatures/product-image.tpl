{**
 * For the full copyright and license information, please view the
 * LICENSE.md file that was distributed with this source code.
 *
 * Copia de Hummingbird. Cambios (Zement): el enlace de la imagen sale del orden de
 * tabulación y del lector de pantalla. Su imagen es decorativa (alt vacío), así que era un
 * enlace sin nombre por producto; el nombre del producto ya enlaza a la misma ficha. Y sin foto,
 * una casilla con la capa y el envase (zementcommerce) en lugar de la imagen por defecto.
 *}
{block name='product_miniature_image'}
  <div class="{$componentName}__image-container thumbnail-container">
    <a href="{$product.url}" class="{$componentName}__image-link outline outline--rounded" tabindex="-1" aria-hidden="true">
      {if $product.cover}
        <picture>
          {if isset($product.cover.bySize.default_md.sources.avif)}
            <source
              srcset="
                {$product.cover.bySize.default_sm.sources.avif} 216w,
                {$product.cover.bySize.default_md.sources.avif} 261w,
                {$product.cover.bySize.default_lg.sources.avif} 336w"
              sizes="(min-width: 992px) 25vw, (min-width: 360px) 50vw, 100vw"
              type="image/avif"
            >
          {/if}

          {if isset($product.cover.bySize.default_md.sources.webp)}
            <source
              srcset="
                {$product.cover.bySize.default_sm.sources.webp} 216w,
                {$product.cover.bySize.default_md.sources.webp} 261w,
                {$product.cover.bySize.default_lg.sources.webp} 336w"
              sizes="(min-width: 992px) 25vw, (min-width: 360px) 50vw, 100vw"
              type="image/webp"
            >
          {/if}

          <img
            class="{$componentName}__image"
            srcset="
              {$product.cover.bySize.default_sm.url} 216w,
              {$product.cover.bySize.default_md.url} 261w,
              {$product.cover.bySize.default_lg.url} 336w"
            sizes="(min-width: 992px) 25vw, (min-width: 360px) 50vw, 100vw"
            src="{$product.cover.bySize.default_md.url}"
            width="{$product.cover.bySize.default_md.width}"
            height="{$product.cover.bySize.default_md.height}"
            loading="lazy"
            alt="{$product.cover.legend}"
            title="{$product.cover.legend}"
            data-full-size-image-url="{$product.cover.bySize.home_default.url}"
          >
        </picture>
      {else}
        {* Zement: sin foto, casilla con la capa y el envase (zementcommerce) en vez de la imagen vacía. *}
        {hook h='displayZementNoPhoto' product=$product variant='miniature'}
      {/if}
    </a>
  </div>
{/block}
