import translations from '../i18n/translations';
import type { Locale } from '../i18n/locales';

type Localized = Record<Locale, string>;

/** Textos de empresa en español e inglés; el resto de idiomas sale de `i18n/translations/`. */
const pick = (
  key:
    | 'hours'
    | 'responseTime'
    | 'area'
    | 'shipping'
    | 'delivery'
    | 'payment'
    | 'returns'
    | 'proApprovalTime',
  es: string,
  en: string,
): Localized => ({
  es,
  en,
  de: translations.de.company[key],
  fr: translations.fr.company[key],
  it: translations.it.company[key],
  pl: translations.pl.company[key],
  no: translations.no.company[key],
  fi: translations.fi.company[key],
});

/**
 * Datos de contacto de Zement: una sola fuente para la web.
 * Un valor vacío o que empieza por «TODO» no se muestra como enlace (se marca como pendiente).
 * TODO: contenido real — rellenar con los datos que facilite Zement.
 */
export const company = {
  /** Correo de contacto comercial y técnico. */
  email: 'info@zement.es',
  /** Teléfono en formato internacional, p. ej. +34 600 000 000. */
  phone: '+34 607 800 028',
  /** Número de WhatsApp en formato internacional sin espacios, p. ej. 34600000000 (vacío = sin WhatsApp). */
  whatsapp: '',
  /** Horario de atención. */
  hours: pick(
    'hours',
    'De lunes a viernes, de 9:00 a 17:00',
    'Monday to Friday, 9:00–17:00 (Spanish time)',
  ),
  /** Plazo de respuesta a consultas. */
  responseTime: pick('responseTime', '24 horas en días laborables', '24 hours on working days'),
  /** Condiciones de compra en la tienda (deben coincidir con PrestaShop: una sola verdad). */
  shopTerms: {
    area: pick('area', 'España y Europa', 'Spain and Europe'),
    shipping: pick(
      'shipping',
      'TODO: coste y envío gratis desde X €',
      'TODO: cost and free shipping from X €',
    ),
    delivery: pick('delivery', 'TODO: plazo real de entrega', 'TODO: real delivery time'),
    payment: pick('payment', 'TODO: formas de pago reales', 'TODO: real payment methods'),
    returns: pick('returns', 'TODO: condiciones de devolución', 'TODO: return conditions'),
  },
  /**
   * Datos legales del titular de la web y la tienda (LSSI art. 10, RGPD art. 13).
   * Se insertan en los textos legales mediante marcadores {{clave}} (ver lib/legal.ts).
   */
  legal: {
    name: 'TODO: razón social',
    taxId: 'TODO: CIF',
    address: 'TODO: domicilio social completo',
    registry: 'TODO: datos de inscripción en el Registro Mercantil',
    email: 'info@zement.es',
    website: 'TODO: dominio de la web',
    shopWebsite: 'TODO: dominio de la tienda',
    paymentProvider: 'TODO: pasarela de pago (Redsys o Stripe)',
    carrier: 'TODO: empresa de transporte',
    updated: '25/11/2026',
  },
  /** Plazo de revisión de las altas profesionales. */
  proApprovalTime: pick('proApprovalTime', '24 h', '24 h'),
} as const;

/** true si el dato está pendiente y no debe usarse como enlace. */
export function isPending(value: string): boolean {
  return value.trim() === '' || value.trim().startsWith('TODO');
}
