{**
 * Mi cuenta: estado de la cuenta profesional. Sin solicitud, enlace a «Información», donde se puede
 * pedir con la casilla «Soy profesional» (también tras un rechazo o una retirada).
 *}
<div class="zm-pro-status zm-pro-status--{$zementProStatus}">
  {if $zementProStatus === 'none'}
    <a class="zm-pro-status__link" href="{$zementProUrl}">{$zementProText} <span aria-hidden="true">→</span></a>
  {else}
    <p class="zm-pro-status__text">{$zementProText}</p>
    {if $zementProStatus === 'rejected' || $zementProStatus === 'revoked'}
      <a class="zm-pro-status__link" href="{$zementProUrl}">{$zementProAgain} <span aria-hidden="true">→</span></a>
    {/if}
  {/if}
</div>
