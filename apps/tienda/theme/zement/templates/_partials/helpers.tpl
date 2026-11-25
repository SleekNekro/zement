{**
 * Copia de Hummingbird: el logotipo sale del tema (SVG de packages/design-tokens/brand)
 * en vez de la imagen subida en el back office, seguido de «Shop» como nombre de la tienda
 * (no como dominio), separado por un filete fino.
 *}
{function renderLogo}
    <a class="navbar-brand zement-brand" href="{$urls.pages.index}" aria-label="{$shop.name} Shop">
        <img
            class="logo zement-brand__logo"
            src="{$urls.child_img_url}zement-logo-navy.svg"
            alt=""
            width="2034"
            height="438"
        >
        <span class="zement-brand__suffix" aria-hidden="true">Shop</span>
    </a>
{/function}
