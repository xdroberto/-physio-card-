import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, readdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { build, validate, derive, formatMxPhone, formatLongDate, fillTokens, loadConfig } from '../scripts/build.mjs';
import { buildVCard, splitName } from '../scripts/vcard.mjs';
import { qrUrl, qrSvg } from '../scripts/qr.mjs';
import { esc } from '../scripts/html.mjs';
import { renderIndex } from '../scripts/render-index.mjs';
import { renderPrint } from '../scripts/render-print.mjs';
import { loadBrand } from '../scripts/brand.mjs';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const outDir = await mkdtemp(path.join(os.tmpdir(), 'physio-card-'));
const result = await build({ allowPlaceholders: true, outDir });
const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
const print = await readFile(path.join(outDir, 'imprimir.html'), 'utf8');
const cfg = result.cfg;
const d = result.d;
const realNumber = /^\d{11,15}$/.test(String(cfg.contact.whatsapp));

test('config: el número de WhatsApp está capturado (si falla, edita card.config.json)', { skip: !realNumber && process.env.ALLOW_PLACEHOLDERS === '1' ? 'preview local con placeholders' : false }, () => {
  assert.equal(validate(cfg).length, 0, 'card.config.json tiene placeholders:\n' + validate(cfg).join('\n'));
});

test('validate: rechaza placeholders y acepta un número real', () => {
  const bad = structuredClone(cfg); bad.contact.whatsapp = '52XXXXXXXXXX';
  assert.ok(validate(bad).some((p) => p.includes('contact.whatsapp')));
  const good = structuredClone(cfg); good.contact.whatsapp = '524421234567'; good.contact.phone_display = '';
  assert.equal(validate(good).filter((p) => p.includes('whatsapp')).length, 0);
  const mismatch = structuredClone(cfg); mismatch.contact.whatsapp = '524421234567';
  assert.ok(validate(mismatch).some((p) => p.includes('phone_display')), 'phone_display debe coincidir con el número');
});

test('formatMxPhone: formato legible para México', () => {
  assert.equal(formatMxPhone('524421234567'), '+52 442 123 4567');
  assert.equal(formatMxPhone('14795551234'), '+14795551234');
});

test('derive: wa.me con mensaje prellenado codificado y tel: en E.164', () => {
  const good = structuredClone(cfg); good.contact.whatsapp = '524421234567';
  const dd = derive(good);
  assert.ok(dd.waLink.startsWith('https://wa.me/524421234567?text='));
  assert.ok(dd.waLink.includes(encodeURIComponent('MTB')), 'el prellenado debe mencionar la carrera MTB');
  assert.equal(decodeURIComponent(dd.waLink.split('text=')[1]), `${cfg.whatsapp.greeting_event} ${cfg.whatsapp.ask}`);
  assert.equal(decodeURIComponent(dd.waLinkPromo.split('text=')[1]), cfg.whatsapp.promo_message);
  assert.equal(dd.pains.length, cfg.pains.items.length);
  assert.ok(dd.pains[0].message.includes('la rodilla o la cadera al pedalear'), 'plantilla de síntoma con la zona');
  assert.ok(dd.pains.every((p) => p.message.includes('MTB')), 'cada chip menciona la carrera');
  assert.ok(dd.pains.every((p) => p.link.startsWith('https://wa.me/524421234567?text=')));
  assert.equal(dd.telLink, 'tel:+524421234567');
  assert.equal(dd.qrSheetUrl, `${d.baseUrl}?src=qr-hoja`);
  assert.equal(dd.qrScreenUrl, `${d.baseUrl}?src=qr-tel`);
});

