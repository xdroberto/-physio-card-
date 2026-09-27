import { esc } from './html.mjs';
import { inlineSvg } from './brand.mjs';

// Hoja carta con "dientes" recortables al pie: arriba la marca, el QR grande y la promoción;
// abajo 10 tiras verticales con nombre y teléfono para que cada persona arranque una.
export function renderFlyer({ cfg, d, svgPrint, brand }) {
  const p = cfg.print || {};
  const { person, contact, theme: t } = cfg;
  const TABS = 10;
  const tab = `
    <div class="tab">
      <span class="tab__who">${esc(person.title)} · ${esc(person.name)}</span>
      <span class="tab__tel">WhatsApp ${esc(d.phoneDisplay)}</span>
    </div>`;
  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Imprimir hoja con dientes recortables · ${esc(person.name)}</title>
<style>
  @font-face { font-family: "Italiana"; src: url(fonts/italiana-400.woff2) format("woff2"); font-weight: 400; }
  @font-face { font-family: "Jost"; src: url(fonts/jost-var.woff2) format("woff2"); font-weight: 100 900; }
  @page { size: letter portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; color: ${t.black}; }
  body { font-family: "Jost", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 8.5in; height: 11in; margin: 0 auto; padding: 0.35in 0.45in 0.45in; background: ${t.cream}; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .brand { display: grid; justify-items: center; gap: 6pt; }
  .brand .logo { width: 54pt; height: auto; color: ${t.black}; }
  .brand .wordmark { width: 180pt; height: auto; color: ${t.black}; }
  .brand .firma { width: 150pt; height: auto; }
  .tagline { font-family: "Italiana", Georgia, serif; font-weight: 400; font-size: 28pt; line-height: 1.02; margin: 8pt 0 2pt; }
  .hook { font-size: 13pt; font-weight: 400; color: #4A423E; margin: 0; }
  .qr { width: 2.6in; height: 2.6in; margin: 8pt auto 3pt; background: #fff; border-radius: 12pt; padding: 9pt; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .scan { font-size: 18pt; font-weight: 500; margin: 2pt 0 0; }
  .scan small { display: block; font-size: 10.5pt; font-weight: 400; color: #4A423E; margin: 2pt auto 0; max-width: 6.2in; }
  .promo { margin-top: 7pt; border: 1.5pt solid ${t.black}; border-radius: 9pt; padding: 6pt 12pt; font-size: 12pt; font-weight: 500; }
  .tel { margin-top: 8pt; font-size: 10pt; letter-spacing: .12em; text-transform: uppercase; color: #4A423E; }
  .tel b { display: inline-block; margin-left: 8pt; font-size: 20pt; font-weight: 300; letter-spacing: .01em; text-transform: none; color: ${t.black}; vertical-align: middle; }
  .zona { font-size: 10pt; font-weight: 300; color: #4A423E; margin-top: 2pt; }
  .cut { width: 100%; margin: auto 0 0; display: flex; align-items: center; gap: 8pt; color: #4A423E; font-size: 9pt; letter-spacing: .14em; text-transform: uppercase; padding-top: 8pt; }
  .cut::before, .cut::after { content: ""; flex: 1; border-top: 1.2pt dashed ${t.black}; }
  .cut svg { width: 12pt; height: 12pt; }
  .tabs { display: grid; grid-template-columns: repeat(${TABS}, 1fr); width: 100%; height: 2.2in; margin-top: 3pt; }
  .tab { border-left: 1.2pt dashed ${t.black}; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 3pt; padding: 6pt 0; }
  .tab:first-child { border-left: 0; }
  .tab span { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; line-height: 1; }
  .tab__who { font-size: 8pt; font-weight: 400; color: #4A423E; letter-spacing: .02em; }
  .tab__tel { font-size: 12.5pt; font-weight: 500; letter-spacing: .02em; }
  .noprint { position: fixed; top: 0; left: 0; right: 0; background: #111; color: #fff; padding: 10px 16px; font-size: 14px; display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
  .noprint button { font: inherit; background: ${t.cream}; color: ${t.black}; border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 600; }
  @media print { .noprint { display: none; } .sheet { margin: 0; box-shadow: none; } }
  @media screen { body { padding-top: 56px; background: #e9e9e9; } .sheet { box-shadow: 0 2px 20px rgba(0,0,0,.15); margin: 16px auto; } }
</style>
</head>
<body>
<div class="noprint">Hoja con dientes recortables (tamaño carta, sin márgenes). Cortar las tiras de abajo por las líneas punteadas hasta la línea horizontal. <button onclick="window.print()">Imprimir / Guardar PDF</button></div>
<main class="sheet">
  <div class="brand">
    ${inlineSvg(brand.logo, { className: 'logo' })}
    ${inlineSvg(brand.wordmark, { className: 'wordmark', label: person.title })}
    <img class="firma" src="brand/firma-black.svg" alt="${esc(person.name)}">
  </div>
  <p class="tagline">${esc(cfg.hero.headline)}</p>
  ${p.hook ? `<p class="hook">${esc(p.hook)}</p>` : ''}
  <div class="qr" role="img" aria-label="Código QR">${svgPrint}</div>
  <p class="scan">${esc(p.instruction || 'Escanee y escríbame por WhatsApp')}<small>${esc(p.instruction_sub || '')}</small></p>
  ${d.printPromoLine ? `<div class="promo">${esc(d.printPromoLine)}</div>` : ''}
  <p class="tel">${esc(contact.phone_label || 'Citas')} <b>${esc(d.phoneDisplay)}</b></p>
  <p class="zona">${esc(person.zone || person.city)} · ${esc(person.cedula_label || 'Céd. Prof.')} ${esc(person.cedula)}</p>
  <div class="cut"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.6 12 6.9 9.3a3 3 0 1 1 1.4-1.4L12 10.6l6.4-6.4 1.4 1.4L12.4 12l7.4 7.4-1.4 1.4L12 13.4l-3.7 2.7a3 3 0 1 1-1.4-1.4L9.6 12zM6 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="currentColor"/></svg>Lleve el teléfono</div>
  <div class="tabs">${tab.repeat(TABS)}</div>
</main>
</body>
</html>
`;
}
