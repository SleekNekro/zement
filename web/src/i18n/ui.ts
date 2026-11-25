export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const ui = {
  es: {
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.professionals': 'Profesionales',
    'nav.contact': 'Contacto',
    'nav.shop': 'Tienda',
    'nav.language': 'English',
    'home.shopCta': 'Ir a la tienda',
    'home.proTitle': 'Distribuidores y profesionales',
    'home.proText': 'Los clientes profesionales acceden a su tarifa iniciando sesión en la tienda.',
    'home.proCta': 'Acceso profesional',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.legal': 'Aviso legal',
    'footer.privacy': 'Privacidad',
    'footer.cookies': 'Cookies',
  },
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.professionals': 'Professionals',
    'nav.contact': 'Contact',
    'nav.shop': 'Shop',
    'nav.language': 'Español',
    'home.shopCta': 'Go to the shop',
    'home.proTitle': 'Distributors and professionals',
    'home.proText': 'Professional customers see their own prices after signing in to the shop.',
    'home.proCta': 'Professional access',
    'footer.rights': 'All rights reserved.',
    'footer.legal': 'Legal notice',
    'footer.privacy': 'Privacy',
    'footer.cookies': 'Cookies',
  },
} as const;

export type UiKey = keyof (typeof ui)['es'];

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}

/** Ruta interna con prefijo de idioma (es sin prefijo). */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === 'es' ? clean : `/en${clean}`;
}

/**
 * URL de la tienda PrestaShop en el idioma indicado.
 * PrestaShop 9.2 sirve el idioma por defecto (es) sin prefijo y el resto con /<iso>/.
 */
export function shopUrl(locale: Locale, path = ''): string {
  const base = (import.meta.env.PUBLIC_TIENDA_URL ?? 'http://localhost:8090').replace(/\/$/, '');
  const prefix = locale === 'es' ? '' : `/${locale}`;
  return `${base}${prefix}/${path.replace(/^\//, '')}`;
}
