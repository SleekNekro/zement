import { marked } from 'marked';
import { company, isPending } from '../data/company';
import type { Locale } from '../i18n/ui';

/** Páginas legales y su URL en cada idioma. */
export const legalPages = {
  notice: { es: 'aviso-legal', en: 'legal-notice' },
  privacy: { es: 'privacidad', en: 'privacy' },
  cookies: { es: 'cookies', en: 'cookies' },
  terms: { es: 'condiciones-de-venta', en: 'terms-of-sale' },
} as const satisfies Record<string, Record<Locale, string>>;

export type LegalPage = keyof typeof legalPages;

/** URL de una página legal en un idioma. */
export function legalPath(locale: Locale, page: LegalPage): string {
  const slug = legalPages[page][locale];
  return locale === 'es' ? `/${slug}/` : `/en/${slug}/`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Convierte el Markdown de un texto legal en HTML, sustituyendo los marcadores {{clave}}
 * por los datos de data/company.ts. Un dato pendiente se muestra como marcador TODO visible.
 */
export function renderLegal(markdown: string): string {
  const values: Record<string, string> = { ...company.legal, contactEmail: company.email };
  const filled = markdown.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = values[key] ?? `TODO: ${key}`;
    return isPending(value) ? `<span class="todo">${escapeHtml(value)}</span>` : escapeHtml(value);
  });
  return marked.parse(filled, { async: false });
}
