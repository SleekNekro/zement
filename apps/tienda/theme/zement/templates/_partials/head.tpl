{extends file='parent:_partials/head.tpl'}

{* Favicon de marca desde el tema (SVG con alternativa PNG para iOS). *}
{block name='head_icons'}
    <link rel="icon" type="image/svg+xml" href="{$urls.child_img_url}zement-favicon.svg">
    <link rel="apple-touch-icon" href="{$urls.child_img_url}zement-touch-icon.png">
{/block}

{*
 * hreflang por idioma, sin país (la tienda vende en Europa: «en», no «en-us») y x-default
 * a la versión en español, el idioma por defecto de la tienda.
 *}
{block name='head_hreflang'}
    {foreach from=$urls.alternative_langs item=pageUrl key=code}
        <link rel="alternate" href="{$pageUrl}" hreflang="{$code|substr:0:2}">
        {if $code|substr:0:2 == 'es'}
            <link rel="alternate" href="{$pageUrl}" hreflang="x-default">
        {/if}
    {/foreach}
{/block}
