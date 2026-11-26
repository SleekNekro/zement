/**
 * Forma de una traducción completa de la web (todos los textos de un idioma).
 * El español y el inglés viven en sus módulos (`i18n/ui.ts`, `data/home.ts`…); el resto de idiomas,
 * un fichero por idioma en esta carpeta (`de.ts`, `fr.ts`…) que cumple esta interfaz.
 */
import type { FormMessages, FormText } from '../form';
import type { UiStrings } from '../ui';
import type { HomeContent } from '../../data/home';
import type { SystemPageText, SystemsIndexText } from '../../data/systemPage';
import type { LegalPage } from '../../lib/legal';

export interface Translation {
  /** Textos cortos de interfaz (menú, botones, etiquetas). */
  ui: UiStrings;
  /** Formulario de contacto: etiquetas (cliente). */
  form: FormText;
  /** Formulario de contacto: respuestas del servidor (también las usa el PHP). */
  formMessages: FormMessages;
  /** Portada completa. */
  home: HomeContent;
  /** Plantilla de la página de sistema. */
  systemPage: SystemPageText;
  /** Índice de sistemas. */
  systemsIndex: SystemsIndexText;
  /** Textos de empresa y condiciones de compra (los «TODO: …» se traducen también). */
  company: Record<
    | 'hours'
    | 'responseTime'
    | 'area'
    | 'shipping'
    | 'delivery'
    | 'payment'
    | 'returns'
    | 'proApprovalTime',
    string
  >;
  /** Direcciones traducidas (minúsculas, sin acentos ni espacios: palabras unidas con guiones). */
  routes: {
    /** Carpeta de los sistemas, p. ej. «systeme» → /de/systeme/. */
    systems: string;
    /** Página de cada texto legal, p. ej. { privacy: 'datenschutz' } → /de/datenschutz/. */
    legal: Record<LegalPage, string>;
  };
}

/** Idiomas que se traducen en esta carpeta (el español y el inglés están en los módulos). */
export type ExtraLocale = 'de' | 'fr' | 'it' | 'pl' | 'no' | 'fi';
