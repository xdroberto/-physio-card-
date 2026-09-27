import { esc, attr, jsonInline } from './html.mjs';
import { inlineSvg } from './brand.mjs';

// La tarjeta digital, con la identidad de la tarjeta impresa: crema #FBEEE6, negro, logo de
// columna, wordmark "Fisioterapeuta" y firma como vectores exactos; Italiana para títulos y
// Jost para texto, autoalojadas. Una sola página móvil: hero, cuatro bloques y pie.
export function renderIndex({ cfg, d, svgScreen, brand }) {
  const { person, contact, hero, cta, trust, how, og, pains, qr_modal: qrm, contact_section: cs, theme: t } = cfg;
  const promo = d.promo;
  const umami = cfg.site.umami || {};
  const umamiTag =
    umami.website_id && umami.src
      ? `<script defer src="${attr(umami.src)}" data-website-id="${attr(umami.website_id)}" data-domains="${attr(d.host)}"></script>`
      : '';

  const wordmark = inlineSvg(brand.wordmark, { className: 'wordmark', label: person.title });
  const motif = inlineSvg(brand.logo, { className: 'motif' });
  const firmaImg = (cls, color, lazy = false) =>
    `<img class="${cls}" src="brand/firma-${color}.svg" width="${brand.firma.w.toFixed(0)}" height="${brand.firma.h.toFixed(0)}" alt="${attr(person.name)}"${lazy ? ' loading="lazy"' : ''}>`;

  const painChips = d.pains
    .map(
      (p) => `<a class="pain" href="${attr(p.link)}" data-umami-event="whatsapp-chip" data-umami-event-zona="${attr(p.label)}"><span>${esc(p.label)}</span>${icon('whatsapp')}</a>`,
    )
    .join('');

  const facts = (trust.facts || []).map((f) => `<li><span class="fact__v">${esc(f.value)}</span><span class="fact__l">${esc(f.label)}</span></li>`).join('');
  const verify =
    person.cedula_verify_url && trust.verify_label
      ? `<a class="verify" href="${attr(person.cedula_verify_url)}" target="_blank" rel="noopener" data-umami-event="verificar-cedula">${esc(trust.verify_label)} ${icon('external')}</a>`
      : '';

  const priceLine = how.price
    ? `<p class="price"><span>${esc(how.price_label || 'Sesión a domicilio')}: <b class="num">${esc(how.price)}</b></span>${how.price_note ? `<span class="price__note">${esc(how.price_note)}</span>` : ''}</p>`
    : '';

  const channels = [
    `<a class="btn btn--outline" href="${attr(d.waLink)}" data-wa="main" data-umami-event="whatsapp-contacto">${icon('whatsapp')}<span>WhatsApp</span></a>`,
    `<a class="btn btn--outline" href="${attr(d.telLink)}" data-umami-event="llamar">${icon('phone')}<span>${esc(cta.call)}</span></a>`,
    contact.instagram
      ? `<a class="btn btn--outline" href="https://instagram.com/${attr(contact.instagram.replace(/^@/, ''))}" target="_blank" rel="noopener" data-umami-event="instagram">${icon('instagram')}<span>Instagram</span></a>`
      : '',
    contact.email
      ? `<a class="btn btn--outline" href="mailto:${attr(contact.email)}?subject=${encodeURIComponent('Sesión de fisioterapia a domicilio')}" data-umami-event="email">${icon('mail')}<span>Correo</span></a>`
      : '',
    `<button class="btn btn--outline" type="button" id="copy-num" data-umami-event="copiar-numero">${icon('copy')}<span>${esc(cta.copy)}</span></button>`,
    `<button class="btn btn--outline" type="button" id="share" data-umami-event="compartir">${icon('share')}<span>${esc(cta.share)}</span></button>`,
  ]
    .filter(Boolean)
    .join('');

  const promoBlock = promo
    ? `<section class="promo" id="promo" aria-labelledby="promo-title" data-until="${attr(promo.until)}">
        <p class="eyebrow">${esc(promo.eyebrow)}</p>
        <h2 id="promo-title" class="promo__title">${esc(promo.title)}</h2>
        <p class="promo__price"><b class="num">${esc(promo.price)}</b> <s class="num"><span class="sr-only">antes </span>${esc(promo.regular_price)}</s></p>
        <p class="promo__text">${esc(promo.text)}</p>
        <a class="btn btn--black" href="${attr(d.waLinkPromo)}" data-umami-event="whatsapp-promo">${icon('whatsapp')}<span>${esc(promo.cta || cta.whatsapp)}</span></a>
      </section>`
    : '';

  const jsConfig = {
    waBase: d.waBase,
    greetEvent: cfg.whatsapp.greeting_event,
    greetGeneric: cfg.whatsapp.greeting_generic || cfg.whatsapp.greeting_event,
    ask: cfg.whatsapp.ask,
    number: '+' + String(contact.whatsapp),
    cedula: person.cedula || '',
    shareTitle: og.title,
    shareUrl: d.baseUrl + '?src=compartido',
    shareText: cfg.share?.text || og.description,
    copied: cta.copied,
    linkCopied: cta.link_copied || cta.copied,
    cedulaCopied: cta.cedula_copied || 'Copiado',
  };

  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light only">
<meta name="theme-color" content="${attr(t.black)}">
<title>${esc(og.title)}</title>
<meta name="description" content="${attr(og.description)}">
<link rel="canonical" href="${attr(d.baseUrl)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_MX">
<meta property="og:site_name" content="${attr(person.name)}">
<meta property="og:title" content="${attr(og.title)}">
<meta property="og:description" content="${attr(og.description)}">
<meta property="og:url" content="${attr(d.baseUrl)}">
<meta property="og:image" content="${attr(d.baseUrl)}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preload" href="fonts/italiana-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/jost-var.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">${jsonInline(jsonLd(cfg, d))}</script>
<style>
@font-face{font-family:"Italiana";src:url(fonts/italiana-400.woff2) format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Jost";src:url(fonts/jost-var.woff2) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}
:root{
  --cream:${t.cream};--black:${t.black};--ink:${t.ink};--muted:${t.muted};--muted-dark:${t.muted_on_dark};
  --line:${t.line};--line-soft:${t.line_soft};--white:${t.white};
  --serif:"Italiana",Georgia,"Times New Roman",serif;
  --sans:"Jost",system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --r:12px;--maxw:520px;
  --safe-b:env(safe-area-inset-bottom,0px);
  color-scheme:light only;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--cream);color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.5;font-weight:400;-webkit-font-smoothing:antialiased;padding-bottom:calc(84px + var(--safe-b))}
a{color:var(--ink)}
img{max-width:100%;display:block}
h1,h2,h3,p,ul,ol{margin:0}
ul,ol{padding:0;list-style:none}
button{font:inherit;color:inherit}
b{font-weight:600}
:focus-visible{outline:3px solid var(--ink);outline-offset:2px;border-radius:6px}
.hero :focus-visible,.sticky :focus-visible{outline-color:var(--cream)}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 20px}
.num{font-variant-numeric:tabular-nums;letter-spacing:.02em}
.serif{font-family:var(--serif);font-weight:400}
.eyebrow{font-size:13px;font-weight:500;letter-spacing:.18em;text-transform:uppercase}

