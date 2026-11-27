import { getCollection } from 'astro:content';
import { localePath, locales, type Locale } from '../i18n/locales';
import { legalPageKeys, legalPath } from './legal';
import { getSystems } from './systems';

/**
 * ¿Se puede indexar la web? Solo al publicarla de verdad: compilar con `ZEMENT_INDEXABLE=true`.
 * Mientras tanto (local, pruebas), todas las páginas llevan `noindex` y robots.txt lo prohíbe.
 */
export const isIndexable = import.meta.env.ZEMENT_INDEXABLE === 'true';

/** Una página pública con su URL en cada idioma (para el sitemap y sus `hreflang`). */
export type PagePaths = Record<Locale, string>;

/** Todas las páginas públicas de la web, en todos sus idiomas. */
export async function getPublicPages(): Promise<PagePaths[]> {
  const systems = await getSystems('es');
  const legal = await getCollection('legal');
  const each = (build: (locale: Locale) => string): PagePaths =>
    Object.fromEntries(locales.map((locale) => [locale, build(locale)])) as PagePaths;
  const legalKeys = legalPageKeys.filter((page) => legal.some((entry) => entry.data.page === page));

  return [
    each((locale) => localePath(locale, '/')),
    ...systems.map((system) => system.paths),
    ...legalKeys.map((page) => each((locale) => legalPath(locale, page))),
  ];
}
