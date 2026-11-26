{**
 * Listado de familia: el del tema padre más los filtros rápidos y la vista en tabla
 * (módulo zementcommerce, gancho displayZementListingTools) bajo la barra de orden.
 *}
{extends file='parent:catalog/listing/category.tpl'}

{block name='product_list_top'}
  {$smarty.block.parent}
  {hook h='displayZementListingTools' category=$category}
{/block}
