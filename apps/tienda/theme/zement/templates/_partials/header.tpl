{**
 * Cabecera de Hummingbird. Único cambio (Zement): en la portada el logotipo ya no es el <h1>
 * («SHOP» como encabezado principal); el <h1> es el titular del bloque principal (zementhome).
 *}
{extends file='parent:_partials/header.tpl'}

{block name='header_bottom'}
  <div class="{$headerBottom}">
    <div class="{$headerBottom}__container container-md">
      <div class="{$headerBottom}__row row gx-2 gx-md-4 align-items-stretch">
        <div class="{$headerBottom}__logo d-flex align-items-center col-auto me-auto me-md-0">
          {if $shop.logo_details}
            {renderLogo}
          {/if}
        </div>

        {hook h='displayTop'}

        <div id="_mobile_ps_customersignin" class="d-md-none d-flex col-auto">
          {* JUST PLACEHOLDER FOR RESPONSIVE COMPONENT TO LOAD REAL ONE *}
          <div class="header-block">
            <a href="{$urls.pages.my_account}" class="header-block__action-btn">
              <i class="material-icons header-block__icon" aria-hidden="true">&#xE853;</i>
            </a>
          </div>
          {* JUST PLACEHOLDER FOR RESPONSIVE COMPONENT TO LOAD REAL ONE *}
        </div>

        {if !$configuration.is_catalog}
          <div id="_mobile_ps_shoppingcart" class="d-md-none d-flex col-auto">
            {* JUST PLACEHOLDER FOR RESPONSIVE COMPONENT TO LOAD REAL ONE *}
            <div class="header-block">
              <a href="{$urls.pages.cart}" class="header-block__action-btn">
                <i class="material-icons header-block__icon" aria-hidden="true">&#xE8CC;</i>
                <span class="header-block__badge">{$cart.products_count}</span>
              </a>
            </div>
            {* JUST PLACEHOLDER FOR RESPONSIVE COMPONENT TO LOAD REAL ONE *}
          </div>
        {/if}
      </div>
    </div>
  </div>

  {capture name="nav_full_width"}{hook h='displayNavFullWidth'}{/capture}
  {if !empty($smarty.capture.nav_full_width)}
    <div class="{$headerNavFullWidth}">
      {$smarty.capture.nav_full_width nofilter}
    </div>
  {/if}
{/block}
