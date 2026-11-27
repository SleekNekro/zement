// Genera por código las fotos de envase de la tienda (images/envases/<clave>--<envase>-<tamaño>.jpg):
// un cubo, una garrafa o un bote con la etiqueta de Zement, recortado sobre blanco con su sombra,
// como una foto de estudio. Una foto por formato de venta de catalog.json; los kits aún no tienen
// dibujo y se saltan.
//
// La etiqueta sigue las plantillas de imprenta de Zement (A4 dividido en 1/4, 1/8 o 1/16):
//   cubo de 12 kg o más  → 148 × 105 mm (1/4 A4 horizontal)
//   garrafa              → 105 × 148 mm (1/4 A4 vertical)
//   cubo de 5 kg y botes → 105 × 74 mm (1/8 A4 horizontal)
//   bote de 1 kg o menos → 74 × 52 mm (1/16 A4 horizontal)
// Con los datos de la ficha en español: familia, nombre, subtítulo y la primera frase del producto.
// Lote, fecha y UFI quedan en blanco, como en la etiqueta sin imprimir. Sin pictogramas GHS,
// marcado CE ni código de barras: no hay datos para ponerlos (TODO cuando existan).
//
// Dos pasos, los dos fotografiados con Chrome sin ventana: 1) la etiqueta plana, maquetada en
// milímetros; 2) el envase en SVG, con la etiqueta pegada encima en un canvas, doblada sobre el
// cilindro (cubo y bote) o plana (garrafa), a su tamaño real respecto al envase. El JPEG lo
// hace sips (macOS). Uso, desde la raíz del repositorio:
//   node apps/tienda/catalog/scripts/generate-packaging.mjs [clave…]
// Después, `pnpm tienda:catalog "<carpeta de fichas>"` las sube como fotos del producto: la del
// formato principal es la portada y cada formato enseña la suya.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CATALOG = fileURLToPath(new URL('..', import.meta.url));
const THEME = fileURLToPath(new URL('../../theme/zement/assets', import.meta.url));
const OUTPUT = join(CATALOG, 'images', 'envases');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SIZE = 1200;
const CONTAINERS = ['cubo', 'garrafa', 'bote'];
/** Píxeles por milímetro al maquetar la etiqueta plana. */
const MM = 10;

/** Nombre del archivo de un formato (lo repite import-catalog.php). */
const packagingFile = (key, format) =>
  `${key}--${format.container}-${format.size
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.jpg`;

const amountOf = ({ size }) => parseFloat(size.replace(',', '.'));

// Escala del envase según su tamaño: un cubo de 5 kg se ve más pequeño que uno de 20 kg.
const scaleOf = (format) => {
  const amount = amountOf(format);
  if (format.container === 'cubo') {
    return amount >= 20 ? 1 : amount >= 15 ? 0.94 : amount >= 12 ? 0.9 : 0.76;
  }
  if (format.container === 'bote') return amount >= 5 ? 1 : amount >= 2 ? 0.86 : 0.72;
  return 1;
};

/** Plantilla de etiqueta de cada formato: tamaño en mm y tamaño de letra relativo. */
const templateOf = (format) => {
  const amount = amountOf(format);
  if (format.container === 'garrafa') return { width: 105, height: 148, type: 1 };
  if (format.container === 'cubo' && amount >= 12) return { width: 148, height: 105, type: 1 };
  if (format.container === 'bote' && amount <= 1) return { width: 74, height: 52, type: 0.52 };
  return { width: 105, height: 74, type: 0.68 };
};

const font = `file://${join(THEME, 'css', 'fonts', 'archivo-latin-wdth-normal.woff2')}`;
const logo = readFileSync(join(THEME, 'img', 'zement-logo-navy.svg'), 'utf8').replace(
  /<title>.*?<\/title>/,
  '',
);
const escape = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const FONT_FACE = `@font-face { font-family: Archivo; font-weight: 100 900; font-stretch: 62% 125%;
  font-display: block; src: url('${font}') format('woff2-variations'); }`;

// --- 1. Etiqueta plana -------------------------------------------------------------------------

