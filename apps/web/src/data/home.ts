/**
 * Textos de la portada.
 * Origen: boceto de UI aportado por Zement (25/11/2026), traducido al inglés.
 * Lo marcado con `todo` está pendiente de contenido real: no rellenar por inferencia.
 */
import type { Locale } from '../i18n/ui';

export interface HomeContent {
  topbar: string;
  hero: {
    eyebrow: string;
    title: [string, string];
    text: string;
    primary: string;
    secondary: string;
    imageTodo: string;
    scroll: string;
  };
  marquee: string[];
  intro: { label: string; title: string[]; paragraphs: string[]; link: string };
  system: {
    label: string;
    title: string[];
    text: string;
    steps: { code: string; name: string; text: string }[];
    layersLabel: string;
    specsTitle: string;
    specs: { name: string; todo: string }[];
  };
  application: { label: string; title: string[]; text: string; cta: string; areas: string[] };
  shop: {
    label: string;
    title: string[];
    text: string;
    categories: string[];
    cta: string;
    proTitle: string;
    proText: string;
    proCta: string;
  };
  method: { label: string; title: string[]; text: string; points: string[]; imageTodo: string };
  contact: {
    label: string;
    title: string[];
    text: string;
    signature: string;
    fields: { name: string; email: string; interest: string; message: string };
    placeholders: { name: string; email: string; message: string };
    interests: string[];
    submit: string;
    todo: string;
  };
}

