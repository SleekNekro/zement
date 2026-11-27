{**
 * Zement: al añadir un producto no se abre nada que interrumpa; sale un aviso pequeño en una
 * esquina (assets/js/zement-cart.js) con el producto, la cantidad y «Ver carrito», que abre el
 * carrito lateral. El tema lo recibe como su «modal» (data-ps-ref="blockcart-modal"); el script
 * cancela su apertura y lo convierte en aviso.
 *}
<div class="zm-added-carrier" data-ps-ref="blockcart-modal" data-zm-added hidden>
  <p class="visually-hidden" data-ps-target="blockcart-modal-status" data-ps-data="{l s='%product_name% has been added to your cart.' sprintf=['%product_name%' => $product.name] d='Shop.Theme.Checkout'}"></p>
  <div class="zm-added" role="status" aria-live="polite">
    <span class="zm-added__media">
      {if $product.default_image}
        <img src="{$product.default_image.small.url}" alt="" width="56" height="56">
      {/if}
    </span>
    <span class="zm-added__text">
      <span class="zm-added__title">
        <i class="material-icons" aria-hidden="true">&#xE5CA;</i>
        {l s='Added to your cart' d='Shop.Theme.Checkout'}
      </span>
      <span class="zm-added__name">{$product.name}</span>
      <span class="zm-added__meta">{$product.price}</span>
    </span>
    <span class="zm-added__actions">
      <a class="zm-added__cart" href="{$urls.pages.cart}?action=show" data-zm-cart-open>{l s='View cart' d='Shop.Theme.Checkout'} ({$cart.products_count})</a>
      <button type="button" class="btn-close zm-added__close" data-zm-added-close aria-label="{l s='Close' d='Shop.Theme.Global'}"></button>
    </span>
  </div>
</div>
