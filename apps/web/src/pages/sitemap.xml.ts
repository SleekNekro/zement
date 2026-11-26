import type { APIRoute } from 'astro';
import { getPublicPages } from '../lib/seo';

/** Sitemap con las dos versiones de cada página enlazadas entre sí (hreflang). */
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('http://localhost:4321');
  const pages = await getPublicPages();
  const url = (path: string): string => new URL(path, base).href;

  const entries = pages.flatMap((page) =>
    (['es', 'en'] as const).map(
      (locale) => `  <url>
    <loc>${url(page[locale])}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${url(page.es)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${url(page.en)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url(page.es)}"/>
  </url>`,
    ),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
