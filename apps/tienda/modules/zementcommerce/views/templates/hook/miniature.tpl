{**
 * Miniatura: qué es el producto (subtítulo de la ficha), su formato y el dato clave.
 *}
<div class="zm-mini-info">
    <p class="zm-mini-info__type">{$zementInfo.subtitle}</p>
    {if $zementInfo.format || $zementInfo.stat}
        <p class="zm-mini-info__specs">
            {if $zementInfo.format}<span>{$zementInfo.format}</span>{/if}
            {if $zementInfo.stat}<span>{$zementInfo.stat.value} · {$zementInfo.stat.label}</span>{/if}
        </p>
    {/if}
</div>
