{**
 * Producto sin foto: casilla de marca con el código de capa (o la capa) y el envase. Repite datos
 * que la página ya da en texto, así que es decorativa para los lectores de pantalla.
 *}
<div class="zm-no-photo zm-no-photo--{$zementNoPhoto.variant}" aria-hidden="true">
    {if $zementNoPhoto.label}<span class="zm-no-photo__label">{$zementNoPhoto.label}</span>{/if}
    {if $zementNoPhoto.format}<span class="zm-no-photo__format">{$zementNoPhoto.format}</span>{/if}
    <img class="zm-no-photo__logo" src="{$zementNoPhoto.logo}" alt="" width="2034" height="438" loading="lazy">
</div>
