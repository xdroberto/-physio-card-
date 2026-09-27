// Activos de marca extraídos como vectores exactos de la tarjeta impresa (PDF de Canva):
// logo (columna), wordmark "Fisioterapeuta" y firma "Paola García Moctezuma".
// Los SVG fuente usan fill="currentColor"; aquí se producen variantes con color fijo para <img>.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { esc } from './html.mjs';

export async function loadBrand(publicDir) {
  const names = ['logo', 'wordmark', 'firma'];
  const out = {};
  for (const n of names) {
    const svg = await readFile(path.join(publicDir, 'brand', `${n}.svg`), 'utf8');
    const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    out[n] = { svg, w: Number(vb[1]), h: Number(vb[2]) };
  }
  return out;
}

// SVG inline con color heredado; se le puede dar clase y título accesible.
export function inlineSvg(asset, { className = '', label = '' } = {}) {
  const attrs = [className ? `class="${esc(className)}"` : '', label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"']
    .filter(Boolean)
    .join(' ');
  return asset.svg.replace('<svg ', `<svg ${attrs} `);
}

export async function writeBrandVariants(brand, outDir, colors) {
  await mkdir(path.join(outDir, 'brand'), { recursive: true });
  for (const [name, asset] of Object.entries(brand)) {
    for (const [cname, hex] of Object.entries(colors)) {
      const svg = asset.svg.replace('fill="currentColor"', `fill="${hex}"`);
      await writeFile(path.join(outDir, 'brand', `${name}-${cname}.svg`), svg);
    }
  }
}

// Favicon e ícono: la columna en negro sobre crema, como el frente de la tarjeta.
export function faviconSvg(brand, { cream, black }) {
  const { w, h } = brand.logo;
  const size = 64;
  const scale = (size * 0.66) / Math.max(w, h);
  const tx = (size - w * scale) / 2;
  const ty = (size - h * scale) / 2;
  const paths = brand.logo.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="14" fill="${cream}"/><g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})" fill="${black}">${paths}</g></svg>`;
}
