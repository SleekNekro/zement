{**
 * Carrito: cuánto falta para el envío gratuito, con una barra de progreso.
 *}
<div class="zm-free-shipping">
    <p class="zm-free-shipping__text">{$zementFreeShipping.text}</p>
    <div class="zm-free-shipping__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{$zementFreeShipping.progress}" aria-label="{$zementFreeShipping.text}">
        <span style="width: {$zementFreeShipping.progress}%"></span>
    </div>
</div>
