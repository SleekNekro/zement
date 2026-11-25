/** Textos fijos de la plantilla de página de sistema. */
import type { Locale } from '../i18n/ui';

export const systemPageText = {
  es: {
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
  },
  en: {
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
  },
} as const satisfies Record<Locale, Record<string, string | readonly string[]>>;

export type SystemPageText = (typeof systemPageText)[Locale];