/* ---------- Hero: el reverso de la tarjeta ---------- */
.hero{background:var(--black);color:var(--cream);position:relative;overflow:hidden}
.hero .wrap{position:relative;padding-top:calc(22px + env(safe-area-inset-top,0px));padding-bottom:26px}
.motif{position:absolute;right:-22%;top:-6%;width:78%;height:auto;color:var(--cream);opacity:.11;pointer-events:none}
.hero__top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.brand{display:grid;gap:8px}
.wordmark{width:196px;height:auto;color:var(--cream)}
.firma{width:170px;height:auto}
.qrpill{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:999px;border:1.5px solid var(--cream);background:transparent;color:var(--cream);font-weight:500;font-size:15px;letter-spacing:.06em;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;white-space:nowrap;flex:none}
.qrpill svg{width:20px;height:20px}
.tagline{font-family:var(--serif);font-weight:400;font-size:clamp(38px,11vw,50px);line-height:1;letter-spacing:-.005em;margin:24px 0 10px;text-wrap:balance}
.sub{font-size:16.5px;font-weight:300;line-height:1.4;color:var(--cream);text-wrap:pretty;max-width:34ch}
.meta{display:grid;gap:6px;margin-top:20px}
.meta__tel{text-decoration:none;color:var(--cream);display:flex;align-items:baseline;gap:10px;font-size:28px;font-weight:300;line-height:1.1}
.meta__lbl{font-size:12px;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-dark)}
.zona{font-size:14.5px;font-weight:400;color:var(--muted-dark);line-height:1.4;display:flex;flex-wrap:wrap;gap:0 14px}
.zona span{white-space:nowrap}
.actions{display:grid;gap:10px;margin-top:24px}

