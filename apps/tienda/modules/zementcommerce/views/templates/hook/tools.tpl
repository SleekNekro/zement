{**
 * Ficha de producto: calculadora de cantidades y «Complete su sistema».
 * Sin JavaScript se ve el sistema (enlaces); la calculadora y las cantidades aparecen con
 * views/js/calculator.js. Consumos y formatos: data/commerce.json (fichas técnicas).
 *}
<div class="zm-tools" data-zm-tools data-zm-invalid-range="{$zementStrings.invalidRange|escape:'html':'UTF-8'}" data-zm-invalid-min="{$zementStrings.invalidMin|escape:'html':'UTF-8'}">
    {if $zementCalculator}
        <section class="zm-calc" aria-labelledby="zm-calc-title" data-zm-js hidden
            data-zm-calculator="{$zementCalculator|json_encode|escape:'html':'UTF-8'}">
            <h2 class="zm-tools__title" id="zm-calc-title">{$zementStrings.calculator}</h2>
            {include file='module:zementcommerce/views/templates/hook/_area.tpl'}
            {if $zementCalculator.mode == 'coats'}
                <div class="zm-calc__field">
                    <label class="form-label" for="zm-coats">{$zementStrings.coats}</label>
                    <input class="form-control" id="zm-coats" type="number" min="1" max="6" step="1" value="{$zementCalculator.coats}" data-zm-coats>
                    <p class="zm-calc__error" id="zm-coats-error" hidden></p>
                </div>
            {elseif $zementCalculator.mode == 'thickness'}
                <div class="zm-calc__field">
                    <label class="form-label" for="zm-thickness">{$zementStrings.thickness}</label>
                    <input class="form-control" id="zm-thickness" type="number" min="0.5" max="100" step="0.5" value="{$zementCalculator.thickness}" data-zm-thickness>
                    <p class="zm-calc__error" id="zm-thickness-error" hidden></p>
                </div>
            {/if}
            <div class="form-check">
                <input class="form-check-input" id="zm-margin" type="checkbox" checked data-zm-margin>
                <label class="form-check-label" for="zm-margin">{$zementStrings.margin}</label>
            </div>
            <p class="zm-calc__result" aria-live="polite">
                <span class="zm-calc__needed">{$zementStrings.needed}</span>
                <strong data-zm-result></strong>
            </p>
            <button class="btn btn-outline-primary zm-calc__use" type="button" hidden data-zm-use>
                {$zementStrings.useQuantity}
            </button>
        </section>
    {/if}

    {if $zementSystem}
        <section class="zm-system" aria-labelledby="zm-system-title">
            <h2 class="zm-tools__title" id="zm-system-title">{$zementStrings.system}</h2>
            <p class="zm-system__name">{$zementSystem.name}</p>
            {if !$zementCalculator}
                {include file='module:zementcommerce/views/templates/hook/_area.tpl'}
            {/if}
            <ol class="zm-system__steps">
                {foreach from=$zementSystem.steps item=step}
                    <li class="zm-system__step{if $step.current} zm-system__step--current{/if}"
                        {if $step.calculator}data-zm-step="{$step.calculator|json_encode|escape:'html':'UTF-8'}"{/if}>
                        <span class="zm-system__media{if !$step.image} zm-system__media--empty{/if}">
                            {if $step.image}<img src="{$step.image}" alt="" loading="lazy" width="98" height="98">{/if}
                        </span>
                        <span class="zm-system__text">
                            <span class="zm-system__code">{$step.code}{if $step.current} · {$zementStrings.current}{/if}</span>
                            {if $step.current}
                                <span class="zm-system__product">{$step.name}</span>
                            {else}
                                <a class="zm-system__product" href="{$step.url}">{$step.name}</a>
                            {/if}
                            <span class="zm-system__subtitle">{$step.subtitle}</span>
                        </span>
                        <span class="zm-system__qty" data-zm-qty>{$step.format}</span>
                    </li>
                {/foreach}
            </ol>
        </section>
    {/if}

    <p class="zm-tools__note" data-zm-js hidden>{$zementStrings.note}</p>
</div>
