import type { APIRoute } from 'astro';
import { isIndexable } from '../lib/seo';

/** Antes de publicar, nada se indexa; al publicar (ZEMENT_INDEXABLE=true), todo y el sitemap. */
export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('http://localhost:4321');
  const body = isIndexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', base).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
