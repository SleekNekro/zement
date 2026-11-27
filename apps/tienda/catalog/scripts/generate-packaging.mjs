// Genera por código las fotos de envase de la tienda (images/envases/<clave>--<envase>-<tamaño>.jpg):
// un cubo, una garrafa o un bote (tarrina de plástico) con la etiqueta de Zement, recortado sobre
// blanco con su sombra, como una foto de estudio. Una foto por formato de venta de catalog.json; los kits aún no tienen
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
// cilindro (cubo y bote) o plana (garrafa), a escala del envase. El JPEG lo
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

// --- 2. Envases (lienzo de 1200 × 1200; vista algo desde arriba, luz de estudio a la izquierda) --
// Proporciones de envases reales de obra: cubo chato con tapa de color, precinto y asa metálica
// colgando a los lados; tarrina blanca baja y ancha (productos al agua); garrafa de 5 L en tres
// cuartos con el asa moldeada y el tapón de rosca.
// `wrap`: cómo se pega la etiqueta. Cilindro: centro, radio a la altura de la etiqueta, achatado
// de la elipse (ry / rx) y píxeles por milímetro; plana: centro y borde de arriba.

const K = 0.24;

/** Degradado vertical (de arriba abajo) con paradas [posición, color, opacidad]. */
const vertical = (id, stops) =>
  `<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">${stops
    .map(
      ([offset, color, opacity = 1]) =>
        `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`,
    )
    .join('')}</linearGradient>`;

const user = (x1, x2) => `gradientUnits="userSpaceOnUse" x1="${x1}" x2="${x2}"`;

// Plástico blanco brillante: luz a la izquierda, rebote suave a la derecha, bordes en sombra.
const plastic = (id, x1, x2) => `<linearGradient id="${id}" ${user(x1, x2)}>
  <stop offset="0" stop-color="#bdb9b3"/><stop offset=".05" stop-color="#dcd9d4"/><stop offset=".16" stop-color="#f7f6f4"/>
  <stop offset=".27" stop-color="#ffffff"/><stop offset=".4" stop-color="#f4f3f1"/><stop offset=".68" stop-color="#e6e4e0"/>
  <stop offset=".86" stop-color="#d3d0cb"/><stop offset=".94" stop-color="#e2e0dc"/><stop offset="1" stop-color="#b3afa9"/>
</linearGradient>`;

const navy = (id, x1, x2) => `<linearGradient id="${id}" ${user(x1, x2)}>
  <stop offset="0" stop-color="#0a131a"/><stop offset=".14" stop-color="#1d3a52"/><stop offset=".26" stop-color="#3f6a8d"/>
  <stop offset=".36" stop-color="#23435f"/><stop offset=".72" stop-color="#15293b"/><stop offset=".9" stop-color="#1d364c"/>
  <stop offset="1" stop-color="#08111a"/>
</linearGradient>`;

const steel = vertical('steel', [
  [0, '#f2f3f4'],
  [0.45, '#a7adb3'],
  [1, '#6c737a'],
]);

// Sombra de contacto (estrecha y oscura) y sombra ambiente (ancha y suave), bajo la base del envase
// (centro de la elipse del fondo en y = base).
const shadow = (rx, base) => `
  <radialGradient id="ambient"><stop offset="0" stop-color="#2a2620" stop-opacity=".2"/><stop offset="1" stop-color="#2a2620" stop-opacity="0"/></radialGradient>
  <radialGradient id="contact"><stop offset="0" stop-color="#16130f" stop-opacity=".5"/><stop offset=".7" stop-color="#16130f" stop-opacity=".1"/><stop offset="1" stop-color="#16130f" stop-opacity="0"/></radialGradient>
  <ellipse cx="${600 + rx * 0.16}" cy="${base + 16}" rx="${rx * 1.5}" ry="${rx * K * 1.45}" fill="url(#ambient)"/>
  <ellipse cx="600" cy="${base + 4}" rx="${rx * 1.07}" ry="${rx * K * 1.18}" fill="url(#contact)"/>`;

// Arco delantero de una elipse de radio rx centrada en y (de izquierda a derecha).
const front = (rx, y, cx = 600) => `M${cx - rx} ${y} A${rx} ${rx * K} 0 0 0 ${cx + rx} ${y}`;

// Banda cilíndrica entre y1 e y2 (centros de elipse), visible por delante.
const band = (rx, y1, y2, cx = 600) =>
  `M${cx - rx} ${y1} L${cx - rx} ${y2} A${rx} ${rx * K} 0 0 0 ${cx + rx} ${y2} L${cx + rx} ${y1} Z`;

