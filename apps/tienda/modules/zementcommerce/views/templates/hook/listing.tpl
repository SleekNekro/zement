{**
 * Listado de una familia: filtros rápidos por capa y tipo, y vista «Tarjetas / Tabla».
 * Todo funciona en la página (views/js/listing.js), sin recargar. Sin JavaScript no se muestra
 * nada de esto y quedan las tarjetas del tema.
 *}
<div class="zm-listing" data-zm-listing data-zm-shown="{$zementListing.strings.shown}">
    <script type="application/json" data-zm-listing-index>{$zementListing.index nofilter}</script>

    <div class="zm-listing__bar" role="group" aria-label="{$zementListing.strings.listingTools}" data-zm-js hidden>
        {foreach from=$zementListing.facets item=facet}
            <div class="zm-listing__facet" role="group" aria-labelledby="zm-facet-{$facet.field}">
                <span class="zm-listing__label" id="zm-facet-{$facet.field}">{$facet.label}</span>
                <button type="button" class="zm-chip" aria-pressed="true" data-zm-filter="{$facet.field}" data-zm-value="">
                    {$zementListing.strings.filterAll}
                </button>
                {foreach from=$facet.values key=value item=short}
                    <button type="button" class="zm-chip" aria-pressed="false" data-zm-filter="{$facet.field}" data-zm-value="{$value}">
                        {$short}
                    </button>
                {/foreach}
            </div>
        {/foreach}

        <div class="zm-listing__facet zm-listing__view" role="group" aria-labelledby="zm-listing-view">
            <span class="zm-listing__label" id="zm-listing-view">{$zementListing.strings.view}</span>
            <button type="button" class="zm-chip" aria-pressed="true" data-zm-view="cards">{$zementListing.strings.viewCards}</button>
            <button type="button" class="zm-chip" aria-pressed="false" data-zm-view="table">{$zementListing.strings.viewTable}</button>
        </div>
    </div>

    <p class="zm-listing__status" role="status" data-zm-status></p>
    <p class="zm-listing__empty" data-zm-empty hidden>
        {$zementListing.strings.noMatch}
        <button type="button" class="btn btn-link zm-listing__clear" data-zm-clear>{$zementListing.strings.clearFilters}</button>
    </p>

    <div class="zm-listing__table" data-zm-table hidden>
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">{$zementListing.strings.colProduct}</th>
                    {foreach from=$zementListing.columns item=column}
                        <th scope="col">{$column.label}</th>
                    {/foreach}
                </tr>
            </thead>
            <tbody>
                {foreach from=$zementListing.products item=product}
                    <tr data-zm-row="{$product.id}">
                        <th scope="row"><a href="{$product.url}">{$product.name}</a></th>
                        {foreach from=$zementListing.columns item=column}
                            <td class="zm-listing__cell--{$column.field}">{$product[$column.field]|default:'—'}</td>
                        {/foreach}
                    </tr>
                {/foreach}
            </tbody>
        </table>
    </div>
</div>
