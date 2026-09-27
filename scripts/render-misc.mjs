import { esc } from './html.mjs';

export function render404({ cfg, d }) {
  return `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=/">
<title>${esc(cfg.person.name)}</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;padding:32px 16px;text-align:center;color:#0a0a0a;background:#FBEEE6}</style>
</head><body><p>La página no existe. Redirigiendo a la tarjeta de ${esc(cfg.person.name)}.</p>
<p><a href="/">${esc(d.host)}</a></p></body></html>
`;
}

export function renderManifest({ cfg }) {
  return JSON.stringify(
    {
      name: `${cfg.person.short_name || cfg.person.name} · Fisioterapia`,
      short_name: cfg.person.short_name || cfg.person.name,
      description: cfg.og?.description || '',
      start_url: '/?src=inicio#qr',
      shortcuts: [{ name: 'Mostrar QR', short_name: 'QR', url: '/?src=inicio#qr' }, { name: 'Tarjeta', short_name: 'Tarjeta', url: '/?src=inicio' }],
      display: 'standalone',
      background_color: cfg.theme?.cream || '#ffffff',
      theme_color: cfg.theme?.black || '#0a0a0a',
      lang: 'es-MX',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2,
  );
}

export function renderRobots({ d }) {
  return `User-agent: *\nAllow: /\nDisallow: /imprimir.html\nDisallow: /imprimir-whatsapp.html\n\nSitemap: ${d.baseUrl}sitemap.xml\n`;
}

export function renderSitemap({ cfg, d }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
  <url><loc>${esc(d.baseUrl)}</loc><lastmod>${esc(cfg.build_date)}</lastmod></url>
</urlset>
`;
}