// Tronco de cono (cuerpo de cubo o tarrina) de la boca (arriba) al fondo.
const frustum = (top, bottom) =>
  `M${600 - top.rx} ${top.y} L${600 - bottom.rx} ${bottom.y} A${bottom.rx} ${bottom.rx * K} 0 0 0 ${600 + bottom.rx} ${bottom.y} L${600 + top.rx} ${top.y} A${top.rx} ${top.rx * K} 0 0 0 ${600 - top.rx} ${top.y} Z`;

// Precinto de la tapa: lengüeta blanca en el centro del faldón.
const tamper = (y, height, width) => `
  <rect x="${600 - width / 2}" y="${y}" width="${width}" height="${height}" rx="4" fill="url(#tab)"/>
  <path d="M${600 - width / 2 + 6} ${y + 6} H${600 + width / 2 - 6}" stroke="#ffffff" stroke-width="2" opacity=".8"/>`;

const TAB = vertical('tab', [
  [0, '#fbfaf8'],
  [1, '#d8d5d0'],
]);

/** Cubo de obra: cuerpo blanco cónico, aro blanco, tapa azul con precinto, asa de alambre a los lados. */
function cubo() {
  const top = { y: 452, rx: 296 };
  const bottom = { y: 930, rx: 250 };
  const rxAt = (y) => top.rx + ((bottom.rx - top.rx) * (y - top.y)) / (bottom.y - top.y);
  const ring = { y1: 418, y2: 456, rx: 308 };
  const lid = { y: 372, rx: 316, skirt: 48 };
  const ribs = [ring.y1 + 12, ring.y1 + 26].map((y) => front(ring.rx, y)).join(' ');
  const foot = front(rxAt(904), 904);
  // Asa: sale de la oreja, cuelga hacia fuera y se mete por detrás del cuerpo.
  const handle = (side) => {
    const x = 600 + side * (ring.rx + 4);
    return `M${x} 438 C${x + side * 46} 520 ${x + side * 30} 650 ${600 + side * (rxAt(690) - 6)} 700`;
  };

  return {
    rx: bottom.rx,
    ceiling: lid.y - lid.rx * K,
    floor: bottom.y + bottom.rx * K,
    wrap: { kind: 'cylinder', cx: 600, r: rxAt(700), top: 552, mmPx: 2.95 },
    svg: `
      <defs>${plastic('body', 600 - top.rx, 600 + top.rx)}${plastic('ring', 600 - ring.rx, 600 + ring.rx)}
        ${navy('lid', 600 - lid.rx, 600 + lid.rx)}${steel}${TAB}
        <radialGradient id="lidTop" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#46739a"/><stop offset=".45" stop-color="#20405b"/><stop offset="1" stop-color="#0c1924"/></radialGradient>
        ${vertical('under', [
          [0, '#000', 0.22],
          [1, '#000', 0],
        ])}
        <clipPath id="bodyClip"><path d="${frustum(top, bottom)}"/></clipPath>
      </defs>
      ${shadow(bottom.rx, bottom.y)}
      <path d="${handle(-1)}" fill="none" stroke="url(#steel)" stroke-width="7" stroke-linecap="round"/>
      <path d="${frustum(top, bottom)}" fill="url(#body)"/>
      <rect x="250" y="${top.y}" width="700" height="${top.rx * K + 46}" fill="url(#under)" clip-path="url(#bodyClip)"/>
      <path d="${foot}" fill="none" stroke="#c9c6c0" stroke-width="3"/>
      <path d="${foot}" fill="none" stroke="#ffffff" stroke-width="2" opacity=".8" transform="translate(0 4)"/>
      <path d="${band(ring.rx, ring.y1, ring.y2)}" fill="url(#ring)"/>
      <path d="${ribs}" fill="none" stroke="#cbc8c2" stroke-width="2.5"/>
      <path d="${front(ring.rx, ring.y2)}" fill="none" stroke="#b8b4ad" stroke-width="2"/>
      <path d="${handle(1)}" fill="none" stroke="url(#steel)" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="${600 - ring.rx - 2}" cy="438" rx="13" ry="20" fill="#e9e7e3" stroke="#b4b0a9" stroke-width="1.5"/>
      <ellipse cx="${600 + ring.rx + 2}" cy="438" rx="13" ry="20" fill="#cfccc6" stroke="#a5a19a" stroke-width="1.5"/>
      <path d="${band(lid.rx, lid.y, lid.y + lid.skirt)}" fill="url(#lid)"/>
      <path d="${front(lid.rx, lid.y + lid.skirt)}" fill="none" stroke="#050c12" stroke-width="3" opacity=".7"/>
      ${tamper(lid.y + lid.rx * K + 4, lid.skirt - 6, 92)}
      <ellipse cx="600" cy="${lid.y}" rx="${lid.rx}" ry="${lid.rx * K}" fill="url(#lidTop)"/>
      <ellipse cx="600" cy="${lid.y}" rx="${lid.rx - 3}" ry="${(lid.rx - 3) * K}" fill="none" stroke="#6390b4" stroke-width="2" opacity=".55"/>
      <ellipse cx="600" cy="${lid.y + 4}" rx="${lid.rx - 34}" ry="${(lid.rx - 34) * K}" fill="none" stroke="#08131c" stroke-width="6" opacity=".5"/>
      <ellipse cx="600" cy="${lid.y + 1}" rx="${lid.rx - 34}" ry="${(lid.rx - 34) * K}" fill="none" stroke="#5584a8" stroke-width="2" opacity=".5"/>
      <ellipse cx="600" cy="${lid.y + 8}" rx="${lid.rx - 120}" ry="${(lid.rx - 120) * K}" fill="#16304a" opacity=".45"/>`,
  };
}