export const home: Record<Locale, HomeContent> = {
  es: {
    topbar: 'Microcemento · Aplicación profesional · Tienda especializada',
    hero: {
      eyebrow: 'Superficies · Texturas · Arquitectura',
      title: ['La materia', 'lo transforma todo.'],
      text: 'Microcemento para crear espacios únicos. Aplicamos soluciones continuas y ponemos a tu alcance los materiales para hacerlas realidad.',
      primary: 'Aplicación profesional',
      secondary: 'Explorar tienda',
      imageTodo: 'TODO: fotografía real de proyecto',
      scroll: 'Desliza',
    },
    marquee: ['Preparación', 'Base', 'Acabado', 'Protección', 'Superficies continuas'],
    intro: {
      label: '01 / Zement',
      title: ['Un material.', 'Dos maneras', 'de transformar.'],
      paragraphs: [
        'En ZEMENT unimos experiencia en aplicación de microcemento y una selección de productos especializados. Acompañamos tanto a quienes quieren renovar sus espacios como a profesionales que buscan materiales de confianza.',
        'Superficies continuas, acabados cuidados y soluciones pensadas para cada proyecto. La calidad está en el material, en la técnica y en cada detalle.',
      ],
      link: 'Descubre nuestra filosofía',
    },
    system: {
      label: '02 / El sistema',
      title: ['Calidad que', 'se puede comprobar.'],
      text: 'Cada superficie es un sistema de capas. Cada producto tiene una función precisa y una documentación técnica que la respalda.',
      steps: [
        { code: 'Z.01', name: 'Preparación', text: 'Producto de preparación para el soporte.' },
        { code: 'Z.02', name: 'Base', text: 'Revestimiento base para sistemas de microcemento.' },
        { code: 'Z.03', name: 'Acabado', text: 'Acabado decorativo de textura suave y natural.' },
        { code: 'Z.04', name: 'Protección', text: 'Protección final para el sistema aplicado.' },
      ],
      layersLabel: 'Sección del sistema',
      specsTitle: 'Documentación por producto',
      specs: [
        { name: 'Ficha técnica', todo: 'TODO: PDF real' },
        { name: 'Hoja de seguridad', todo: 'TODO: PDF real' },
        { name: 'Rendimiento', todo: 'TODO: kg/m² reales' },
        { name: 'Ensayos y normativa', todo: 'TODO: datos reales' },
      ],
    },
    application: {
      label: '03 / Aplicación profesional',
      title: ['Tu espacio.', 'Nuestra experiencia.'],
      text: 'Realizamos trabajos de microcemento con atención al soporte, la preparación y el acabado final. Una solución versátil para renovar sin recargar, con continuidad visual y personalidad.',
      cta: 'Solicitar presupuesto',
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
      label: '04 / Zement shop',
      title: ['Materiales para', 'crear sin límites.'],
      text: 'Descubre una selección de productos para preparar, aplicar y proteger superficies de microcemento.',
      categories: ['Microcemento', 'Preparación', 'Protección', 'Herramientas'],
      cta: 'Ver en la tienda',
      proTitle: 'Distribuidores y profesionales',
      proText: 'Los clientes profesionales acceden a su tarifa iniciando sesión en la tienda.',
      proCta: 'Acceso profesional',
    },
    method: {
      label: '05 / Nuestra manera de trabajar',
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
      label: '06 / Hablemos',
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
      submit: 'Preparar consulta',
      todo: 'TODO: conectar el envío (endpoint PHP + Resend + Turnstile) y el correo real de destino.',
    },
  },
  en: {
    topbar: 'Microcement · Professional application · Specialist shop',
    hero: {
      eyebrow: 'Surfaces · Textures · Architecture',
      title: ['Material', 'transforms everything.'],
      text: 'Microcement to create unique spaces. We apply seamless solutions and bring you the materials to make them real.',
      primary: 'Professional application',
      secondary: 'Explore the shop',
      imageTodo: 'TODO: real project photograph',
      scroll: 'Scroll',
    },
    marquee: ['Preparation', 'Base', 'Finish', 'Protection', 'Seamless surfaces'],
    intro: {
      label: '01 / Zement',
      title: ['One material.', 'Two ways', 'to transform.'],
      paragraphs: [
        'At ZEMENT we combine expertise in microcement application with a selection of specialist products. We support both those who want to renew their spaces and professionals looking for reliable materials.',
        'Seamless surfaces, careful finishes and solutions designed for each project. Quality lies in the material, the technique and every detail.',
      ],
      link: 'Discover our philosophy',
    },
    system: {
      label: '02 / The system',
      title: ['Quality you', 'can verify.'],
      text: 'Every surface is a system of layers. Every product has a precise role and technical documentation to support it.',
      steps: [
        { code: 'Z.01', name: 'Preparation', text: 'Substrate preparation product.' },
        { code: 'Z.02', name: 'Base', text: 'Base coat for microcement systems.' },
        { code: 'Z.03', name: 'Finish', text: 'Decorative finish with a soft, natural texture.' },
        { code: 'Z.04', name: 'Protection', text: 'Final protection for the applied system.' },
      ],
      layersLabel: 'System cross-section',
      specsTitle: 'Documentation for every product',
      specs: [
        { name: 'Technical data sheet', todo: 'TODO: real PDF' },
        { name: 'Safety data sheet', todo: 'TODO: real PDF' },
        { name: 'Coverage', todo: 'TODO: real kg/m²' },
        { name: 'Tests and standards', todo: 'TODO: real data' },
      ],
    },
    application: {
      label: '03 / Professional application',
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
      label: '04 / Zement shop',
      title: ['Materials to', 'create without limits.'],
      text: 'Discover a selection of products to prepare, apply and protect microcement surfaces.',
      categories: ['Microcement', 'Preparation', 'Protection', 'Tools'],
      cta: 'View in the shop',
      proTitle: 'Distributors and professionals',
      proText: 'Professional customers see their own prices after signing in to the shop.',
      proCta: 'Professional access',
    },
    method: {
      label: '05 / How we work',
      title: ['From the first gesture', 'to the final detail.'],
      text: 'We believe in well-chosen materials and work done with judgement. That is why ZEMENT brings together specialist application and products, so every project has a coherent solution.',
      points: ['Close advice', 'Specialist selection', 'Careful finishes', 'Bespoke solutions'],
      imageTodo: 'TODO: real finish photograph',
    },
    contact: {
      label: '06 / Let’s talk',
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
      submit: 'Prepare enquiry',
      todo: 'TODO: connect sending (PHP endpoint + Resend + Turnstile) and the real destination email.',
    },
  },
};
