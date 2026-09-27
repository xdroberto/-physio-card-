// Carga Playwright desde node_modules local o desde la instalación global (entorno CI/remoto).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
const require = createRequire(import.meta.url);
export function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    const g = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return require(path.join(g, 'playwright'));
  }
}
export function serveDir(dir, port) {
  // Servidor estático mínimo para que las capturas se hagan por http (como en producción).
  return import('node:http').then(({ createServer }) =>
    import('node:fs/promises').then(({ readFile }) => {
      const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.vcf': 'text/vcard', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.jpg': 'image/jpeg' };
      const server = createServer(async (req, res) => {
        let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        if (p.endsWith('/')) p += 'index.html';
        try {
          const buf = await readFile(path.join(dir, p));
          res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
          res.end(buf);
        } catch {
          res.writeHead(404); res.end('404');
        }
      });
      return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
    }),
  );
}
