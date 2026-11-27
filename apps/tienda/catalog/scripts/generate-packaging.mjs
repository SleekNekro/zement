// Genera las fotos de envase de la tienda (images/envases/<clave>--<envase>-<tamaño>.jpg) a partir
// de fotos reales de los mismos envases (images/envases-base/: cubo.webp, garrafa.webp y
// tarrina.webp; carpeta local que no se sube a Git). Una foto por formato de venta de
// catalog.json; los kits aún no tienen foto y se saltan.
//
//   cubo    el impreso del cubo con el logotipo de Zement (y el texto grande de su familia si no
//           es microcemento)
//   garrafa la etiqueta vertical de imprenta (105 × 148 mm) en el frente y el tapón en azul
//   bote    tarrina blanca con la etiqueta de 105 × 74 mm (74 × 52 mm en 1 kg) doblada en el frente
// Todas llevan un círculo con el acabado del producto (su muestra de la ficha) o en azul, con el
// nombre y el tamaño.
//
// Etiquetas: plantillas de imprenta de Zement con los datos de la ficha en español (familia,
// nombre, subtítulo y primera frase). Lote, fecha y UFI en blanco; sin pictogramas GHS, marcado CE
// ni código de barras: no hay datos para ponerlos (TODO cuando existan).
//
// Todo se fotografía con Chrome sin ventana y el JPEG lo hace sips (macOS). Uso, desde la raíz:
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
const SIZE = 900;
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

// --- 2. Foto del envase ------------------------------------------------------------------------
// Cada envase parte de una foto real del mismo envase (carpeta local images/envases-base/, que no
// se sube: las fotos llevan la marca del fabricante). Sobre ella, en coordenadas de la foto base:
//   patches  zonas impresas que se borran rellenando cada fila con el color de sus bordes
//   logo     logotipo de Zement en el hueco del logotipo original
//   print    texto grande impreso del cubo («MICRO CEMENTO»), que se cambia si no es microcemento
//   recolor  tapón de color, que pasa al azul de Zement
//   label    etiqueta de imprenta: plana con escorzo (garrafa) o doblada sobre el cilindro (tarrina)
//   badge    círculo con la textura del acabado del producto (o azul) y su nombre

const BASE = join(CATALOG, 'images', 'envases-base');

const PHOTOS = {
  cubo: {
    file: 'cubo.webp',
    anchor: [225, 395],
    patches: [
      { x0: 146, x1: 297, y0: 165, y1: 219 },
      { x0: 203, x1: 262, y0: 340, y1: 359, flat: true },
    ],
    logo: { cx: 221, cy: 190, width: 140 },
    print: { x0: 150, x1: 300, y0: 243, y1: 337 },
    badge: { cx: 315, cy: 350, r: 68 },
  },
  garrafa: {
    file: 'garrafa.webp',
    anchor: [150, 238],
    patches: [],
    recolor: { x0: 160, x1: 212, y0: 55, y1: 86 },
    label: { kind: 'skew', x: 88, y: 105, width: 84, skew: 0.2 },
    badge: { cx: 210, cy: 233, r: 46 },
  },
  bote: {
    file: 'tarrina.webp',
    anchor: [225, 312],
    patches: [],
    label: { kind: 'cylinder', cx: 225, r: 92, k: 0.1, top: 192, mmPx: 1.25 },
    badge: { cx: 315, cy: 308, r: 68 },
  },
};

/** Texto grande impreso en el cubo según la familia (el original dice «MICRO CEMENTO»). */
const PRINTS = { corcho: ['KORK'], imprimaciones: ['PRIME', 'GRIP'] };

const dataUrl = (file, type) => `data:${type};base64,${readFileSync(file).toString('base64')}`;
const LOGO_URL = dataUrl(join(THEME, 'img', 'zement-logo-paper.svg'), 'image/svg+xml');