/* ---------- Botones ---------- */
.btn{display:flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:10px 16px;border-radius:var(--r);font-family:var(--sans);font-weight:500;font-size:17px;line-height:1.15;letter-spacing:.01em;text-decoration:none;border:1.5px solid var(--ink);background:transparent;color:var(--ink);-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .08s ease,filter .08s ease;cursor:pointer;text-align:center}
.btn:active{transform:scale(.98);filter:brightness(.9)}
.btn svg{width:24px;height:24px;flex:none}
.btn--cream{background:var(--cream);color:var(--black);border-color:var(--cream);flex-direction:column;gap:1px;min-height:64px;font-size:19px;font-weight:500}
.btn--cream .btn__main{display:flex;align-items:center;gap:12px}
.btn--cream .btn__main svg{width:28px;height:28px}
.btn--cream .btn__sub{font-size:13.5px;font-weight:400;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.btn--outline-cream{border-color:var(--cream);color:var(--cream)}
.btn--black{background:var(--black);color:var(--cream);border-color:var(--black);min-height:58px;font-size:18px}
.btn--black:active{filter:brightness(1.3)}
.btn--outline{font-size:16px;min-height:52px}

/* ---------- Secciones (crema, estilo editorial) ---------- */
section{padding:30px 0 12px}
section+section{border-top:1px solid var(--line-soft)}
.h2{font-family:var(--serif);font-weight:400;font-size:32px;line-height:1.05;margin-bottom:12px}
.lead{font-size:15.5px;font-weight:300;color:var(--muted);margin:-4px 0 14px;max-width:38ch}
.promo{border:1.5px solid var(--ink);border-radius:16px;padding:20px 18px 18px;margin-top:24px}
.promo[hidden]{display:none}
.promo__title{font-family:var(--serif);font-weight:400;font-size:28px;line-height:1.05;margin:6px 0 4px}
.promo__price{display:flex;align-items:baseline;gap:12px;margin:4px 0 8px}
.promo__price b{font-family:var(--serif);font-weight:400;font-size:56px;line-height:1}
.promo__price s{font-size:20px;font-weight:300;color:var(--muted)}
.promo__text{font-size:15.5px;font-weight:400;color:var(--muted)}
.promo .btn{margin-top:14px}
.pains{display:grid;border-top:1px solid var(--line-soft)}
.pain{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:54px;padding:8px 4px;border-bottom:1px solid var(--line-soft);background:transparent;color:var(--ink);font-weight:500;font-size:17px;line-height:1.2;text-decoration:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.pain:active{background:var(--black);color:var(--cream)}
.pain svg{width:22px;height:22px;flex:none}
.pains__note{font-size:14.5px;font-weight:300;color:var(--muted);margin-top:12px}
.cedula-row{display:flex;align-items:center;justify-content:space-between;gap:8px 12px;flex-wrap:wrap;padding:8px 0 10px;border-bottom:1px solid var(--line-soft);margin-bottom:16px}
.cedula-row__main{display:grid;gap:0}
.cedula-row .lbl{font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.cedula-copy{font-family:var(--sans);font-size:24px;font-weight:300;background:none;border:0;padding:2px 0;border-radius:8px;cursor:pointer;color:var(--ink);display:inline-flex;align-items:center;gap:8px;min-height:36px}
.cedula-copy svg{width:18px;height:18px}
.facts{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px 12px}
.facts li{display:grid;gap:2px;padding-top:10px;border-top:1px solid var(--line-soft)}
.fact__v{font-family:var(--serif);font-weight:400;font-size:24px;line-height:1.05;letter-spacing:-.005em}
.fact__l{font-size:13.5px;font-weight:300;color:var(--muted);line-height:1.3}
.verify{display:inline-flex;align-items:center;gap:6px;margin-left:auto;font-weight:500;font-size:15px;min-height:44px;text-decoration:underline;text-underline-offset:3px;flex:none}
.verify svg{width:16px;height:16px}
.price{display:grid;gap:4px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line-soft);font-size:16px;font-weight:500}
.price .num{font-family:var(--serif);font-weight:400;font-size:32px;line-height:1;letter-spacing:0;margin-left:4px}
.price__note{font-size:14px;font-weight:300;color:var(--muted)}
.trust .btn--black{margin-top:16px}
.save-help{font-size:14px;font-weight:300;color:var(--muted);margin:8px 0 14px}
.phone{font-size:30px;font-weight:300;margin:0 0 14px;user-select:all;-webkit-user-select:all}
.grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
.grid2 .btn{padding-left:10px;padding-right:10px}
.legal{margin-top:18px;font-size:13.5px;font-weight:300;color:var(--muted);display:grid;gap:4px}

/* ---------- Pie: el frente de la tarjeta ---------- */
.front{border-top:1px solid var(--line-soft);margin-top:24px;padding:36px 20px 24px;text-align:center;display:grid;justify-items:center;gap:14px}
.front .logo{width:96px;height:auto}
.front .wordmark{width:210px;height:auto}
.front .firma{width:190px}

/* ---------- Barra fija ---------- */
.sticky{position:fixed;left:0;right:0;bottom:0;padding:8px 16px calc(8px + var(--safe-b));background:var(--black);transform:translateY(110%);transition:transform .15s ease;z-index:20}
.sticky.is-on{transform:none}
.sticky .btn--cream{max-width:var(--maxw);margin:0 auto;min-height:56px;flex-direction:row;gap:10px;font-size:18px}

/* ---------- QR ---------- */
dialog.qr{border:0;padding:0;background:var(--cream);color:var(--ink);width:min(100vw,560px);max-width:100vw;height:100dvh;max-height:100dvh;margin:0 auto;overflow:auto}
dialog:not([open]){display:none}
body:has(dialog[open]){overflow:hidden}
dialog.qr::backdrop{background:var(--cream)}
.qr__inner{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100%;padding:24px 20px calc(24px + var(--safe-b));text-align:center;gap:12px}
.qr__title{font-family:var(--serif);font-size:30px;line-height:1.05;padding:0 56px}
.qr__code{width:min(86vw,50dvh,420px);height:auto;background:var(--white);border-radius:16px;padding:12px}
.qr__code svg{width:100%;height:auto;display:block}
.qr__brand{display:grid;justify-items:center;gap:8px}
.qr__brand .wordmark{width:150px;height:auto}
.qr__brand .firma{width:150px}
.qr__hint{font-size:15.5px;font-weight:300;color:var(--muted);max-width:34ch}
.qr__tip{font-size:14px;font-weight:500;color:var(--ink)}
.qr__close{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));right:12px;width:56px;height:56px;border-radius:50%;border:1.5px solid var(--ink);background:var(--cream);font-size:28px;line-height:1;color:var(--ink);cursor:pointer;touch-action:manipulation}

