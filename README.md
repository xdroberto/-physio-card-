# Tarjeta digital · Paola García Moctezuma

Tarjeta de presentación digital, 100 % móvil, para captar pacientes con un QR: una página estática
sin frameworks que abre en un segundo con mala señal, con **WhatsApp como acción principal**,
**Guardar contacto** (vCard) y un **modo "Mostrar QR"** para que Paola la enseñe desde su teléfono.

La identidad es la de la tarjeta impresa (Canva): crema `#FBEEE6` y negro, el logo de columna, el
wordmark "Fisioterapeuta" y la firma extraídos del PDF como vectores exactos (`public/brand/`), y las
mismas tipografías, Italiana (títulos) y Jost (texto), autoalojadas en `public/fonts/`. El hero
reproduce el reverso de la tarjeta (tagline, citas, zona y cédula); el pie, el frente.

Dominio previsto: **https://paola.robertobh.dev** (subdominio de robertobh.dev).

## Estrategia en una hoja

| Momento | Qué pasa | Qué lo resuelve |
|---|---|---|
| Alguien ve la hoja en la carpa | Escanea el QR con su cámara | `dist/imprimir.html` (hoja carta con QR grande + número de respaldo) |
| Paola atiende a alguien y no hay hoja a la mano | Abre `paola.robertobh.dev/#qr` en su teléfono y se lo muestra | Modo QR a pantalla completa |
| El lead abre la página al sol, con prisa | Ve nombre, cédula, a qué se dedica y un botón verde enorme | Hero compacto + CTA WhatsApp sobre el pliegue + barra fija al hacer scroll |
| El lead no quiere escribir ahora | Toca **Guardar contacto** y queda en su agenda | vCard con nombre, teléfono, URL y nota "nos conocimos en la carrera" |
| El lead escribe | Llega un WhatsApp que ya dice "te vi en la carrera de MTB" | Mensaje prellenado: Paola sabe de dónde viene cada lead |
| El lead tiene un dolor concreto | Toca "Rodilla y cadera al pedalear" y se abre WhatsApp con la molestia ya escrita | Chips de dolor: cada uno es un enlace directo a wa.me |
| El lead duda si escribir hoy | Ve la promo de la carrera con precio, precio regular y fecha límite | Placa amarilla; se oculta sola al vencer |
| El dominio no está listo a medianoche | Se imprime la hoja de respaldo, cuyo QR abre WhatsApp directo | `dist/imprimir-whatsapp.html` |
| Roberto quiere medir | Cuántos escaneos, cuántos toques al botón, de qué QR | Umami self-hosted (opcional), `?src=qr-hoja` vs `?src=qr-tel` |

Decisiones deliberadas:

- **Sin modo oscuro del sistema.** La página fija sus colores: el hero negro es el reverso de la tarjeta y el
  resto va en crema, que a brillo máximo se lee bajo el sol.
- **Cero requests a terceros.** Sin CDN ni JS externo; las dos fuentes van en el mismo dominio (37 KB en
  total, con `font-display: swap`: el texto aparece antes de que carguen). El HTML pesa ~48 KB con el QR y
  el logo inline.
- **Registro de tú.** Público deportivo, trato directo.
- **La cédula profesional visible.** En México es la señal de confianza número uno para un fisioterapeuta.
- **Sin formulario.** En un cerro nadie llena formularios; WhatsApp es el formulario.

## Antes de publicar (5 minutos)

Todo lo editable vive en **`card.config.json`**. Lo mínimo:

1. `contact.whatsapp`: ya está el número de la tarjeta (`524425500158`, se muestra como 442 550 0158).
   Si cambia, va **con lada de país y sin "+"**, solo dígitos. El build se niega a publicar con un marcador
   tipo `52XXXXXXXXXX`: un QR impreso que lleva a un WhatsApp inexistente es peor que no tener tarjeta.
2. `promo`: Paola confirma `price` (propuesta $650), `regular_price` ($800) y `until` (propuesta
   2026-10-11, 14 días después de la carrera). Si no quiere promo: `"enabled": false`.
3. `how.price`: el precio regular que se publica en "Así funciona" (vacío = no se muestra).
4. `contact.email` e `contact.instagram` (opcionales; si van vacíos, el botón no se muestra).
5. Foto (opcional): guardar `public/paola.jpg` (cuadrada, ~400 px, < 40 KB) y poner `"photo": "paola.jpg"`.
6. `site.umami.website_id` (opcional): crear el sitio `paola.robertobh.dev` en stats.robertobh.dev y pegar el ID.

Todo lo demás (textos, chips de dolor con su mensaje, pasos, hoja impresa, Open Graph) también vive
en ese JSON. Para el próximo evento solo cambian los textos que mencionan la carrera.

Después:

```bash
npm ci
npm run build          # genera dist/
npm test               # 13 pruebas: enlaces, vCard, peso, copy, archivos
npm run dev            # sirve dist/ en http://localhost:4173
npm run screenshots    # capturas iPhone/Android + hoja-qr.pdf en screenshots/ (usa Playwright)
node scripts/og.mjs    # regenerar public/og.png e íconos si cambian nombre o colores
```

