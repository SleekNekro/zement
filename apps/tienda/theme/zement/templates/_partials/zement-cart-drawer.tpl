{**
 * Carrito lateral (Zement): panel a la derecha con los productos, el envío gratuito, el subtotal
 * y los botones de seguir comprando y tramitar el pedido.
 *
 * Es el «modal» del carrito de Hummingbird (data-ps-ref="blockcart-modal"), así que lo abre y lo
 * cierra el propio tema; zement.css lo convierte en panel lateral. Lo pinta
 * modules/ps_shoppingcart/ps_shoppingcart.tpl y lo abre el icono del carrito (zement-cart.js).
 * Al añadir un producto no se abre: sale un aviso pequeño (modules/ps_shoppingcart/modal.tpl).
 * «added» (opcional) marca un producto recién añadido, por si se vuelve a abrir al añadir.
 *
 * Parámetros: cart, added (opcional).
 *}
<div id="blockcart-modal" class="blockcart-modal modal fade zm-cart" tabindex="-1" role="dialog" aria-labelledby="blockcart-modal-title" aria-hidden="true" data-ps-ref="blockcart-modal">
  <div class="modal-dialog modal-dialog-scrollable" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <p class="modal-title zm-cart__title" id="blockcart-modal-title">
          {l s='Cart' d='Shop.Theme.Checkout'}
          <span class="zm-cart__count">({$cart.products_count})</span>
        </p>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{l s='Close' d='Shop.Theme.Global'}"></button>

        {if isset($added) && $added}
          <p class="visually-hidden" aria-live="polite" role="status" data-ps-target="blockcart-modal-status" data-ps-data="{l s='%product_name% has been added to your cart.' sprintf=['%product_name%' => $added.name] d='Shop.Theme.Checkout'}"></p>
          <p class="zm-cart__added" aria-hidden="true">
            <i class="material-icons" aria-hidden="true">&#xE5CA;</i>
            {l s='Added to your cart' d='Shop.Theme.Checkout'}
          </p>
        {/if}
      </div>

      <div class="modal-body">
        {if $cart.products_count > 0}
          {hook h='displayShoppingCart'}

          <ul class="zm-cart__list">
            {foreach from=$cart.products item=line}
              <li class="zm-cart__item{if isset($added) && $added && $added.id_product == $line.id_product && $added.id_product_attribute == $line.id_product_attribute} zm-cart__item--added{/if}">
                <a class="zm-cart__media" href="{$line.url}">
                  {if $line.default_image}
                    <img src="{$line.default_image.small.url}" alt="" loading="lazy" width="80" height="80">
                  {/if}
                </a>
                <div class="zm-cart__info">
                  <a class="zm-cart__name" href="{$line.url}">{$line.name}</a>
                  {foreach from=$line.attributes key=property item=value}
                    <span class="zm-cart__attr">{$property}: {$value}</span>
                  {/foreach}
                  <span class="zm-cart__qty">{$line.quantity} × {$line.price}</span>
                  <a class="zm-cart__remove" rel="nofollow" href="{$line.remove_from_cart_url}" data-zm-cart-remove>
                    {l s='Remove' d='Shop.Theme.Actions'}
                  </a>
                </div>
                <span class="zm-cart__total">{$line.total}</span>
              </li>
            {/foreach}
          </ul>
        {else}
          <p class="zm-cart__empty">{l s='There are no more items in your cart' d='Shop.Theme.Checkout'}</p>
        {/if}
      </div>

      <div class="modal-footer">
        {if $cart.products_count > 0}
          <p class="zm-cart__subtotal">
            <span>{$cart.subtotals.products.label}</span>
            <strong>{$cart.subtotals.products.value}</strong>
          </p>
          <p class="zm-cart__tax">{$cart.labels.tax_short}</p>
          <a class="btn btn-primary w-100" href="{$urls.pages.order}">{l s='Proceed to checkout' d='Shop.Theme.Actions'}</a>
          <a class="btn btn-outline-primary w-100" href="{$urls.pages.cart}?action=show">{l s='View cart' d='Shop.Theme.Checkout'}</a>
        {/if}
        <button type="button" class="btn btn-link zm-cart__continue" data-bs-dismiss="modal">{l s='Continue shopping' d='Shop.Theme.Actions'}</button>
      </div>
    </div>
  </div>
</div>
