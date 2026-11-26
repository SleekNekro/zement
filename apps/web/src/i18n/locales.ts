/**
 * Idiomas de la web: los mismos que la tienda. El español es el principal y va sin prefijo;
 * el resto, con /<código>/ (como PrestaShop).
 */
export const locales = ['es', 'en', 'de', 'fr', 'it', 'pl', 'no', 'fi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

/** Nombre de cada idioma en su propio idioma (selector de idioma). */
export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  pl: 'Polski',
  no: 'Norsk',
  fi: 'Suomi',
};

/** Código regional para Open Graph. */
export const ogLocales: Record<Locale, string> = {
  es: 'es_ES',
  en: 'en_GB',
  de: 'de_DE',
  fr: 'fr_FR',
  it: 'it_IT',
  pl: 'pl_PL',
  no: 'nb_NO',
  fi: 'fi_FI',
};

/** Convierte los textos literales de una plantilla en `string` para poder traducirlos. */
export type Strings<T> = {
  [K in keyof T]: T[K] extends readonly string[] ? readonly string[] : string;
};

/** Ruta interna con prefijo de idioma (es sin prefijo). */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}