/* ---------- Toast ---------- */
.toast{position:fixed;left:50%;bottom:calc(88px + var(--safe-b));transform:translate(-50%,20px);background:var(--black);color:var(--cream);font-weight:500;font-size:15px;padding:12px 18px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s;z-index:40;max-width:calc(100vw - 32px);text-align:center}
.toast.is-on{opacity:1;transform:translate(-50%,0)}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
@media (min-width:600px){.hero .wrap{padding-top:40px}}
@media print{.sticky,.toast,.qrpill{display:none}}
</style>
<noscript><style>#open-qr,#copy-num,#share,#copy-cedula svg{display:none}</style></noscript>
</head>
<body>
<header class="hero">
  ${motif}
  <div class="wrap">
    <div class="hero__top">
      <div class="brand">
        ${wordmark}
        ${firmaImg('firma', 'cream')}
      </div>
      <button class="qrpill" type="button" id="open-qr" data-umami-event="qr-abrir" aria-label="${attr(cta.qr)}">${icon('qr')}<span>QR</span></button>
    </div>
    <h1 class="tagline">${esc(hero.headline)}</h1>
    <p class="sub">${esc(hero.sub)}</p>
    <div class="meta">
      <a class="meta__tel num" href="${attr(d.telLink)}" data-umami-event="llamar-hero"><span class="meta__lbl">${esc(contact.phone_label || 'Citas')}</span><span>${esc(d.phoneDisplay)}</span></a>
      <p class="zona"><span>${esc(person.zone_short || person.zone || person.city)}</span><span>${esc(person.cedula_label || 'Céd. Prof.')} <span class="num">${esc(person.cedula)}</span></span></p>
    </div>
    <nav class="actions" aria-label="Contacto directo">
      <a id="cta-wa" class="btn btn--cream" href="${attr(d.waLink)}" data-wa="main" data-umami-event="whatsapp-hero">
        <span class="btn__main">${icon('whatsapp')}<span>${esc(cta.whatsapp)}</span></span>
        <span class="btn__sub">${esc(cta.whatsapp_sub)}</span>
      </a>
      <a class="btn btn--outline-cream" href="${attr(d.vcfName)}" data-umami-event="vcard-hero">${icon('contact')}<span>${esc(cta.save)}</span></a>
    </nav>
  </div>
