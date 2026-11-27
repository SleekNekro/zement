import { getCollection, type CollectionEntry } from 'astro:content';
import translations from '../i18n/translations';
import { localePath, locales, type Locale } from '../i18n/locales';
import { shopPathUrl, shopUrl } from './shop';
import systemsData from '../content/systems.json';

type Localized = Record<Locale, string>;
type SystemData = CollectionEntry<'systems'>['data'];

/** Sistema con los textos ya resueltos en un idioma. */
export interface LocalizedSystem {
  id: string;
  slug: string;
  name: string;
  audience: string;
  summary: string;
  shopQuery: string;
  /** URL de compra del sistema completo (categoría/pack o, si no existe, búsqueda). */
  buyHref: string;
  products: {
    code: string;
    layer: string;
    name: string;
    benefit: string;
    sku: string;
    formats: string;
    /** URL de compra del producto (ficha o, si no existe, búsqueda por SKU o capa). */
    buyHref: string;
  }[];
  specs: { label: string; values: string[]; highlight: boolean }[];
  steps: { title: string; text: string; time: string; code: string }[];
  colors: string;
  documents: { kind: 'technical' | 'safety'; label: string; href: string }[];
  faqs: { question: string; answer: string }[];
  /** URL de este sistema en cada idioma (para hreflang y el selector de idioma). */
  paths: Record<Locale, string>;
}

/** Carpeta de los sistemas en cada idioma (es y en aquí; el resto, en `i18n/translations/`). */
const systemsSegment: Record<Locale, string> = {
  es: 'sistemas',
  en: 'systems',
  de: translations.de.routes.systems,
  fr: translations.fr.routes.systems,
  it: translations.it.routes.systems,
  pl: translations.pl.routes.systems,
  no: translations.no.routes.systems,
  fi: translations.fi.routes.systems,
};

const basePath = (locale: Locale): string => localePath(locale, `/${systemsSegment[locale]}/`);

/**
 * URL de la antigua página índice de sistemas (/sistemas/…). Ya no tiene contenido propio: redirige
 * al sistema principal, porque solo hay uno.
 */
export function systemsIndexPath(locale: Locale): string {
  return basePath(locale);
}

/** URL del sistema principal (el de microcemento): destino de «Sistema» en el menú y el pie. */
export function mainSystemPath(locale: Locale): string {
  const [main] = systemsData;
  if (!main) throw new Error('systems.json no tiene ningún sistema');
  return systemPath(locale, main.slug[locale]);
}

/** URL de un sistema en un idioma. */
export function systemPath(locale: Locale, slug: string): string {
  return `${basePath(locale)}${slug}/`;
}

function localize(locale: Locale, id: string, data: SystemData): LocalizedSystem {
  const l = (value: Localized): string => value[locale];
  return {
    id,
    slug: l(data.slug),
    name: l(data.name),
    audience: l(data.audience),
    summary: l(data.summary),
    shopQuery: l(data.shopQuery),
    buyHref: data.shopPath[locale]
      ? shopPathUrl(locale, data.shopPath[locale])
      : shopUrl(locale, 'search', l(data.shopQuery)),
    products: data.products.map((product) => ({
      code: product.code,
      layer: l(product.layer),
      name: l(product.name),
      benefit: l(product.benefit),
      sku: product.sku,
      formats: l(product.formats),
      buyHref: product.shopPath[locale]
        ? shopPathUrl(locale, product.shopPath[locale])
        : shopUrl(
            locale,
            'search',
            product.sku.startsWith('TODO') ? l(product.layer) : product.sku,
          ),
    })),
    specs: data.specs.map((row) => ({
      label: l(row.label),
      values: row.values.map(l),
      highlight: row.highlight,
    })),
    steps: data.steps.map((step) => ({
      title: l(step.title),
      text: l(step.text),
      time: l(step.time),
      code: step.code,
    })),
    colors: l(data.colors),
    documents: data.documents.map((doc) => ({
      kind: doc.kind,
      label: l(doc.label),
      href: doc.href,
    })),
    faqs: data.faqs.map((faq) => ({ question: l(faq.question), answer: l(faq.answer) })),
    paths: Object.fromEntries(
      locales.map((code) => [code, systemPath(code, data.slug[code])]),
    ) as Record<Locale, string>,
  };
}

/** Todos los sistemas en un idioma. */
export async function getSystems(locale: Locale): Promise<LocalizedSystem[]> {
  const entries = await getCollection('systems');
  return entries.map((entry) => localize(locale, entry.id, entry.data));
}

/** true si el valor es un marcador de contenido pendiente. */
export function isTodo(value: string): boolean {
  return value.trim().startsWith('TODO');
}
