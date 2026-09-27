import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, readdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { build, validate, derive, formatMxPhone, formatLongDate, fillTokens, loadConfig } from '../scripts/build.mjs';
import { buildVCard, splitName } from '../scripts/vcard.mjs';
import { qrUrl } from '../scripts/qr.mjs';

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
  const good = structuredClone(cfg); good.contact.whatsapp = '524421234567';
  assert.equal(validate(good).filter((p) => p.includes('whatsapp')).length, 0);
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
  assert.ok(dd.pains[0].message.includes('rodilla o cadera al pedalear'), 'plantilla de síntoma con la zona');
  assert.ok(dd.pains.every((p) => p.message.includes('MTB')), 'cada chip menciona la carrera');
  assert.ok(dd.pains.every((p) => p.link.startsWith('https://wa.me/524421234567?text=')));
  assert.equal(dd.telLink, 'tel:+524421234567');
  assert.equal(dd.qrSheetUrl, 'https://paola.robertobh.dev/?src=qr-hoja');
  assert.equal(dd.qrScreenUrl, 'https://paola.robertobh.dev/?src=qr-tel');
});

test('promo: tokens y fecha larga en español, y el build exige sus campos', () => {
  assert.equal(formatLongDate('2026-10-11').replace(/ de 20\d\d$/, ''), '11 de octubre');
  assert.equal(fillTokens('A {price} en vez de {regular_price} hasta el {until}', { price: '$650', regular_price: '$800', until: '2026-10-11' }).replace(/ de 20\d\d$/, ''), 'A $650 en vez de $800 hasta el 11 de octubre');
  const bad = structuredClone(cfg); bad.promo.enabled = true; bad.promo.until = '11/10/2026';
  assert.ok(validate(bad).some((p) => p.includes('promo.until')));
  const off = structuredClone(cfg); off.promo.enabled = false; off.promo.until = '';
  assert.equal(validate(off).filter((p) => p.includes('promo')).length, 0);
});

test('qrUrl: agrega src sin romper la URL', () => {
  assert.equal(qrUrl('https://paola.robertobh.dev/', 'x'), 'https://paola.robertobh.dev/?src=x');
  assert.equal(qrUrl('https://paola.robertobh.dev/', ''), 'https://paola.robertobh.dev/');
});

test('index.html: CTAs y metadatos esenciales', () => {
  assert.match(html, /<html lang="es-MX">/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">/);
  assert.ok(html.includes(`href="${d.waLink}"`), 'CTA WhatsApp principal');
  assert.ok(html.includes(`href="${d.vcfName}" download`), 'CTA guardar contacto');
  assert.ok(html.includes(`href="${d.telLink}"`), 'enlace tel:');
  assert.match(html, /<dialog class="qr"/);
  assert.match(html, /<svg[^>]*>[\s\S]*<\/svg>/, 'QR inline');
  assert.match(html, /property="og:image" content="https:\/\/paola\.robertobh\.dev\/og\.png"/);
  assert.match(html, /"@type":"Physiotherapy"/);
  assert.ok(html.includes(cfg.person.cedula), 'cédula visible');
  assert.equal((html.match(/<a [^>]*data-wa="main"/g) || []).length, 4, 'hero, así funciona, contacto y barra fija llevan el mensaje principal');
  assert.equal((html.match(/class="pain" href="https:\/\/wa\.me\//g) || []).length, cfg.pains.items.length, 'chips de dolor como enlaces directos a WhatsApp');
  for (const p of d.pains) assert.ok(html.includes(`href="${p.link}"`), `chip ${p.label}`);
  assert.ok(html.includes(`href="${d.waLinkPromo}"`), 'CTA de la promo con su mensaje');
  assert.ok(!/target="_blank"[^>]*wa\.me|wa\.me[^>]*target="_blank"/.test(html), 'wa.me sin target _blank: en móvil abre la app directo');
  assert.ok(html.includes('$650') && html.includes('<s>$800</s>'), 'promo con precio y precio regular tachado');
  assert.ok(html.includes('Sesión a domicilio: <b>$800</b>'), 'precio regular publicado en Así funciona');
  assert.ok(html.includes('id="copy-cedula"'), 'tocar la cédula la copia');
  assert.equal((html.match(/<section/g) || []).length, 5, 'hero + 5 secciones = 6 bloques');
  assert.ok(html.includes('data-until="2026-10-11"') || !cfg.promo.enabled, 'la promo lleva su fecha de vencimiento');
  assert.ok(html.includes(cfg.person.cedula_verify_url), 'enlace para verificar cédula');
  assert.ok(html.includes('wakeLock'), 'wake lock en el modal QR');
});

test('index.html: sin requests a terceros (salvo Umami si está configurado)', () => {
  const urls = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  const allowed = /^(https:\/\/wa\.me\/|https:\/\/instagram\.com\/|https:\/\/paola\.robertobh\.dev\/|https:\/\/stats\.robertobh\.dev\/|https:\/\/www\.cedulaprofesional\.sep\.gob\.mx\/)/;
  const bad = urls.filter((u) => !allowed.test(u));
  assert.deepEqual(bad, [], 'requests externos inesperados');
  assert.ok(!/fonts\.googleapis|fonts\.gstatic|cdn\./.test(html), 'sin fuentes ni CDNs externos');
});

test('index.html: peso bajo para 3G en el cerro', () => {
  assert.ok(result.indexBytes < 60 * 1024, `index.html pesa ${result.indexBytes} bytes`);
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
  assert.ok(print.includes(d.host));
  assert.ok(print.includes('$650'), 'la hoja anuncia la promo con precio');
  assert.ok(print.includes('11 de octubre'), 'fecha de vencimiento en formato largo');
});

test('imprimir-whatsapp.html: hoja de respaldo con QR directo a wa.me', async () => {
  const wa = await readFile(path.join(outDir, 'imprimir-whatsapp.html'), 'utf8');
  assert.match(wa, /RESPALDO/);
  assert.match(wa, /<svg[^>]*>[\s\S]*<\/svg>/);
  assert.notEqual(wa, print);
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
  assert.ok(v.includes('URL:https://paola.robertobh.dev/'));
  for (const line of v.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, `línea > 75 bytes: ${line}`);
  assert.deepEqual(splitName('Paola García Moctezuma'), { given: 'Paola', family: 'García Moctezuma' });
});

test('dist: archivos esperados', async () => {
  const files = await readdir(outDir);
  for (const f of ['index.html', 'imprimir.html', 'imprimir-whatsapp.html', '404.html', 'qr.svg', 'qr-print.svg', 'qr-print.png', 'qr-whatsapp.svg', 'qr-whatsapp.png', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', '.nojekyll', 'CNAME', d.vcfName, 'og.png', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
    assert.ok(files.includes(f), `falta ${f}`);
  }
  assert.equal((await readFile(path.join(outDir, 'CNAME'), 'utf8')).trim(), 'paola.robertobh.dev');
});

test('config real carga y es JSON válido', async () => {
  const c = await loadConfig();
  assert.equal(c.person.name, 'Paola García Moctezuma');
});
