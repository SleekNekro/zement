# Textos legales: estado y pendientes

> Borradores redactados el 25/11/2026 para Zement, en español e inglés. **No son definitivos**:
> deben revisarlos la asesoría legal y la fiscal antes de publicar la web y la tienda.

## Dónde están

| Página               | Español                  | Inglés               | Fuente                                |
| -------------------- | ------------------------ | -------------------- | ------------------------------------- |
| Aviso legal          | `/aviso-legal/`          | `/en/legal-notice/`  | `apps/web/src/content/legal/{es,en}/` |
| Privacidad           | `/privacidad/`           | `/en/privacy/`       | ídem                                  |
| Cookies              | `/cookies/`              | `/en/cookies/`       | ídem                                  |
| Condiciones de venta | `/condiciones-de-venta/` | `/en/terms-of-sale/` | ídem                                  |

Las mismas cuatro páginas existen también en DE, FR, IT, PL, NO y FI (`apps/web/src/content/legal/<idioma>/`), con su dirección traducida (p. ej. `/de/datenschutz/`). Son traducciones del borrador: cualquier cambio legal se hace primero en español y después en el resto.

- Los datos de la empresa se escriben una sola vez en `apps/web/src/data/company.ts` → `legal` y se insertan en los cuatro textos mediante marcadores `{{clave}}`.
- Mientras `draft: true`, la página muestra un aviso de «Borrador pendiente de revisión legal». Cambiar a `false` tras la validación.
- Enlazadas desde el pie de todas las páginas y desde la casilla de privacidad del formulario.

## Base normativa usada

- LSSI-CE (Ley 34/2002): art. 10 (identificación) y art. 22.2 (cookies).
- RGPD (UE 2016/679) y LOPDGDD (Ley Orgánica 3/2018).
- RDL 1/2007 (consumidores): desistimiento de 14 días (arts. 102–108), excepciones (art. 103) y garantía de 3 años (art. 120).
- Conservación: Código de Comercio art. 30 (6 años) y Ley General Tributaria art. 66 (4 años).

## Datos que faltan (company.ts → legal)

Razón social, CIF, domicilio social, inscripción registral, correo de privacidad, dominios de web y tienda, pasarela de pago y transportista.

## Decisiones pendientes para la asesoría

1. Plazo de conservación de las consultas no convertidas en cliente.
2. Mecanismo de transferencia internacional de Resend y Cloudflare (Marco UE-EE. UU. o cláusulas tipo) y ubicación de la pasarela y el transportista.
3. IVA en ventas a Europa (ventanilla única OSS; inversión del sujeto pasivo para profesionales).
4. Costes de devolución en el desistimiento.
5. Si los productos tintados a medida quedan excluidos del desistimiento (art. 103.c).
6. Plazos de comunicación de incidencias (particulares y profesionales).
7. Condiciones profesionales: pedido mínimo, pago a plazo o transferencia, envíos en palé.
8. Adhesión o no a la Junta Arbitral de Consumo.

## Pendientes técnicos

- **Cookie `PHPSESSID` de la tienda:** en el entorno local caduca en 2083. En IONOS debe ser de sesión (`session.cookie_lifetime = 0`).
- **Tienda (PrestaShop):** sus páginas legales propias (CMS) deben mostrar estos mismos textos o enlazar a ellos, y la casilla de aceptación de condiciones del checkout debe apuntar a las condiciones de venta.
- **Turnstile:** confirmar con la configuración final de Cloudflare que no instala cookies de seguimiento.