</header>

<main class="wrap" id="top">
  ${promoBlock}

  <section aria-labelledby="pain-title">
    <h2 class="h2" id="pain-title">${esc(pains.title)}</h2>
    ${pains.sub ? `<p class="lead">${esc(pains.sub)}</p>` : ''}
    <div class="pains">${painChips}</div>
    ${pains.note ? `<p class="pains__note">${esc(pains.note)}</p>` : ''}
  </section>

  <section class="trust" aria-labelledby="trust-title">
    <h2 class="h2" id="trust-title">${esc(trust.title)}</h2>
    ${person.cedula ? `<div class="cedula-row"><div class="cedula-row__main"><span class="lbl">Cédula profesional</span><button class="cedula-copy num" type="button" id="copy-cedula" aria-label="Copiar cédula profesional ${attr(person.cedula)}" data-umami-event="copiar-cedula">${esc(person.cedula)} ${icon('copy')}</button></div>${verify}</div>` : ''}
    ${facts ? `<ul class="facts">${facts}</ul>` : ''}
    ${priceLine}
    <a id="cta-wa-2" class="btn btn--black" href="${attr(d.waLink)}" data-wa="main" data-umami-event="whatsapp-how">${icon('whatsapp')}<span>${esc(cta.whatsapp_how || cta.whatsapp)}</span></a>
  </section>

  <section aria-labelledby="contact-title" id="contacto">
    <h2 class="h2" id="contact-title">${esc(cs.title)}</h2>
    ${cs.sub ? `<p class="lead">${esc(cs.sub)}</p>` : ''}
    <a class="btn btn--black" href="${attr(d.vcfName)}" data-umami-event="vcard-contacto">${icon('contact')}<span>${esc(cta.save)}</span></a>
    <p class="save-help">${esc(cta.save_help || '')}</p>
    <p class="phone num" id="phone">${esc(d.phoneDisplay)}</p>
    <div class="grid2">${channels}</div>
    <div class="legal">
      ${cs.coverage ? `<p>${esc(cs.coverage)}</p>` : ''}
      <p>${esc(person.name)}, ${esc(person.title_long || person.title)}.${person.cedula ? ` ${esc(person.cedula_label || 'Céd. Prof.')} <span class="num">${esc(person.cedula)}</span>.` : ''}</p>
      ${cs.disclaimer ? `<p>${esc(cs.disclaimer)}</p>` : ''}
    </div>
  </section>
</main>

<footer class="front" aria-label="Marca">
  <img class="logo" src="brand/logo-black.svg" width="${brand.logo.w.toFixed(0)}" height="${brand.logo.h.toFixed(0)}" alt="" loading="lazy">
  <img class="wordmark" src="brand/wordmark-black.svg" width="${brand.wordmark.w.toFixed(0)}" height="${brand.wordmark.h.toFixed(0)}" alt="${attr(person.title)}" loading="lazy">
  ${firmaImg('firma', 'black', true)}
</footer>

