import type { Locale } from '../i18n/ui';
import { legalPages, legalPath, type LegalPage } from './legal';
import { getSystems, systemPath, systemsIndexPath } from './systems';

/**
 * ¿Se puede indexar la web? Solo al publicarla de verdad: compilar con `ZEMENT_INDEXABLE=true`.
 * Mientras tanto (local, pruebas), todas las páginas llevan `noindex` y robots.txt lo prohíbe.
 */
export const isIndexable = import.meta.env.ZEMENT_INDEXABLE === 'true';

/** Una página pública con su URL en cada idioma (para el sitemap y sus `hreflang`). */
export type PagePaths = Record<Locale, string>;

/** Todas las páginas públicas de la web, en sus dos idiomas. */
export async function getPublicPages(): Promise<PagePaths[]> {
  const systems = await getSystems('es');
  const legal = Object.keys(legalPages) as LegalPage[];

  return [
    { es: '/', en: '/en/' },
    { es: systemsIndexPath('es'), en: systemsIndexPath('en') },
    ...systems.map((system) => ({
      es: systemPath('es', system.slug),
      en: systemPath('en', system.slug),
    })),
    ...legal.map((page) => ({ es: legalPath('es', page), en: legalPath('en', page) })),
  ];
}
