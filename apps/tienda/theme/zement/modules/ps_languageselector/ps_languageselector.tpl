{**
 * For the full copyright and license information, please view the
 * LICENSE.md file that was distributed with this source code.
 *
 * Zement: en lugar del <select> de Hummingbird (sus opciones no admiten imágenes), un menú de
 * enlaces con la bandera de cada idioma, como el de la web. Banderas: packages/design-tokens/flags
 * (pnpm tokens:sync). Hummingbird mueve este bloque al menú móvil en pantallas pequeñas.
 *}

<div id="_desktop_ps_languageselector">
  <details class="ps-languageselector zm-lang" data-zm-lang>
    <summary class="zm-lang__toggle">
      <img class="zm-flag" src="{$urls.child_img_url}flags/{$current_language.iso_code|escape:'html':'UTF-8'}.svg" alt="" width="18" height="12">
      <span class="visually-hidden">{l s='Change language' d='Shop.Theme.Global'}:</span>
      {$current_language.name_simple}
      <svg class="zm-lang__chevron" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" /></svg>
    </summary>
    <ul class="zm-lang__list">
      {foreach from=$languages item=language}
        <li>
          <a
            class="zm-lang__link"
            href="{url entity='language' id=$language.id_lang}"
            hreflang="{$language.iso_code|escape:'html':'UTF-8'}"
            lang="{$language.iso_code|escape:'html':'UTF-8'}"
            {if $language.id_lang == $current_language.id_lang}aria-current="page"{/if}
          >
            <img class="zm-flag" src="{$urls.child_img_url}flags/{$language.iso_code|escape:'html':'UTF-8'}.svg" alt="" width="18" height="12">
            {$language.name_simple}
          </a>
        </li>
      {/foreach}
    </ul>
  </details>
</div>

<script>
{literal}
  // Se cierra al pulsar fuera o con Escape. Por delegación: el bloque cambia de sitio en móvil.
  if (!window.zmLangMenu) {
    window.zmLangMenu = true;
    document.addEventListener('click', function (event) {
      document.querySelectorAll('[data-zm-lang][open]').forEach(function (menu) {
        if (!menu.contains(event.target)) menu.open = false;
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('[data-zm-lang][open]').forEach(function (menu) {
        menu.open = false;
        menu.querySelector('summary').focus();
      });
    });
  }
{/literal}
</script>