function packPage(entry, product, format, template, labelUrl) {
  const photo = PHOTOS[format.container];
  const texture = join(CATALOG, 'images', `${entry.key}.jpg`);
  const spec = {
    ...photo,
    scale: scaleOf(format),
    print: PRINTS[entry.category] ? { ...photo.print, lines: PRINTS[entry.category] } : null,
    template: { width: template.width, height: template.height },
    name: product.name.replace(/^Zement\s+/i, ''),
    size: format.size,
  };

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${FONT_FACE}
    * { margin: 0; }
    html, body { width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; background: #ffffff; }
  </style></head><body>
    <canvas width="${SIZE}" height="${SIZE}"></canvas>
    <script>
      const spec = ${JSON.stringify(spec)};
      const load = (src) => new Promise((resolve) => { const image = new Image(); image.onload = () => resolve(image); image.src = src; });

      (async () => {
        await document.fonts.load('700 extra-condensed 40px Archivo');
        const [base, label, logo, texture] = await Promise.all([
          load(${JSON.stringify(dataUrl(join(BASE, photo.file), 'image/webp'))}),
          ${format.container === 'cubo' ? 'null' : `load(${JSON.stringify(labelUrl)})`},
          load(${JSON.stringify(LOGO_URL)}),
          ${existsSync(texture) ? `load(${JSON.stringify(dataUrl(texture, 'image/jpeg'))})` : 'null'},
        ]);

        // 1. Retoques sobre la foto base, a su tamaño.
        const work = document.createElement('canvas');
        work.width = base.width;
        work.height = base.height;
        const w = work.getContext('2d', { willReadFrequently: true });
        w.drawImage(base, 0, 0);
        const pixel = (x, y) => w.getImageData(x, y, 1, 1).data;
        const rgb = (p) => 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
        // Cada fila, con el color de sus bordes (o del izquierdo, si el derecho no es fondo).
        const fillRows = (x0, x1, y0, y1, flat) => {
          for (let y = y0; y <= y1; y++) {
            const left = pixel(x0 - 2, y);
            const right = flat ? left : pixel(x1 + 2, y);
            const row = w.createLinearGradient(x0, 0, x1, 0);
            row.addColorStop(0, rgb(left));
            row.addColorStop(1, rgb(right));
            w.fillStyle = row;
            w.fillRect(x0, y, x1 - x0, 1);
          }
        };
        // Cada columna, con el color de una fila limpia justo encima (conserva la luz del panel).
        const fillColumns = (x0, x1, y0, y1) => {
          for (let x = x0; x <= x1; x++) {
            w.fillStyle = rgb(pixel(x, y0 - 3));
            w.fillRect(x, y0, 1, y1 - y0);
          }
        };
        for (const patch of spec.patches) fillRows(patch.x0, patch.x1, patch.y0, patch.y1, patch.flat);
        if (spec.print) {
          fillColumns(spec.print.x0, spec.print.x1, spec.print.y0, spec.print.y1);
        }
        if (spec.recolor) {
          // Tapón: los píxeles rojos pasan a la gama de azules de Zement con la misma luz.
          const { x0, x1, y0, y1 } = spec.recolor;
          const area = w.getImageData(x0, y0, x1 - x0, y1 - y0);
          const d = area.data;
          for (let i = 0; i < d.length; i += 4) {
            const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
            if (r > g + 40 && r > b + 40) {
              const light = Math.min(1, (r + g + b) / 3 / 150);
              d[i] = 10 + 55 * light;
              d[i + 1] = 22 + 90 * light;
              d[i + 2] = 34 + 120 * light;
            }
          }
          w.putImageData(area, x0, y0);
        }

        // 2. Composición final: la foto ampliada y, encima, logotipo, texto, etiqueta y círculo.
        const ctx = document.querySelector('canvas').getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        const f = ${SIZE} / base.width;
        const s = spec.scale;
        const [ax, ay] = spec.anchor;
        // Envases pequeños: más pequeños desde el pie y centrados en vertical.
        ctx.setTransform(f * s, 0, 0, f * s, ax * f * (1 - s), ay * f * (1 - s) - (${SIZE} * (1 - s)) / 2.4);
        ctx.drawImage(work, 0, 0);

        if (spec.logo) {
          const height = (spec.logo.width * logo.height) / logo.width;
          ctx.drawImage(logo, spec.logo.cx - spec.logo.width / 2, spec.logo.cy - height / 2, spec.logo.width, height);
        }

        if (spec.print) {
          const { x0, x1, y0, y1 } = spec.print;
          const lines = spec.print.lines;
          const lineHeight = (y1 - y0) / Math.max(2, lines.length);
          const top = y0 + ((y1 - y0) - lineHeight * lines.length) / 2;
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'alphabetic';
          lines.forEach((line, i) => {
            let size = lineHeight * 1.12;
            ctx.font = '700 extra-condensed ' + size + 'px Archivo';
            while (ctx.measureText(line).width > x1 - x0 - 16 && size > 10) {
              ctx.font = '700 extra-condensed ' + (size -= 1) + 'px Archivo';
            }
            ctx.fillText(line, x0 + 6, top + lineHeight * (i + 1) - 4);
          });
        }

        if (label) drawLabel(ctx, label, spec);
        drawBadge(ctx, spec, texture);
      })();

      // Etiqueta en una capa aparte para sombrearla sin tocar la foto.
      function drawLabel(ctx, label, spec) {
        const layer = document.createElement('canvas');
        layer.width = layer.height = ${SIZE};
        const l = layer.getContext('2d');
        l.setTransform(ctx.getTransform());
        const g = spec.label;
        if (g.kind === 'skew') {
          const height = (g.width * spec.template.height) / spec.template.width;
          l.transform(1, g.skew, 0, 1, g.x, g.y - g.skew * g.x);
          l.drawImage(label, 0, 0, g.width, height);
          l.setTransform(ctx.getTransform());
          shade(l, g.x, g.x + g.width, 0.1);
        } else {
          const width = spec.template.width * g.mmPx;
          const height = spec.template.height * g.mmPx;
          const span = width / g.r;
          const lift = g.r * g.k;
          // Tiras de un píxel de la foto final: cada una toma su trozo de la etiqueta plana.
          const scale = ctx.getTransform().a;
          const strips = Math.ceil(2 * g.r * Math.sin(span / 2) * scale);
          for (let j = 0; j < strips; j++) {
            const u0 = j / strips;
            const u1 = (j + 1) / strips;
            const a0 = (u0 - 0.5) * span;
            const a1 = (u1 - 0.5) * span;
            const x0 = g.cx + g.r * Math.sin(a0);
            const x1 = g.cx + g.r * Math.sin(a1);
            const y = g.top - lift + lift * Math.cos((a0 + a1) / 2);
            const sx = u0 * label.width;
            l.drawImage(label, sx, 0, (u1 - u0) * label.width, label.height, x0, y, x1 - x0 + 0.6 / scale, height);
          }
          const half = g.r * Math.sin(span / 2);
          shade(l, g.cx - half, g.cx + half, 0.28);
        }
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(layer, 0, 0);
        ctx.restore();
      }

      // Luz de la foto sobre la etiqueta: bordes en sombra y un brillo a la izquierda.
      function shade(l, from, to, strength) {
        l.globalCompositeOperation = 'source-atop';
        const light = l.createLinearGradient(from, 0, to, 0);
        light.addColorStop(0, 'rgba(40,35,28,' + strength * 1.1 + ')');
        light.addColorStop(0.2, 'rgba(40,35,28,' + strength * 0.2 + ')');
        light.addColorStop(0.32, 'rgba(255,255,255,0)');
        light.addColorStop(0.65, 'rgba(40,35,28,' + strength * 0.2 + ')');
        light.addColorStop(1, 'rgba(40,35,28,' + strength + ')');
        l.fillStyle = light;
        l.fillRect(from - 20, 0, to - from + 40, 1000);
        l.globalCompositeOperation = 'source-over';
      }

      // Círculo del producto: su acabado (si hay muestra) o azul, con el nombre y el tamaño.
      function drawBadge(ctx, spec, texture) {
        const { cx, cy, r } = spec.badge;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        if (texture) {
          const side = Math.min(texture.width, texture.height);
          ctx.drawImage(texture, (texture.width - side) / 2, (texture.height - side) / 2, side, side, cx - r, cy - r, r * 2, r * 2);
          ctx.fillStyle = 'rgba(15,28,38,.42)';
        } else {
          ctx.fillStyle = '#172b3b';
        }
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        const words = spec.name.split(' ');
        const lines = [];
        let size = r * 0.3;
        const fit = () => {
          lines.length = 0;
          ctx.font = '700 ' + size + 'px Archivo';
          let line = '';
          for (const word of words) {
            const next = line ? line + ' ' + word : word;
            if (ctx.measureText(next).width > r * 1.55 && line) { lines.push(line); line = word; } else line = next;
          }
          lines.push(line);
          return lines.length <= 3 && lines.every((text) => ctx.measureText(text).width <= r * 1.55);
        };
        while (!fit() && size > 6) size -= 0.5;
        const total = lines.length * size * 1.08;
        lines.forEach((text, i) => ctx.fillText(text, cx, cy - total / 2 + size * (i + 0.85) * 1.08 - r * 0.08));
        ctx.font = '500 ' + r * 0.17 + 'px Archivo';
        ctx.fillText(spec.size, cx, cy + total / 2 + r * 0.22);
      }
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
        if (format.container !== 'cubo') {
          writeFileSync(labelHtml, labelPage(product, format, template));
          shoot(labelHtml, labelPng, template.width * MM, template.height * MM);
        }

        const packHtml = join(work, 'envase.html');
        const packPng = join(work, 'envase.png');
        writeFileSync(packHtml, packPage(entry, product, format, template, `file://${labelPng}`));
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
