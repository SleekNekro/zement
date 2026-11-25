import type { Locale } from '../i18n/ui';

const DEFAULT_SHOP_URL = 'http://localhost:8090';

/** Rutas de la tienda que dependen del idioma (URLs amigables de PrestaShop). */
const shopRoutes = {
  login: { es: 'iniciar-sesion', en: 'login' },
  search: { es: 'busqueda', en: 'search' },
  register: { es: 'registro', en: 'registration' },
} as const satisfies Record<string, Record<Locale, string>>;

export type ShopRoute = keyof typeof shopRoutes;

/** URL de una ruta concreta de la tienda (categoría, pack o producto) en el idioma indicado. */
export function shopPathUrl(locale: Locale, path: string): string {
  const base = (import.meta.env.PUBLIC_TIENDA_URL ?? DEFAULT_SHOP_URL).replace(/\/$/, '');
  const prefix = locale === 'es' ? '' : `/${locale}`;
  return `${base}${prefix}/${path.replace(/^\//, '')}`;
}

/**
 * URL de la tienda PrestaShop en el idioma indicado.
 * PrestaShop 9.2 sirve el idioma por defecto (es) sin prefijo y el resto con /<iso>/.
 */
export function shopUrl(locale: Locale, route?: ShopRoute, query?: string): string {
  const base = (import.meta.env.PUBLIC_TIENDA_URL ?? DEFAULT_SHOP_URL).replace(/\/$/, '');
  const prefix = locale === 'es' ? '' : `/${locale}`;
  const path = route ? shopRoutes[route][locale] : '';
  const search = query ? `?${new URLSearchParams({ s: query }).toString()}` : '';
  return `${base}${prefix}/${path}${search}`;
}
