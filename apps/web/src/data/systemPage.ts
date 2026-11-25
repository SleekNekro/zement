/** Textos fijos de la plantilla de página de sistema. */
import type { Locale } from '../i18n/ui';

export const systemPageText = {
  es: {
    breadcrumbLabel: 'Ruta de navegación',
    breadcrumbHome: 'Inicio',
    breadcrumbProducts: 'Sistemas',
    buySystem: 'Comprar el sistema',
    seeDocs: 'Fichas técnicas',
    layersLabel: 'Capas del sistema',
    supportLabel: 'Soporte existente',
    thicknessTodo: 'TODO: mm',
    rangeTitle: 'La gama',
    rangeText:
      'Cada capa tiene su producto. Se aplican en este orden, de la preparación a la protección.',
    formats: 'Envases',
    buy: 'Comprar',
    specsTitle: 'Datos técnicos',
    specsText: 'Los valores de referencia de cada producto, para comparar y calcular la obra.',
    stepsTitle: 'Cómo se aplica',
    stepTime: 'Tiempo',
    colorsTitle: 'Colores',
    docsTitle: 'Documentación',
    docsText: 'Fichas técnicas y hojas de seguridad, siempre actualizadas.',
    docPending: 'TODO: PDF real',
    download: 'Descargar PDF',
    faqTitle: 'Preguntas frecuentes',
    ctaTitle: ['¿Hablamos', 'de tu obra?'],
    ctaText:
      'Cuéntanos el soporte y los metros: te ayudamos a elegir el sistema y a calcular las cantidades.',
    talkToTech: 'Hablar con un técnico',
    quote: 'Pedir presupuesto de aplicación',
    proTitle: '¿Eres profesional?',
    proText:
      'Inicia sesión en la tienda y verás tu tarifa, sin IVA, en cada producto de este sistema.',
    proCta: 'Acceso profesional',
    proSignup: 'Solicitar el alta',
  },
  en: {
    breadcrumbLabel: 'Breadcrumb',
    breadcrumbHome: 'Home',
    breadcrumbProducts: 'Systems',
    buySystem: 'Buy the system',
    seeDocs: 'Data sheets',
    layersLabel: 'System layers',
    supportLabel: 'Existing substrate',
    thicknessTodo: 'TODO: mm',
    rangeTitle: 'The range',
    rangeText:
      'Each layer has its product. They are applied in this order, from preparation to protection.',
    formats: 'Pack sizes',
    buy: 'Buy',
    specsTitle: 'Technical data',
    specsText: 'Reference values for each product, to compare and plan the job.',
    stepsTitle: 'How it is applied',
    stepTime: 'Time',
    colorsTitle: 'Colours',
    docsTitle: 'Documentation',
    docsText: 'Technical data sheets and safety data sheets, always up to date.',
    docPending: 'TODO: real PDF',
    download: 'Download PDF',
    faqTitle: 'Frequently asked questions',
    ctaTitle: ['Shall we talk', 'about your project?'],
    ctaText:
      'Tell us about the substrate and the area: we help you choose the system and work out the quantities.',
    talkToTech: 'Talk to a technician',
    quote: 'Request an application quote',
    proTitle: 'Are you a professional?',
    proText:
      'Sign in to the shop to see your price list, excluding VAT, on every product in this system.',
    proCta: 'Professional access',
    proSignup: 'Request an account',
  },
} as const satisfies Record<Locale, Record<string, string | readonly string[]>>;

export type SystemPageText = (typeof systemPageText)[Locale];

/** Textos del índice de sistemas (/sistemas/, /en/systems/). */
export const systemsIndexText = {
  es: {
    breadcrumbLabel: 'Ruta de navegación',
    breadcrumbHome: 'Inicio',
    title: 'Sistemas',
    intro:
      'Cada sistema reúne los productos de todas sus capas, con datos técnicos, aplicación y documentación.',
    see: 'Ver el sistema',
    buy: 'Comprar',
    proText: '¿Eres profesional? Inicia sesión y verás tu tarifa sin IVA en cada producto.',
    proCta: 'Acceso profesional',
  },
  en: {
    breadcrumbLabel: 'Breadcrumb',
    breadcrumbHome: 'Home',
    title: 'Systems',
    intro:
      'Each system brings together the products for every layer, with technical data, application and documentation.',
    see: 'See the system',
    buy: 'Buy',
    proText:
      'Are you a professional? Sign in to see your price list, excluding VAT, on every product.',
    proCta: 'Professional access',
  },
} as const satisfies Record<Locale, Record<string, string>>;
