{**
 * Mi cuenta: estado de la cuenta profesional. Sin solicitud (o rechazada), enlace a «Información»,
 * donde se puede pedir con la casilla «Soy profesional».
 *}
<div class="zm-pro-status zm-pro-status--{$zementProStatus}">
  {if $zementProStatus === 'none'}
    <a class="zm-pro-status__link" href="{$zementProUrl}">{$zementProText} <span aria-hidden="true">→</span></a>
  {else}
    <p class="zm-pro-status__text">{$zementProText}</p>
  {/if}
</div>
