{**
 * Pie como el de la web de marca (apps/web: SiteFooter.astro): logotipo grande a la izquierda y,
 * a su lado, alineados abajo, los enlaces de la web en dos columnas y el contacto directo; debajo,
 * la barra con los textos legales y el copyright con el lema.
 *
 * Enlaces: el bloque «Zement» de ps_linklist (setup-footer.php). Solo se pinta ps_linklist en
 * displayFooter: la cuenta y el contacto de la tienda ya están en la cabecera y aquí.
 *}
{extends file='parent:_partials/footer.tpl'}

{block name='footer_main'}
    <div class="footer footer__main zm-foot">
        <div class="container zm-foot__top">
            <div class="zm-foot__logo" aria-hidden="true">
                <img
                    src="{$urls.child_img_url}zement-logo-paper.svg"
                    alt=""
                    width="2034"
                    height="438"
                    loading="lazy"
                >
            </div>

            <div class="zm-foot__side">
                <div class="zm-foot__links">
                    {hook h='displayFooter' mod='ps_linklist'}
                </div>
                <ul class="zm-foot__contact">
                    {if $shop.email}
                        <li><a class="zm-foot__email" href="mailto:{$shop.email}">{$shop.email}</a></li>
                    {/if}
                    {if $shop.phone}
                        <li><a href="tel:{$shop.phone|regex_replace:'/[^0-9+]/':''}">{$shop.phone}</a></li>
                    {/if}
                </ul>
            </div>
        </div>

        {* displayFooterAfter: textos legales (ps_linklist), en la barra final junto al copyright *}
        <div class="zement-footer-legal">
            <div class="container zement-footer-legal__inner">
                {hook h='displayFooterAfter'}
                {include file='_partials/copyright.tpl'}
            </div>
        </div>
    </div>
{/block}
