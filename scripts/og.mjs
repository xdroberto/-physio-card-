// Genera public/og.png (1200x630, vista previa al compartir por WhatsApp) e íconos PNG.
// Se corre a mano cuando cambian nombre, título o colores; los PNG se versionan en public/.
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadPlaywright } from './pw.mjs';
import { esc } from './html.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(await readFile(path.join(ROOT, 'card.config.json'), 'utf8'));
const { person, og, theme: t } = cfg;
const host = new URL(cfg.site.url).host;

const ogHtml = `<!doctype html><html lang="es-MX"><meta charset="utf-8"><style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:#FFFFFF;color:${t.ink};display:flex;align-items:center;padding:0 84px;box-sizing:border-box;position:relative}
.bar{position:absolute;left:0;top:0;bottom:0;width:22px;background:${t.accent}}
.avatar{width:220px;height:220px;border-radius:50%;background:${t.accent};color:#fff;display:grid;place-items:center;font-size:92px;font-weight:800;flex:none;box-shadow:0 0 0 10px #fff,0 0 0 14px ${t.accent}}
.txt{margin-left:64px}
.eyebrow{font-size:26px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${t.accent};margin:0 0 10px}
h1{font-size:68px;line-height:1.05;margin:0 0 14px;letter-spacing:-.02em}
p{font-size:32px;line-height:1.3;margin:0;color:${t.muted};max-width:760px}
.url{margin-top:28px;display:inline-block;font-size:28px;font-weight:800;color:#fff;background:${t.whatsapp};padding:12px 26px;border-radius:999px}
</style><body><div class="bar"></div>
<div class="avatar">${esc(person.initials || 'P')}</div>
<div class="txt"><p class="eyebrow">Fisioterapia a domicilio · Querétaro</p><h1>${esc(person.name)}</h1><p>${esc(person.title)} · Cédula profesional ${esc(person.cedula)}. Recuperación post carrera, lesiones y columna. Voy a tu casa con camilla y equipo.</p><span class="url">${esc(host)}</span></div>
</body></html>`;

const iconSvg = await readFile(path.join(ROOT, 'public/favicon.svg'), 'utf8');
const iconHtml = (size) =>
  `<!doctype html><html><meta charset="utf-8"><style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style><body>${iconSvg}</body></html>`;

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(ogHtml, { waitUntil: 'load' });
await writeFile(path.join(ROOT, 'public/og.png'), await page.screenshot({ type: 'png' }));
for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(iconHtml(size), { waitUntil: 'load' });
  await writeFile(path.join(ROOT, 'public', file), await page.screenshot({ type: 'png', omitBackground: true }));
}
await browser.close();
console.log('✓ public/og.png e íconos generados');
