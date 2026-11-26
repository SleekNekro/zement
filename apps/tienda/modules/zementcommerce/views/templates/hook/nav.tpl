{**
 * Barra superior: «Volver a la web» (portada de la web de marca) a la izquierda de todo y
 * «Profesionales» (tarifa y alta). Los contenedores `_desktop_*` pasan en móvil a sus `_mobile_*`
 * del menú lateral (tema: modules/ps_mainmenu/ps_mainmenu.tpl).
 *}
{if $zementWebUrl}
  <div id="_desktop_zement_web" class="zm-nav-web-wrap">
    <a class="zm-nav-web" href="{$zementWebUrl}"><span aria-hidden="true">←</span> {$zementStrings.backToWeb}</a>
  </div>
{/if}
{if $zementProfessionalsUrl}
  <div id="_desktop_zement_pro">
    <a class="zm-nav-pro" href="{$zementProfessionalsUrl}">{$zementStrings.professionals}</a>
  </div>
{/if}
