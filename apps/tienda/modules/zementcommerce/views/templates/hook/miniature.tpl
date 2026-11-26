{**
 * Miniatura: qué es el producto (subtítulo de la ficha), su capa y su árido cuando los tiene (o
 * el dato clave de la ficha) y su formato. Para elegir sin abrir cada ficha.
 *}
<div class="zm-mini-info">
    <p class="zm-mini-info__type">{$zementInfo.subtitle}</p>
    {if $zementInfo.layer || $zementInfo.aggregate}
        <p class="zm-mini-info__key">
            {if $zementInfo.layer}<span>{$zementInfo.layer}</span>{/if}
            {if $zementInfo.aggregate}<span>{$zementInfo.aggregate}</span>{/if}
        </p>
    {elseif $zementInfo.stat}
        <p class="zm-mini-info__key"><span>{$zementInfo.stat.value} · {$zementInfo.stat.label}</span></p>
    {/if}
    {if $zementInfo.format}
        <p class="zm-mini-info__specs"><span>{$zementInfo.format}</span></p>
    {/if}
</div>
