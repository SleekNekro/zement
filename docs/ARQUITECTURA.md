# Zement — web de marca + tienda online (B2C y mayorista)

> Documento de arquitectura. Versión 2 (25/11/2026): **opción C — Astro + PrestaShop**, todo en el **IONOS Hosting Plus** que ya tiene Zement.
> Entorno local montado el 25/11/2026: ver `README.md`.
> Sustituye a la versión 1 (Astro + Medusa en VPS), descartada para no añadir un servidor ni un coste extra.

## Contexto

Zement es una marca nueva de microcemento y materiales. Su identidad usa azul marino `#2D4F70`, crema `#F5F0E6` y dorado `#B99A57`. Hoy no tiene web propia.

Se quiere una web que sea a la vez:

- **presentación de marca**;
- **tienda online** con dos canales:
  - **venta al por menor (B2C)**, con precios públicos;
  - **venta mayorista (B2B)**, con **tarifas por cliente**.

La web de marca será en **ES + EN** y la tienda en los **8 idiomas de las fichas técnicas** (ES, EN, DE, FR, IT, PL, NO, FI), con venta en España y la UE.

Decisiones tomadas por el usuario:

| Decisión       | Elección                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Marca          | Zement                                                                                                                            |
| Arquitectura   | Opción C: web de marca en Astro + tienda en PrestaShop, ambas en el hosting compartido IONOS Hosting Plus (PHP, MySQL, SFTP, SSH) |
| B2B en la v1   | Tarifas por cliente                                                                                                               |
| Fuera de la v1 | Alta con aprobación, pago a plazo e integración con el CRM                                                                        |
| Idiomas        | Web: ES + EN. Tienda: ES, EN, DE, FR, IT, PL, NO, FI (decidido el 25/11/2026)                                                     |

---

## 1. Stack

| Capa                           | Elección                                                                                                                                                                 | Por qué                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Web de marca (`www.<dominio>`) | **Astro 7** en modo estático, TypeScript, **Tailwind 4**, **Keystatic** + Markdoc                                                                                        | HTML estático en IONOS, máximo rendimiento y SEO                                                                                                       |
| Formularios de la web          | Endpoint **PHP** en IONOS + validación en servidor + honeypot + **Cloudflare Turnstile** + envío por **Resend**                                                          | El hosting ya ejecuta PHP: sin servidor aparte                                                                                                         |
| Tienda (`tienda.<dominio>`)    | **PrestaShop 9.2.1** (PHP 8.4 en local; comprobar la versión de PHP disponible en IONOS) + **MySQL** del propio hosting                                                  | B2C y B2B de serie: grupos de clientes, precios específicos por cliente, precios sin IVA por grupo, datos de empresa, cantidades mínimas y multiidioma |
| Tema de la tienda              | **Tema hijo propio** sobre **Hummingbird** (tema por defecto de PrestaShop 9.2, Bootstrap 5), versionado en Git                                                          | Mismo aspecto que la web de marca sin tocar el núcleo, para que las actualizaciones no rompan nada                                                     |
| Pagos                          | Tarjeta mediante el módulo **Redsys** (TPV del banco, con Bizum) o **Stripe** (decidir) y **transferencia bancaria** (módulo nativo), limitada a mayoristas si se quiere | PrestaShop permite activar o desactivar cada forma de pago por grupo de clientes                                                                       |
| Correo de la tienda            | SMTP del correo IONOS del dominio (o SMTP de Resend)                                                                                                                     | Que confirmaciones y avisos lleguen bien a la bandeja de entrada                                                                                       |
| Analítica                      | Plausible o Umami (sin cookies) en las dos partes                                                                                                                        | Evita banner por la analítica                                                                                                                          |
| Despliegue                     | GitHub Actions → SFTP (web Astro y tema/módulos propios)                                                                                                                 | El núcleo de PrestaShop no se guarda en Git                                                                                                            |

## 2. Arquitectura

```
                    IONOS Hosting Plus (PHP + MySQL)
                ┌──────────────────────────────────────────────┐
www.<dominio> ─▶│ /web     HTML estático Astro + contacto.php  │
                │                                               │
tienda.<dom.> ─▶│ /tienda  PrestaShop ──▶ MySQL (BD propia)     │
                └──────────────────────────────────────────────┘
                     │                 │
       build Astro ◀─┘ Webservice API  ├─▶ TPV Redsys / Stripe
       (solo lectura, en GitHub Actions)├─▶ SMTP (correos de pedidos)
                                        └─▶ Resend (formularios web)
```

### Reparto de papeles

- **Web de marca (Astro).** Contiene:
  - portada, empresa, proyectos, blog y contacto;
  - fichas **editoriales** de producto: usos, galerías y fichas técnicas en PDF.

  Cada ficha lleva un botón «Comprar» que enlaza con su producto en la tienda.

- **Tienda (PrestaShop).** Es la fuente de verdad de todo lo que se vende:
  - referencias (SKU), variantes, envases y pesos;
  - precios, tarifas y stock;
  - clientes, pedidos y envíos.
