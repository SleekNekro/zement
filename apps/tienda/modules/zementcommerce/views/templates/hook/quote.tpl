{**
 * Ficha de un producto sin precio todavía: «Solicitar presupuesto».
 * El enlace abre el formulario de contacto con el mensaje escrito; sin JavaScript lleva el
 * producto y, con él (views/js/calculator.js), también el formato y las cantidades.
 *}
<div class="zm-quote" data-zm-quote="{$zementQuote|json_encode|escape:'html':'UTF-8'}">
    <a class="btn btn-primary zm-quote__button" data-zm-quote-link
        href="{$zementQuote.url}?id_product={$zementQuote.productId}&amp;message={$zementQuote.message|escape:'url'}">
        {$zementStrings.quote}
    </a>
</div>
