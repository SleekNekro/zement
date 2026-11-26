{**
 * Portada: «¿Qué va a hacer?». Un acceso por proyecto que lleva a la familia adecuada.
 *}
{if $zementProjects}
    <section class="zm-projects container" aria-labelledby="zm-projects-title">
        <h2 class="zm-projects__title" id="zm-projects-title">{$zementStrings.projects}</h2>
        <ul class="zm-projects__list">
            {foreach from=$zementProjects item=project}
                <li>
                    <a class="zm-project" href="{$project.url}">
                        <span class="zm-project__media{if !$project.image} zm-project__media--empty{/if}">
                            {if $project.image}
                                <img src="{$project.image}" alt="" loading="lazy" width="98" height="98">
                            {/if}
                        </span>
                        <span class="zm-project__label">{$project.label}</span>
                    </a>
                </li>
            {/foreach}
        </ul>
    </section>
{/if}
