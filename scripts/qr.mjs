import QRCode from 'qrcode';

// URL que llevará el QR. `src` viaja como parámetro para saber de dónde llegó el lead
// (hoja impresa vs. pantalla del teléfono) en la analítica.
export function qrUrl(baseUrl, src) {
  const u = new URL(baseUrl);
  if (src) u.searchParams.set('src', src);
  return u.toString();
}

export async function qrSvg(text, { ecl = 'M', margin = 2, dark = '#000000', light = '#ffffff' } = {}) {
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: ecl,
    margin,
    color: { dark, light },
  });
}

export async function qrPng(text, { ecl = 'H', margin = 4, width = 1200 } = {}) {
  return QRCode.toBuffer(text, {
    type: 'png',
    errorCorrectionLevel: ecl,
    margin,
    width,
    color: { dark: '#000000', light: '#ffffff' },
  });
}
