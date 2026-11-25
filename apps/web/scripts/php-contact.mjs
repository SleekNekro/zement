// Copia el endpoint PHP del formulario y sus mensajes a dist/api/ (IONOS sirve la web estática + PHP).
import { copyFile, mkdir, writeFile } from 'node:fs/promises';

export async function preparePhpContact(dir) {
  const { formMessages } = await import(new URL('../src/i18n/form.ts', import.meta.url));
  const api = new URL('api/', dir);
  await mkdir(api, { recursive: true });
  await copyFile(
    new URL('../src/server/php/contact.php', import.meta.url),
    new URL('contact.php', api),
  );
  await writeFile(new URL('contact-messages.json', api), JSON.stringify(formMessages));
}