<div class="sticky" id="sticky" aria-hidden="true">
  <a class="btn btn--cream" href="${attr(d.waLink)}" data-wa="main" tabindex="-1" data-umami-event="whatsapp-sticky">${icon('whatsapp')}<span>${esc(cta.whatsapp)}</span></a>
</div>

<dialog class="qr" id="qr" aria-labelledby="qr-title">
  <div class="qr__inner">
    <button class="qr__close" type="button" id="close-qr" aria-label="Cerrar">×</button>
    <p class="qr__title" id="qr-title">${esc(qrm?.title || 'Escanee para abrir mi tarjeta')}</p>
    <div class="qr__code" role="img" aria-label="Código QR de esta tarjeta">${svgScreen}</div>
    <div class="qr__brand"><img class="wordmark" src="brand/wordmark-black.svg" width="${brand.wordmark.w.toFixed(0)}" height="${brand.wordmark.h.toFixed(0)}" alt="${attr(person.title)}">${firmaImg('firma', 'black')}</div>
    <p class="qr__hint">${esc(qrm?.hint || '')}</p>
    ${qrm?.brightness_toast ? `<p class="qr__tip">${esc(qrm.brightness_toast)}</p>` : ''}
  </div>
</dialog>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
(function(){
  var C=${jsonInline(jsConfig)};
  var $=function(id){return document.getElementById(id);};
  var src=new URLSearchParams(location.search).get('src')||'';

  /* Mensaje principal: quien llega por un link compartido no "vio a Paola en la carrera". */
  if(src==='compartido'){
    var ge='?text='+encodeURIComponent(C.greetEvent),gg='?text='+encodeURIComponent(C.greetGeneric);
    var links=document.querySelectorAll('a[href^="https://wa.me/"]:not([data-umami-event="whatsapp-promo"])');
    for(var i=0;i<links.length;i++){links[i].href=links[i].href.replace(ge,gg);}
  }
  if(src){
    var tracked=document.querySelectorAll('[data-umami-event]');
    for(var j=0;j<tracked.length;j++){tracked[j].setAttribute('data-umami-event-src',src);}
  }

  /* Promo: se oculta sola cuando vence (fecha local del visitante). */
  var promo=$('promo');
  if(promo&&promo.getAttribute('data-until')){
    var u=promo.getAttribute('data-until').split('-');
    if(new Date()>new Date(+u[0],+u[1]-1,+u[2],23,59,59)){promo.hidden=true;}
  }

  /* Toast + copiar */
  var toast=$('toast'),toastT;
  function say(msg){ if(!msg)return; toast.textContent=msg; toast.classList.add('is-on'); clearTimeout(toastT); toastT=setTimeout(function(){toast.classList.remove('is-on');},1800); }
  function copy(text,ok){
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(function(){say(ok);},function(){fallbackCopy(text,ok);}); }
    else{ fallbackCopy(text,ok); }
  }
  function fallbackCopy(text,ok){
    var ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select(); var done=false; try{done=document.execCommand('copy');}catch(e){}
    document.body.removeChild(ta); if(done){say(ok);}else{prompt('',text);}
  }
  $('copy-num').addEventListener('click',function(){ copy(C.number,C.copied); });
  var ced=$('copy-cedula'); if(ced){ ced.addEventListener('click',function(){ copy(C.cedula,C.cedulaCopied); }); }

  /* QR pantalla a pantalla: #qr lo abre directo (Paola lo guarda en su pantalla de inicio). */
  var qr=$('qr'),lock=null,pushed=false;
  function showQR(fromClick){
    if(qr.open)return;
    if(qr.showModal){qr.showModal();}else{qr.setAttribute('open','');}
    if(fromClick&&location.hash!=='#qr'){history.pushState(null,'',location.pathname+location.search+'#qr');pushed=true;}
    if(navigator.wakeLock&&navigator.wakeLock.request){navigator.wakeLock.request('screen').then(function(l){lock=l;}).catch(function(){});}
  }
  function hideQR(){
    if(qr.open){ if(qr.close){qr.close();}else{qr.removeAttribute('open');} }
    if(lock){lock.release().catch(function(){});lock=null;}
    if(location.hash==='#qr'){ if(pushed){pushed=false;history.back();}else{history.replaceState(null,'',location.pathname+location.search);} }
  }
  $('open-qr').addEventListener('click',function(){showQR(true);});
  $('close-qr').addEventListener('click',hideQR);
  qr.addEventListener('close',hideQR);
  if(location.hash==='#qr'){ showQR(false); }
  window.addEventListener('popstate',function(){ if(location.hash==='#qr'){showQR(false);}else{pushed=false;hideQR();} });

  /* Compartir: hoja nativa o copiar enlace. */
  $('share').addEventListener('click',function(){
    if(navigator.share){ navigator.share({title:C.shareTitle,text:C.shareText,url:C.shareUrl}).catch(function(){}); }
    else{ copy(C.shareUrl,C.linkCopied); }
  });

  /* Barra fija: solo cuando ningún botón principal está en pantalla y ya se pasó el del hero. */
  var sticky=$('sticky'),greens=[$('cta-wa'),$('cta-wa-2')],vis={};
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      for(var k=0;k<entries.length;k++){vis[entries[k].target.id]=entries[k].isIntersecting;}
      var heroAbove=greens[0].getBoundingClientRect().bottom<0;
      var on=heroAbove&&!vis['cta-wa']&&!vis['cta-wa-2'];
      sticky.classList.toggle('is-on',on); sticky.setAttribute('aria-hidden',String(!on)); sticky.querySelector('a').tabIndex=on?0:-1;
    },{threshold:0});
    for(var g=0;g<greens.length;g++){ if(greens[g]){io.observe(greens[g]);} }
  }
})();
</script>
${umamiTag}
</body>
</html>
`;
}

function jsonLd(cfg, d) {
  const { person, contact } = cfg;
  return {
    '@context': 'https://schema.org',
    '@type': 'Physiotherapy',
    name: `${person.name} · ${person.title}`,
    url: d.baseUrl,
    telephone: `+${contact.whatsapp}`,
    ...(contact.email ? { email: contact.email } : {}),
    areaServed: { '@type': 'City', name: person.city },
    address: { '@type': 'PostalAddress', addressLocality: person.city, addressRegion: person.state, addressCountry: 'MX' },
    founder: { '@type': 'Person', name: person.name, jobTitle: person.title_long || person.title },
    sameAs: contact.instagram ? [`https://instagram.com/${contact.instagram.replace(/^@/, '')}`] : [],
  };
}

