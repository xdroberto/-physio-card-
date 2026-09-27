import { esc } from './html.mjs';
import { inlineSvg } from './brand.mjs';

// Hoja tamaño carta para pegar en la carpa, con el frente de la tarjeta (crema, logo, wordmark,
// firma), el QR sobre blanco y, como respaldo, el número y el dominio en texto grande.
// mode 'site': el QR abre la tarjeta (paola.robertobh.dev/?src=qr-hoja).
// mode 'wa':   el QR abre WhatsApp directo (por si el dominio no está listo a tiempo).
export function renderPrint({ cfg, d, svgPrint, svgWa, brand }, { mode = 'site' } = {}) {
  const p = cfg.print || {};
  const { person, contact, theme: t } = cfg;
  const isWa = mode === 'wa';
  const svg = isWa ? svgWa : svgPrint;
  const instruction = p.instruction || 'Escanee y escríbame por WhatsApp';
  const instructionSub = isWa
    ? 'Abra la cámara de su celular y apúntela al código. Se abre WhatsApp con el mensaje listo: solo toque Enviar.'
    : p.instruction_sub || 'Abra la cámara de su celular y apúntela al código';
  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Imprimir QR${isWa ? ' (respaldo WhatsApp)' : ''} · ${esc(person.name)}</title>
<style>
  @font-face { font-family: "Italiana"; src: url(fonts/italiana-400.woff2) format("woff2"); font-weight: 400; }
  @font-face { font-family: "Jost"; src: url(fonts/jost-var.woff2) format("woff2"); font-weight: 100 900; }
  @page { size: letter portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; color: ${t.black}; }
  body { font-family: "Jost", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 8.5in; height: 11in; margin: 0 auto; padding: 0.4in 0.6in 0.4in; background: ${t.cream}; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .brand { display: grid; justify-items: center; gap: 6pt; }
  .brand .logo { width: 80pt; height: auto; color: ${t.black}; }
  .brand .wordmark { width: 230pt; height: auto; color: ${t.black}; }
  .brand .firma { width: 200pt; height: auto; }
  .tagline { font-family: "Italiana", Georgia, serif; font-weight: 400; font-size: 32pt; line-height: 1.02; margin: 14pt 0 3pt; }
  .hook { font-size: 14pt; font-weight: 400; color: #4A423E; margin: 0; }
  .qr { width: 3.9in; height: 3.9in; margin: 10pt auto 4pt; background: #fff; border-radius: 12pt; padding: 10pt; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .scan { font-size: 21pt; font-weight: 500; margin: 2pt 0 2pt; }
  .scan small { display: block; font-size: 11.5pt; font-weight: 400; color: #4A423E; margin: 3pt auto 0; max-width: 6.3in; }
  .promo { margin-top: 8pt; border: 1.5pt solid ${t.black}; border-radius: 10pt; padding: 7pt 14pt; font-size: 13pt; font-weight: 500; }
  .fallback { margin-top: 10pt; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; align-items: end; text-align: left; border-top: 1pt solid ${t.black}; padding-top: 10pt; }
  .fallback .lbl { font-size: 10.5pt; letter-spacing: .12em; text-transform: uppercase; color: #4A423E; display: block; }
  .fallback b { font-size: 24pt; font-weight: 300; display: block; letter-spacing: .01em; }
  .fallback .right { text-align: right; font-size: 12pt; font-weight: 300; color: #4A423E; line-height: 1.35; }
  .noprint { position: fixed; top: 0; left: 0; right: 0; background: #111; color: #fff; padding: 10px 16px; font-size: 14px; display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
  .noprint button { font: inherit; background: ${t.cream}; color: ${t.black}; border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 600; }
  @media print { .noprint { display: none; } .sheet { margin: 0; box-shadow: none; } }
  @media screen { body { padding-top: 56px; background: #e9e9e9; } .sheet { box-shadow: 0 2px 20px rgba(0,0,0,.15); margin: 16px auto; } }
</style>
</head>
<body>
<div class="noprint">${isWa ? 'Hoja de RESPALDO: el QR abre WhatsApp directo, sin pasar por el sitio.' : 'Hoja lista para imprimir (tamaño carta, sin márgenes). Papel mate; 3 copias.'} <button onclick="window.print()">Imprimir / Guardar PDF</button></div>
<main class="sheet">
  <div class="brand">
    ${inlineSvg(brand.logo, { className: 'logo' })}
    ${inlineSvg(brand.wordmark, { className: 'wordmark', label: person.title })}
    <img class="firma" src="brand/firma-black.svg" alt="${esc(person.name)}">
  </div>
  <p class="tagline">${esc(cfg.hero.headline)}</p>
  ${p.hook ? `<p class="hook">${esc(p.hook)}</p>` : ''}
  <div class="qr" role="img" aria-label="Código QR">${svg}</div>
  <p class="scan">${esc(instruction)}<small>${esc(instructionSub)}</small></p>
  ${d.printPromoLine ? `<div class="promo">${esc(d.printPromoLine)}</div>` : ''}
  <div class="fallback">
    <div><span class="lbl">${esc(contact.phone_label || 'Citas')} · ${esc(p.fallback_label || 'si el QR no abre')}</span><b>${esc(d.phoneDisplay)}</b></div>
    <div class="right">${esc(person.zone || person.city)}<br>${esc(person.cedula_label || 'Céd. Prof.')} ${esc(person.cedula)}</div>
  </div>
</main>
</body>
</html>
`;
}
