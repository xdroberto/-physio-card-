// Genera una vCard 3.0 (la versión que iOS y Android importan sin sorpresas).
// Reglas: CRLF, valores con , ; \ y saltos de línea escapados, líneas > 75 bytes plegadas.

const esc = (v = '') =>
  String(v)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\;');

function fold(line) {
  // RFC 6350 §3.2: plegar a 75 octetos; la continuación empieza con un espacio.
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const out = [];
  let chunk = '';
  let chunkBytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch, 'utf8');
    const limit = out.length === 0 ? 75 : 74; // la continuación gasta 1 en el espacio
    if (chunkBytes + b > limit) {
      out.push(chunk);
      chunk = ch;
      chunkBytes = b;
    } else {
      chunk += ch;
      chunkBytes += b;
    }
  }
  if (chunk) out.push(chunk);
  return out.map((l, i) => (i === 0 ? l : ' ' + l)).join('\r\n');
}

export function splitName(fullName) {
  // "Paola García Moctezuma" -> given "Paola", family "García Moctezuma".
  // Para dos apellidos mexicanos, el primer token es el nombre y el resto apellidos.
  const parts = String(fullName).trim().split(/\s+/);
  if (parts.length === 1) return { given: parts[0], family: '' };
  return { given: parts[0], family: parts.slice(1).join(' ') };
}

export function buildVCard(cfg) {
  const { person, contact, site } = cfg;
  const { given, family } = splitName(person.name);
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  lines.push(`N:${esc(family)};${esc(given)};;;`);
  lines.push(`FN:${esc(person.name)}`);
  if (person.title) lines.push(`TITLE:${esc(person.title)}`);
  if (person.org) lines.push(`ORG:${esc(person.org)}`);
  if (contact.whatsapp) lines.push(`TEL;TYPE=CELL,VOICE:+${contact.whatsapp}`);
  if (contact.email) lines.push(`EMAIL;TYPE=INTERNET,PREF:${esc(contact.email)}`);
  if (site.url) lines.push(`URL:${site.url}`);
  if (person.city) lines.push(`ADR;TYPE=WORK:;;;${esc(person.city)};${esc(person.state || '')};;${esc(person.country || 'México')}`);
  if (contact.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/${contact.instagram.replace(/^@/, '')}`);
  const note = [
    person.cedula ? `Cédula profesional ${person.cedula}.` : '',
    person.vcard_note || '',
  ].filter(Boolean).join(' ');
  if (note) lines.push(`NOTE:${esc(note)}`);
  lines.push(`REV:${cfg.build_date || '2026-01-01'}T00:00:00Z`);
  lines.push('END:VCARD');
  return lines.map(fold).join('\r\n') + '\r\n';
}
