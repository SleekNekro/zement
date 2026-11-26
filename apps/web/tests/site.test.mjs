// Comprobaciones de la web ya compilada (apps/web/dist): enlaces internos y metadatos por página.
// Se ejecuta con `pnpm test` después de `pnpm build`. Sin dependencias: node:test y node:fs.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const dist = new URL('../dist/', import.meta.url).pathname;

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return files.flat();
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** Fichero de dist que sirve una URL interna (/ruta/ → /ruta/index.html). */
function fileFor(url) {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  return join(dist, path.endsWith('/') ? `${path}index.html` : path);
}

const pages = await htmlFiles(dist);
const pageList = pages.map((page) => ({ page, name: `/${relative(dist, page)}` }));

test('hay páginas compiladas', () => {
  assert.ok(pages.length > 0, 'Ejecuta `pnpm build` antes de las pruebas');
});

for (const { page, name } of pageList) {
  test(`${name}: enlaces internos y recursos existen`, async () => {
    const html = await readFile(page, 'utf8');
    const urls = [...html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)].map((match) => match[1]);
    const missing = [];
    for (const url of new Set(urls)) {
      if (url.startsWith('//') || url.startsWith('/api/')) continue;
      if (!(await exists(fileFor(url)))) missing.push(url);
    }
    assert.deepEqual(missing, [], `Enlaces rotos en ${name}`);
  });

  test(`${name}: metadatos básicos`, async () => {
    const html = await readFile(page, 'utf8');
    assert.match(html, /<html lang="(es|en)"/, 'falta lang');
    assert.match(html, /<title>[^<]+<\/title>/, 'falta title');
    assert.match(html, /<meta name="description" content="[^"]+"/, 'falta description');
    assert.match(html, /<meta name="robots" content="[^"]+"/, 'falta robots');
    if (!name.endsWith('/404.html')) {
      assert.match(html, /<link rel="canonical" href="[^"]+"/, 'falta canonical');
    }
  });
}