`npm run build` imprime las URLs que llevan los QR. Salidas para mañana:

| Archivo | Qué es |
|---|---|
| `dist/imprimir.html` | Hoja carta con QR a la tarjeta. Abrir en el navegador → Imprimir → Guardar PDF. Papel mate, 3 copias. |
| `dist/imprimir-whatsapp.html` | Hoja de respaldo: el QR abre WhatsApp directo con el mensaje listo. Sirve aunque el dominio no exista. |
| `dist/qr-print.png` | Solo el QR (1600 px) por si se quiere pegar en otro diseño. |
| `https://paola.robertobh.dev/#qr` | Modo "Mostrar QR" para el teléfono de Paola. Que lo agregue a su pantalla de inicio. |

Antes de imprimir: probar el QR con un iPhone y un Android usando datos móviles (no wifi), y tocar
WhatsApp, Llamar y Guardar contacto desde el teléfono.

## Publicar

El QR lleva `https://paola.robertobh.dev/`. Esa URL se puede apuntar a cualquiera de las dos
opciones, hoy o dentro de un año, sin reimprimir nada.

### Opción A · GitHub Pages (recomendada: cero servidor que mantener)

1. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Pages → Custom domain:** `paola.robertobh.dev`. Guardar.
3. En el DNS de robertobh.dev, registro **CNAME**: `paola` → `xdroberto.github.io` (TTL bajo, 300 s).
4. Push a `main` (o **Actions → "Deploy — GitHub Pages" → Run workflow**). En ~1 min está publicado.
5. Cuando GitHub termine de emitir el certificado (minutos, a veces una hora), marcar **Enforce HTTPS**.

Mientras el DNS propaga, la misma página vive en `https://xdroberto.github.io/-physio-card-/`.

### Opción B · VPS Hetzner (el mismo nginx que sirve robertobh.dev)

1. DNS: registro **A** `paola` → `178.156.248.110`.
2. Una sola vez, desde este repo:
   ```bash
   scp deploy/setup-vps.sh deploy/nginx-paola.conf root@178.156.248.110:/root/
   ssh root@178.156.248.110 'bash /root/setup-vps.sh'   # crea /var/www/paola, emite el cert, instala el vhost
   ```
3. Subir el build: `npm run build && scp -r dist/* root@178.156.248.110:/var/www/paola/`,
   o agregar el secret `DEPLOY_SSH_KEY` y correr **Actions → "Deploy — VPS Hetzner"**.

`deploy/nginx-paola.conf` sigue el patrón de robertobh.dev (config-as-code, cabeceras de seguridad,
`index.html` sin caché) y agrega el tipo MIME `text/vcard` para que iOS abra la vCard como contacto.

## Estructura

```
card.config.json        ← TODO el contenido y los datos de contacto
scripts/build.mjs       ← genera dist/ (HTML, vCard, QR svg/png, hoja de impresión, manifest)
scripts/render-*.mjs    ← plantillas (template literals, sin motor de plantillas)
scripts/vcard.mjs       ← vCard 3.0 con escapes y plegado RFC
scripts/qr.mjs          ← QR con parámetro ?src= para distinguir hoja vs. teléfono
scripts/og.mjs          ← imagen Open Graph e íconos (Playwright)
scripts/screenshots.mjs ← capturas móviles y PDF de la hoja
public/brand/           ← logo, wordmark y firma (vectores exactos de la tarjeta impresa)
public/fonts/           ← Italiana y Jost (woff2, subconjunto latín)
public/                 ← estáticos que se copian tal cual (og.png, íconos, foto)
scripts/brand.mjs       ← variantes de color de la marca, favicon
deploy/                 ← nginx + script de alta en el VPS
.github/workflows/      ← Pages (push a main) y VPS (manual)
test/                   ← node:test
```

## Guion para Paola en la carpa

Al terminar cada masaje, la misma frase: "Escanea aquí, guárdame y escríbeme, te aplico la promo".
El guion verbal convierte más que cualquier diseño. En WhatsApp Business, activar el mensaje de
ausencia: "Gracias por escribir. Estoy en la carrera, te respondo hoy en la tarde. Cuéntame qué te
duele y qué días te acomodan". Brillo al máximo y bloqueo automático en 5 minutos mientras muestre el QR;
una captura del modo QR en la galería funciona sin señal y sin batería de red.

## Medir leads

- Cada QR lleva su fuente: la hoja impresa abre `/?src=qr-hoja`, el teléfono de Paola `/?src=qr-tel`,
  el botón Compartir `/?src=compartido` (con ese origen el mensaje prellenado no dice "te vi en la carrera").
- Los botones llevan `data-umami-event` (`whatsapp-hero`, `whatsapp-chip` con la zona, `whatsapp-promo`,
  `whatsapp-sticky`, `vcard-hero`, `qr-abrir`, `llamar`, `compartir`…) y la propiedad `src`. Con Umami
  activo, el embudo escaneo → toque → WhatsApp se ve en el dashboard.
- El mensaje prellenado de WhatsApp menciona la carrera: aunque no haya analítica, Paola sabe de dónde
  viene cada conversación.