function icon(name) {
  const p = {
    whatsapp:
      '<path d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.5 0 .2 5.3.2 11.8c0 2.1.5 4.1 1.6 5.9L0 24l6.5-1.7a11.8 11.8 0 0 0 5.5 1.4c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.3-8.4zM12 21.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 0 1-1.5-5.2C2.1 6.4 6.5 2 12 2c2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 0 1 2.9 6.9c0 5.5-4.4 9.9-9.8 9.9zm5.4-7.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z" fill="currentColor"/>',
    phone:
      '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" fill="currentColor"/>',
    mail: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V18h16V7.4l-8 5.3-8-5.3zM4.9 7l7.1 4.7L19.1 7H4.9z" fill="currentColor"/>',
    instagram:
      '<path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z" fill="currentColor"/>',
    contact:
      '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-3.3 0-8 1.7-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-3.3-4.7-5-8-5z" fill="currentColor"/><path d="M19 3h2v4h-2zM18 5v-2h4v2z" fill="currentColor"/>',
    qr: '<path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3z" fill="currentColor"/>',
    copy: '<path d="M8 2h11a1 1 0 0 1 1 1v13h-2V4H8V2zM4 6h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1 2v12h9V8H5z" fill="currentColor"/>',
    share:
      '<path d="M18 16a3 3 0 0 0-2.4 1.2l-7-4a3 3 0 0 0 0-2.4l7-4A3 3 0 1 0 15 5c0 .2 0 .4.1.6l-7 4a3 3 0 1 0 0 4.8l7 4A3 3 0 1 0 18 16z" fill="currentColor"/>',
    check: '<path d="M9.5 16.2 5.3 12l1.4-1.4 2.8 2.8 7.8-7.8 1.4 1.4z" fill="currentColor"/>',
    external: '<path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z" fill="currentColor"/>',
  }[name];
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${p}</svg>`;
}
