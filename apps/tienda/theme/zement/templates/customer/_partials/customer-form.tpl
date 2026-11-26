{**
 * Alta y datos del cliente sin «Tratamiento» (Sr./Sra.): es opcional y no hace falta para
 * vender (minimización de datos, RGPD). La fecha de nacimiento se quita por configuración
 * (PS_CUSTOMER_BIRTHDATE, pnpm tienda:settings).
 *}
{extends file='parent:customer/_partials/customer-form.tpl'}

{block "form_field"}
    {if $field.name !== 'id_gender'}
        {$smarty.block.parent}
    {/if}
{/block}
