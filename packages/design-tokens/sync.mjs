// Copia tokens y tipografías al tema hijo de PrestaShop para que web y tienda
// compartan exactamente el mismo aspecto. No editar las copias.
import { cp, mkdir, rm } from 'node:fs/promises';

const here = new URL('./', import.meta.url);
const themeCss = new URL('../../apps/tienda/theme/zement/assets/css/', import.meta.url);

await mkdir(themeCss, { recursive: true });
for (const file of ['tokens.css', 'fonts.css']) {
  await cp(new URL(file, here), new URL(file, themeCss));
}
await rm(new URL('fonts/', themeCss), { recursive: true, force: true });
await cp(new URL('fonts/', here), new URL('fonts/', themeCss), { recursive: true });
console.log('Tokens y tipografías copiados a apps/tienda/theme/zement/assets/css/');
