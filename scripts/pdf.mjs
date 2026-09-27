// Genera los PDF de las hojas para imprimir (carta) y comprueba que cada una sea UNA página.
import path from 'node:path';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, serveDir } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.PDF_DIR || path.join(ROOT, 'screenshots');
const PORT = 4187;
await mkdir(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const server = await serveDir(path.join(ROOT, 'dist'), PORT);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
let failed = false;
for (const [file, out] of [['imprimir.html', 'hoja-qr-tarjeta.pdf'], ['imprimir-whatsapp.html', 'hoja-qr-respaldo-whatsapp.pdf']]) {
  await page.goto(`http://127.0.0.1:${PORT}/${file}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  const bottom = await page.evaluate(() => document.querySelector('.fallback').getBoundingClientRect().bottom);
  const target = path.join(OUT, out);
  await page.pdf({ path: target, format: 'Letter', printBackground: true, preferCSSPageSize: true });
  const pages = ((await readFile(target)).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const ok = pages === 1 && bottom <= 10.6 * 96;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✗'} ${out}: ${pages} página(s), respaldo termina a ${(bottom / 96).toFixed(2)} in`);
}
await browser.close();
server.close();
if (failed) process.exit(1);
