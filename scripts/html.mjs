export const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Para atributos href/src ya codificados por URL: solo escapamos HTML.
export const attr = esc;

// JSON para incrustar en <script>: un </script> o un & en la config no pueden romper el HTML.
export const jsonInline = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