- **Enlace entre las dos.** Cada producto se identifica por su **referencia (SKU)**:
  - En Keystatic, cada ficha editorial guarda la referencia de PrestaShop.
  - Al generar la web, Astro consulta la **Webservice API de PrestaShop** con una clave **de solo lectura** y obtiene la URL de compra de cada producto en cada idioma y, si se decide, el precio público.
  - Los precios mayoristas **no salen nunca** en la web de marca.
- **Una sola experiencia.** Las dos partes comparten:
  - los mismos tokens de diseño (colores, tipografías y espaciados), escritos una vez y exportados a Tailwind y al CSS del tema;
  - la misma cabecera y el mismo pie, con enlaces cruzados;
  - el mismo favicon;
  - los mismos textos legales.

### Repositorio (`Desarrollo/ZementWeb/`)

Monorepo con **pnpm workspaces**: aplicaciones en `apps/`, piezas compartidas en `packages/`, entorno en `infra/`.

```
ZementWeb/
  apps/web/                    Web de marca (Astro)
  apps/tienda/theme/zement/    Tema hijo de PrestaShop (plantillas, CSS, traducciones)
  apps/tienda/modules/         Módulos propios si hacen falta (p. ej. reglas mayoristas)
  apps/tienda/config/          Configuración documentada y exportable (grupos, impuestos, transportistas)
  packages/design-tokens/      Colores, tipografías, espaciados y movimiento: fuente única
  infra/docker/                PrestaShop + MySQL para desarrollo local
  docs/                        Este documento, dirección visual, decisiones (ADR)
  AGENTS.md                    Normas de código, estructura y reglas del proyecto
```

- **Web:** Node 24 y pnpm. Calidad de código con Prettier, ESLint, Stylelint y TypeScript estricto (`pnpm verify`).
- **Tienda:** se desarrolla en local con la imagen Docker oficial de PrestaShop y la misma versión que en IONOS.

## 3. Venta al por menor (B2C) y mayorista (B2B) en PrestaShop

| Grupo de clientes              | Quién                       | Precios                                                                         | Pago                            |
| ------------------------------ | --------------------------- | ------------------------------------------------------------------------------- | ------------------------------- |
| Visitante / Invitado / Cliente | Público                     | Precio público **IVA incluido**                                                 | Tarjeta (y Bizum si hay Redsys) |
| Distribuidor                   | Mayorista                   | Tarifa del grupo (descuento del grupo o precios específicos), **sin IVA**       | Tarjeta y transferencia         |
| Aplicador                      | Profesional                 | Tarifa del grupo, **sin IVA**                                                   | Tarjeta y transferencia         |
| (Cliente concreto)             | Mayorista con tarifa propia | **Precio específico por cliente** en el producto o regla de precios de catálogo | Según su grupo                  |

- **Alta de mayoristas.** En la v1, el personal crea la cuenta o la pasa al grupo mayorista desde el panel. El alta con aprobación queda para la fase 2.
- **Modo B2B.** Se activa en Clientes → Ajustes. Añade razón social y número fiscal (CIF/NIF-IVA) a la cuenta.
- **Pedidos mayoristas.** La cantidad mínima por producto es nativa. Un **pedido mínimo distinto por grupo** necesitaría un módulo (decidir). Los valores reales están por definir (**TODO: contenido real**).
- **Impuestos.** IVA 21 % en España y reglas por país de la UE.
  - Ventas intracomunitarias a empresas con NIF-IVA válido (inversión del sujeto pasivo): requiere comprobar el número en **VIES** (módulo) → fase 2 si no hay clientes UE en la v1.
  - Ventas al público en la UE: valorar la ventanilla única de IVA (**OSS**) con la asesoría.

## 4. Detalles técnicos

- **Idiomas**
  - Astro: los mismos 8 idiomas que la tienda; `es` por defecto y sin prefijo, el resto con `/<código>/` y direcciones traducidas. Textos de ES y EN en sus módulos y del resto en `apps/web/src/i18n/translations/`.
  - PrestaShop: ES (por defecto) + EN, DE, FR, IT, PL, NO y FI con URLs amigables por idioma (`/en/`, `/de/`…), los mismos idiomas en que existen las fichas técnicas.
  - El selector de idioma de cada parte enlaza con la página equivalente de la otra. Pendiente: a qué idioma de la web enlaza la tienda en DE, FR, IT, PL, NO y FI (la web solo tiene ES y EN).
- **Catálogo:** se genera desde las fichas técnicas PDF; ver [`apps/tienda/catalog/README.md`](../apps/tienda/catalog/README.md).
- **SEO**
  - Web: `BaseLayout` con OG, `hreflang`, JSON-LD `Organization`, sitemap y `robots`.
  - Tienda: URLs amigables, `canonical`, `hreflang`, sitemap (módulo oficial) y datos `Product`/`Offer` solo con precio público.
  - Carrito, cuenta y checkout: `noindex`.
- **Seguridad**
  - SSL de IONOS en los dos subdominios.
  - Carpeta de administración renombrada (lo hace el instalador) y usuarios nominativos.
  - PrestaShop y módulos siempre actualizados, solo con los módulos imprescindibles.
  - Webservice con clave de solo lectura limitada a productos.
  - En la web Astro, CSP sin ClientRouter.
