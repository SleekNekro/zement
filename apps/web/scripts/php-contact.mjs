// Copia el endpoint PHP del formulario a dist/api/ (IONOS sirve la web estática + PHP).
// Sus mensajes en cada idioma los genera la propia web: src/pages/api/contact-messages.json.ts.
import { copyFile, mkdir } from 'node:fs/promises';

export async function preparePhpContact(dir) {
  const api = new URL('api/', dir);
  await mkdir(api, { recursive: true });
  await copyFile(
    new URL('../src/server/php/contact.php', import.meta.url),
    new URL('contact.php', api),
  );
}