/** Tarrina de plástico blanca, baja y ancha, con tapa blanca, precinto y asa de plástico. */
function bote() {
  const top = { y: 586, rx: 262 };
  const bottom = { y: 930, rx: 232 };
  const rxAt = (y) => top.rx + ((bottom.rx - top.rx) * (y - top.y)) / (bottom.y - top.y);
  const lid = { y: 540, rx: 276, skirt: 50 };
  const foot = front(rxAt(906), 906);
  const handle = (side) => {
    const x = 600 + side * (lid.rx + 2);
    return `M${x} 618 C${x + side * 26} 690 ${x + side * 14} 760 ${600 + side * (rxAt(760) - 6)} 800`;
  };

  return {
    rx: bottom.rx,
    ceiling: lid.y - lid.rx * K,
    floor: bottom.y + bottom.rx * K,
    wrap: { kind: 'cylinder', cx: 600, r: rxAt(760), top: 672, mmPx: 3.4 },
    svg: `
      <defs>${plastic('body', 600 - top.rx, 600 + top.rx)}${plastic('lid', 600 - lid.rx, 600 + lid.rx)}${TAB}
        <radialGradient id="lidTop" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eeece8"/><stop offset="1" stop-color="#d2cfc9"/></radialGradient>
        ${vertical('strap', [
          [0, '#fbfaf8'],
          [1, '#cfccc6'],
        ])}
        ${vertical('under', [
          [0, '#000', 0.16],
          [1, '#000', 0],
        ])}
        <clipPath id="bodyClip"><path d="${frustum(top, bottom)}"/></clipPath>
      </defs>
      ${shadow(bottom.rx, bottom.y)}
      <path d="${handle(-1)}" fill="none" stroke="#bfbbb5" stroke-width="12" stroke-linecap="round"/>
      <path d="${handle(-1)}" fill="none" stroke="url(#strap)" stroke-width="8" stroke-linecap="round"/>
      <path d="${frustum(top, bottom)}" fill="url(#body)"/>
      <rect x="300" y="${top.y}" width="600" height="${top.rx * K + 40}" fill="url(#under)" clip-path="url(#bodyClip)"/>
      <path d="${foot}" fill="none" stroke="#cbc8c2" stroke-width="3"/>
      <path d="${handle(1)}" fill="none" stroke="#bfbbb5" stroke-width="12" stroke-linecap="round"/>
      <path d="${handle(1)}" fill="none" stroke="url(#strap)" stroke-width="8" stroke-linecap="round"/>
      <path d="${band(lid.rx, lid.y, lid.y + lid.skirt)}" fill="url(#lid)"/>
      <path d="${front(lid.rx, lid.y + 16)} ${front(lid.rx, lid.y + 30)}" fill="none" stroke="#d4d1cb" stroke-width="2"/>
      <path d="${front(lid.rx, lid.y + lid.skirt)}" fill="none" stroke="#a9a59e" stroke-width="2.5"/>
      ${tamper(lid.y + lid.rx * K + 6, lid.skirt - 10, 70)}
      <ellipse cx="${600 - lid.rx}" cy="610" rx="11" ry="17" fill="#ecebe7" stroke="#b6b2ab" stroke-width="1.5"/>
      <ellipse cx="${600 + lid.rx}" cy="610" rx="11" ry="17" fill="#d1cec8" stroke="#a6a29b" stroke-width="1.5"/>
      <ellipse cx="600" cy="${lid.y}" rx="${lid.rx}" ry="${lid.rx * K}" fill="url(#lidTop)"/>
      <ellipse cx="600" cy="${lid.y + 3}" rx="${lid.rx - 26}" ry="${(lid.rx - 26) * K}" fill="none" stroke="#c9c6c0" stroke-width="4"/>
      <ellipse cx="600" cy="${lid.y + 1}" rx="${lid.rx - 26}" ry="${(lid.rx - 26) * K}" fill="none" stroke="#ffffff" stroke-width="2"/>`,
  };
}

