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
  jumpLabel: string;
  jumpTo: 'profesionales' | 'proyecto';
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
  marquee: string[];
  chapters: { pro: Chapter; project: Chapter };
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
    specsTitle: string;
    specs: { name: string; todo: string }[];
  };
  application: { title: string[]; text: string; cta: string; areas: string[] };
  shop: {
    title: string[];
    text: string;
    categories: ShopCategory[];
    cta: string;
    proTitle: string;
    proText: string;
    proCta: string;
  };
  method: { title: string[]; text: string; points: string[]; imageTodo: string };
  contact: {
    title: string[];
    text: string;
    signature: string;
    fields: { name: string; email: string; interest: string; message: string };
    placeholders: { name: string; email: string; message: string };
    interests: string[];
    requiredNote: string;
    submit: string;
    unavailable: string;
    emailTodo: string;
    nextStep: string;
    responseTodo: string;
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
          secondary: { label: 'Ver aplicaciones', target: { kind: 'section', id: 'aplicacion' } },
        },
      ],
      imageTodo: 'TODO: fotografía real de proyecto',
    },
    marquee: ['Preparación', 'Base', 'Acabado', 'Protección', 'Superficies continuas'],
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
        text: 'Aplicamos el sistema en tu espacio, de la preparación del soporte al último detalle.',
        jumpLabel: '¿Eres profesional?',
        jumpTo: 'profesionales',
      },
    },
    intro: {
      title: ['Un material.', 'Dos maneras', 'de transformar.'],
      paragraphs: [
        'En ZEMENT unimos experiencia en aplicación de microcemento y una selección de productos especializados. Acompañamos tanto a quienes quieren renovar sus espacios como a profesionales que buscan materiales de confianza.',
        'Superficies continuas, acabados cuidados y soluciones pensadas para cada proyecto. La calidad está en el material, en la técnica y en cada detalle.',
      ],
      link: 'Descubre nuestra filosofía',
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
      specsTitle: 'Documentación por producto',
      specs: [
        { name: 'Ficha técnica', todo: 'TODO: PDF real' },
        { name: 'Hoja de seguridad', todo: 'TODO: PDF real' },
        { name: 'Rendimiento', todo: 'TODO: kg/m² reales' },
        { name: 'Ensayos y normativa', todo: 'TODO: datos reales' },
      ],
    },
    application: {
      title: ['Tu espacio.', 'Nuestra experiencia.'],
      text: 'Realizamos trabajos de microcemento con atención al soporte, la preparación y el acabado final. Una solución versátil para renovar sin recargar, con continuidad visual y personalidad.',
      cta: 'Pedir presupuesto',
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
      title: ['Materiales para', 'crear sin límites.'],
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
      proText: 'Los clientes profesionales acceden a su tarifa iniciando sesión en la tienda.',
      proCta: 'Acceso profesional',
    },
    method: {
      title: ['Del primer gesto', 'al último detalle.'],
      text: 'Creemos en los materiales bien elegidos y en el trabajo hecho con criterio. Por eso ZEMENT reúne aplicación especializada y productos para que cada proyecto tenga una solución coherente.',
      points: [
        'Asesoramiento cercano',
        'Selección especializada',
        'Acabados cuidados',
        'Soluciones a medida',
      ],
      imageTodo: 'TODO: fotografía real de acabado',
    },
    contact: {
      title: ['¿Empezamos', 'tu proyecto?'],
      text: 'Cuéntanos si buscas un aplicador profesional o si necesitas productos para tu propio proyecto. Te ayudaremos a encontrar el siguiente paso.',
      signature: 'Zement · Microcemento & Materials',
      fields: {
        name: 'Nombre',
        email: 'Correo electrónico',
        interest: 'Estoy interesado/a en',
        message: 'Cuéntanos más',
      },
      placeholders: { name: 'Tu nombre', email: 'tu@email.com', message: '¿Qué tienes en mente?' },
      interests: [
        'Aplicación de microcemento',
        'Comprar productos',
        'Información profesional',
        'Otro',
      ],
      requiredNote: 'Los campos con * son obligatorios.',
      submit: 'Enviar consulta',
      unavailable:
        'El envío desde la web estará disponible muy pronto. Mientras tanto, escríbenos a',
      emailTodo: 'TODO: correo real de contacto',
      nextStep: 'Te responderemos en',
      responseTodo: 'TODO: plazo real de respuesta',
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
          secondary: { label: 'See applications', target: { kind: 'section', id: 'aplicacion' } },
        },
      ],
      imageTodo: 'TODO: real project photograph',
    },
    marquee: ['Preparation', 'Base', 'Finish', 'Protection', 'Seamless surfaces'],
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
        text: 'We apply the system in your space, from substrate preparation to the final detail.',
        jumpLabel: 'Are you a professional?',
        jumpTo: 'profesionales',
      },
    },
    intro: {
      title: ['One material.', 'Two ways', 'to transform.'],
      paragraphs: [
        'At ZEMENT we combine expertise in microcement application with a selection of specialist products. We support both those who want to renew their spaces and professionals looking for reliable materials.',
        'Seamless surfaces, careful finishes and solutions designed for each project. Quality lies in the material, the technique and every detail.',
      ],
      link: 'Discover our philosophy',
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
      specsTitle: 'Documentation for every product',
      specs: [
        { name: 'Technical data sheet', todo: 'TODO: real PDF' },
        { name: 'Safety data sheet', todo: 'TODO: real PDF' },
        { name: 'Coverage', todo: 'TODO: real kg/m²' },
        { name: 'Tests and standards', todo: 'TODO: real data' },
      ],
    },
    application: {
      title: ['Your space.', 'Our expertise.'],
      text: 'We carry out microcement work with attention to the substrate, preparation and final finish. A versatile way to renovate without clutter, with visual continuity and character.',
      cta: 'Request a quote',
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
      title: ['Materials to', 'create without limits.'],
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
      proText: 'Professional customers see their own prices after signing in to the shop.',
      proCta: 'Professional access',
    },
    method: {
      title: ['From the first gesture', 'to the final detail.'],
      text: 'We believe in well-chosen materials and work done with judgement. That is why ZEMENT brings together specialist application and products, so every project has a coherent solution.',
      points: ['Close advice', 'Specialist selection', 'Careful finishes', 'Bespoke solutions'],
      imageTodo: 'TODO: real finish photograph',
    },
    contact: {
      title: ['Shall we start', 'your project?'],
      text: 'Tell us whether you are looking for a professional applicator or need products for your own project. We will help you find the next step.',
      signature: 'Zement · Microcement & Materials',
      fields: {
        name: 'Name',
        email: 'Email',
        interest: 'I am interested in',
        message: 'Tell us more',
      },
      placeholders: {
        name: 'Your name',
        email: 'you@email.com',
        message: 'What do you have in mind?',
      },
      interests: [
        'Microcement application',
        'Buying products',
        'Professional information',
        'Other',
      ],
      requiredNote: 'Fields marked * are required.',
      submit: 'Send enquiry',
      unavailable:
        'Sending from the website will be available very soon. In the meantime, write to us at',
      emailTodo: 'TODO: real contact email',
      nextStep: 'We will reply within',
      responseTodo: 'TODO: real response time',
    },
  },
};
