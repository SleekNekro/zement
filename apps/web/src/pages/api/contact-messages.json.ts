import type { APIRoute } from 'astro';
import { formMessages } from '../../i18n/form';

/** Respuestas del formulario en los 8 idiomas, para el endpoint PHP (dist/api/contact.php). */
export const GET: APIRoute = () =>
  new Response(JSON.stringify(formMessages), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
