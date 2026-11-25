{**
 * Copia de Hummingbird: el logotipo sale del tema (SVG de packages/design-tokens/brand)
 * en vez de la imagen subida en el back office, con «.shop» en pequeño.
 *}
{function renderLogo}
    <a class="navbar-brand zement-brand" href="{$urls.pages.index}">
        <img
            class="logo zement-brand__logo"
            src="{$urls.child_img_url}zement-logo-navy.svg"
            alt="{$shop.name}"
            width="2034"
            height="438"
        >
        <span class="zement-brand__suffix" aria-hidden="true">.shop</span>
    </a>
{/function}