/** Garrafa de 5 L en tres cuartos: lateral izquierdo en escorzo, asa moldeada y tapón de rosca. */
function garrafa() {
  return {
    rx: 250,
    ceiling: 218,
    floor: 1000,
    wrap: { kind: 'flat', cx: 694, top: 530, mmPx: 2.4 },
    svg: `
      <defs>${plastic('face', 512, 868)}
        <linearGradient id="side" x1="0" x2="1"><stop offset="0" stop-color="#a9a59e"/><stop offset=".5" stop-color="#c6c2bb"/><stop offset="1" stop-color="#d9d6d0"/></linearGradient>
        ${vertical('top', [
          [0, '#dedbd6'],
          [1, '#f3f2ef'],
        ])}
        ${navy('cap', 728, 832)}
        <radialGradient id="capTop" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#46739a"/><stop offset="1" stop-color="#0f1f2d"/></radialGradient>
        ${vertical('neck', [
          [0, '#f4f3f0'],
          [1, '#d6d3ce'],
        ])}
      </defs>
      ${shadow(250, 972)}
      <path d="M368 410 Q368 384 392 378 L520 404 L520 994 L400 956 Q368 946 368 918 Z" fill="url(#side)"/>
      <path d="M368 410 Q368 384 392 378 L520 404" fill="none" stroke="#9e9a93" stroke-width="2"/>
      <path d="M392 378 Q400 358 430 356 L790 350 Q846 350 862 380 L868 404 L520 404 Z" fill="url(#top)"/>
      <path d="M392 378 L520 404 L868 404" fill="none" stroke="#bcb8b1" stroke-width="2"/>
      <path d="M424 384 C420 268 440 246 478 244 L584 242 C622 242 640 266 636 384" fill="none" stroke="#b9b5ae" stroke-width="50" stroke-linejoin="round"/>
      <path d="M424 384 C420 268 440 246 478 244 L584 242 C622 242 640 266 636 384" fill="none" stroke="#f6f5f2" stroke-width="34" stroke-linejoin="round" transform="translate(-4 -5)"/>
      <path d="M476 386 C472 316 482 296 504 296 L558 296 C578 296 586 316 584 386 Z" fill="#ffffff"/>
      <path d="M476 386 C472 316 482 296 504 296 L558 296 C578 296 586 316 584 386" fill="none" stroke="#a9a59e" stroke-width="5"/>
      <rect x="520" y="404" width="348" height="596" rx="28" fill="url(#face)"/>
      <path d="M548 404 L840 404" stroke="#ffffff" stroke-width="3"/>
      <path d="M522 430 Q520 406 546 404" fill="none" stroke="#bcb8b1" stroke-width="2"/>
      <path d="M516 444 Q514 408 548 406 L700 406" fill="none" stroke="#ffffff" stroke-width="5" opacity=".9"/>
      <path d="M520 980 Q530 996 560 998 L824 998 Q860 996 866 970" fill="none" stroke="#aaa69f" stroke-width="3" opacity=".6"/>
      <path d="M744 340 L744 392 A36 9 0 0 0 816 392 L816 340 Z" fill="url(#neck)"/>
      <path d="M730 290 L730 352 A50 12 0 0 0 830 352 L830 290 Z" fill="url(#cap)"/>
      <path d="M740 298 V354 M752 298 V358 M764 298 V361 M776 298 V362 M788 298 V362 M800 298 V361 M812 298 V358 M822 298 V354" stroke="#06101a" stroke-width="3" opacity=".5"/>
      <ellipse cx="780" cy="290" rx="50" ry="12" fill="url(#capTop)"/>`,
  };
}

const DRAWINGS = { cubo, garrafa, bote };

function packPage(format, template, labelUrl) {
  const drawing = DRAWINGS[format.container]();
  const scale = scaleOf(format);
  const wrap = { ...drawing.wrap, k: K, width: template.width, height: template.height };
  // Centrado en vertical según su altura real, ya escalado (los envases pequeños no caen al suelo).
  const offset = 620 - (drawing.floor - (scale * (drawing.floor - drawing.ceiling)) / 2);

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; }
    html, body { width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; background: #ffffff; }
    .stage { position: absolute; inset: 0; transform: translateY(${offset}px) scale(${scale}); transform-origin: 600px ${drawing.floor}px; }
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
