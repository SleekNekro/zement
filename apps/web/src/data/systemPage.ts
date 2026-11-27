/** Textos fijos de la plantilla de página de sistema. */
import translations from '../i18n/translations';
import type { Locale, Strings } from '../i18n/locales';

const basePage = {
  es: {
    breadcrumbLabel: 'Ruta de navegación',
    breadcrumbHome: 'Inicio',
    buySystem: 'Comprar el sistema',
    seeDocs: 'Fichas técnicas',
    layersLabel: 'Capas del sistema',
    supportLabel: 'Soporte existente',
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
    buySystem: 'Buy the system',
    seeDocs: 'Data sheets',
    layersLabel: 'System layers',
    supportLabel: 'Existing substrate',
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
} as const;

export type SystemPageText = Strings<(typeof basePage)['es']>;

export const systemPageText: Record<Locale, SystemPageText> = {
  ...basePage,
  de: translations.de.systemPage,
  fr: translations.fr.systemPage,
  it: translations.it.systemPage,
  pl: translations.pl.systemPage,
  no: translations.no.systemPage,
  fi: translations.fi.systemPage,
};
