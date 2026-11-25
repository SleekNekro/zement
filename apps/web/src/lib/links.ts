import type { LinkTarget } from '../data/home';
import type { Locale } from '../i18n/ui';
import { shopUrl } from './shop';

export interface ResolvedLink {
  href: string;
  /** true si el enlace sale de la web de marca (tienda). */
  isExternal: boolean;
}

/** Convierte un destino de contenido en un enlace real según el idioma. */
export function resolveLink(locale: Locale, target: LinkTarget): ResolvedLink {
  if (target.kind === 'shop') {
    return { href: shopUrl(locale, target.route), isExternal: true };
  }
  return { href: `#${target.id}`, isExternal: false };
}
