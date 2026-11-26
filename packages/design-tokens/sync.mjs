// Copia tokens, tipografías y logotipo al tema hijo de PrestaShop para que web y tienda
// compartan exactamente el mismo aspecto. No editar las copias.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const here = new URL('./', import.meta.url);
const themeCss = new URL('../../apps/tienda/theme/zement/assets/css/', import.meta.url);
const themeImg = new URL('../../apps/tienda/theme/zement/assets/img/', import.meta.url);

await mkdir(themeCss, { recursive: true });
for (const file of ['tokens.css', 'fonts.css']) {
  await cp(new URL(file, here), new URL(file, themeCss));
}
await rm(new URL('fonts/', themeCss), { recursive: true, force: true });
await cp(new URL('fonts/', here), new URL('fonts/', themeCss), { recursive: true });
await mkdir(themeImg, { recursive: true });
for (const file of ['zement-logo-navy.svg', 'zement-favicon.svg', 'zement-touch-icon.png']) {
  await cp(new URL(`brand/${file}`, here), new URL(file, themeImg));
}
// Banderas del selector de idioma (las mismas que la web, que las importa del paquete).
await rm(new URL('flags/', themeImg), { recursive: true, force: true });
await cp(new URL('flags/', here), new URL('flags/', themeImg), { recursive: true });
// Versión clara del logotipo para fondos oscuros (firma del pie de la tienda).
const logo = await readFile(new URL('brand/zement-logo.svg', here), 'utf8');
await writeFile(
  new URL('zement-logo-paper.svg', themeImg),
  logo.replaceAll('currentColor', '#f6f5f1'),
);
// iOS busca /apple-touch-icon.png en la raíz y no acepta bien iconos en línea.
const webPublic = new URL('../../apps/web/public/', import.meta.url);
await mkdir(webPublic, { recursive: true });
await cp(new URL('brand/zement-touch-icon.png', here), new URL('apple-touch-icon.png', webPublic));
console.log(
  'Tokens, tipografías, logotipo y banderas copiados a apps/web/public y al tema de la tienda (assets/css e img)',
);