function labelPage(product, format, template) {
  const W = template.width * MM;
  const H = template.height * MM;
  const t = (mm) => `${(mm * template.type * MM).toFixed(1)}px`;
  const [amount, unit] = format.size.split(/\s+/);
  const liquid = format.container !== 'cubo';
  const tall = template.height > template.width;
  const dated = template.width >= 148 || tall;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${FONT_FACE}
    * { margin: 0; box-sizing: border-box; }
    html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
    .tag { display: grid; grid-template-columns: 1fr ${5.2 * MM}px; grid-template-rows: 1fr auto; width: ${W}px;
      height: ${H}px; background: #fffefb; color: #1e2c4a; font-family: Archivo, sans-serif; font-stretch: 100%; }
    .main { display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding: ${t(4.5)} ${t(4.5)} 0; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; }
    .logo { width: ${t(25)}; }
    .logo svg { display: block; width: 100%; height: auto; }
    .caps { text-transform: uppercase; letter-spacing: .28em; }
    .section { margin-top: ${t(0.9)}; font-size: ${t(1.9)}; font-weight: 600; }
    .size { font-size: ${t(11)}; font-weight: 300; line-height: .9; white-space: nowrap; }
    .size span { margin-left: .15em; font-size: ${t(3.4)}; font-weight: 500; }
    .name { margin-top: ${t(tall ? 5 : 3)}; font-size: ${t(6.8)}; font-weight: 600; line-height: 1.02;
      text-transform: uppercase; letter-spacing: .01em; }
    .subtitle { margin-top: ${t(0.8)}; color: #4a5363; font-size: ${t(2)}; }
    .text { display: -webkit-box; margin-top: ${t(3)}; overflow: hidden; color: #8f96a0; font-size: ${t(2.6)};
      line-height: 1.3; -webkit-box-orient: vertical; -webkit-line-clamp: ${tall ? 9 : 3}; }
    .safety { display: flex; gap: 1.6em; align-items: flex-end; margin-top: auto; padding-bottom: .5em;
      border-bottom: .22em solid #1e2c4a; font-size: ${t(1.8)}; }
    .safety b { flex: 1; font-weight: 700; }
    .field { width: ${t(15)}; padding-bottom: .9em; border-bottom: .22em solid #111; color: #4a5363; white-space: nowrap; }
    .hazard { padding-block: ${t(1.8)} ${t(2.6)}; border-bottom: ${t(0.35)} solid #d7cfbd; color: #8f96a0; font-size: ${t(2.4)}; }
    .foot { padding: ${t(1.9)} ${t(4.5)}; background: #1e2c4a; color: #f4f2ee; font-size: ${t(2.1)}; line-height: 1.55; }
    .strip { display: flex; grid-row: 1 / 3; grid-column: 2; align-items: center; justify-content: center;
      background: #ece4d6; font-size: ${t(1.8)}; font-weight: 500; writing-mode: vertical-rl; }
  </style></head><body>
    <div class="tag">
      <div class="main">
        <div class="head">
          <div><div class="logo">${logo}</div><div class="section caps">${escape(product.family)}</div></div>
          <div class="size">${escape(amount)}<span>${escape(unit ?? '')}</span></div>
        </div>
        <div class="name">${escape(product.name)}</div>
        <div class="subtitle caps">${escape(product.subtitle)}</div>
        <p class="text">${escape(product.lead)}</p>
        <div class="safety caps"><b>Seguridad</b><span class="field">Lote</span>${dated ? '<span class="field">Fecha fab.</span>' : ''}<span class="field">UFI</span></div>
        <p class="hazard">Consulte la ficha de datos de seguridad antes de usar.</p>
      </div>
      <footer class="foot">${
        template.width < 105
          ? 'Octavi Ten i Orenga, 9 · 12600 La Vall d’Uixó (CS)<br>607 800 028 · info@zement.es · <b>zement.com</b>'
          : `C/ Octavi Ten i Orenga, 9, bajo izq.${tall ? '<br>' : ' · '}12600 La Vall d’Uixó (Castellón)<br>Tel. 607 800 028 · info@zement.es · <b>zement.com</b>`
      }</footer>
      <div class="strip caps">${liquid ? 'Agitar antes de usar' : ''}</div>
    </div>
    <script>
      // El nombre, en una o dos líneas, sin salirse de la etiqueta.
      const name = document.querySelector('.name');
      let size = parseFloat(getComputedStyle(name).fontSize);
      while ((name.scrollWidth > name.clientWidth + 1 || name.offsetHeight > size * 2.2) && size > 8) {
        name.style.fontSize = (size -= 1) + 'px';
      }
    </script>
  </body></html>`;
}

// --- 2. Envases (lienzo de 1200 × 1200; suelo en y = 1000; vista algo desde arriba) -------------
// `wrap`: cómo se pega la etiqueta. Cilindro: centro, radio a la altura de la etiqueta, achatado
// de la elipse (ry / rx) y píxeles por milímetro; plana: centro y borde de arriba.

const K = 0.2;

/** Degradado vertical (de arriba abajo) con paradas [posición, color, opacidad]. */
const vertical = (id, stops) =>
  `<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">${stops
    .map(
      ([offset, color, opacity = 1]) =>
        `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`,
    )
    .join('')}</linearGradient>`;

const user = (x1, x2) => `gradientUnits="userSpaceOnUse" x1="${x1}" x2="${x2}"`;

// Plástico blanco: luz de estudio a la izquierda, rebote suave a la derecha.
const plastic = (id, x1, x2) => `<linearGradient id="${id}" ${user(x1, x2)}>
  <stop offset="0" stop-color="#b9b5ae"/><stop offset=".07" stop-color="#d9d6d0"/><stop offset=".22" stop-color="#f6f5f2"/>
  <stop offset=".32" stop-color="#ffffff"/><stop offset=".45" stop-color="#f3f2ef"/><stop offset=".7" stop-color="#e2e0db"/>
  <stop offset=".88" stop-color="#cfccc6"/><stop offset=".95" stop-color="#dcd9d4"/><stop offset="1" stop-color="#a9a59e"/>
</linearGradient>`;

const navy = (id, x1, x2) => `<linearGradient id="${id}" ${user(x1, x2)}>
  <stop offset="0" stop-color="#0a131a"/><stop offset=".2" stop-color="#1d3a52"/><stop offset=".32" stop-color="#3a6487"/>
  <stop offset=".42" stop-color="#22425e"/><stop offset=".75" stop-color="#14283a"/><stop offset=".92" stop-color="#1b3349"/>
  <stop offset="1" stop-color="#08111a"/>
</linearGradient>`;

const metal = (id, x1, x2) => `<linearGradient id="${id}" ${user(x1, x2)}>
  <stop offset="0" stop-color="#5d646b"/><stop offset=".08" stop-color="#9aa1a8"/><stop offset=".22" stop-color="#e9ecee"/>
  <stop offset=".3" stop-color="#ffffff"/><stop offset=".4" stop-color="#c9ced3"/><stop offset=".58" stop-color="#8d949b"/>
  <stop offset=".78" stop-color="#c3c8cd"/><stop offset=".9" stop-color="#e3e6e8"/><stop offset="1" stop-color="#6a7178"/>
</linearGradient>`;

// Sombra de contacto (estrecha y oscura) y sombra ambiente (ancha y suave).
const shadow = (rx) => `
  <radialGradient id="ambient"><stop offset="0" stop-color="#2a2620" stop-opacity=".22"/><stop offset="1" stop-color="#2a2620" stop-opacity="0"/></radialGradient>
  <radialGradient id="contact"><stop offset="0" stop-color="#16130f" stop-opacity=".55"/><stop offset=".7" stop-color="#16130f" stop-opacity=".12"/><stop offset="1" stop-color="#16130f" stop-opacity="0"/></radialGradient>
  <ellipse cx="${600 + rx * 0.12}" cy="1004" rx="${rx * 1.35}" ry="${rx * K * 1.1}" fill="url(#ambient)"/>
  <ellipse cx="600" cy="1000" rx="${rx * 1.04}" ry="${rx * K * 1.02}" fill="url(#contact)"/>`;

// Arco delantero de una elipse de radio rx en y (de izquierda a derecha).
const front = (rx, y, cx = 600) => `M${cx - rx} ${y} A${rx} ${rx * K} 0 0 0 ${cx + rx} ${y}`;

function cubo() {
  const top = { y: 372, rx: 272 };
  const bottom = { y: 968, rx: 236 };
  const rxAt = (y) => top.rx + ((bottom.rx - top.rx) * (y - top.y)) / (bottom.y - top.y);
  const body = `M${600 - top.rx} ${top.y} L${600 - bottom.rx} ${bottom.y} A${bottom.rx} ${bottom.rx * K} 0 0 0 ${600 + bottom.rx} ${bottom.y} L${600 + top.rx} ${top.y} Z`;
  const lid = { y: 346, rx: 292, band: 50 };
  const lidBand = `M${600 - lid.rx} ${lid.y} L${600 - lid.rx} ${lid.y + lid.band} A${lid.rx} ${lid.rx * K} 0 0 0 ${600 + lid.rx} ${lid.y + lid.band} L${600 + lid.rx} ${lid.y} Z`;
  const ribs = [430, 448].map((y) => front(rxAt(y), y)).join(' ');
  const notches = Array.from({ length: 23 }, (_, i) => {
    const a = -1.45 + (i * 2.9) / 22;
    const x = 600 + lid.rx * Math.sin(a);
    const y = lid.y + lid.band + lid.rx * K * Math.cos(a);
    return `M${x.toFixed(1)} ${(y - 6).toFixed(1)} V${(y - lid.band + 12).toFixed(1)}`;
  }).join(' ');

  return {
    rx: 270,
    wrap: { kind: 'cylinder', cx: 600, r: rxAt(640), top: 548, mmPx: 2.05 },
    svg: `
      <defs>${plastic('body', 600 - top.rx, 600 + top.rx)}${navy('lid', 600 - lid.rx, 600 + lid.rx)}
        <radialGradient id="lidTop" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#3d6a8f"/><stop offset=".45" stop-color="#1f3d57"/><stop offset="1" stop-color="#0d1a25"/></radialGradient>
        ${vertical('grip', [
          [0, '#f4f3f0'],
          [0.5, '#ffffff'],
          [1, '#bdb9b2'],
        ])}
        ${vertical('wire', [
          [0, '#e8eaec'],
          [0.5, '#a3a9af'],
          [1, '#6f767d'],
        ])}
        ${vertical('occlusion', [
          [0, '#000', 0.28],
          [1, '#000', 0],
        ])}
        <clipPath id="bodyClip"><path d="${body}"/></clipPath>
      </defs>
      ${shadow(250)}
      <path d="M${600 - top.rx - 14} 404 C${600 - top.rx - 40} 205 ${600 + top.rx + 40} 205 ${600 + top.rx + 14} 404" fill="none" stroke="url(#wire)" stroke-width="7" stroke-linecap="round"/>
      <path d="M528 255 Q600 246 672 255 L672 279 Q600 270 528 279 Z" fill="url(#grip)" stroke="#bdb9b2" stroke-width="1.5"/>
      <path d="${body}" fill="url(#body)"/>
      <rect x="300" y="${top.y}" width="600" height="70" fill="url(#occlusion)" clip-path="url(#bodyClip)"/>
      <path d="${ribs}" fill="none" stroke="#c4c0b9" stroke-width="3"/>
      <path d="${ribs}" fill="none" stroke="#ffffff" stroke-width="2" transform="translate(0 4)" opacity=".7"/>
      <path d="${front(rxAt(930), 930)}" fill="none" stroke="#c9c5be" stroke-width="3"/>
      <path d="${lidBand}" fill="url(#lid)"/>
      <path d="${notches}" stroke="#08111a" stroke-width="2.5" opacity=".45"/>
      <path d="${front(lid.rx, lid.y + lid.band)}" fill="none" stroke="#06101a" stroke-width="3" opacity=".6"/>
      <ellipse cx="600" cy="${lid.y}" rx="${lid.rx}" ry="${lid.rx * K}" fill="url(#lidTop)"/>
      <ellipse cx="600" cy="${lid.y}" rx="${lid.rx - 3}" ry="${(lid.rx - 3) * K}" fill="none" stroke="#5b86a8" stroke-width="2" opacity=".55"/>
      <ellipse cx="600" cy="${lid.y + 3}" rx="${lid.rx - 30}" ry="${(lid.rx - 30) * K}" fill="none" stroke="#0a1620" stroke-width="5" opacity=".55"/>
      <ellipse cx="600" cy="${lid.y + 1}" rx="${lid.rx - 30}" ry="${(lid.rx - 30) * K}" fill="none" stroke="#4d7799" stroke-width="2" opacity=".5"/>
      <ellipse cx="600" cy="${lid.y + 6}" rx="${lid.rx - 110}" ry="${(lid.rx - 110) * K}" fill="#152c3f" opacity=".55"/>
      <rect x="${600 - top.rx - 22}" y="388" width="26" height="40" rx="7" fill="#e6e4df" stroke="#b7b3ac" stroke-width="1.5"/>
      <rect x="${600 + top.rx - 4}" y="388" width="26" height="40" rx="7" fill="#c9c6c0" stroke="#a7a39c" stroke-width="1.5"/>`,
  };
}

function bote() {
  const top = 488;
  const bottom = 966;
  const r = 226;
  const body = `M${600 - r} ${top} L${600 - r} ${bottom} A${r} ${r * K} 0 0 0 ${600 + r} ${bottom} L${600 + r} ${top} Z`;
  const beads = [532, 548, 920, 936].map((y) => front(r, y)).join(' ');

  return {
    rx: r,
    wrap: { kind: 'cylinder', cx: 600, r, top: 612, mmPx: 2.55 },
    svg: `
      <defs>${metal('tin', 600 - r, 600 + r)}${metal('rim', 600 - r - 6, 600 + r + 6)}
        <radialGradient id="disc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#f7f8f9"/><stop offset=".55" stop-color="#bfc4c9"/><stop offset="1" stop-color="#7d848b"/></radialGradient>
        ${vertical('wire', [
          [0, '#eef0f1'],
          [0.5, '#aab0b6'],
          [1, '#727980'],
        ])}
      </defs>
      ${shadow(226)}
      <path d="M${600 - r - 2} 532 C${600 - r - 26} 300 ${600 + r + 26} 300 ${600 + r + 2} 532" fill="none" stroke="url(#wire)" stroke-width="6" stroke-linecap="round"/>
      <path d="${body}" fill="url(#tin)"/>
      <path d="${beads}" fill="none" stroke="#5a6168" stroke-width="2.5" opacity=".55"/>
      <path d="${beads}" fill="none" stroke="#ffffff" stroke-width="2" opacity=".55" transform="translate(0 4)"/>
      <path d="M${600 - r - 4} ${bottom - 10} L${600 - r - 4} ${bottom} A${r + 4} ${(r + 4) * K} 0 0 0 ${600 + r + 4} ${bottom} L${600 + r + 4} ${bottom - 10} Z" fill="url(#rim)"/>
      <ellipse cx="600" cy="${top}" rx="${r + 6}" ry="${(r + 6) * K}" fill="url(#rim)"/>
      <ellipse cx="600" cy="${top}" rx="${r - 4}" ry="${(r - 4) * K}" fill="none" stroke="#ffffff" stroke-width="2" opacity=".7"/>
      <ellipse cx="600" cy="${top + 4}" rx="${r - 14}" ry="${(r - 14) * K}" fill="url(#disc)"/>
      <ellipse cx="600" cy="${top + 5}" rx="${r - 30}" ry="${(r - 30) * K}" fill="none" stroke="#7d848b" stroke-width="3"/>
      <ellipse cx="600" cy="${top + 3}" rx="${r - 30}" ry="${(r - 30) * K}" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".8"/>
      <circle cx="${600 - r}" cy="536" r="10" fill="#b2b8be" stroke="#6f767d" stroke-width="1.5"/>
      <circle cx="${600 + r}" cy="536" r="10" fill="#8a9198" stroke="#5d646b" stroke-width="1.5"/>`,
  };
}

function garrafa() {
  // Vista de tres cuartos: cara frontal, lateral derecho en escorzo y hombro con asa y tapón.
  return {
    rx: 250,
    wrap: { kind: 'flat', cx: 579, top: 528, mmPx: 2.0 },
    svg: `
      <defs>
        ${plastic('face', 396, 762)}
        <linearGradient id="side" x1="0" x2="1"><stop offset="0" stop-color="#d3d0ca"/><stop offset=".5" stop-color="#c3bfb8"/><stop offset="1" stop-color="#a8a49d"/></linearGradient>
        <linearGradient id="shoulder" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fbfaf8"/><stop offset="1" stop-color="#e4e2dd"/></linearGradient>
        ${navy('cap', 728, 832)}
        <radialGradient id="capTop" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#3d6a8f"/><stop offset="1" stop-color="#0f1f2d"/></radialGradient>
      </defs>
      ${shadow(250)}
      <path d="M762 418 Q770 406 784 400 L852 372 Q864 368 864 382 L864 944 Q864 962 848 970 L784 996 Q770 1000 762 990 Z" fill="url(#side)"/>
      <path d="M432 402 Q440 362 480 356 L800 340 Q852 338 856 360 Q858 374 842 380 L782 404 Q770 410 750 410 L440 410 Z" fill="url(#shoulder)"/>
      <path d="M474 384 C466 252 488 226 530 224 L622 222 C664 222 682 246 676 382" fill="none" stroke="#d7d4ce" stroke-width="50" stroke-linejoin="round"/>
      <path d="M474 384 C466 252 488 226 530 224 L622 222 C664 222 682 246 676 382" fill="none" stroke="#fdfcfa" stroke-width="30" stroke-linejoin="round" transform="translate(-5 -5)"/>
      <path d="M528 384 C526 300 534 280 556 280 L598 280 C616 280 624 300 622 384 Z" fill="#ffffff"/>
      <path d="M528 384 C526 300 534 280 556 280 L598 280 C616 280 624 300 622 384" fill="none" stroke="#b5b1aa" stroke-width="5"/>
      <rect x="396" y="396" width="366" height="604" rx="38" fill="url(#face)"/>
      <path d="M402 440 Q400 404 438 400 L560 400" fill="none" stroke="#ffffff" stroke-width="5" opacity=".9"/>
      <path d="M408 980 Q420 996 450 998 L708 998 Q748 996 758 970" fill="none" stroke="#a9a59e" stroke-width="3" opacity=".6"/>
      <path d="M764 430 L860 392" stroke="#ffffff" stroke-width="3" opacity=".5"/>
      <ellipse cx="780" cy="372" rx="48" ry="12" fill="#cfccc6"/>
      <path d="M732 300 L732 366 A48 11 0 0 0 828 366 L828 300 Z" fill="url(#cap)"/>
      <path d="M742 308 V368 M754 308 V372 M766 308 V374 M778 308 V375 M790 308 V375 M802 308 V374 M814 308 V371" stroke="#06101a" stroke-width="3" opacity=".5"/>
      <ellipse cx="780" cy="300" rx="48" ry="11" fill="url(#capTop)"/>`,
  };
}

const DRAWINGS = { cubo, garrafa, bote };

function packPage(format, template, labelUrl) {
  const drawing = DRAWINGS[format.container]();
  const scale = scaleOf(format);
  const wrap = { ...drawing.wrap, k: K, width: template.width, height: template.height };

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; }
    html, body { width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; background: #ffffff; }
    .stage { position: absolute; inset: 0; transform: translateY(${(1 - scale) * -120}px) scale(${scale}); transform-origin: 600px 1000px; }
    svg, canvas { position: absolute; inset: 0; }
  </style></head><body>
    <div class="stage">
      <svg viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">${drawing.svg}</svg>
      <canvas width="${SIZE}" height="${SIZE}"></canvas>
    </div>
    <script>
      const wrap = ${JSON.stringify(wrap)};
      const ctx = document.querySelector('canvas').getContext('2d');
      const label = new Image();
      label.onload = () => {
        const w = wrap.width * wrap.mmPx;
        const h = wrap.height * wrap.mmPx;
        if (wrap.kind === 'flat') {
          ctx.drawImage(label, wrap.cx - w / 2, wrap.top, w, h);
          shade(wrap.cx - w / 2, wrap.cx + w / 2, 0.12);
          return;
        }
        // Cilindro: cada columna de la etiqueta va a su ángulo; baja con la elipse (sonrisa) y
        // se estrecha hacia los bordes.
        const span = w / wrap.r;
        const columns = label.width;
        const lift = wrap.r * wrap.k;
        for (let i = 0; i < columns; i++) {
          const a0 = (i / columns - 0.5) * span;
          const a1 = ((i + 1) / columns - 0.5) * span;
          const x0 = wrap.cx + wrap.r * Math.sin(a0);
          const x1 = wrap.cx + wrap.r * Math.sin(a1);
          const y = wrap.top - lift + lift * Math.cos((a0 + a1) / 2);
          ctx.drawImage(label, i, 0, 1, label.height, x0, y, x1 - x0 + 0.6, h);
        }
        const half = wrap.r * Math.sin(span / 2);
        shade(wrap.cx - half, wrap.cx + half, 0.3);
      };
      // Luz sobre la etiqueta: la misma que en el envase (brillo a la izquierda, bordes en sombra).
      function shade(from, to, strength) {
        const light = ctx.createLinearGradient(from, 0, to, 0);
        light.addColorStop(0, 'rgba(40,35,28,' + strength * 1.2 + ')');
        light.addColorStop(0.18, 'rgba(40,35,28,' + strength * 0.25 + ')');
        light.addColorStop(0.3, 'rgba(255,255,255,0)');
        light.addColorStop(0.62, 'rgba(40,35,28,' + strength * 0.2 + ')');
        light.addColorStop(1, 'rgba(40,35,28,' + strength * 1.1 + ')');
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = light;
        ctx.fillRect(0, 0, ${SIZE}, ${SIZE});
        const gloss = ctx.createLinearGradient(from, 0, to, 0);
        gloss.addColorStop(0.2, 'rgba(255,255,255,0)');
        gloss.addColorStop(0.27, 'rgba(255,255,255,' + strength * 0.8 + ')');
        gloss.addColorStop(0.34, 'rgba(255,255,255,0)');
        ctx.fillStyle = gloss;
        ctx.fillRect(0, 0, ${SIZE}, ${SIZE});
      }
      label.src = ${JSON.stringify(labelUrl)};
    </script>
  </body></html>`;
}

// --- Datos y ejecución -------------------------------------------------------------------------

/** Datos de la etiqueta: de la ficha en español, si la hay. */
function productData(entry, families) {
  const file = join(CATALOG, 'products', `${entry.key}.json`);
  const sheet = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).languages.es : null;
  const lead =
    sheet?.sections
      ?.flatMap((section) => section.blocks ?? [])
      .find((block) => block.type === 'lead')?.text ?? '';
  return {
    name: sheet?.name ?? entry.name?.es ?? entry.name ?? entry.key,
    subtitle: sheet?.subtitle ?? '',
    family: families[entry.category] ?? '',
    lead,
  };
}

function shoot(html, png, width, height) {
  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--allow-file-access-from-files',
      `--window-size=${width},${height}`,
      '--virtual-time-budget=4000',
      `--screenshot=${png}`,
      `file://${html}`,
    ],
    { stdio: 'ignore' },
  );
}

function main() {
  const catalog = JSON.parse(readFileSync(join(CATALOG, 'catalog.json'), 'utf8'));
  const families = Object.fromEntries(
    catalog.categories.map((category) => [category.key, category.name.es]),
  );
  const only = process.argv.slice(2);
  const work = mkdtempSync(join(tmpdir(), 'zement-envases-'));
  mkdirSync(OUTPUT, { recursive: true });
  let count = 0;

  try {
    for (const entry of catalog.products) {
      if (only.length && !only.includes(entry.key)) continue;
      const product = productData(entry, families);

      for (const format of entry.formats ?? []) {
        if (!CONTAINERS.includes(format.container)) continue;
        const template = templateOf(format);
        const labelHtml = join(work, 'etiqueta.html');
        const labelPng = join(work, 'etiqueta.png');
        writeFileSync(labelHtml, labelPage(product, format, template));
        shoot(labelHtml, labelPng, template.width * MM, template.height * MM);

        const packHtml = join(work, 'envase.html');
        const packPng = join(work, 'envase.png');
        writeFileSync(packHtml, packPage(format, template, `file://${labelPng}`));
        shoot(packHtml, packPng, SIZE, SIZE);

        const file = packagingFile(entry.key, format);
        execFileSync(
          'sips',
          [
            '-s',
            'format',
            'jpeg',
            '-s',
            'formatOptions',
            '88',
            packPng,
            '--out',
            join(OUTPUT, file),
          ],
          { stdio: 'ignore' },
        );
        console.log(`  · ${file}`);
        count++;
      }
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }

  console.log(`${count} fotos de envase en ${OUTPUT}`);
}

main();
