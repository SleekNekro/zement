{**
 * Pie de Hummingbird con la firma de la web de marca: el logotipo a todo el ancho al final.
 *}
{extends file='parent:_partials/footer.tpl'}

{block name='footer_main'}
    <div class="footer footer__main">
        <div class="container">
            {capture name="footer_main_top"}{hook h='displayFooter'}{/capture}
            {if $smarty.capture.footer_main_top}
                {block name='hook_footer_main'}
                    <div class="footer__main-top row">
                        {$smarty.capture.footer_main_top nofilter}
                    </div>
                {/block}
            {/if}

            {capture name="footer_main_bottom"}{hook h='displayFooterAfter'}{/capture}
            {if isset($smarty.capture.footer_main_bottom) && $smarty.capture.footer_main_bottom}
                {block name='hook_footer_after'}
                    <div class="footer__main-bottom row">
                        {$smarty.capture.footer_main_bottom nofilter}
                    </div>
                {/block}
            {/if}
        </div>

        <div class="zement-signature container" aria-hidden="true">
            <img
                class="zement-signature__logo"
                src="{$urls.child_img_url}zement-logo-paper.svg"
                alt=""
                width="2034"
                height="438"
                loading="lazy"
            >
        </div>

        <div class="zement-footer-legal">
            <div class="container">
                {include file='_partials/copyright.tpl'}
            </div>
        </div>
    </div>
{/block}
