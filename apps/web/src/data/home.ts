/**
 * Textos de la portada.
 * Origen: boceto de UI aportado por Zement (25/11/2026), traducido al inglés.
 * Lo marcado con `todo` está pendiente de contenido real: no rellenar por inferencia.
 */
import type { Locale } from '../i18n/ui';

/** Destino de un enlace: la tienda (sale de la web) o una sección de esta página. */
export type LinkTarget = { kind: 'shop'; route?: 'login' } | { kind: 'section'; id: string };

export interface AudienceLink {
  label: string;
  target: LinkTarget;
}

/** Camino de entrada para cada público: profesional o particular con un proyecto. */
export interface AudiencePath {
  id: 'pro' | 'project';
  title: string;
  text: string;
  primary: AudienceLink;
  secondary: AudienceLink;
}

/** Capítulo de la portada dedicado a un público, con salto al otro capítulo. */
export interface Chapter {
  id: 'profesionales' | 'proyecto';
  title: string;
  text: string;
  /** Salto opcional al otro capítulo. */
  jumpLabel?: string;
  jumpTo?: 'profesionales' | 'proyecto';
}

/**
 * Familia de productos en la tienda, ligada a las capas del sistema que cubre.
 * `query` se usa en la búsqueda de PrestaShop hasta que existan las categorías reales
 * (TODO: sustituir por la URL de cada categoría cuando se creen en la tienda).
 */
export interface ShopCategory {
  name: string;
  codes: string[];
  text: string;
  query: string;
}

export interface HomeContent {
  topbar: string;
  hero: {
    title: [string, string];
    text: string;
    /** Pregunta que agrupa los dos caminos (no es un titular). */
    pathsLabel: string;
    paths: AudiencePath[];
    imageTodo: string;
  };
  /** Franja fija al pie del hero que lleva a la tienda. */
  shopStrip: { label: string; cta: string };
  /** El capítulo «proyecto» no lleva apertura propia: solo el ancla y su nombre accesible. */
  chapters: { pro: Chapter; project: Pick<Chapter, 'id' | 'title'> };
  intro: { title: string[]; paragraphs: string[]; link: string };
  system: {
    title: string[];
    text: string;
    steps: { code: string; name: string; text: string }[];
    layersLabel: string;
    /** Cómo leer el corte de capas. */
    layersDirection: string;
    stepLabel: string;
    /** Capa base del corte (la superficie existente). */
    supportLabel: string;
    /** Espesor de cada capa: pendiente de ficha técnica, no inventar. */
    thicknessTodo: string;
    /** Enlace a la página completa del sistema (datos técnicos, aplicación, documentación). */
    fullSystemText: string;
    fullSystemCta: string;
  };
  application: { title: string[]; text: string; cta: string; shopCta: string; areas: string[] };
  shop: {
    title: string[];
    text: string;
    categories: ShopCategory[];
    cta: string;
    proTitle: string;
    proText: string;
    proCta: string;
    proSignupText: string;
    proSignupCta: string;
    /** Cómo funciona el alta; el plazo sale de data/company.ts. */
    proSignupSteps: string;
  };
  method: { title: string[]; text: string; points: string[]; imageTodo: string };
  contact: {
    title: string[];
    text: string;
    signature: string;
    placeholders: {
      name: string;
      email: string;
      phone: string;
      postalCode: string;
      message: string;
    };
    /** Opciones de «Te interesa», en el orden de interestValues (application, products, professional, other). */
    interests: string[];
  };
}

