<?php

/**
 * Convierte el contenido de una ficha técnica (un idioma) en el HTML de la ficha de producto.
 *
 * Clases `zm-sheet*`: estilos en apps/tienda/theme/zement/assets/css/zement.css.
 * Solo HTML que deja pasar HTMLPurifier de PrestaShop (HTML 4: sin <section> ni <dl> con <div>).
 */

declare(strict_types=1);

final class ZementSheetHtml
{
    private const META_LENGTH = 160;

    /** @param array<string, mixed> $content */
    public function __construct(private readonly array $content)
    {
    }

    /** Resumen junto al botón de compra: subtítulo de la ficha y párrafo destacado. */
    public function summary(): string
    {
        $html = '<p class="zm-sheet__subtitle">' . $this->escape($this->content['subtitle']) . '</p>';
        $lead = $this->lead();

        if ($lead !== null) {
            $html .= '<p>' . $this->escape($lead) . '</p>';
        }

        return $html;
    }

    /** Ficha completa: cifras destacadas y todas las secciones, menos el párrafo del resumen. */
    public function body(): string
    {
        $html = '<div class="zm-sheet">';

        if ($this->content['stats']) {
            $html .= '<div class="zm-sheet__stats">';
            foreach ($this->content['stats'] as $stat) {
                $html .= '<div class="zm-sheet__stat"><span class="zm-sheet__stat-value">'
                    . $this->escape($stat['value']) . '</span><span class="zm-sheet__stat-label">'
                    . $this->escape($stat['label']) . '</span></div>';
            }
            $html .= '</div>';
        }

        $skipLead = true;

        foreach ($this->content['sections'] as $section) {
            $blocks = '';

            foreach ($section['blocks'] as $block) {
                if ($block['type'] === 'lead' && $skipLead) {
                    $skipLead = false;
                    continue;
                }
                $blocks .= $this->block($block);
            }

            if ($blocks === '') {
                continue;
            }

            $html .= '<div class="zm-sheet__section"><h3>' . $this->escape($section['title'])
                . '</h3>' . $blocks . '</div>';
        }

        $html .= '<p class="zm-sheet__disclaimer">' . $this->escape($this->content['disclaimer']) . '</p>';

        return $html . '</div>';
    }

    public function metaDescription(): string
    {
        $text = $this->lead() ?? $this->content['subtitle'];

        if (mb_strlen($text) <= self::META_LENGTH) {
            return $text;
        }

        $cut = mb_substr($text, 0, self::META_LENGTH - 1);

        return rtrim(mb_substr($cut, 0, (int) mb_strrpos($cut, ' ')), ' ,.;:') . '…';
    }

    private function lead(): ?string
    {
        foreach ($this->content['sections'] as $section) {
            foreach ($section['blocks'] as $block) {
                if ($block['type'] === 'lead') {
                    return $block['text'];
                }
            }
        }

        return null;
    }

    /** @param array<string, mixed> $block */
    private function block(array $block): string
    {
        return match ($block['type']) {
            'lead' => '<p class="zm-sheet__lead">' . $this->escape($block['text']) . '</p>',
            'p' => '<p>' . $this->escape($block['text']) . '</p>',
            'list' => '<ul>' . $this->items($block['items']) . '</ul>',
            'packs' => '<ul class="zm-sheet__packs">' . $this->items($block['items']) . '</ul>',
            'table' => $this->table($block['groups']),
            'swatches' => $this->swatches($block['items']),
            default => '',
        };
    }

    /** @param list<string> $items */
    private function items(array $items): string
    {
        return implode('', array_map(fn (string $item): string => '<li>' . $this->escape($item) . '</li>', $items));
    }

    /** @param list<array<string, mixed>> $groups */
    private function table(array $groups): string
    {
        $html = '<table class="zm-sheet__table"><tbody>';

        foreach ($groups as $group) {
            if ($group['title'] !== null) {
                $html .= '<tr class="zm-sheet__group"><th colspan="2" scope="colgroup">'
                    . $this->escape($group['title']) . '</th></tr>';
            }
            foreach ($group['rows'] as $row) {
                $html .= '<tr><th scope="row">' . $this->escape($row['key']) . '</th><td>'
                    . $this->escape($row['value']) . '</td></tr>';
            }
        }

        return $html . '</tbody></table>';
    }

    /** @param list<array<string, mixed>> $items */
    private function swatches(array $items): string
    {
        $html = '<ul class="zm-sheet__swatches">';

        foreach ($items as $item) {
            $color = is_string($item['color']) && preg_match('/^#[0-9a-f]{6}$/', $item['color'])
                ? $item['color'] : null;
            $chip = $color !== null
                ? '<span class="zm-sheet__chip" style="background-color: ' . $color . '"></span>'
                : '';
            $html .= '<li>' . $chip . $this->escape($item['code']) . '</li>';
        }

        return $html . '</ul>';
    }

    private function escape(string $text): string
    {
        return htmlspecialchars($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
