// Capturas móviles de dist/ para revisar el diseño (iPhone 13 y un Android chico).
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, serveDir } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = process.env.SHOTS_DIR || path.join(ROOT, 'screenshots');
const PORT = 4179;

const { chromium, devices } = loadPlaywright();
const server = await serveDir(DIST, PORT);
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

const targets = [
  { name: 'iphone13', device: devices['iPhone 13'] },
  { name: 'android-small', device: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 } } },
];
for (const t of targets) {
  const ctx = await browser.newContext({ ...t.device, locale: 'es-MX', colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/?src=test`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, `${t.name}-fold.png`) });
  await page.screenshot({ path: path.join(OUT, `${t.name}-full.png`), fullPage: true });
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${t.name}-scrolled.png`) });
  await page.goto(`http://127.0.0.1:${PORT}/#qr`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${t.name}-qr.png`) });
  await ctx.close();
}
const ctx = await browser.newContext({ viewport: { width: 900, height: 1200 } });
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${PORT}/imprimir.html`, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: path.join(OUT, 'hoja-qr.pdf'), format: 'Letter', printBackground: true });
await page.emulateMedia({ media: 'screen' });
await page.screenshot({ path: path.join(OUT, 'imprimir.png'), fullPage: true });
await browser.close();
server.close();
console.log('✓ capturas en', OUT);
