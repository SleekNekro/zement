/**
 * Textos del formulario de contacto (cliente) y respuestas del servidor (PHP).
 * El build copia `messages` a /api/contact-messages.json para que el PHP responda en el idioma del visitante.
 */
import translations from './translations';
import type { Locale, Strings } from './locales';

const baseText = {
  es: {
    name: 'Nombre',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    interest: 'Te interesa',
    postalCode: 'Código postal de la obra',
    area: 'Superficie aproximada (m²)',
    message: 'Cuéntanos más',
    optional: 'opcional',
    required: 'Los campos con * son obligatorios.',
    privacyBefore: 'He leído la',
    privacyLink: 'política de privacidad',
    submit: 'Enviar consulta',
    sending: 'Enviando…',
    directTitle: 'O contacta directamente',
    callUs: 'Llamar',
    writeUs: 'Escribir un correo',
    whatsapp: 'WhatsApp',
    hours: 'Horario',
    responseTime: 'Respondemos en',
  },
  en: {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    interest: 'You are interested in',
    postalCode: 'Project postcode',
    area: 'Approximate area (m²)',
    message: 'Tell us more',
    optional: 'optional',
    required: 'Fields marked * are required.',
    privacyBefore: 'I have read the',
    privacyLink: 'privacy policy',
    submit: 'Send enquiry',
    sending: 'Sending…',
    directTitle: 'Or contact us directly',
    callUs: 'Call',
    writeUs: 'Send an email',
    whatsapp: 'WhatsApp',
    hours: 'Opening hours',
    responseTime: 'We reply within',
  },
} as const;

export type FormText = Strings<(typeof baseText)['es']>;

export const formText: Record<Locale, FormText> = {
  ...baseText,
  de: translations.de.form,
  fr: translations.fr.form,
  it: translations.it.form,
  pl: translations.pl.form,
  no: translations.no.form,
  fi: translations.fi.form,
};

/** Respuestas del servidor (también usadas por el endpoint PHP). */
const baseMessages = {
  es: {
    success: 'Gracias. Hemos recibido tu consulta y te responderemos lo antes posible.',
    invalidFields: 'Revisa los campos marcados.',
    invalidName: 'Indica tu nombre (2 a 100 caracteres).',
    invalidEmail: 'Indica un correo electrónico válido.',
    invalidPhone: 'Indica un teléfono válido o déjalo vacío.',
    invalidArea: 'Indica la superficie en m² (solo números) o déjala vacía.',
    shortMessage: 'Cuéntanos un poco más (al menos 10 caracteres).',
    privacyRequired: 'Debes confirmar que has leído la información sobre privacidad.',
    captchaRequired: 'Completa la verificación antispam.',
    verificationExpired: 'La verificación ha caducado. Vuelve a intentarlo.',
    unavailable: 'El envío no está disponible en este momento. Escríbenos o llámanos directamente.',
    forbidden: 'No se ha podido enviar el formulario.',
    network: 'No hay conexión. Comprueba tu red y vuelve a intentarlo.',
  },
  en: {
    success: 'Thank you. We have received your enquiry and will reply as soon as possible.',
    invalidFields: 'Please check the highlighted fields.',
    invalidName: 'Please enter your name (2 to 100 characters).',
    invalidEmail: 'Please enter a valid email address.',
    invalidPhone: 'Please enter a valid phone number or leave it empty.',
    invalidArea: 'Please enter the area in m² (numbers only) or leave it empty.',
    shortMessage: 'Please tell us a little more (at least 10 characters).',
    privacyRequired: 'Please confirm you have read the privacy information.',
    captchaRequired: 'Please complete the anti-spam check.',
    verificationExpired: 'The check has expired. Please try again.',
    unavailable: 'Sending is not available right now. Please email or call us directly.',
    forbidden: 'The form could not be sent.',
    network: 'No connection. Please check your network and try again.',
  },
} as const;

export type FormMessages = Strings<(typeof baseMessages)['es']>;

export const formMessages: Record<Locale, FormMessages> = {
  ...baseMessages,
  de: translations.de.formMessages,
  fr: translations.fr.formMessages,
  it: translations.it.formMessages,
  pl: translations.pl.formMessages,
  no: translations.no.formMessages,
  fi: translations.fi.formMessages,
};

/** Valores aceptados en «Te interesa» (el texto visible sale de data/home.ts). */
export const interestValues = ['application', 'products', 'professional', 'other'] as const;
export type Interest = (typeof interestValues)[number];
