/**
 * Datos de contacto de Zement: una sola fuente para la web.
 * Un valor vacío o que empieza por «TODO» no se muestra como enlace (se marca como pendiente).
 * TODO: contenido real — rellenar con los datos que facilite Zement.
 */
export const company = {
  /** Correo de contacto comercial y técnico. */
  email: 'TODO: correo real',
  /** Teléfono en formato internacional, p. ej. +34 600 000 000. */
  phone: 'TODO: teléfono real',
  /** Número de WhatsApp en formato internacional sin espacios, p. ej. 34600000000 (vacío = sin WhatsApp). */
  whatsapp: '',
  /** Horario de atención. */
  hours: { es: 'TODO: horario real', en: 'TODO: real opening hours' },
  /** Plazo de respuesta a consultas. */
  responseTime: { es: 'TODO: plazo real de respuesta', en: 'TODO: real response time' },
  /** Condiciones de compra en la tienda (deben coincidir con PrestaShop: una sola verdad). */
  shopTerms: {
    shipping: {
      es: 'TODO: envío gratis desde X € / coste',
      en: 'TODO: free shipping from X € / cost',
    },
    delivery: { es: 'TODO: plazo real de entrega', en: 'TODO: real delivery time' },
    payment: { es: 'TODO: formas de pago reales', en: 'TODO: real payment methods' },
    returns: { es: 'TODO: condiciones de devolución', en: 'TODO: return conditions' },
  },
  /** Plazo de revisión de las altas profesionales. */
  proApprovalTime: { es: 'TODO: plazo real de alta', en: 'TODO: real approval time' },
} as const;

/** true si el dato está pendiente y no debe usarse como enlace. */
export function isPending(value: string): boolean {
  return value.trim() === '' || value.trim().startsWith('TODO');
}
