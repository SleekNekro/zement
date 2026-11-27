// Genera por código la textura de microcemento del fondo de la portada
// (src/assets/fotos/textura-microcemento-generada.jpg): imita la pared llaneada de
// pared-microcemento-luz.jpg (manchas nubosas, moteado de llana y poro fino) en un tono más claro.
// Uso, desde apps/web: node scripts/generate-texture.mjs
// La semilla es fija: cada ejecución produce la misma imagen.
import { createRequire } from 'node:module';

// sharp llega como dependencia de Astro: se resuelve desde Astro para no añadir otra dependencia.
const sharp = createRequire(import.meta.resolve('astro'))('sharp');

const WIDTH = 2880;
const HEIGHT = 1800;
const OUTPUT = new URL('../src/assets/fotos/textura-microcemento-generada.jpg', import.meta.url);
// Color medio de la pared de la foto (124, 112, 96), aclarado y algo más neutro.
const BASE = [196, 187, 174];

let seed = 1234567;
const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

// Ruido de valor sobre una rejilla periódica, con interpolación suave.
const GRID = 512;
const lattice = Float32Array.from({ length: GRID * GRID }, random);
const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);

function noise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const at = (a, b) => lattice[(b & (GRID - 1)) * GRID + (a & (GRID - 1))];
  const a = at(xi, yi);
  const b = at(xi + 1, yi);
  const c = at(xi, yi + 1);
  const d = at(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

function fbm(x, y, octaves) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;
  for (let octave = 0; octave < octaves; octave++) {
    value += amplitude * noise(x * frequency, y * frequency);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }
  return value / norm;
}

const clamp = (value) => Math.max(0, Math.min(255, value));
const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    const u = x / 520;
    const v = y / 520;
    // Deformación del dominio: manchas nubosas alargadas, como pasadas de llana.
    const warpX = fbm(u * 0.8 + 3.1, v * 0.8 + 7.7, 4);
    const warpY = fbm(u * 0.8 + 11.3, v * 0.8 + 1.9, 4);
    const cloud = fbm(u + 1.6 * warpX, v * 1.25 + 1.6 * warpY, 6) - 0.5;
    // Moteado medio (las manchas de la llana) y fino (el poro del material).
    const mottle = fbm(x / 34 + 3 * warpX, y / 26 + 3 * warpY, 4) - 0.5;
    const pore = fbm(x / 7, y / 6, 2) - 0.5;
    const grain = random() - 0.5;
    const shade = cloud * 40 + mottle * 30 + pore * 10 + grain * 6;
    const index = (y * WIDTH + x) * 3;
    pixels[index] = clamp(BASE[0] + shade);
    pixels[index + 1] = clamp(BASE[1] + shade * 0.97);
    pixels[index + 2] = clamp(BASE[2] + shade * 0.93);
  }
}

await sharp(pixels, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
  .blur(0.5)
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUTPUT.pathname);

console.log(`Textura generada: ${OUTPUT.pathname}`);
