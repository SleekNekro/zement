import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/ui';
import { shopPathUrl, shopUrl } from './shop';

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
  steps: { title: string; text: string; time: string }[];
  colors: string;
  documents: { kind: 'technical' | 'safety'; label: string; href: string }[];
  faqs: { question: string; answer: string }[];
  /** URL de este sistema en cada idioma (para hreflang y el selector de idioma). */
  paths: Record<Locale, string>;
}

const basePath: Record<Locale, string> = { es: '/sistemas/', en: '/en/systems/' };

/** URL del índice de sistemas en un idioma. */
export function systemsIndexPath(locale: Locale): string {
  return basePath[locale];
}

/** URL de un sistema en un idioma. */
export function systemPath(locale: Locale, slug: string): string {
  return `${basePath[locale]}${slug}/`;
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
    buyHref: l(data.shopPath)
      ? shopPathUrl(locale, l(data.shopPath))
      : shopUrl(locale, 'search', l(data.shopQuery)),
    products: data.products.map((product) => ({
      code: product.code,
      layer: l(product.layer),
      name: l(product.name),
      benefit: l(product.benefit),
      sku: product.sku,
      formats: l(product.formats),
      buyHref: l(product.shopPath)
        ? shopPathUrl(locale, l(product.shopPath))
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
    })),
    colors: l(data.colors),
    documents: data.documents.map((doc) => ({
      kind: doc.kind,
      label: l(doc.label),
      href: doc.href,
    })),
    faqs: data.faqs.map((faq) => ({ question: l(faq.question), answer: l(faq.answer) })),
    paths: {
      es: systemPath('es', data.slug.es),
      en: systemPath('en', data.slug.en),
    },
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
