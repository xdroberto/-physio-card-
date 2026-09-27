// Genera public/og.png (1200x630, vista previa al compartir por WhatsApp) e íconos PNG a partir
// de la marca (reverso de la tarjeta: negro, wordmark, firma, tagline, citas). Se corre a mano.
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadPlaywright } from './pw.mjs';
import { esc } from './html.mjs';
import { loadBrand, inlineSvg, faviconSvg } from './brand.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(await readFile(path.join(ROOT, 'card.config.json'), 'utf8'));
const { person, contact, hero, theme: t } = cfg;
const host = new URL(cfg.site.url).host;
const brand = await loadBrand(path.join(ROOT, 'public'));
const b64 = (f) => readFile(path.join(ROOT, 'public/fonts', f)).then((b) => b.toString('base64'));
const italiana = await b64('italiana-400.woff2');
const jost = await b64('jost-var.woff2');
const phone = contact.phone_display || contact.whatsapp;

const ogHtml = `<!doctype html><html lang="es-MX"><meta charset="utf-8"><style>
@font-face{font-family:Italiana;src:url(data:font/woff2;base64,${italiana}) format("woff2")}
@font-face{font-family:Jost;src:url(data:font/woff2;base64,${jost}) format("woff2");font-weight:100 900}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{font-family:Jost,system-ui,sans-serif;background:${t.black};color:${t.cream};position:relative;padding:64px 80px;box-sizing:border-box}
.motif{position:absolute;right:-120px;top:-40px;width:720px;height:auto;color:${t.cream};opacity:.11}
.wordmark{width:300px;height:auto;color:${t.cream};display:block}
.firma{width:260px;height:auto;color:${t.cream};display:block;margin-top:14px}
h1{font-family:Italiana,serif;font-weight:400;font-size:88px;line-height:.98;margin:54px 0 0;max-width:820px;position:relative}
.row{position:absolute;left:80px;right:80px;bottom:64px;display:flex;justify-content:space-between;align-items:flex-end}
.citas span{display:block;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:${t.muted_on_dark}}
.citas b{font-size:52px;font-weight:300}
.zona{text-align:right;font-size:26px;font-weight:300;color:${t.muted_on_dark};line-height:1.35}
.zona .url{color:${t.cream};font-weight:500}
</style><body>
${inlineSvg(brand.logo, { className: 'motif' })}
${inlineSvg(brand.wordmark, { className: 'wordmark' })}
${inlineSvg(brand.firma, { className: 'firma' })}
<h1>${esc(hero.headline)}</h1>
<div class="row"><div class="citas"><span>${esc(contact.phone_label || 'Citas')}</span><b>${esc(phone)}</b></div>
<div class="zona">${esc(person.zone || person.city)}<br>${esc(person.cedula_label || 'Céd. Prof.')} ${esc(person.cedula)}<br><span class="url">${esc(host)}</span></div></div>
</body></html>`;

const iconSvg = faviconSvg(brand, { cream: t.cream, black: t.black });
const iconHtml = (size) =>
  `<!doctype html><html><meta charset="utf-8"><style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style><body>${iconSvg}</body></html>`;

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(ogHtml, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await writeFile(path.join(ROOT, 'public/og.png'), await page.screenshot({ type: 'png' }));
for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(iconHtml(size), { waitUntil: 'load' });
  await writeFile(path.join(ROOT, 'public', file), await page.screenshot({ type: 'png', omitBackground: true }));
}
await browser.close();
console.log('✓ public/og.png e íconos generados');
