// Copia los tokens de diseño al tema hijo de PrestaShop para que ambas partes compartan aspecto.
import { copyFile, mkdir } from 'node:fs/promises';

const source = new URL('./tokens.css', import.meta.url);
const targetDir = new URL('../tienda/theme/zement/assets/css/', import.meta.url);

await mkdir(targetDir, { recursive: true });
await copyFile(source, new URL('tokens.css', targetDir));
console.log('Tokens copiados a tienda/theme/zement/assets/css/tokens.css');
