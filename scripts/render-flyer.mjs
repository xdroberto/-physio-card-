import { esc } from './html.mjs';
import { inlineSvg } from './brand.mjs';

// Hoja carta con panfletos recortables: arriba la marca y el QR grande; abajo una cuadrícula
// de 8 tarjetitas (4 x 2) con QR, nombre y teléfono, separadas por líneas de corte.
export function renderFlyer({ cfg, d, svgPrint, svgTab, brand }) {
  const p = cfg.print || {};
  const { person, contact, theme: t } = cfg;
  const card = `
    <div class="mini">
      <div class="mini__qr">${svgTab}</div>
      <img class="mini__wordmark" src="brand/wordmark-black.svg" alt="${esc(person.title)}">
      <img class="mini__firma" src="brand/firma-black.svg" alt="${esc(person.name)}">
      <p class="mini__tel"><span>${esc(contact.phone_label || 'Citas')}</span> ${esc(d.phoneDisplay)}</p>
    </div>`;
  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Imprimir panfletos recortables · ${esc(person.name)}</title>
<style>
  @font-face { font-family: "Italiana"; src: url(fonts/italiana-400.woff2) format("woff2"); font-weight: 400; }
  @font-face { font-family: "Jost"; src: url(fonts/jost-var.woff2) format("woff2"); font-weight: 100 900; }
  @page { size: letter portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; color: ${t.black}; }
  body { font-family: "Jost", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 8.5in; height: 11in; margin: 0 auto; padding: 0.32in 0.4in 0.3in; background: ${t.cream}; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .brand { display: grid; justify-items: center; gap: 4pt; }
  .brand .logo { width: 50pt; height: auto; color: ${t.black}; }
  .brand .wordmark { width: 150pt; height: auto; color: ${t.black}; }
  .brand .firma { width: 130pt; height: auto; }
  .tagline { font-family: "Italiana", Georgia, serif; font-weight: 400; font-size: 22pt; line-height: 1.02; margin: 6pt 0 1pt; }
  .hook { font-size: 11.5pt; font-weight: 400; color: #4A423E; margin: 0; }
  .top { display: grid; grid-template-columns: 2.3in 1fr; gap: 0.22in; align-items: center; width: 100%; margin-top: 6pt; text-align: left; }
  .qr { width: 2.3in; height: 2.3in; background: #fff; border-radius: 10pt; padding: 7pt; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .scan { font-size: 16pt; font-weight: 500; line-height: 1.15; margin: 0 0 4pt; }
  .scan small { display: block; font-size: 10pt; font-weight: 400; color: #4A423E; margin-top: 3pt; }
  .promo { margin-top: 7pt; border: 1.5pt solid ${t.black}; border-radius: 8pt; padding: 5pt 9pt; font-size: 10pt; font-weight: 500; }
  .tel { margin-top: 8pt; font-size: 9.5pt; letter-spacing: .12em; text-transform: uppercase; color: #4A423E; }
  .tel b { display: block; font-size: 20pt; font-weight: 300; letter-spacing: .01em; text-transform: none; color: ${t.black}; }
  .zona { font-size: 9.5pt; font-weight: 300; color: #4A423E; margin-top: 3pt; }
  .cut { width: 100%; margin: 9pt 0 5pt; display: flex; align-items: center; gap: 8pt; color: #4A423E; font-size: 9pt; letter-spacing: .14em; text-transform: uppercase; }
  .cut::before, .cut::after { content: ""; flex: 1; border-top: 1.2pt dashed ${t.black}; }
  .cut svg { width: 12pt; height: 12pt; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); width: 100%; }
  .mini { border: 1pt dashed ${t.black}; margin: -0.5pt; padding: 6pt 4pt 5pt; display: flex; flex-direction: column; align-items: center; gap: 2pt; height: 1.45in; overflow: hidden; }
  .mini__qr { width: 0.86in; height: 0.86in; background: #fff; border-radius: 4pt; padding: 3pt; }
  .mini__qr svg { width: 100%; height: 100%; display: block; }
  .mini__wordmark { width: 0.9in; height: auto; margin-top: 1pt; }
  .mini__firma { width: 0.8in; height: auto; }
  .mini__tel { margin: 1pt 0 0; font-size: 8pt; font-weight: 500; letter-spacing: .02em; }
  .mini__tel span { font-size: 6.5pt; letter-spacing: .12em; text-transform: uppercase; color: #4A423E; font-weight: 500; margin-right: 2pt; }
  .noprint { position: fixed; top: 0; left: 0; right: 0; background: #111; color: #fff; padding: 10px 16px; font-size: 14px; display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
  .noprint button { font: inherit; background: ${t.cream}; color: ${t.black}; border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 600; }
  @media print { .noprint { display: none; } .sheet { margin: 0; box-shadow: none; } }
  @media screen { body { padding-top: 56px; background: #e9e9e9; } .sheet { box-shadow: 0 2px 20px rgba(0,0,0,.15); margin: 16px auto; } }
</style>
</head>
<body>
<div class="noprint">Hoja con 15 panfletos recortables (tamaño carta, sin márgenes). Cortar por las líneas punteadas. <button onclick="window.print()">Imprimir / Guardar PDF</button></div>
<main class="sheet">
  <div class="brand">
    ${inlineSvg(brand.logo, { className: 'logo' })}
    ${inlineSvg(brand.wordmark, { className: 'wordmark', label: person.title })}
    <img class="firma" src="brand/firma-black.svg" alt="${esc(person.name)}">
  </div>
  <p class="tagline">${esc(cfg.hero.headline)}</p>
  ${p.hook ? `<p class="hook">${esc(p.hook)}</p>` : ''}
  <div class="top">
    <div class="qr" role="img" aria-label="Código QR">${svgPrint}</div>
    <div>
      <p class="scan">${esc(p.instruction || 'Escanee y escríbame por WhatsApp')}<small>${esc(p.instruction_sub || '')}</small></p>
      ${d.printPromoLine ? `<div class="promo">${esc(d.printPromoLine)}</div>` : ''}
      <p class="tel">${esc(contact.phone_label || 'Citas')} · ${esc(p.fallback_label || 'si el QR no abre')}<b>${esc(d.phoneDisplay)}</b></p>
      <p class="zona">${esc(person.zone || person.city)} · ${esc(person.cedula_label || 'Céd. Prof.')} ${esc(person.cedula)}</p>
    </div>
  </div>
  <div class="cut"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.6 12 6.9 9.3a3 3 0 1 1 1.4-1.4L12 10.6l6.4-6.4 1.4 1.4L12.4 12l7.4 7.4-1.4 1.4L12 13.4l-3.7 2.7a3 3 0 1 1-1.4-1.4L9.6 12zM6 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="currentColor"/></svg>Lleve una tarjeta</div>
  <div class="grid">${card.repeat(15)}</div>
</main>
</body>
</html>
`;
}
