export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const ui = {
  es: {
    'nav.home': 'Inicio',
    'nav.system': 'Sistema',
    'nav.application': 'Aplicación',
    'nav.professionals': 'Profesionales',
    'nav.project': 'Tu proyecto',
    'nav.contact': 'Contacto',
    'brand.tagline': 'Microcemento & Materials',
    'a11y.skip': 'Saltar al contenido',
    'a11y.menu': 'Menú principal',
    'nav.menu': 'Menú',
    'nav.close': 'Cerrar',
    'nav.shop': 'Tienda',
    'nav.external': '(abre la tienda)',
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
    'nav.system': 'System',
    'nav.application': 'Application',
    'nav.professionals': 'Professionals',
    'nav.project': 'Your project',
    'nav.contact': 'Contact',
    'brand.tagline': 'Microcement & Materials',
    'a11y.skip': 'Skip to content',
    'a11y.menu': 'Main menu',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.shop': 'Shop',
    'nav.external': '(opens the shop)',
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
