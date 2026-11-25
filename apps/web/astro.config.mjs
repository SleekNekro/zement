import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // TODO: contenido real — dominio definitivo de Zement.
  site: process.env.ZEMENT_SITE ?? 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    {
      name: 'zement-php-contact',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const { preparePhpContact } = await import('./scripts/php-contact.mjs');
          await preparePhpContact(dir);
        },
      },
    },
  ],
});