- **Instalación de PrestaShop**
  - Por «Seleccionar aplicación» (Click & Build) o a mano por SSH. **Recomendado: a mano**, para controlar la versión y cuándo se actualiza, y que coincida con el entorno Docker local.
  - Base de datos MySQL **propia** de la tienda.
- **Rendimiento**
  - En la tienda: caché de Smarty, CCC (agrupar CSS/JS), imágenes WebP y desactivar módulos que no se usen.
  - En la web: `<Image />` de Astro y sin JS innecesario.
  - Objetivo Lighthouse ≥ 90 en la web y ≥ 80 en la tienda.
- **Envíos.** Transportistas con tarifas por peso y zona. Para mayoristas, el envío en palé por grupo se hace con un transportista solo visible para ese grupo. Transportista y tablas reales **TODO**.
- **Facturación y Verifactu.** PrestaShop genera facturas en PDF, pero **no está adaptado a Verifactu de serie**. Hay dos opciones (**decisión pendiente con administración**):
  1. emitir las facturas legales desde el programa de facturación/ERP de Zement, exportando los pedidos;
  2. instalar un módulo Verifactu certificado.
- **Cookies.** Los módulos de PrestaShop (pagos, mapas, etc.) pueden poner cookies, así que la tienda necesita un banner de consentimiento. Opción por defecto: rechazar todo lo que no sea esencial.
- **Legal.** Aviso legal, privacidad (RGPD), cookies y condiciones de venta separadas para el público y para mayoristas. Hacen falta los textos reales (**TODO: contenido real**, no inventar).
- **Copias de seguridad**
  - Copia de la base de datos MySQL cada noche por SSH/cron y copia semanal de `/tienda` (imágenes y configuración).
  - Retención de 30 días, guardadas **fuera de IONOS**.
  - Antes de cada actualización de PrestaShop o de un módulo, hacer copia y probar primero en local con Docker.
- **Integración con el CRM (fase 2).** Se hace mediante la Webservice API de PrestaShop. Para preparar el terreno, las referencias de producto se alinean desde el principio con las del CRM.

## 5. Fases

1. **Fundaciones**
   - Repositorio y tokens de diseño.
   - Docker local con PrestaShop + MySQL.
   - Proyecto Astro y `AGENTS.md`.
   - Integración continua (CI).
2. **Web de marca**
   - Portada, empresa, productos (editoriales), proyectos y contacto.
   - 8 idiomas (los de la tienda) y SEO.
   - Despliegue en `www`.
3. **Tienda B2C**
   - Instalación en `tienda.<dominio>` y tema hijo.
   - Catálogo, impuestos, transportistas y pago con tarjeta.
   - Correos, textos legales y banner de cookies.
4. **B2B**
   - Grupos de clientes, tarifas y precios específicos.
   - Modo B2B, transferencia solo para mayoristas y cantidades mínimas.
5. **Lanzamiento**
   - Botones «Comprar» conectados por referencia (SKU).
   - Copias y monitorización.
   - Pedidos de prueba reales y revisión en escritorio y móvil.
6. **Fase 2**
   - Alta de mayoristas con aprobación y pago a plazo.
   - VIES/OSS.
   - Más idiomas.
   - Integración con el CRM.

## 6. Decisiones pendientes

- **Subdominios:** confirmar el dominio de Zement y crear `tienda.<dominio>` y su carpeta en el Hosting Plus. Los cambios de DNS y dominios solo se hacen con autorización expresa.
- **Pasarela de pago:** Redsys (¿qué banco da el TPV?) o Stripe.
- **Facturación:** ERP/programa actual o módulo Verifactu.
- **Catálogo real:** referencias, envases, pesos, precios públicos, tarifas mayoristas y control de stock (sí/no).
- **Envíos:** transportista(s) y tarifas.
- **Precio en la web de marca:** ¿se muestra el precio público o solo el botón «Comprar»?
- **Diseño:** ¿hay manual de marca o partimos de los colores de Zement del CRM?

## 7. Verificación

- **Web:**
  - `pnpm check`, `pnpm build`, `format:check` y pruebas `node --test`.
  - Script que comprueba que cada botón «Comprar» apunta a un producto existente en la tienda.
- **Tienda (local con Docker y en el servidor, en modo pruebas):**
  - Compra al por menor completa con la tarjeta de pruebas de la pasarela.
  - El cliente del grupo «Distribuidor» ve su tarifa sin IVA y la opción de transferencia; un visitante ve el precio público y no ve la transferencia.
  - Correos de pedido recibidos en un buzón de pruebas.
- **Pruebas automáticas (E2E):** Playwright sobre la navegación en los 8 idiomas, el paso de la web a la tienda, el carrito, el checkout y el inicio de sesión de mayoristas.
- **Calidad:** Lighthouse y axe en la portada, la ficha de producto y el checkout.
- **Copias:** restaurar una copia de MySQL en el Docker local.