test('promo: tokens y fecha larga en español, y el build exige sus campos', async () => {
  assert.equal(formatLongDate('2026-10-11').replace(/ de 20\d\d$/, ''), '11 de octubre');
  assert.equal(fillTokens('A {price} en vez de {regular_price} hasta el {until}', { price: '$650', regular_price: '$800', until: '2026-10-11' }).replace(/ de 20\d\d$/, ''), 'A $650 en vez de $800 hasta el 11 de octubre');
  const bad = structuredClone(cfg); bad.promo.enabled = true; bad.promo.until = '11/10/2026';
  assert.ok(validate(bad).some((p) => p.includes('promo.until')));
  const off = structuredClone(cfg); off.promo.enabled = false; off.promo.until = '';
  assert.equal(validate(off).filter((p) => p.includes('promo')).length, 0);
  assert.equal(derive(off).printPromoLine, '', 'con la promo apagada la hoja no lleva la línea de promo');
  const brand = await loadBrand(path.resolve('public'));
  const sheet = renderPrint({ cfg: off, d: derive(off), svgPrint: '<svg></svg>', svgWa: '<svg></svg>', brand });
  assert.ok(!sheet.includes('class="promo"'));
});

test('qrUrl: agrega src sin romper la URL', () => {
  assert.equal(qrUrl('https://paola.robertobh.dev/', 'x'), 'https://paola.robertobh.dev/?src=x');
  assert.equal(qrUrl('https://paola.robertobh.dev/', ''), 'https://paola.robertobh.dev/');
  assert.equal(qrUrl('https://xdroberto.github.io/-physio-card-/', 'qr-hoja'), 'https://xdroberto.github.io/-physio-card-/?src=qr-hoja');
});

test('site.url con ruta (github.io/repo/): manifest, 404 y QR respetan la base y no se escribe CNAME', async () => {
  const gh = structuredClone(cfg); gh.site.url = 'https://xdroberto.github.io/-physio-card-/';
  assert.equal(validate(gh).length, 0, validate(gh).join('\n'));
  const dd = derive(gh);
  assert.equal(dd.basePath, '/-physio-card-/');
  assert.equal(dd.qrSheetUrl, 'https://xdroberto.github.io/-physio-card-/?src=qr-hoja');
  const { renderManifest, render404 } = await import('../scripts/render-misc.mjs');
  const m = JSON.parse(renderManifest({ cfg: gh, d: dd }));
  assert.equal(m.start_url, '/-physio-card-/?src=inicio#qr');
  assert.equal(m.icons[0].src, '/-physio-card-/icon-192.png');
  assert.ok(render404({ cfg: gh, d: dd }).includes('url=/-physio-card-/'));
  const bad = structuredClone(cfg); bad.site.url = 'https://paola.robertobh.dev/?x=1';
  assert.ok(validate(bad).some((p) => p.includes('site.url')));
});

