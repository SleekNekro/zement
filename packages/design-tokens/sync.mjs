// Copia tokens, tipografías y logotipo al tema hijo de PrestaShop para que web y tienda
// compartan exactamente el mismo aspecto. No editar las copias.
import { cp, mkdir, rm } from 'node:fs/promises';

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
// iOS busca /apple-touch-icon.png en la raíz y no acepta bien iconos en línea.
const webPublic = new URL('../../apps/web/public/', import.meta.url);
await mkdir(webPublic, { recursive: true });
await cp(new URL('brand/zement-touch-icon.png', here), new URL('apple-touch-icon.png', webPublic));
console.log(
  'Tokens, tipografías y logotipo copiados a apps/web/public y al tema de la tienda (assets/css e img)',
);
