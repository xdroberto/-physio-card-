import { esc } from './html.mjs';

// Hoja tamaño carta para pegar en la carpa: QR grande, gancho, qué pasa al escanear y,
// como respaldo si el QR falla, el número y el dominio en texto grande.
// mode 'site': el QR abre la tarjeta (paola.robertobh.dev/?src=qr-hoja).
// mode 'wa':   el QR abre WhatsApp directo (por si el dominio no está listo a tiempo).
export function renderPrint({ cfg, d, svgPrint, svgWa }, { mode = 'site' } = {}) {
  const p = cfg.print || {};
  const person = cfg.person;
  const t = cfg.theme || {};
  const accent = t.accent || '#0f766e';
  const ink = t.ink || '#111111';
  const isWa = mode === 'wa';
  const svg = isWa ? svgWa : svgPrint;
  const instruction = isWa ? 'Escanea y me llega tu WhatsApp' : p.instruction || 'Escanea y escríbeme por WhatsApp';
  const instructionSub = isWa
    ? 'Abre la cámara de tu teléfono y apúntala al código. Se abre WhatsApp con el mensaje listo.'
    : p.instruction_sub || 'Abre la cámara de tu teléfono y apúntala al código';
  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Imprimir QR${isWa ? ' (respaldo WhatsApp)' : ''} · ${esc(person.name)}</title>
<style>
  @page { size: letter portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; color: ${ink}; }
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.45in 0.5in 0.4in; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .top { width: 100%; border-top: 6px solid ${accent}; padding-top: 14pt; }
  .eyebrow { font-size: 12.5pt; letter-spacing: .18em; text-transform: uppercase; color: ${accent}; font-weight: 700; margin: 0 0 6pt; }
  h1 { font-size: 32pt; line-height: 1.1; margin: 0 0 6pt; letter-spacing: -.01em; }
  .sub { font-size: 13pt; color: #444; margin: 0; }
  .qr { width: 5.1in; height: 5.1in; margin: 14pt auto 4pt; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .scan { font-size: 21pt; font-weight: 800; margin: 4pt 0 2pt; }
  .scan small { display: block; font-size: 12pt; font-weight: 500; color: #444; margin-top: 3pt; max-width: 6.5in; margin-left: auto; margin-right: auto; }
  .promo { margin-top: 8pt; background: ${t.promo || '#FFD84D'}; color: ${t.promo_ink || '#111'}; border: 2.5pt solid ${t.promo_ink || '#111'}; border-radius: 10pt; padding: 8pt 14pt; font-size: 13pt; font-weight: 800; }
  .fallback { margin-top: 10pt; width: 100%; border: 2px dashed #bbb; border-radius: 10pt; padding: 9pt 12pt; font-size: 12pt; color: #333; }
  .fallback b { font-size: 20pt; display: block; color: ${ink}; letter-spacing: .02em; }
  .url { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 15pt; color: ${accent}; font-weight: 700; margin: 6pt 0 0; word-break: break-all; }
  .foot { margin-top: auto; font-size: 10pt; color: #777; padding-top: 10pt; }
  .noprint { position: fixed; top: 0; left: 0; right: 0; background: #111; color: #fff; padding: 10px 16px; font-size: 14px; display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
  .noprint button { font: inherit; background: ${accent}; color: #fff; border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 700; }
  @media print { .noprint { display: none; } .sheet { padding-top: 0; } }
  @media screen { body { padding-top: 56px; background: #e9e9e9; } .sheet { background: #fff; box-shadow: 0 2px 20px rgba(0,0,0,.15); margin: 16px auto; } }
</style>
</head>
<body>
<div class="noprint">${isWa ? 'Hoja de RESPALDO: el QR abre WhatsApp directo, sin pasar por el sitio.' : 'Hoja lista para imprimir (tamaño carta). Papel mate; QR de al menos 8 cm.'} <button onclick="window.print()">Imprimir / Guardar PDF</button></div>
<main class="sheet">
  <div class="top">
    <p class="eyebrow">${esc(p.eyebrow || 'Fisioterapia deportiva')}</p>
    <h1>${esc(p.headline || person.name)}</h1>
    <p class="sub">${esc(p.subline || person.title || '')}</p>
  </div>
  <div class="qr" role="img" aria-label="Código QR">${svg}</div>
  <p class="scan">${esc(instruction)}<small>${esc(instructionSub)}</small></p>
  ${d.printPromoLine ? `<div class="promo">${esc(d.printPromoLine)}</div>` : ''}
  <div class="fallback">
    ${esc(p.fallback_label || 'Si el QR no abre, escríbeme directo:')}
    <b>${esc(d.phoneDisplay)}</b>
    <p class="url">${esc(d.host)}</p>
  </div>
  <p class="foot">${esc(person.name)} · ${esc(person.title || '')}${person.cedula ? ` · Cédula profesional ${esc(person.cedula)}` : ''} · ${esc(person.city || '')}</p>
</main>
</body>
</html>
`;
}
