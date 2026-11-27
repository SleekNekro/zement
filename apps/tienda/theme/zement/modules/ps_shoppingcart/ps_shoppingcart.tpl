{**
 * Copia de Hummingbird. Cambio (Zement): el icono abre el carrito lateral en vez de ir a la página
 * del carrito (sin JavaScript sigue siendo un enlace a ella). El panel va en un <template> dentro
 * de .blockcart, que ps_shoppingcart.js sustituye en cada cambio del carrito: así está al día.
 * Lo abre assets/js/zement-cart.js.
 *}
<div id="_desktop_ps_shoppingcart">
  <div class="ps-shoppingcart">
    <div class="header-block d-flex align-items-center blockcart cart-preview {if $cart.products_count> 0}header-block--active{else}inactive{/if}" data-refresh-url="{$refresh_url}">
      <a class="header-block__action-btn pe-md-0" rel="nofollow" href="{$cart_url}" data-zm-cart-open aria-label="{l s='View cart (%d products)' d='Shop.Theme.Checkout' sprintf=[$cart.products_count]}">
        <i class="material-icons header-block__icon" aria-hidden="true">&#xE8CC;</i>
        <span class="d-none d-md-flex header-block__title">{l s='Cart' d='Shop.Theme.Checkout'}</span>
        <span class="header-block__badge">{$cart.products_count}</span>
      </a>
      <template data-zm-cart-template>
        {include file='_partials/zement-cart-drawer.tpl' cart=$cart}
      </template>
    </div>
  </div>
</div>
