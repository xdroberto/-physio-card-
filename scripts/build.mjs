// Build: card.config.json -> dist/ (HTML estático, vCard, QRs, hojas para imprimir).
// Sin frameworks: un JSON de datos y funciones de render con template literals.
import { readFile, writeFile, mkdir, rm, cp, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildVCard } from './vcard.mjs';
import { qrUrl, qrSvg, qrPng } from './qr.mjs';
import { renderIndex } from './render-index.mjs';
import { renderPrint } from './render-print.mjs';
import { render404, renderManifest, renderRobots, renderSitemap } from './render-misc.mjs';
import { loadBrand, writeBrandVariants, faviconSvg } from './brand.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

export function validate(cfg) {
  const problems = [];
  const wa = String(cfg.contact?.whatsapp || '');
  if (!/^\d{11,15}$/.test(wa)) {
    problems.push(
      `contact.whatsapp debe ser el número con lada de país y SIN "+", solo dígitos (ej. 524421234567). Valor actual: "${wa}"`,
    );
  }
  if (!/^https:\/\/[^/\s]+(\/[^\s?#]*)?$/.test(cfg.site?.url || '')) {
    problems.push(`site.url debe ser https://dominio/ (o https://usuario.github.io/repo/). Valor actual: "${cfg.site?.url}"`);
  }
  if (!cfg.person?.name) problems.push('person.name es obligatorio');
  const disp = String(cfg.contact?.phone_display || '').replace(/\D/g, '');
  if (disp && !wa.endsWith(disp)) {
    problems.push(`contact.phone_display "${cfg.contact.phone_display}" no coincide con contact.whatsapp "${wa}"`);
  }
  for (const [k, v] of Object.entries(cfg.theme || {})) {
    if (!/^#[0-9a-fA-F]{6}$/.test(String(v))) problems.push(`theme.${k} debe ser un color hex de 6 dígitos. Valor actual: "${v}"`);
  }
  if (!cfg.whatsapp?.greeting_event || !cfg.whatsapp?.ask) {
    problems.push('whatsapp.greeting_event y whatsapp.ask son obligatorios (arman el mensaje prellenado)');
  }
  if (cfg.promo?.enabled && !cfg.whatsapp?.promo_message) problems.push('whatsapp.promo_message es obligatorio con la promo activa');
  for (const it of cfg.pains?.items || []) {
    if (!it.message && !it.zone) problems.push(`pains.items "${it.label}" necesita "zone" o "message"`);
  }
  if (cfg.promo?.enabled) {
    for (const k of ['price', 'regular_price', 'until']) {
      if (!cfg.promo[k]) problems.push(`promo.${k} es obligatorio mientras promo.enabled sea true`);
    }
    if (cfg.promo.until && !/^\d{4}-\d{2}-\d{2}$/.test(cfg.promo.until)) {
      problems.push(`promo.until debe ser una fecha AAAA-MM-DD. Valor actual: "${cfg.promo.until}"`);
    }
  }
  return problems;
}

export async function loadConfig(file = path.join(ROOT, 'card.config.json')) {
  const cfg = JSON.parse(await readFile(file, 'utf8'));
  cfg.build_date = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
  return cfg;
}

export function formatMxPhone(digits) {
  // 52 442 123 4567 -> +52 442 123 4567 ; otros países: +CC resto
  if (/^52\d{10}$/.test(digits)) {
    return `+52 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return digits ? `+${digits}` : '';
}

export function formatLongDate(iso) {
  // 2026-10-11 -> "11 de octubre"
  const [y, m, d] = iso.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d} de ${meses[m - 1]}${y !== new Date().getFullYear() ? ' de ' + y : ''}`;
}

export function fillTokens(text, promo) {
  if (!text) return '';
  return text
    .replace(/\{price\}/g, promo?.price || '')
    .replace(/\{regular_price\}/g, promo?.regular_price || '')
    .replace(/\{until\}/g, promo?.until ? formatLongDate(promo.until) : '');
}

export function derive(cfg) {
  const wa = String(cfg.contact.whatsapp || '');
  const w = cfg.whatsapp || {};
  const prefillEvent = [w.greeting_event, w.ask].filter(Boolean).join(' ');
  const prefillGeneric = [w.greeting_generic || w.greeting_event, w.ask].filter(Boolean).join(' ');
  const base = cfg.site.url.replace(/\/?$/, '/');
  const waBase = `https://wa.me/${wa}?text=`;
  const promo = cfg.promo?.enabled ? { ...cfg.promo, title: fillTokens(cfg.promo.title, cfg.promo), text: fillTokens(cfg.promo.text, cfg.promo) } : null;
  const pains = (cfg.pains?.items || []).map((it) => {
    const message = it.message || (w.symptom_template || '{zona}').replace(/\{zona\}/g, it.zone || '');
    return { label: it.label, message, link: waBase + encodeURIComponent(message) };
  });
  return {
    baseUrl: base,
    basePath: new URL(base).pathname,
    host: new URL(base).host,
    waBase,
    prefillEvent,
    prefillGeneric,
    waLink: waBase + encodeURIComponent(prefillEvent),
    waLinkPromo: waBase + encodeURIComponent(w.promo_message || prefillEvent),
    pains,
    telLink: `tel:+${wa}`,
    phoneDisplay: cfg.contact.phone_display || formatMxPhone(wa),
    vcfName: cfg.contact.vcard_filename || 'contacto.vcf',
    qrSheetUrl: qrUrl(base, cfg.site.source_print || 'qr-hoja'),
    qrScreenUrl: qrUrl(base, cfg.site.source_screen || 'qr-tel'),
    promo,
    printPromoLine: cfg.promo?.enabled ? fillTokens(cfg.print?.promo_line, cfg.promo) : '',
  };
}

export async function build({ allowPlaceholders = process.env.ALLOW_PLACEHOLDERS === '1', outDir = DIST } = {}) {
  const cfg = await loadConfig();
  const problems = validate(cfg);
  if (problems.length) {
    const msg = ['card.config.json tiene datos pendientes:', ...problems.map((p) => `  • ${p}`)].join('\n');
    if (!allowPlaceholders) {
      throw new Error(msg + '\n\nCorrige card.config.json (o exporta ALLOW_PLACEHOLDERS=1 solo para previsualizar).');
    }
    console.warn('⚠ ' + msg + '\n  (ALLOW_PLACEHOLDERS=1: se construye igual, NO publicar así)');
  }

  const d = derive(cfg);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const svgScreen = await qrSvg(d.qrScreenUrl, { ecl: 'M', margin: 2 });
  const svgPrint = await qrSvg(d.qrSheetUrl, { ecl: 'H', margin: 4 });
  const pngPrint = await qrPng(d.qrSheetUrl, { ecl: 'H', margin: 4, width: 1600 });
  // Respaldo: QR directo a WhatsApp, por si el dominio no está listo. Más denso, ECL M.
  const svgWa = await qrSvg(d.waLink, { ecl: 'M', margin: 4 });
  const pngWa = await qrPng(d.waLink, { ecl: 'M', margin: 4, width: 1600 });

  const brand = await loadBrand(PUBLIC);
  const ctx = { cfg, d, svgScreen, svgPrint, svgWa, brand };
  await writeFile(path.join(outDir, 'index.html'), renderIndex(ctx));
  await writeFile(path.join(outDir, 'imprimir.html'), renderPrint(ctx, { mode: 'site' }));
  await writeFile(path.join(outDir, 'imprimir-whatsapp.html'), renderPrint(ctx, { mode: 'wa' }));
  await writeFile(path.join(outDir, '404.html'), render404(ctx));
  await writeFile(path.join(outDir, d.vcfName), buildVCard(cfg));
  await writeFile(path.join(outDir, 'qr.svg'), svgScreen);
  await writeFile(path.join(outDir, 'qr-print.svg'), svgPrint);
  await writeFile(path.join(outDir, 'qr-print.png'), pngPrint);
  await writeFile(path.join(outDir, 'qr-whatsapp.svg'), svgWa);
  await writeFile(path.join(outDir, 'qr-whatsapp.png'), pngWa);
  await writeFile(path.join(outDir, 'manifest.webmanifest'), renderManifest(ctx));
  await writeFile(path.join(outDir, 'robots.txt'), renderRobots(ctx));
  await writeFile(path.join(outDir, 'sitemap.xml'), renderSitemap(ctx));
  await writeFile(path.join(outDir, '.nojekyll'), '');
  if (cfg.site.github_pages_cname && !d.host.endsWith('.github.io')) await writeFile(path.join(outDir, 'CNAME'), d.host + '\n');

  if (existsSync(PUBLIC)) await cp(PUBLIC, outDir, { recursive: true });
  await writeBrandVariants(brand, outDir, { black: cfg.theme.black, cream: cfg.theme.cream });
  await writeFile(path.join(outDir, 'favicon.svg'), faviconSvg(brand, { cream: cfg.theme.cream, black: cfg.theme.black }));

  const size = (await stat(path.join(outDir, 'index.html'))).size;
  return { cfg, d, indexBytes: size, problems };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  build()
    .then(({ d, indexBytes }) => {
      console.log(`✓ dist/ listo · index.html ${(indexBytes / 1024).toFixed(1)} KB`);
      console.log(`  QR hoja impresa  → ${d.qrSheetUrl}   (dist/imprimir.html, dist/qr-print.png)`);
      console.log(`  QR en teléfono   → ${d.qrScreenUrl}   (index.html#qr)`);
      console.log(`  QR de respaldo   → wa.me directo      (dist/imprimir-whatsapp.html, dist/qr-whatsapp.png)`);
      console.log(`  WhatsApp         → ${d.waLink.slice(0, 70)}…`);
    })
    .catch((err) => {
      console.error('✗ ' + err.message);
      process.exit(1);
    });
}
