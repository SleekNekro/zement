/**
 * Colecciones de contenido de la web de marca.
 * Cada texto visible se guarda en los dos idiomas ({ es, en }).
 * Un valor que empieza por «TODO» se muestra como marcador de contenido pendiente: no rellenar por inferencia.
 */
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

import { locales, type Locale } from './i18n/locales';

/** Texto en los 8 idiomas de la web. */
const localized = z.object(
  Object.fromEntries(locales.map((code) => [code, z.string()])) as Record<Locale, z.ZodString>,
);

/** Ruta en la tienda (p. ej. «/12-microcemento»); vacía = se usa la búsqueda de la tienda. */
const shopPath = z
  .object(
    Object.fromEntries(locales.map((code) => [code, z.string()])) as Record<Locale, z.ZodString>,
  )
  .partial()
  .default({});

/** Sistema de microcemento: conjunto de productos que se aplican por capas (Z.01 → Z.04). */
const systems = defineCollection({
  loader: file('src/content/systems.json'),
  schema: z.object({
    slug: localized,
    name: localized,
    /** Para quién es y qué ofrece, en una frase. */
    audience: localized,
    summary: localized,
    /** Búsqueda en la tienda para «Comprar el sistema» hasta que exista su categoría. */
    shopQuery: localized,
    /** Categoría o pack del sistema completo en la tienda (TODO al crearlos en PrestaShop). */
    shopPath,
    products: z.array(
      z.object({
        code: z.string(),
        layer: localized,
        name: localized,
        benefit: localized,
        sku: z.string(),
        /** Ficha del producto en la tienda (TODO al crearla en PrestaShop). */
        shopPath,
        formats: localized,
      }),
    ),
    /** Comparativa técnica: una fila por dato, un valor por producto (mismo orden que `products`). */
    specs: z.array(
      z.object({
        label: localized,
        values: z.array(localized),
        /** Se muestra también en la portada (máx. 2 datos por capa). */
        highlight: z.boolean().default(false),
      }),
    ),
    steps: z.array(
      z.object({
        title: localized,
        text: localized,
        time: localized,
        /** Capa que se aplica en este paso (p. ej. «Z.02»); vacío = trabajo sobre el soporte. */
        code: z.string().default(''),
      }),
    ),
    colors: localized,
    documents: z.array(
      z.object({
        kind: z.enum(['technical', 'safety']),
        label: localized,
        /** Ruta del PDF en /public/docs/ (vacía mientras no exista). */
        href: z.string(),
      }),
    ),
    faqs: z.array(z.object({ question: localized, answer: localized })),
  }),
});

/**
 * Textos legales en Markdown, uno por página e idioma (src/content/legal/<idioma>/<página>.md).
 * Los datos de la empresa se escriben como marcadores {{clave}} y salen de data/company.ts.
 */
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    page: z.enum(['notice', 'privacy', 'cookies', 'terms']),
    lang: z.enum(locales),
    title: z.string(),
    description: z.string(),
    /** true mientras el texto no haya sido revisado por la asesoría legal. */
    draft: z.boolean().default(true),
  }),
});

export const collections = { systems, legal };
