import { esc, attr } from './html.mjs';

// La tarjeta: una sola página móvil, seis secciones. Todo inline (CSS, SVG del QR, script
// mínimo). Cero fuentes externas y cero requests de terceros, salvo la analítica si se configura.
export function renderIndex({ cfg, d, svgScreen }) {
  const { person, contact, hero, cta, trust, how, og, pains, qr_modal: qrm, contact_section: cs, theme: t } = cfg;
  const promo = d.promo;
  const umami = cfg.site.umami || {};
  const umamiTag =
    umami.website_id && umami.src
      ? `<script defer src="${attr(umami.src)}" data-website-id="${attr(umami.website_id)}" data-domains="${attr(d.host)}"></script>`
      : '';

  const avatar = person.photo
    ? `<img class="avatar" src="${attr(person.photo)}" width="60" height="60" alt="Foto de ${esc(person.name)}" loading="eager" decoding="async">`
    : `<div class="avatar avatar--initials" aria-hidden="true">${esc(person.initials || person.name.slice(0, 1))}</div>`;

  const chips = (hero.chips || []).map((c) => `<li>${esc(c)}</li>`).join('');

  const painChips = d.pains
    .map(
      (p) => `<a class="pain" href="${attr(p.link)}" data-umami-event="whatsapp-chip" data-umami-event-zona="${attr(p.label)}"><span>${esc(p.label)}</span>${icon('whatsapp')}</a>`,
    )
    .join('');

  const trustItems = (trust.items || []).map((i) => `<li>${icon('check')}<span>${esc(i)}</span></li>`).join('');
  const verify =
    person.cedula_verify_url && trust.verify_label
      ? `<a class="verify" href="${attr(person.cedula_verify_url)}" target="_blank" rel="noopener" data-umami-event="verificar-cedula">${esc(trust.verify_label)} ${icon('external')}</a>`
      : '';

  const steps = (how.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const priceLine = how.price
    ? `<p class="price"><span>${esc(how.price_label || 'Sesión a domicilio')}: <b>${esc(how.price)}</b></span>${how.price_note ? `<span class="price__note">${esc(how.price_note)}</span>` : ''}</p>`
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
        <p class="promo__eyebrow">${esc(promo.eyebrow)}</p>
        <h2 id="promo-title" class="promo__title">${esc(promo.title)}</h2>
        <p class="promo__price"><b>${esc(promo.price)}</b> <s>${esc(promo.regular_price)}</s></p>
        <p class="promo__text">${esc(promo.text)}</p>
        <a class="btn btn--promo" href="${attr(d.waLinkPromo)}" data-umami-event="whatsapp-promo">${icon('whatsapp')}<span>${esc(promo.cta || cta.whatsapp)}</span></a>
        ${promo.fine_print ? `<p class="promo__fine">${esc(promo.fine_print)}</p>` : ''}
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
    brightness: qrm?.brightness_toast || '',
  };

  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light only">
<meta name="theme-color" content="${attr(t.bg)}">
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
<script type="application/ld+json">${JSON.stringify(jsonLd(cfg, d))}</script>
<style>
:root{
  --bg:${t.bg};--surface:${t.surface};--ink:${t.ink};--muted:${t.muted};--line:${t.line};
  --accent:${t.accent};--wa:${t.whatsapp};--wa-active:${t.whatsapp_active || t.whatsapp};
  --promo:${t.promo};--promo-ink:${t.promo_ink};
  --r:14px;--pad:18px;--maxw:520px;
  --safe-b:env(safe-area-inset-bottom,0px);
  color-scheme:light only;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:17px;line-height:1.45;-webkit-font-smoothing:antialiased;padding-bottom:calc(88px + var(--safe-b))}
a{color:var(--accent)}
img{max-width:100%;display:block}
h1,h2,h3,p,ul,ol{margin:0}
ul,ol{padding:0;list-style:none}
button{font:inherit;color:inherit}
b{font-weight:800}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:8px}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 16px}
.num{font-variant-numeric:tabular-nums;letter-spacing:.02em}

