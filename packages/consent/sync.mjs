// Copia el aviso de cookies al módulo de la tienda (zementcommerce), que lo sirve en PrestaShop.
// La web lo importa directamente del paquete. No editar las copias.
import { cp, mkdir } from 'node:fs/promises';

const here = new URL('./', import.meta.url);
const module = new URL('../../apps/tienda/modules/zementcommerce/views/consent/', import.meta.url);

await mkdir(module, { recursive: true });
for (const file of ['consent.js', 'consent.css', 'strings.json']) {
  await cp(new URL(file, here), new URL(file, module));
}
console.log('Aviso de cookies copiado a apps/tienda/modules/zementcommerce/views/consent');
