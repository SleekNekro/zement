/**
 * Textos de la portada.
 * Origen: boceto de UI aportado por Zement (25/11/2026), traducido al inglés.
 * Lo marcado con `todo` está pendiente de contenido real: no rellenar por inferencia.
 */
import translations from '../i18n/translations';
import type { Locale } from '../i18n/locales';

/** Destino de un enlace: la tienda (sale de la web) o una sección de esta página. */
export type LinkTarget =
  { kind: 'shop'; route?: 'login' | 'register' } | { kind: 'section'; id: string };

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
  /** Enlace secundario opcional (p. ej. «Entrar» para quien ya tiene cuenta). */
  secondary?: AudienceLink;
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
 * `shopPath` es la ruta de su categoría en PrestaShop en ese idioma (id + nombre en la URL).
 */
export interface ShopCategory {
  name: string;
  codes: string[];
  text: string;
  shopPath: string;
}

export interface HomeContent {
  /** Descripción de la portada para buscadores y redes. */
  description: string;
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
    /**
     * Fase previa sobre el soporte (grietas, fisuras, desniveles). Su producto y código están por
     * definir: se muestran como TODO en el corte.
     */
    /** Fase previa sobre el soporte, con los datos de su mortero (mismo orden que los datos destacados del sistema). */
    repair: { code: string; name: string; text: string; specValues: string[] };
    steps: { code: string; name: string; text: string }[];
    layersLabel: string;
    /** Indicación de uso de la muestra y textos de sus controles (reproducir, pausar, volver a ver). */
    layersHint: string;
    player: { play: string; pause: string; replay: string; phases: string };
    stepLabel: string;
    /** Foto real del producto aplicado para el fondo de la muestra, hasta tenerla. */
    photoTodo: string;
    /** Capa base del corte (la superficie existente). */
    supportLabel: string;
    /** Etiqueta de las fases previas al sistema de capas (soporte y reparación). */
    beforeLabel: string;
    /** Versión corta para las pistas de la muestra. */
    beforeShort: string;
    /** Explicación del soporte: el sistema se aplica sobre la superficie existente. */
    supportText: string;
    /** Soportes compatibles, según las fichas técnicas. */
    supportNote: string;
    /** Espesor de cada capa, según las fichas técnicas. */
    thicknessNote: string;
    /** Enlace a la página completa del sistema (datos técnicos, aplicación, documentación). */
    fullSystemText: string;
    fullSystemCta: string;
  };
  application: {
    title: string[];
    text: string;
    cta: string;
    shopCta: string;
    areas: string[];
    imageTodo: string;
  };
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
  method: { title: string[]; text: string; points: string[] };
  contact: {
    title: string[];
    text: string;
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
    description:
      'Zement: sistema de microcemento por capas y materiales para superficies continuas. Tienda online con envíos a España y Europa y tarifa propia para profesionales.',
    hero: {
      title: ['La materia', 'lo transforma todo.'],
      text: 'Microcemento para crear espacios únicos. Aplicamos soluciones continuas y ponemos a tu alcance los materiales para hacerlas realidad.',
      pathsLabel: '¿Por dónde empiezas?',
      paths: [
        {
          id: 'pro',
          title: 'Soy profesional',
          text: 'Distribuidores y aplicadores: materiales del sistema, tarifa propia y documentación técnica.',
          primary: {
            label: 'Solicitar acceso profesional',
            target: { kind: 'shop', route: 'register' },
          },
          secondary: {
            label: 'Ya tengo cuenta · Entrar',
            target: { kind: 'shop', route: 'login' },
          },
        },
        {
          id: 'project',
          title: 'Tengo un proyecto',
          text: 'Particulares y estudios: aplicamos el sistema en tu espacio o te ayudamos a elegir los materiales.',
          primary: { label: 'Pedir presupuesto', target: { kind: 'section', id: 'contacto' } },
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
      repair: {
        code: '',
        name: 'Reparación',
        text: 'Zement Repair: mortero que cierra grietas y corrige desniveles del soporte; con malla de fibra de vidrio si está muy deteriorado.',
        specValues: ['1,4 por mm de espesor', '4 h'],
      },
      steps: [
        {
          code: 'Z.01',
          name: 'Preparación',
          text: 'Zement Prime: imprimación al agua que regula la absorción del soporte y mejora el anclaje.',
        },
        {
          code: 'Z.02',
          name: 'Base',
          text: 'Basis: microcemento de base con cuarzos micronizados que da cuerpo al sistema.',
        },
        {
          code: 'Z.03',
          name: 'Acabado',
          text: 'Fein: acabado fino con efecto aguas, en dos manos sobre la base.',
        },
        {
          code: 'Z.04',
          name: 'Protección',
          text: 'Protect Aqua 2K: barniz al agua que no amarillea y resiste el tránsito.',
        },
      ],
      layersLabel: 'Cómo se construye una superficie Zement',
      layersHint: 'Reproduce el montaje o elige una fase',
      player: {
        play: 'Reproducir el montaje',
        pause: 'Pausar el montaje',
        replay: 'Volver a ver el montaje',
        phases: 'Fases del montaje',
      },
      stepLabel: 'Capa',
      photoTodo: 'TODO: foto real del producto aplicado (fondo)',
      supportLabel: 'Soporte existente',
      beforeLabel: 'Antes del sistema',
      beforeShort: 'Previo',
      supportText:
        'Se aplica sobre la superficie que ya tienes, sea cual sea: sin levantar suelos ni paredes y sin obra de derribo.',
      supportNote: 'Hormigón, morteros, revocos, yeso y cerámica, firmes y con mordiente.',
      thicknessNote:
        'Espesor por capa: Zement Prime 50 µm · Basis 0,5–1 mm · Fein 0,1–0,5 mm · Protect Aqua 2K 120 µm mín.',
      fullSystemText:
        'Datos técnicos, aplicación paso a paso, colores y fichas para descargar: todo en la página del sistema.',
      fullSystemCta: 'Ver el sistema completo',
    },
    application: {
      title: ['Tu espacio,', 'con el sistema completo.'],
      text: 'Realizamos trabajos de microcemento con atención al soporte, la preparación y el acabado final. Una solución versátil para renovar sin recargar, con continuidad visual y personalidad.',
      cta: 'Pedir presupuesto',
      shopCta: 'Comprar en la tienda',
      areas: [
        'Suelos y paredes',
        'Baños y duchas',
        'Cocinas',
        'Locales comerciales',
        'Revestimientos',
        'Proyectos a medida',
      ],
      imageTodo: 'TODO: fotografía real de obra aplicada',
    },
    shop: {
      title: ['Los materiales', 'de cada capa.'],
      text: 'Descubre una selección de productos para preparar, aplicar y proteger superficies de microcemento.',
      categories: [
        {
          name: 'Reparación',
          codes: [],
          text: 'Morteros para reparar y nivelar el soporte antes del sistema.',
          shopPath: 'z/c/morteros',
        },
        {
          name: 'Imprimaciones',
          codes: ['Z.01'],
          text: 'Zement Prime y selladores: preparan el soporte y mejoran el anclaje.',
          shopPath: 'z/c/imprimaciones',
        },
        {
          name: 'Microcemento',
          codes: ['Z.02', 'Z.03'],
          text: 'Base y acabado: las dos capas que dan cuerpo y textura a la superficie.',
          shopPath: 'z/c/microcemento',
        },
        {
          name: 'Protección',
          codes: ['Z.04'],
          text: 'Barnices que sellan y protegen el sistema aplicado.',
          shopPath: 'z/c/proteccion',
        },
      ],
      cta: 'Ver en la tienda',
      proTitle: 'Distribuidores y profesionales',
      proText:
        'Inicia sesión y la tienda te muestra tu tarifa, sin IVA, en cada producto. Sin pedir precios por correo.',
      proCta: 'Solicitar acceso profesional',
      proSignupText: '¿Ya tienes cuenta profesional?',
      proSignupCta: 'Entrar',
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
    },
    contact: {
      title: ['¿Empezamos', 'tu proyecto?'],
      text: 'Cuéntanos si buscas un aplicador profesional o si necesitas productos para tu propio proyecto. Te ayudaremos a encontrar el siguiente paso.',
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
    description:
      'Zement: a layered microcement system and materials for seamless surfaces. Online shop shipping to Spain and Europe, with trade prices for professionals.',
    hero: {
      title: ['Material', 'transforms everything.'],
      text: 'Microcement to create unique spaces. We apply seamless solutions and bring you the materials to make them real.',
      pathsLabel: 'Where do you start?',
      paths: [
        {
          id: 'pro',
          title: 'I am a professional',
          text: 'Distributors and applicators: system materials, your own price list and technical documentation.',
          primary: {
            label: 'Request professional access',
            target: { kind: 'shop', route: 'register' },
          },
          secondary: {
            label: 'I have an account · Sign in',
            target: { kind: 'shop', route: 'login' },
          },
        },
        {
          id: 'project',
          title: 'I have a project',
          text: 'Homeowners and studios: we apply the system in your space or help you choose the materials.',
          primary: { label: 'Request a quote', target: { kind: 'section', id: 'contacto' } },
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
      repair: {
        code: '',
        name: 'Repair',
        text: 'Zement Repair: mortar that closes cracks and corrects uneven substrates; with glass-fibre mesh if badly deteriorated.',
        specValues: ['1.4 per mm of thickness', '4 h'],
      },
      steps: [
        {
          code: 'Z.01',
          name: 'Preparation',
          text: 'Zement Prime: water-based primer that regulates substrate absorption and improves bonding.',
        },
        {
          code: 'Z.02',
          name: 'Base',
          text: 'Basis: base microcement with micronised quartz that gives the system its body.',
        },
        {
          code: 'Z.03',
          name: 'Finish',
          text: 'Fein: fine finish with a watermark effect, in two coats over the base.',
        },
        {
          code: 'Z.04',
          name: 'Protection',
          text: 'Protect Aqua 2K: water-based varnish that does not yellow and withstands traffic.',
        },
      ],
      layersLabel: 'How a Zement surface is built',
      layersHint: 'Play the build-up or choose a phase',
      player: {
        play: 'Play the build-up',
        pause: 'Pause the build-up',
        replay: 'Watch the build-up again',
        phases: 'Build-up phases',
      },
      stepLabel: 'Layer',
      photoTodo: 'TODO: real photograph of the applied product (background)',
      supportLabel: 'Existing substrate',
      beforeLabel: 'Before the system',
      beforeShort: 'Before',
      supportText:
        'It goes on the surface you already have, whatever it is: no lifting floors or walls, no demolition.',
      supportNote:
        'Concrete, mortars, renders, plaster and ceramic tiles, firm and with a good key.',
      thicknessNote:
        'Thickness per coat: Zement Prime 50 µm · Basis 0.5–1 mm · Fein 0.1–0.5 mm · Protect Aqua 2K 120 µm min.',
      fullSystemText:
        'Technical data, step-by-step application, colours and downloadable sheets: all on the system page.',
      fullSystemCta: 'See the full system',
    },
    application: {
      title: ['Your space,', 'with the complete system.'],
      text: 'We carry out microcement work with attention to the substrate, preparation and final finish. A versatile way to renovate without clutter, with visual continuity and character.',
      cta: 'Request a quote',
      shopCta: 'Buy in the shop',
      areas: [
        'Floors and walls',
        'Bathrooms and showers',
        'Kitchens',
        'Commercial premises',
        'Wall coverings',
        'Bespoke projects',
      ],
      imageTodo: 'TODO: real photograph of a finished job',
    },
    shop: {
      title: ['The materials', 'for every layer.'],
      text: 'Discover a selection of products to prepare, apply and protect microcement surfaces.',
      categories: [
        {
          name: 'Repair',
          codes: [],
          text: 'Mortars to repair and level the substrate before the system.',
          shopPath: 'z/c/morteros',
        },
        {
          name: 'Primers',
          codes: ['Z.01'],
          text: 'Zement Prime and sealers: prepare the substrate and improve bonding.',
          shopPath: 'z/c/imprimaciones',
        },
        {
          name: 'Microcement',
          codes: ['Z.02', 'Z.03'],
          text: 'Base and finish: the two layers that give the surface its body and texture.',
          shopPath: 'z/c/microcemento',
        },
        {
          name: 'Protection',
          codes: ['Z.04'],
          text: 'Varnishes that seal and protect the applied system.',
          shopPath: 'z/c/proteccion',
        },
      ],
      cta: 'View in the shop',
      proTitle: 'Distributors and professionals',
      proText:
        'Sign in and the shop shows your own price list, excluding VAT, on every product. No need to ask for prices by email.',
      proCta: 'Request professional access',
      proSignupText: 'Already have a professional account?',
      proSignupCta: 'Sign in',
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
    },
    contact: {
      title: ['Shall we start', 'your project?'],
      text: 'Tell us whether you are looking for a professional applicator or need products for your own project. We will help you find the next step.',
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
  de: translations.de.home,
  fr: translations.fr.home,
  it: translations.it.home,
  pl: translations.pl.home,
  no: translations.no.home,
  fi: translations.fi.home,
};