export const home: Record<Locale, HomeContent> = {
  es: {
    topbar: 'Microcemento · Aplicación profesional · Tienda especializada',
    hero: {
      title: ['La materia', 'lo transforma todo.'],
      text: 'Microcemento para crear espacios únicos. Aplicamos soluciones continuas y ponemos a tu alcance los materiales para hacerlas realidad.',
      pathsLabel: '¿Por dónde empiezas?',
      paths: [
        {
          id: 'pro',
          title: 'Soy profesional',
          text: 'Distribuidores y aplicadores: materiales del sistema, tarifa propia y documentación técnica.',
          primary: { label: 'Ver materiales', target: { kind: 'shop' } },
          secondary: { label: 'Acceso profesional', target: { kind: 'shop', route: 'login' } },
        },
        {
          id: 'project',
          title: 'Tengo un proyecto',
          text: 'Particulares y estudios: aplicamos el sistema en tu espacio o te ayudamos a elegir los materiales.',
          primary: { label: 'Pedir presupuesto', target: { kind: 'section', id: 'contacto' } },
          secondary: { label: 'Comprar los materiales', target: { kind: 'shop' } },
        },
      ],
      imageTodo: 'TODO: fotografía real de proyecto',
    },
    shopStrip: { label: 'Todo el sistema, en la tienda online', cta: 'Comprar en la tienda' },
    chapters: {
      pro: {
        id: 'profesionales',
        title: 'Para profesionales',
        text: 'El sistema, sus materiales y tu tarifa: lo que necesitas para trabajar con Zement.',
        jumpLabel: '¿Tienes un proyecto propio?',
        jumpTo: 'proyecto',
      },
      project: {
        id: 'proyecto',
        title: 'Para tu proyecto',
      },
    },
    intro: {
      title: ['Un material.', 'Dos maneras', 'de transformar.'],
      paragraphs: [
        'Zement es un sistema de microcemento por capas: preparación, base, acabado y protección. Lo vendemos en nuestra tienda online, con envíos a España y Europa, y lo aplicamos en obra en España.',
        'Cada capa tiene un producto con una función concreta y su ficha técnica. Los profesionales compran con su propia tarifa; si tienes un proyecto, puedes encargarnos la aplicación o hacerlo por tu cuenta.',
      ],
      link: 'Ver cómo se construye',
    },
    system: {
      title: ['Calidad que', 'se puede comprobar.'],
      text: 'Cada superficie es un sistema de capas. Cada producto tiene una función precisa y una documentación técnica que la respalda.',
      steps: [
        { code: 'Z.01', name: 'Preparación', text: 'Producto de preparación para el soporte.' },
        { code: 'Z.02', name: 'Base', text: 'Revestimiento base para sistemas de microcemento.' },
        { code: 'Z.03', name: 'Acabado', text: 'Acabado decorativo de textura suave y natural.' },
        { code: 'Z.04', name: 'Protección', text: 'Protección final para el sistema aplicado.' },
      ],
      layersLabel: 'Cómo se construye una superficie Zement',
      layersDirection: 'Se lee de abajo arriba: del soporte a la protección',
      stepLabel: 'Capa',
      supportLabel: 'Soporte existente',
      thicknessTodo: 'TODO: mm',
      fullSystemText:
        'Datos técnicos, aplicación paso a paso, colores y fichas para descargar: todo en la página del sistema.',
      fullSystemCta: 'Ver el sistema completo',
    },
    application: {
      title: ['Tu espacio,', 'con el sistema completo.'],
      text: 'Realizamos trabajos de microcemento con atención al soporte, la preparación y el acabado final. Una solución versátil para renovar sin recargar, con continuidad visual y personalidad.',
      cta: 'Pedir presupuesto',
      shopCta: 'Comprar los materiales',
      areas: [
        'Suelos y paredes',
        'Baños y duchas',
        'Cocinas',
        'Locales comerciales',
        'Revestimientos',
        'Proyectos a medida',
      ],
    },
    shop: {
      title: ['Los materiales', 'de cada capa.'],
      text: 'Descubre una selección de productos para preparar, aplicar y proteger superficies de microcemento.',
      categories: [
        {
          name: 'Microcemento',
          codes: ['Z.02', 'Z.03'],
          text: 'Base y acabado: las dos capas que dan cuerpo y textura a la superficie.',
          query: 'microcemento',
        },
        {
          name: 'Preparación',
          codes: ['Z.01'],
          text: 'Productos de preparación para el soporte.',
          query: 'preparación',
        },
        {
          name: 'Protección',
          codes: ['Z.04'],
          text: 'Protección final para el sistema aplicado.',
          query: 'protección',
        },
        {
          name: 'Herramientas',
          codes: [],
          text: 'Para preparar, aplicar y acabar el sistema.',
          query: 'herramientas',
        },
      ],
      cta: 'Ver en la tienda',
      proTitle: 'Distribuidores y profesionales',
      proText:
        'Inicia sesión y la tienda te muestra tu tarifa, sin IVA, en cada producto. Sin pedir precios por correo.',
      proCta: 'Acceso profesional',
      proSignupText: '¿Aún no tienes cuenta profesional?',
      proSignupCta: 'Solicitar el alta',
      proSignupSteps:
        'Regístrate en la tienda con los datos de tu empresa (razón social y CIF). Revisamos la solicitud y activamos tu tarifa en',
    },
    method: {
      title: ['Del primer gesto', 'al último detalle.'],
      text: 'En cada obra revisamos primero el soporte, proponemos el sistema adecuado y lo aplicamos capa a capa, respetando los tiempos de cada producto hasta la protección final.',
      points: [
        'Revisión del soporte antes de empezar',
        'Sistema completo de una sola marca',
        'Ficha técnica de cada producto',
        'Materiales también en la tienda online',
      ],
      imageTodo: 'TODO: fotografía real de acabado',
    },
    contact: {
      title: ['¿Empezamos', 'tu proyecto?'],
      text: 'Cuéntanos si buscas un aplicador profesional o si necesitas productos para tu propio proyecto. Te ayudaremos a encontrar el siguiente paso.',
      signature: 'Zement · Microcemento & Materials',
      placeholders: {
        name: 'Tu nombre',
        email: 'tu@email.com',
        phone: '+34 …',
        postalCode: 'Ej.: 28001',
        message: 'Qué espacio, en qué estado está el soporte, plazos…',
      },
      interests: [
        'Aplicación del sistema en mi espacio',
        'Comprar productos',
        'Alta o información profesional',
        'Otro',
      ],
    },
  },
  en: {
    topbar: 'Microcement · Professional application · Specialist shop',
    hero: {
      title: ['Material', 'transforms everything.'],
      text: 'Microcement to create unique spaces. We apply seamless solutions and bring you the materials to make them real.',
      pathsLabel: 'Where do you start?',
      paths: [
        {
          id: 'pro',
          title: 'I am a professional',
          text: 'Distributors and applicators: system materials, your own price list and technical documentation.',
          primary: { label: 'View materials', target: { kind: 'shop' } },
          secondary: { label: 'Professional access', target: { kind: 'shop', route: 'login' } },
        },
        {
          id: 'project',
          title: 'I have a project',
          text: 'Homeowners and studios: we apply the system in your space or help you choose the materials.',
          primary: { label: 'Request a quote', target: { kind: 'section', id: 'contacto' } },
          secondary: { label: 'Buy the materials', target: { kind: 'shop' } },
        },
      ],
      imageTodo: 'TODO: real project photograph',
    },
    shopStrip: { label: 'The whole system, in the online shop', cta: 'Buy in the shop' },
    chapters: {
      pro: {
        id: 'profesionales',
        title: 'For professionals',
        text: 'The system, its materials and your price list: what you need to work with Zement.',
        jumpLabel: 'Do you have your own project?',
        jumpTo: 'proyecto',
      },
      project: {
        id: 'proyecto',
        title: 'For your project',
      },
    },
    intro: {
      title: ['One material.', 'Two ways', 'to transform.'],
      paragraphs: [
        'Zement is a layered microcement system: preparation, base, finish and protection. We sell it in our online shop, shipping to Spain and Europe, and we apply it on site in Spain.',
        'Each layer has a product with a specific role and its own data sheet. Professionals buy at their own price list; if you have a project, you can have us apply it or do it yourself.',
      ],
      link: 'See how it is built',
    },
    system: {
      title: ['Quality you', 'can verify.'],
      text: 'Every surface is a system of layers. Every product has a precise role and technical documentation to support it.',
      steps: [
        { code: 'Z.01', name: 'Preparation', text: 'Substrate preparation product.' },
        { code: 'Z.02', name: 'Base', text: 'Base coat for microcement systems.' },
        { code: 'Z.03', name: 'Finish', text: 'Decorative finish with a soft, natural texture.' },
        { code: 'Z.04', name: 'Protection', text: 'Final protection for the applied system.' },
      ],
      layersLabel: 'How a Zement surface is built',
      layersDirection: 'Read from bottom to top: from substrate to protection',
      stepLabel: 'Layer',
      supportLabel: 'Existing substrate',
      thicknessTodo: 'TODO: mm',
      fullSystemText:
        'Technical data, step-by-step application, colours and downloadable sheets: all on the system page.',
      fullSystemCta: 'See the full system',
    },
    application: {
      title: ['Your space,', 'with the complete system.'],
      text: 'We carry out microcement work with attention to the substrate, preparation and final finish. A versatile way to renovate without clutter, with visual continuity and character.',
      cta: 'Request a quote',
      shopCta: 'Buy the materials',
      areas: [
        'Floors and walls',
        'Bathrooms and showers',
        'Kitchens',
        'Commercial premises',
        'Wall coverings',
        'Bespoke projects',
      ],
    },
    shop: {
      title: ['The materials', 'for every layer.'],
      text: 'Discover a selection of products to prepare, apply and protect microcement surfaces.',
      categories: [
        {
          name: 'Microcement',
          codes: ['Z.02', 'Z.03'],
          text: 'Base and finish: the two layers that give the surface its body and texture.',
          query: 'microcement',
        },
        {
          name: 'Preparation',
          codes: ['Z.01'],
          text: 'Substrate preparation products.',
          query: 'preparation',
        },
        {
          name: 'Protection',
          codes: ['Z.04'],
          text: 'Final protection for the applied system.',
          query: 'protection',
        },
        {
          name: 'Tools',
          codes: [],
          text: 'To prepare, apply and finish the system.',
          query: 'tools',
        },
      ],
      cta: 'View in the shop',
      proTitle: 'Distributors and professionals',
      proText:
        'Sign in and the shop shows your own price list, excluding VAT, on every product. No need to ask for prices by email.',
      proCta: 'Professional access',
      proSignupText: 'No professional account yet?',
      proSignupCta: 'Request an account',
      proSignupSteps:
        'Register in the shop with your company details (company name and tax ID). We review the request and activate your price list within',
    },
    method: {
      title: ['From the first gesture', 'to the final detail.'],
      text: 'On every job we first check the substrate, propose the right system and apply it layer by layer, respecting the times of each product through to the final protection.',
      points: [
        'Substrate check before we start',
        'A complete system from a single brand',
        'A data sheet for every product',
        'Materials also in the online shop',
      ],
      imageTodo: 'TODO: real finish photograph',
    },
    contact: {
      title: ['Shall we start', 'your project?'],
      text: 'Tell us whether you are looking for a professional applicator or need products for your own project. We will help you find the next step.',
      signature: 'Zement · Microcement & Materials',
      placeholders: {
        name: 'Your name',
        email: 'you@email.com',
        phone: '+44 …',
        postalCode: 'E.g. SW1A 1AA',
        message: 'Which space, the state of the substrate, timing…',
      },
      interests: [
        'Applying the system in my space',
        'Buying products',
        'Professional account or information',
        'Other',
      ],
    },
  },
};
