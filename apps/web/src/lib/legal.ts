import { marked } from 'marked';
import { company, isPending } from '../data/company';
import translations from '../i18n/translations';
import { localePath, type Locale } from '../i18n/locales';

export const legalPageKeys = ['notice', 'privacy', 'cookies', 'terms'] as const;
export type LegalPage = (typeof legalPageKeys)[number];

/** Dirección de cada página legal en cada idioma (es y en aquí; el resto, en `i18n/translations/`). */
const fromTranslations = (page: LegalPage): Record<Locale, string> => ({
  es: {
    notice: 'aviso-legal',
    privacy: 'privacidad',
    cookies: 'cookies',
    terms: 'condiciones-de-venta',
  }[page],
  en: { notice: 'legal-notice', privacy: 'privacy', cookies: 'cookies', terms: 'terms-of-sale' }[
    page
  ],
  de: translations.de.routes.legal[page],
  fr: translations.fr.routes.legal[page],
  it: translations.it.routes.legal[page],
  pl: translations.pl.routes.legal[page],
  no: translations.no.routes.legal[page],
  fi: translations.fi.routes.legal[page],
});

export const legalPages: Record<LegalPage, Record<Locale, string>> = {
  notice: fromTranslations('notice'),
  privacy: fromTranslations('privacy'),
  cookies: fromTranslations('cookies'),
  terms: fromTranslations('terms'),
};

/** URL de una página legal en un idioma. */
export function legalPath(locale: Locale, page: LegalPage): string {
  return localePath(locale, `/${legalPages[page][locale]}/`);
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
