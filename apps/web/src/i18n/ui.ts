import translations from './translations';
import { localePath, locales, type Locale, type Strings } from './locales';

export { localePath, locales, type Locale };

/** Textos cortos de interfaz en español e inglés; el resto de idiomas, en `translations/`. */
const base = {
  es: {
    'nav.system': 'Sistema',
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
    'nav.language': 'Idioma',
    'shop.buy': 'Comprar en la tienda',
    'footer.legal': 'Aviso legal',
    'footer.privacy': 'Privacidad',
    'footer.cookies': 'Cookies',
    'footer.terms': 'Condiciones de venta',
    'terms.title': 'Comprar en la tienda',
    'terms.area': 'Envíos a',
    'terms.shipping': 'Coste de envío',
    'terms.delivery': 'Entrega',
    'terms.payment': 'Pago',
    'terms.returns': 'Devoluciones',
    'legal.crumbs': 'Ruta de navegación',
    'legal.home': 'Inicio',
    'legal.updated': 'Última actualización',
    'legal.draft':
      'Borrador pendiente de revisión legal. Este texto no es definitivo hasta que lo valide la asesoría de Zement.',
  },
  en: {
    'nav.system': 'System',
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
    'nav.language': 'Language',
    'shop.buy': 'Buy in the shop',
    'footer.legal': 'Legal notice',
    'footer.privacy': 'Privacy',
    'footer.cookies': 'Cookies',
    'footer.terms': 'Terms of sale',
    'terms.title': 'Buying in the shop',
    'terms.area': 'Shipping to',
    'terms.shipping': 'Shipping cost',
    'terms.delivery': 'Delivery',
    'terms.payment': 'Payment',
    'terms.returns': 'Returns',
    'legal.crumbs': 'Breadcrumb',
    'legal.home': 'Home',
    'legal.updated': 'Last updated',
    'legal.draft':
      'Draft pending legal review. This text is not final until it has been approved by Zement’s legal advisers.',
  },
} as const;

export type UiStrings = Strings<(typeof base)['es']>;
export type UiKey = keyof UiStrings;

export const ui: Record<Locale, UiStrings> = {
  ...base,
  de: translations.de.ui,
  fr: translations.fr.ui,
  it: translations.it.ui,
  pl: translations.pl.ui,
  no: translations.no.ui,
  fi: translations.fi.ui,
};

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}