test('index.html: CTAs y metadatos esenciales', () => {
  assert.match(html, /<html lang="es-MX">/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">/);
  assert.ok(html.includes(`href="${d.waLink}"`), 'CTA WhatsApp principal');
  assert.ok(html.includes(`href="${d.vcfName}"`) && !html.includes(`href="${d.vcfName}" download`), 'CTA guardar contacto sin atributo download (iOS abre la ficha directo)');
  assert.ok(html.includes(`href="${d.telLink}"`), 'enlace tel:');
  assert.match(html, /<dialog class="qr"/);
  assert.match(html, /<svg[^>]*>[\s\S]*<\/svg>/, 'QR inline');
  assert.ok(html.includes(`property="og:image" content="${d.baseUrl}og.png"`), 'og:image absoluta en la URL publicada');
  assert.match(html, /"@type":"Physiotherapy"/);
  assert.ok(html.includes(cfg.person.cedula), 'cédula visible');
  assert.equal((html.match(/<a [^>]*data-wa="main"/g) || []).length, 4, 'hero, así funciona, contacto y barra fija llevan el mensaje principal');
  assert.equal((html.match(/class="pain" href="https:\/\/wa\.me\//g) || []).length, cfg.pains.items.length, 'chips de dolor como enlaces directos a WhatsApp');
  for (const p of d.pains) assert.ok(html.includes(`href="${p.link}"`), `chip ${p.label}`);
  assert.ok(html.includes(`href="${d.waLinkPromo}"`), 'CTA de la promo con su mensaje');
  assert.ok(!/target="_blank"[^>]*wa\.me|wa\.me[^>]*target="_blank"/.test(html), 'wa.me sin target _blank: en móvil abre la app directo');
  assert.ok(html.includes(esc(cfg.promo.price)) && html.includes(`${esc(cfg.promo.regular_price)}</s>`), 'promo con precio y precio regular tachado');
  assert.ok(html.includes(`${esc(cfg.how.price_label)}: <b class="num">${esc(cfg.how.price)}</b>`), 'precio regular publicado');
  assert.ok(html.includes(d.phoneDisplay), 'el teléfono de la tarjeta impresa, tal cual');
  assert.ok(html.includes(esc(cfg.hero.headline)), 'la frase de la tarjeta impresa');
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  assert.ok(!visible.includes(d.host), 'el dominio no aparece como texto en la página');
  assert.ok(html.includes(`data-until="${cfg.promo.until}"`), 'la promo lleva su fecha de vencimiento');
  assert.ok(d.pains.every((p) => p.message.startsWith(cfg.whatsapp.greeting_event)), 'cada chip empieza con el saludo del evento (el reemplazo por src=compartido depende de ello)');
  assert.ok(html.includes('aria-label="Copiar cédula profesional') && html.includes('<span class="sr-only">antes </span>'), 'accesibilidad: cédula y precio tachado');
  assert.ok(!html.includes('say(C.brightness)') && html.includes('class="qr__tip"'), 'el aviso de brillo vive dentro del modal');
  assert.ok(html.includes("start_url") === false, 'start_url no va en el HTML');
  assert.ok(html.includes('fonts/italiana-400.woff2') && html.includes('fonts/jost-var.woff2'), 'tipografías de la tarjeta autoalojadas');
  assert.ok(html.includes('class="motif"') && html.includes('class="wordmark"') && html.includes('brand/firma-cream.svg'), 'logo, wordmark y firma de la tarjeta');
  assert.ok(html.includes('#FBEEE6') && html.includes('#0A0A0A'), 'paleta crema y negro de la tarjeta');
  assert.ok(html.includes('id="copy-cedula"'), 'tocar la cédula la copia');
  assert.equal((html.match(/<section/g) || []).length, 5, 'hero + 5 secciones = 6 bloques');
  assert.ok(html.includes(cfg.person.cedula_verify_url), 'enlace para verificar cédula');
  assert.ok(html.includes('wakeLock'), 'wake lock en el modal QR');
});

test('index.html: sin requests a terceros (salvo Umami si está configurado)', () => {
  const urls = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  const allowed = /^(https:\/\/wa\.me\/|https:\/\/instagram\.com\/|https:\/\/stats\.robertobh\.dev\/|https:\/\/www\.cedulaprofesional\.sep\.gob\.mx\/)/;
  const bad = urls.filter((u) => !allowed.test(u) && !u.startsWith(d.baseUrl));
  assert.deepEqual(bad, [], 'requests externos inesperados');
  assert.ok(!/fonts\.googleapis|fonts\.gstatic|cdn\./.test(html), 'sin fuentes ni CDNs externos (las fuentes van autoalojadas)');
});

test('index.html: peso bajo para 3G en el cerro', async () => {
  assert.ok(result.indexBytes < 60 * 1024, `index.html pesa ${result.indexBytes} bytes`);
  const refs = new Set([...html.matchAll(/(?:src|href)="((?:fonts|brand)\/[^"]+)"/g)].map((m) => m[1]).concat([...html.matchAll(/url\((fonts\/[^)]+)\)/g)].map((m) => m[1])));
  let total = result.indexBytes;
  for (const f of refs) total += (await readFile(path.join(outDir, f))).length;
  assert.ok(total < 150 * 1024, `primera carga (html + fuentes + marca) pesa ${total} bytes en ${refs.size + 1} archivos`);
});

test('index.html: copy sin em-dashes ni placeholders sin resolver', () => {
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  assert.ok(!text.includes('—'), 'hay em-dash en el copy');
  assert.ok(!/\{[A-Z_]+\}/.test(text), 'quedó un marcador {ASI} en el copy');
});

test('imprimir.html: QR grande, número de respaldo y dominio', () => {
  assert.match(print, /size: letter portrait/);
  assert.match(print, /<svg[^>]*>[\s\S]*<\/svg>/);
  assert.ok(print.includes(d.phoneDisplay));
  assert.ok(!print.includes(d.host), 'la hoja no muestra el dominio');
  assert.ok(print.includes(`precio regular ${esc(cfg.promo.regular_price)}`), 'la hoja ancla el precio regular');
  assert.ok(print.includes(esc(cfg.promo.price)), 'la hoja anuncia la promo con precio');
  assert.ok(print.includes(formatLongDate(cfg.promo.until).replace(/ de 20\d\d$/, '')), 'fecha de vencimiento en formato largo');
  assert.ok(!print.includes('page-break-after'), 'la hoja no fuerza salto de página');
  assert.ok(print.includes('class="logo"') && print.includes('brand/firma-black.svg'), 'la hoja lleva el frente de la tarjeta');
});

test('imprimir-panfletos.html: 15 tarjetitas con QR, teléfono y marca', async () => {
  const fl = await readFile(path.join(outDir, 'imprimir-panfletos.html'), 'utf8');
  assert.equal((fl.match(/class="mini"/g) || []).length, 15);
  assert.equal((fl.match(/<svg/g) || []).length >= 16, true, 'QR grande + 15 QR chicos');
  assert.equal((fl.match(new RegExp(d.phoneDisplay.replace(/\s/g, '\\s'), 'g')) || []).length, 16, 'teléfono en la hoja y en cada tarjetita');
  assert.ok(!fl.includes(d.host), 'sin dominio visible');
  const tabSvg = await qrSvg(`${d.baseUrl}?src=qr-panfleto`, { ecl: 'M', margin: 2 });
  assert.ok(fl.includes(tabSvg), 'las tarjetitas llevan su propio QR con fuente qr-panfleto');
});

test('imprimir-whatsapp.html: hoja de respaldo con QR directo a wa.me', async () => {
  const wa = await readFile(path.join(outDir, 'imprimir-whatsapp.html'), 'utf8');
  assert.match(wa, /RESPALDO/);
  assert.match(wa, /<svg[^>]*>[\s\S]*<\/svg>/);
  assert.notEqual(wa, print);
  assert.ok(!wa.includes('class="url"'), 'la hoja de respaldo no anuncia el dominio (puede no existir aún)');
  assert.ok(wa.includes(d.phoneDisplay), 'la hoja de respaldo sí lleva el número');
});

test('vCard: estructura 3.0, CRLF, escapes y nombre partido', () => {
  const good = structuredClone(cfg); good.contact.whatsapp = '524421234567'; good.contact.email = 'p@example.com';
  const v = buildVCard(good);
  assert.ok(v.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n'));
  assert.ok(v.endsWith('END:VCARD\r\n'));
  assert.ok(v.includes('N:García Moctezuma;Paola;;;'));
  assert.ok(v.includes('FN:Paola García Moctezuma'));
  assert.ok(v.includes('TEL;TYPE=CELL,VOICE:+524421234567'));
  assert.ok(v.includes('EMAIL;TYPE=INTERNET,PREF:p@example.com'));
  assert.ok(v.includes(`URL:${d.baseUrl}`));
  for (const line of v.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, `línea > 75 bytes: ${line}`);
  assert.deepEqual(splitName('Paola García Moctezuma'), { given: 'Paola', family: 'García Moctezuma' });
});

test('dist: archivos esperados', async () => {
  const files = await readdir(outDir);
  for (const f of ['index.html', 'imprimir.html', 'imprimir-whatsapp.html', 'imprimir-panfletos.html', '404.html', 'qr.svg', 'qr-print.svg', 'qr-print.png', 'qr-whatsapp.svg', 'qr-whatsapp.png', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', '.nojekyll', d.vcfName, 'og.png', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
    assert.ok(files.includes(f), `falta ${f}`);
  }
  const wantsCname = cfg.site.github_pages_cname && !d.host.endsWith('.github.io');
  assert.equal(files.includes('CNAME'), wantsCname, 'CNAME solo con dominio propio');
  for (const f of ['fonts/italiana-400.woff2', 'fonts/jost-var.woff2', 'brand/logo-black.svg', 'brand/logo-cream.svg', 'brand/wordmark-black.svg', 'brand/firma-cream.svg', 'brand/firma-black.svg']) {
    assert.ok((await readFile(path.join(outDir, f))).length > 500, `falta o está vacío ${f}`);
  }
  if (wantsCname) assert.equal((await readFile(path.join(outDir, 'CNAME'), 'utf8')).trim(), d.host);
});

test('publicado: la vCard de dist lleva el mismo número, nombre y URL que la página', async () => {
  const v = await readFile(path.join(outDir, d.vcfName), 'utf8');
  assert.ok(v.includes(`TEL;TYPE=CELL,VOICE:+${cfg.contact.whatsapp}`));
  assert.ok(v.includes(`FN:${cfg.person.name}`));
  assert.ok(v.includes(`URL:${d.baseUrl}`));
});

test('publicado: los QR decodifican a las URL correctas', async () => {
  const decode = async (f) => {
    const png = PNG.sync.read(await readFile(path.join(outDir, f)));
    const r = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    return r ? r.data : null;
  };
  assert.equal(await decode('qr-print.png'), d.qrSheetUrl);
  assert.equal(await decode('qr-whatsapp.png'), d.waLink);
  const sheetSvg = await qrSvg(d.qrSheetUrl, { ecl: 'H', margin: 4 });
  const waSvg = await qrSvg(d.waLink, { ecl: 'M', margin: 4 });
  const wa = await readFile(path.join(outDir, 'imprimir-whatsapp.html'), 'utf8');
  assert.ok(print.includes(sheetSvg) && !print.includes(waSvg), 'la hoja principal lleva el QR del sitio');
  assert.ok(wa.includes(waSvg) && !wa.includes(sheetSvg), 'la hoja de respaldo lleva el QR de WhatsApp');
});

test('seguridad: texto hostil en la config no rompe el HTML', async () => {
  const evil = structuredClone(cfg);
  evil.person.name = 'Ana "Q" <b>x</b></script><script>alert(1)</script>';
  evil.og.title = '</script><img src=x onerror=alert(1)>';
  evil.person.title = 'Fisio" onmouseover="alert(1)';
  const brand = await loadBrand(path.resolve('public'));
  const out = renderIndex({ cfg: evil, d: derive(evil), svgScreen: '<svg></svg>', brand });
  assert.ok(!out.includes('<script>alert(1)</script>'), 'script inyectado en el cuerpo');
  assert.ok(!out.includes('</script><img'), 'cierre de script inyectado en JSON');
  assert.ok(!/onmouseover="alert/.test(out), 'atributo inyectado');
  const bad = structuredClone(cfg); bad.theme.cream = 'red';
  assert.ok(validate(bad).some((p) => p.includes('theme.cream')));
  const v = buildVCard({ ...cfg, person: { ...cfg.person, name: 'Ana; López' } });
  assert.ok(v.includes('FN:Ana\\; López'), 'la vCard escapa el punto y coma');
});