/* ---------- Hero ---------- */
.hero{padding:calc(12px + env(safe-area-inset-top,0px)) 0 4px}
.who{display:grid;grid-template-columns:60px minmax(0,1fr) auto;gap:12px;align-items:center}
.avatar{width:60px;height:60px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 3px var(--bg),0 0 0 5px var(--accent)}
.avatar--initials{display:grid;place-items:center;background:var(--accent);color:#fff;font-weight:800;font-size:22px;letter-spacing:.02em}
.name{font-size:22px;line-height:1.15;font-weight:800;letter-spacing:-.01em}
.cred{font-size:14.5px;line-height:1.3;color:var(--muted);font-weight:600;margin-top:2px;white-space:nowrap}
.qrpill{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:999px;border:2px solid var(--ink);background:var(--bg);font-weight:700;font-size:15px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;white-space:nowrap}
.qrpill svg{width:20px;height:20px}
.headline{font-size:clamp(28px,7.5vw,34px);line-height:1.1;font-weight:800;letter-spacing:-.02em;margin:16px 0 8px;text-wrap:balance}
.sub{font-size:17px;font-weight:500;color:var(--ink);text-wrap:pretty}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.chips li{font-size:14px;font-weight:700;padding:6px 11px;border-radius:999px;background:var(--surface);border:1px solid var(--line);color:var(--ink)}
.actions{display:grid;gap:10px;margin:16px 0 0}
.actions__row{display:grid;grid-template-columns:1fr 1fr;gap:10px}

/* ---------- Botones ---------- */
.btn{display:flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:10px 16px;border-radius:var(--r);font-weight:700;font-size:17px;line-height:1.15;text-decoration:none;border:2px solid var(--ink);background:var(--bg);color:var(--ink);-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .08s ease,filter .08s ease,background .08s ease;cursor:pointer;text-align:center}
.btn:active{transform:scale(.98);filter:brightness(.92)}
.btn svg{width:24px;height:24px;flex:none}
.btn--wa{background:var(--wa);color:#fff;border-color:#043F38;flex-direction:column;gap:2px;min-height:64px;font-size:20px}
.btn--wa:active{background:var(--wa-active)}
.btn--wa .btn__main{display:flex;align-items:center;gap:12px}
.btn--wa .btn__main svg{width:28px;height:28px}
.btn--wa .btn__sub{font-size:14px;font-weight:600;opacity:.95}
.btn--wa.btn--row{flex-direction:row;font-size:18px;min-height:60px}
.btn--outline{font-size:16px;min-height:52px}
.btn--outline svg{color:var(--accent)}
.btn--promo{background:var(--promo-ink);color:var(--promo);border-color:var(--promo-ink);min-height:56px;margin-top:12px}
.btn--promo svg{color:var(--promo)}

/* ---------- Secciones ---------- */
section{margin-top:20px}
.card{background:var(--bg);border:2px solid var(--line);border-radius:var(--r);padding:var(--pad)}
.h2{font-size:22px;font-weight:800;letter-spacing:-.01em;margin-bottom:8px}
.card__sub{font-size:16px;color:var(--muted);font-weight:500;margin:0 0 14px}
.promo{background:var(--promo);color:var(--promo-ink);border:3px solid var(--promo-ink);border-radius:16px;padding:var(--pad)}
.promo[hidden]{display:none}
.promo__eyebrow{font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.promo__title{font-size:20px;font-weight:800;line-height:1.2;margin:4px 0 2px}
.promo__price{display:flex;align-items:baseline;gap:10px;margin:2px 0 8px}
.promo__price b{font-size:34px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.01em;line-height:1}
.promo__price s{font-size:18px;font-weight:600;opacity:.8}
.promo__text{font-size:16px;font-weight:500}
.promo__fine{font-size:14px;font-weight:600;margin-top:10px}
.pains{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pain{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:56px;padding:10px 12px;border-radius:14px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font-weight:700;font-size:15.5px;line-height:1.2;text-decoration:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.pain:active{filter:brightness(.94)}
.pain svg{width:18px;height:18px;flex:none;color:var(--wa)}
.pains__note{font-size:15px;color:var(--muted);font-weight:500;margin-top:12px}
.trust__intro{font-size:17px;font-weight:500;margin-bottom:12px}
.cedula-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);margin-bottom:12px}
.cedula-row .lbl{font-size:14px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.cedula-copy{font-size:20px;font-weight:800;background:none;border:0;padding:6px 8px;border-radius:8px;cursor:pointer;color:var(--ink);display:inline-flex;align-items:center;gap:6px;min-height:40px}
.cedula-copy svg{width:18px;height:18px;color:var(--accent)}
.checks{display:grid;gap:10px}
.checks li{display:grid;grid-template-columns:24px 1fr;gap:10px;align-items:start;font-size:17px;font-weight:600}
.checks svg{width:24px;height:24px;color:var(--accent);margin-top:1px}
.verify{display:inline-flex;align-items:center;gap:6px;margin-top:14px;font-weight:600;font-size:15px;min-height:44px}
.verify svg{width:16px;height:16px}
.steps{display:grid;gap:12px;counter-reset:s}
.steps li{position:relative;padding-left:48px;counter-increment:s;font-size:17px;font-weight:500;min-height:36px}
.steps li::before{content:counter(s);position:absolute;left:0;top:0;width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;font-weight:800;display:grid;place-items:center;font-size:18px}
.price{display:grid;gap:2px;margin-top:14px;font-size:18px;font-weight:700}
.price b{font-variant-numeric:tabular-nums}
.price__note{font-size:15px;font-weight:500;color:var(--muted)}
.how .btn--wa{margin-top:14px}
.save-help{font-size:14px;font-weight:600;color:var(--muted);margin:8px 0 12px}
.phone{font-size:22px;font-weight:800;margin:0 0 14px;user-select:all;-webkit-user-select:all}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.legal{margin-top:18px;font-size:14px;font-weight:600;color:var(--muted);display:grid;gap:6px}
.legal .host{color:var(--accent)}

/* ---------- Barra fija ---------- */
.sticky{position:fixed;left:0;right:0;bottom:0;padding:8px 16px calc(8px + var(--safe-b));background:var(--bg);border-top:1px solid var(--line);transform:translateY(110%);transition:transform .15s ease;z-index:20}
.sticky.is-on{transform:none}
.sticky .btn--wa{max-width:var(--maxw);margin:0 auto;min-height:56px}

/* ---------- QR ---------- */
dialog.qr{border:0;padding:0;background:#fff;color:var(--ink);width:min(100vw,560px);max-width:100vw;height:100dvh;max-height:100dvh;margin:0 auto}
dialog.qr::backdrop{background:#fff}
.qr__inner{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;padding:24px 20px calc(24px + var(--safe-b));text-align:center;gap:12px}
.qr__title{font-size:22px;font-weight:800;padding:0 56px}
.qr__code{width:min(88vw,60dvh,440px);height:auto}
.qr__code svg{width:100%;height:auto;display:block}
.qr__name{font-size:17px;font-weight:700}
.qr__hint{font-size:16px;font-weight:500;color:var(--muted);max-width:34ch}
.qr__url{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;color:var(--accent);font-size:16px}
.qr__close{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));right:12px;width:56px;height:56px;border-radius:50%;border:2px solid var(--ink);background:#fff;font-size:28px;line-height:1;color:var(--ink);cursor:pointer;touch-action:manipulation}

/* ---------- Toast ---------- */
.toast{position:fixed;left:50%;bottom:calc(92px + var(--safe-b));transform:translate(-50%,20px);background:var(--ink);color:#fff;font-weight:700;font-size:15px;padding:12px 18px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s;z-index:40;max-width:calc(100vw - 32px);text-align:center}
.toast.is-on{opacity:1;transform:translate(-50%,0)}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
@media (min-width:600px){.hero{padding-top:32px}}
@media print{.sticky,.toast,.qrpill{display:none}}
</style>
</head>
<body>
<main class="wrap" id="top">
  <header class="hero">
    <div class="who">
      ${avatar}
      <div class="who__txt">
        <p class="name">${esc(person.name)}</p>
        <p class="cred">${esc(person.title)}${person.cedula ? `<br>Cédula profesional <span class="num">${esc(person.cedula)}</span>` : ''}</p>
      </div>
      <button class="qrpill" type="button" id="open-qr" data-umami-event="qr-abrir" aria-label="${attr(cta.qr)}">${icon('qr')}<span>QR</span></button>
    </div>
    <h1 class="headline">${esc(hero.headline)}</h1>
    <p class="sub">${esc(hero.sub)}</p>
    ${chips ? `<ul class="chips" aria-label="Datos clave">${chips}</ul>` : ''}
    <nav class="actions" aria-label="Contacto directo">
      <a id="cta-wa" class="btn btn--wa" href="${attr(d.waLink)}" data-wa="main" data-umami-event="whatsapp-hero">
        <span class="btn__main">${icon('whatsapp')}<span>${esc(cta.whatsapp)}</span></span>
        <span class="btn__sub">${esc(cta.whatsapp_sub)}</span>
      </a>
      <div class="actions__row">
        <a class="btn btn--outline" href="${attr(d.vcfName)}" download data-umami-event="vcard-hero">${icon('contact')}<span>${esc(cta.save)}</span></a>
        <a class="btn btn--outline" href="${attr(d.telLink)}" data-umami-event="llamar-hero">${icon('phone')}<span>${esc(cta.call)}</span></a>
      </div>
    </nav>
  </header>

  ${promoBlock}

  <section class="card" aria-labelledby="pain-title">
    <h2 class="h2" id="pain-title">${esc(pains.title)}</h2>
    <p class="card__sub">${esc(pains.sub || '')}</p>
    <div class="pains">${painChips}</div>
    ${pains.note ? `<p class="pains__note">${esc(pains.note)}</p>` : ''}
  </section>

  <section class="card" aria-labelledby="trust-title">
    <h2 class="h2" id="trust-title">${esc(trust.title)}</h2>
    ${trust.intro ? `<p class="trust__intro">${esc(trust.intro)}</p>` : ''}
    ${person.cedula ? `<div class="cedula-row"><span class="lbl">Cédula profesional</span><button class="cedula-copy num" type="button" id="copy-cedula" data-umami-event="copiar-cedula">${esc(person.cedula)} ${icon('copy')}</button><span class="lbl">${esc(person.title)}</span></div>` : ''}
    <ul class="checks">${trustItems}</ul>
    ${verify}
  </section>

  <section class="card how" aria-labelledby="how-title">
    <h2 class="h2" id="how-title">${esc(how.title)}</h2>
    <ol class="steps">${steps}</ol>
    ${priceLine}
    <a id="cta-wa-2" class="btn btn--wa btn--row" href="${attr(d.waLink)}" data-wa="main" data-umami-event="whatsapp-how">${icon('whatsapp')}<span>${esc(cta.whatsapp_how || cta.whatsapp)}</span></a>
  </section>

  <section class="card" aria-labelledby="contact-title" id="contacto">
    <h2 class="h2" id="contact-title">${esc(cs.title)}</h2>
    <p class="card__sub">${esc(cs.sub || '')}</p>
    <a class="btn btn--outline" href="${attr(d.vcfName)}" download data-umami-event="vcard-contacto">${icon('contact')}<span>${esc(cta.save)}</span></a>
    <p class="save-help">${esc(cta.save_help || '')}</p>
    <p class="phone num" id="phone">${esc(d.phoneDisplay)}</p>
    <div class="grid2">${channels}</div>
    <div class="legal">
      <p>${esc(cs.coverage)}</p>
      <p>${esc(person.name)}. ${esc(person.title)}.${person.cedula ? ` Cédula profesional ${esc(person.cedula)}.` : ''}</p>
      ${cs.disclaimer ? `<p>${esc(cs.disclaimer)}</p>` : ''}
      <p class="host">${esc(d.host)}</p>
    </div>
  </section>
</main>

<div class="sticky" id="sticky" aria-hidden="true">
  <a class="btn btn--wa btn--row" href="${attr(d.waLink)}" data-wa="main" tabindex="-1" data-umami-event="whatsapp-sticky">${icon('whatsapp')}<span>${esc(cta.whatsapp)}</span></a>
</div>

<dialog class="qr" id="qr" aria-labelledby="qr-title">
  <div class="qr__inner">
    <button class="qr__close" type="button" id="close-qr" aria-label="Cerrar">×</button>
    <p class="qr__title" id="qr-title">${esc(qrm?.title || 'Escanea para abrir mi tarjeta')}</p>
    <div class="qr__code" role="img" aria-label="Código QR de esta tarjeta">${svgScreen}</div>
    <p class="qr__name">${esc(person.short_name || person.name)} · Fisioterapia</p>
    <p class="qr__hint">${esc(qrm?.hint || '')}</p>
    <p class="qr__url">${esc(d.host)}</p>
  </div>
</dialog>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
(function(){
  var C=${JSON.stringify(jsConfig)};
  var $=function(id){return document.getElementById(id);};
  var src=new URLSearchParams(location.search).get('src')||'';

  /* Mensaje principal: quien llega por un link compartido no "vio a Paola en la carrera". */
  if(src==='compartido'){
    var msg=C.waBase+encodeURIComponent(C.greetGeneric+' '+C.ask);
    var mains=document.querySelectorAll('a[data-wa="main"]');
    for(var i=0;i<mains.length;i++){mains[i].href=msg;}
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
    say(C.brightness);
  }
  function hideQR(){
    if(qr.open){ if(qr.close){qr.close();}else{qr.removeAttribute('open');} }
    if(lock){lock.release().catch(function(){});lock=null;}
    if(location.hash==='#qr'){ if(pushed){pushed=false;history.back();}else{history.replaceState(null,'',location.pathname+location.search);} }
  }
  $('open-qr').addEventListener('click',function(){showQR(true);});
  $('close-qr').addEventListener('click',hideQR);
  qr.addEventListener('click',function(e){ if(e.target===qr){hideQR();} });
  qr.addEventListener('close',hideQR);
  if(location.hash==='#qr'){ showQR(false); }
  window.addEventListener('popstate',function(){ if(location.hash==='#qr'){showQR(false);}else{pushed=false;hideQR();} });

  /* Compartir: hoja nativa o copiar enlace. */
  $('share').addEventListener('click',function(){
    if(navigator.share){ navigator.share({title:C.shareTitle,text:C.shareText,url:C.shareUrl}).catch(function(){}); }
    else{ copy(C.shareUrl,C.linkCopied); }
  });

  /* Barra fija: solo cuando ningún botón verde está en pantalla y ya se pasó el del hero. */
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
    name: `${person.name} · Fisioterapia`,
    url: d.baseUrl,
    telephone: `+${contact.whatsapp}`,
    ...(contact.email ? { email: contact.email } : {}),
    areaServed: { '@type': 'City', name: person.city },
    address: { '@type': 'PostalAddress', addressLocality: person.city, addressRegion: person.state, addressCountry: 'MX' },
    founder: { '@type': 'Person', name: person.name, jobTitle: person.title },
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
    check: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.6 14.6-4-4 1.4-1.4 2.6 2.6 5.8-5.8 1.4 1.4-7.2 7.2z" fill="currentColor"/>',
    external: '<path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z" fill="currentColor"/>',
  }[name];
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${p}</svg>`;
}
