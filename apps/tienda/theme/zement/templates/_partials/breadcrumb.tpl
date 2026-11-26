{**
 * For the full copyright and license information, please view the
 * LICENSE.md file that was distributed with this source code.
 *
 * Copia de Hummingbird. Único cambio (Zement): el aria-label de la miga de pan era el nombre
 * del componente («breadcrumb», en inglés); ahora es la cadena traducida «Breadcrumb».
 *}
{$componentName = 'breadcrumb'}

<nav data-depth="{$breadcrumb.count}" class="{$componentName}__wrapper" aria-label="{l s='Breadcrumb' d='Shop.Theme.Global'}">
  <div class="container">
    {block name='breadcrumb_list'}
      <ol class="{$componentName}">
        {block name='breadcrumb_items'}
          {foreach from=$breadcrumb.links item=path name=breadcrumb}
            {block name='breadcrumb_item'}
              <li class="{$componentName}-item">
                {if not $smarty.foreach.breadcrumb.last}
                  <a href="{$path.url}" class="{$componentName}-link"><span>{$path.title}</span></a>
                {else}
                  <span>{$path.title}</span>
                {/if}
              </li>
            {/block}
          {/foreach}
        {/block}
      </ol>
    {/block}
  </div>
</nav>
