{**
 * Normas que cumple el producto según su ficha técnica (clasificación EN 13813, reacción al
 * fuego EN 13501-1): argumentos comprobables, sin adjetivos.
 *}
<ul class="zm-norms">
    {foreach from=$zementNorms item=norm}
        <li class="zm-norms__item">
            <span class="zm-norms__norm">{$norm.norm}</span>
            <span class="zm-norms__value">{$norm.value}</span>
        </li>
    {/foreach}
</ul>
