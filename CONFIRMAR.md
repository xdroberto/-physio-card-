# Por confirmar con Paola antes de imprimir

Cada punto vive en `card.config.json`. Lo que no se confirme, se deja como está o se apaga.

| # | Qué | Propuesta actual | Dónde |
|---|---|---|---|
| 1 | Precio promocional de la primera sesión a domicilio | $650 | `promo.price` |
| 2 | Precio regular de la sesión a domicilio (se publica) | $800 | `promo.regular_price` y `how.price` |
| 3 | Fecha límite de la promoción (14 días después del evento) | 11 de octubre de 2026 (domingo) | `promo.until` |
| 4 | La primera sesión incluye valoración y tratamiento sin cobro aparte | Sí | `promo.text` |
| 5 | La promoción aplica también a acompañantes | Sí | `promo.text` |
| 6 | Cobertura: atiende a domicilio en San José Iturbide y qué pasa con el traslado | "San José Iturbide: consultar traslado" | `how.price_note`, `person.zone` |
| 7 | Días de atención y de respuesta por WhatsApp | Con cita previa, lunes a sábado; respuesta el mismo día | `contact_section.coverage`, `cta.whatsapp_sub` |
| 8 | Correo e Instagram profesionales (si existen) | Vacíos: no se muestran | `contact.email`, `contact.instagram` |
| 9 | Vigencia de los datos de trayectoria | 4 años de práctica, 1 año en el CRIT Teletón, punción seca certificada, kinesiotape | `trust.facts` |
| 10 | Si prefiere no publicar precio regular | Se muestra | `how.price` vacío lo oculta |
| 11 | Si prefiere no tener promoción | Activa | `promo.enabled: false` |

Ya confirmado por la tarjeta impresa: nombre, "Fisioterapeuta", "Rehabilitación integral a domicilio",
citas 442 550 0158, Céd. Prof. 15860222, Querétaro y zona metropolitana.

Después de editar: `npm run build && npm test && npm run pdf`, revisar `screenshots/hoja-qr-tarjeta.pdf` y publicar.
