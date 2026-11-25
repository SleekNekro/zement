{extends file='parent:_partials/head.tpl'}

{* Favicon de marca desde el tema (SVG con alternativa PNG para iOS). *}
{block name='head_icons'}
    <link rel="icon" type="image/svg+xml" href="{$urls.child_img_url}zement-favicon.svg">
    <link rel="apple-touch-icon" href="{$urls.child_img_url}zement-touch-icon.png">
{/block}
