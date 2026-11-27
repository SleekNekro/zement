# Configuración de la tienda (PrestaShop)

Ajustes que deben aplicarse igual en local y en IONOS. Registrar aquí cualquier cambio de configuración.

## Alta profesional (B2B)

- **Modo B2B activado** (`PS_B2B_ENABLE = 1`): el registro (`/registro`, `/en/registration`) pide empresa e identificación fiscal.
  - Local: `docker exec zement-prestashop-1 php bin/console prestashop:config set PS_B2B_ENABLE --value 1` (aplicado el 25/11/2026).
  - IONOS: Clientes → Ajustes → «Activar modo B2B».
- Flujo de la primera versión:
  1. El profesional se registra desde «Solicitar el alta» en la web de marca.
  2. Zement revisa la empresa y el CIF en el panel.
  3. Se le asigna el grupo con su tarifa (Distribuidor, Aplicador o tarifa propia).
- Pendiente: plazo real de revisión (`apps/web/src/data/company.ts` → `proApprovalTime`) y traducir la etiqueta del campo de identificación fiscal si el tema muestra «SIRET».

## Idiomas

- 8 idiomas, los de las fichas técnicas: ES (por defecto), EN, DE, FR, IT, PL, NO, FI.
- Local: los instala `pnpm tienda:catalog` (script `install-languages.php`, paquetes oficiales de PrestaShop) el 25/11/2026.
- IONOS: Internacional → Traducciones → «Añadir o actualizar un idioma», o el mismo script por SSH.

## Catálogo

- Familias y productos: [`apps/tienda/catalog/README.md`](../catalog/README.md).
- Productos de demostración de PrestaShop y sus categorías: **desactivados** (no borrados) el 25/11/2026 con `--deactivate-others`. En IONOS se instalará sin datos de demostración.
- **Precios, descuentos e IVA:** tarifa del 27/11/2026, aplicada por la importación del catálogo (ver [`catalog/README.md`](../catalog/README.md) → «Tarifa, formatos, descuentos e IVA»).

## Portada

> Desde el 26/11/2026 la portada sigue un estilo de tienda clásica (ver «Ajustes y restos de demostración» más abajo).

- Módulo propio [`zementhome`](../modules/zementhome/) en `displayHome`, el primero: bloque principal (la primera familia, «Microcemento & Materials», con la textura de su ficha) y rejilla de las 8 familias con su número de productos y los tres primeros.
- Solo usa textos que ya existen en los 8 idiomas: nombres de familia y de producto y cadenas traducidas de PrestaShop. No hay textos de marca nuevos que traducir.
- Bloques de demostración **quitados de la portada** (desenganchados de `displayHome`, no desinstalados): `ps_imageslider`, `ps_banner`, `ps_customtext`, `ps_featuredproducts` y `ps_newproducts`. `ps_bestsellers` y `ps_specials` se quedan: no muestran nada hasta que haya ventas u ofertas.
- Local: `pnpm tienda:home` (25/11/2026). El módulo se monta en el contenedor desde `infra/docker/docker-compose.yml`; tras actualizar el repo, `pnpm tienda:up` recrea el contenedor con el montaje.
- IONOS: subir `apps/tienda/modules/zementhome` a `modules/`, instalarlo desde Módulos y desenganchar esos bloques en Diseño → Posiciones.
- TODO: fotos para las familias sin imagen (imprimaciones, barnices, morteros, aditivos); hasta entonces muestran una superficie azul de marca.

## Pie

- Script [`scripts/setup-footer.php`](scripts/setup-footer.php) (`pnpm tienda:footer`, 26/11/2026). Rehace los bloques de `ps_linklist` cada vez que se ejecuta:
  - **Productos:** las 8 familias en el orden del catálogo.
  - **Zement:** Sistema, Profesionales y Contacto de la web de marca.
  - **Textos legales** (aviso legal, privacidad, cookies y condiciones de venta): van en la barra final, junto a «© año Zement» (`displayFooterAfter`, del que se quita `blockreassurance`).
- Los enlaces a la web usan `ZEMENT_WEB_URL` (por defecto `http://localhost:4321`). En producción: `ZEMENT_WEB_URL=https://… php setup-footer.php`.
- La web solo está en español e inglés: en DE, FR, IT, PL, NO y FI los enlaces llevan a la versión inglesa.
- Nombre de la tienda: «Zement» (`PS_SHOP_NAME`).
- El correo de la tienda se oculta en «Información de la tienda» mientras sea el de pruebas (`*.test`).
- Los textos del pie que no son de PrestaShop (títulos de columna y enlaces) se traducen en el script.
- TODO (contenido real que tiene que facilitar Zement):
  - Correo, teléfono y domicilio de la tienda (Parámetros de la tienda → Contacto → Tiendas). Son los mismos datos que faltan en `apps/web/src/data/company.ts`.
  - Textos legales de la tienda en los 8 idiomas, antes de vender fuera de España y del mundo anglosajón.

## Ajustes y restos de demostración

- Script [`scripts/setup-settings.php`](scripts/setup-settings.php) (`pnpm tienda:settings`, 26/11/2026). No borra nada: todo se puede volver a activar desde el panel.
  - **Monedas y tiendas:** solo euro; desactivadas las tiendas físicas de demostración (Miami).
  - **Páginas CMS:** desactivadas las de demostración, que tenían lorem ipsum. La de condiciones se queda, porque el pedido la enlaza, y remite a las condiciones de venta de la web.
  - **Alta de clientes:** sin «ofertas de nuestros socios» y sin sello «Nuevo».
  - **Bloques de demostración:** `blockreassurance` («Security policy…») fuera de fichas, carrito y pedido.
  - **Existencias:** sin gestión de existencias (`PS_STOCK_MANAGEMENT = 0`): se vende desde fábrica y, con stock 0, no se podría pedir nada.
  - **Privacidad:** consentimiento de `psgdpr` en los 8 idiomas, con enlace a la política de privacidad de la web. `ps_dataprivacy` desactivado.
  - **Traducciones:** títulos y URL de las páginas de PrestaShop, estados de pedido, tratamientos y transportistas, traducidos para IT, PL, NO y FI, que se habían quedado en inglés. En español, el título del alta es «Crear una cuenta».
- **Productos sin precio** (`catalog.json`, sin `formats`): la ficha se ve, pero sin «0,00 €», sin cantidad ni «Añadir al carrito», sin «Fuera de stock» y sin «Notificarme».
- **Productos sin foto:** superficie azul de marca con el logotipo en lugar de «Imagen no disponible».
- Desde la auditoría de la tienda (26/11/2026), también:
  - **Marca:** tienda «Zement» con su logotipo (`theme/zement/assets/img/zement-logo-navy.png` → `img/zement-logo.png`).
  - **Módulos de terceros sin uso:** desactivados.
  - **Alta y boletín:** alta sin fecha de nacimiento; boletín con doble confirmación.
  - **Contacto:** quitado el contacto «Webmaster» (lo único que se borra).
  - **Portada:** descripción con las familias.
  - **Listados:** a todo el ancho.
- **Tratamiento de usted** en español: [`translations/es-usted.php`](translations/es-usted.php), que guarda las cadenas que tutean como traducciones propias.
  - Para buscar si quedan cadenas que tutean tras actualizar PrestaShop o un módulo, buscar en `translations/es-ES/{Shop,Modules}*.xlf` del contenedor «tu», «tus», «te» e imperativos como «Introduce» o «Envíanos».
- **Países:** de momento, Europa (UE y resto de Europa salvo Rusia y Bielorrusia).
- **Búsqueda:** exacta (`PS_SEARCH_FUZZY = 0`).
- `pnpm tienda:settings` copia toda la carpeta `apps/tienda/config` al contenedor (el script lee `translations/`).
- Portada (`zementhome` 0.3.0), al estilo de una tienda clásica:
  - Contenido: bloque principal compacto, accesos a las familias y una fila de 4 productos por familia, con las miniaturas del tema.
  - Caché: por idioma. `pnpm tienda:home` registra los ganchos que la vacían.
- Correo de la tienda: info@zement.es (`config/company.php`) como remitente, contacto «Servicio al cliente» y destino de los avisos (solicitudes profesionales). Para que los correos salgan de verdad hay que configurar el SMTP de ese buzón en el panel: Parámetros avanzados → Correo electrónico.

## Cuentas profesionales

- Módulo propio [`zementpro`](../modules/zementpro/). Se instala con `pnpm tienda:pro`, después de `pnpm tienda:commerce` (que crea los grupos Distribuidor y Aplicador con precio sin IVA).
- **Alta:** en el registro, «Soy profesional» con el tipo, la razón social y el CIF / NIF-IVA (obligatorios si se marca). También desde «Información» de la cuenta.
- **Solicitud:** queda en revisión y el cliente compra con precios públicos. La tienda recibe un aviso en su correo (`PS_SHOP_EMAIL`).
- **Panel → Clientes → Solicitudes profesionales:** aprobar pasa al cliente a su grupo y le escribe en su idioma; rechazar también le avisa; retirar devuelve una cuenta aprobada a los precios públicos y le avisa (se puede volver a aprobar).
- **Mi cuenta:** el estado sale del grupo real del cliente; si se cambia el grupo a mano en la ficha, también cuadra.
- **Descuento de cada grupo:** el de la tarifa (`catalog.json` → `discounts`), en el precio de cada producto. El descuento general del grupo se deja al 0 % para que no se sume al de palé (ver [`pro.php`](pro.php)).

## Herramientas de venta (fase 1 de la auditoría comercial)

- Módulo propio [`zementcommerce`](../modules/zementcommerce/). Se instala con `pnpm tienda:commerce`, que primero genera `modules/zementcommerce/data/commerce.json` con `catalog/scripts/build_commerce.py`. Incluye:
  - **Miniaturas:** tipo de producto, formato y dato clave de la ficha.
  - **Ficha de producto:**
    - sellos EN 13813 y EN 13501-1;
    - calculadora de cantidades;
    - «Complete su sistema», con las cantidades de cada capa.
  - **Portada:** asesor «¿Qué va a hacer?».
  - **Barra superior:** enlaces «Volver a la web» (portada) y «Profesionales» a la web, en cada idioma; en móvil, en el menú lateral.
- **Datos:** [`catalog/commerce.json`](../catalog/commerce.json): consumos y envases, sistemas, productos relacionados y proyectos.
  - Cada cifra lleva la frase de la ficha de la que sale.
  - Cuando la ficha da un intervalo, se toma el valor que pide más producto.
- **Sistemas:** solo los que dicen la web o las fichas: microcemento (Z.01-Z.04), revestimiento de arena para piscinas (ficha de Zement Dune Fix) y efecto metálico.
- **Productos relacionados:** son los accesorios nativos de PrestaShop, que la ficha muestra en «También podría interesarle».
- **Enlaces estables para la web de marca:**
  - `/<idioma>/z/p/<clave de producto>` y `/<idioma>/z/c/<clave de familia>` redirigen a la ficha o la familia.
  - La web (`systems.json`, `data/home.ts` y las traducciones) ya los usa: los identificadores de PrestaShop cambian entre instalaciones.
- **Rutas de la web por idioma** (pie, privacidad, condiciones, profesionales): [`web-routes.php`](web-routes.php), copia de las rutas de `apps/web`. Si cambian allí, hay que cambiarlas aquí.
- **Local:** el módulo se monta desde `infra/docker/docker-compose.yml`. Tras actualizar el repositorio, ejecutar `pnpm tienda:up` y después `pnpm tienda:commerce`.
- **IONOS:**
  - subir `apps/tienda/modules/zementcommerce` a `modules/` e instalarlo;
  - ejecutar `setup-commerce.php` con `ZEMENT_WEB_URL` apuntando al dominio de la web.

## Venta, fase 2 (26/11/2026)

- **Contacto real** en la tienda: `info@zement.es` y +34 607 800 028, en «Información de la tienda», como remitente y como destinatario del formulario.
  - Fuente: [`company.php`](company.php), copia de `apps/web/src/data/company.ts`. Si cambian allí, cambiarlos aquí.
  - Lo aplica `pnpm tienda:settings`.
- **Barra de confianza** (módulo `zementcommerce`, gancho `displayReassurance`) en ficha, carrito y pedido. Muestra:
  - asesoramiento técnico (teléfono y horario);
  - plazo de respuesta;
  - zona de envío.
  - Envío gratuito, plazo de entrega y devoluciones aparecen solos cuando `company.php` los tenga (hoy son TODO).
- **Aviso de envío gratuito** en el carrito («le faltan X € para…»), con barra de progreso.
  - Solo aparece si `freeShippingFrom` tiene importe (`PS_SHIPPING_FREE_PRICE`). TODO: importe de Zement.
- **Grupos profesionales** Aplicador y Distribuidor (`pnpm tienda:commerce`):
  - ven el precio sin IVA y todo el catálogo, con los mismos medios de pago y transportistas que los clientes;
  - el descuento de cada grupo es el de la tarifa (−12 % Aplicador, −40 % Distribuidor), sin sumarse al de palé;
  - Zement revisa cada alta profesional (empresa y CIF) y asigna el grupo en Clientes → Clientes.
- **Formatos, precios y palé** (`catalog.json`, `pnpm tienda:catalog`): los de la tarifa, con −22 % por palé en el formato principal de los 16 productos cuya ficha da las unidades por palé.
- **Traducciones que faltaban:** [`translations/missing.php`](translations/missing.php) recoge las cadenas de Hummingbird que no traen los paquetes de idioma.
  - Hoy cubre el teléfono de la cabecera y el buscador.
  - TODO: faltan unas 170 en DE, NO y FI, 140 en FR y 130 en PL, sobre todo etiquetas para lectores de pantalla.

## Formas de pago

Se aplican con `pnpm tienda:payments` ([`scripts/setup-payments.php`](scripts/setup-payments.php)). Decisión del 26/11/2026: **tarjeta con Stripe y transferencia bancaria**.

- **Pendiente (26/11/2026), aparcado hasta que haya precios** (los precios llegaron el 27/11/2026):
  - **Stripe:** comprobar que el módulo oficial admite PrestaShop 9.2, instalarlo desde el Marketplace, crear la cuenta de Stripe de Zement y poner las claves de pruebas. Pasos abajo.
  - **Transferencia:** titular e IBAN de la cuenta de Zement en `company.php` → `bank`, y después `pnpm tienda:payments`.
  - **Pedido:** días de reserva del pedido pagado por transferencia.
  - **Transporte:** la tarifa va franco fábrica y el porte se cobra aparte según el destino. Los transportistas activos son los de ejemplo de PrestaShop («Click and collect» y «My carrier»), y el carrito muestra «Envío: Gratis». TODO: transportistas y tarifas de porte reales, por peso y destino (pedidos sueltos y palés).

- **Métodos de ejemplo de PrestaShop:** se desactivan (no se desinstalan) el cheque, el contra reembolso y PrestaShop Checkout.
- **Transferencia bancaria** (`ps_wirepayment`):
  - Los datos salen de [`company.php`](company.php) → `bank`: titular, IBAN, BIC y banco.
  - TODO: datos reales de la cuenta. Los rellena la empresa.
  - Mientras falte el titular o el IBAN, la transferencia no se ofrece en la caja.
  - Los días de reserva del pedido se quedan en el valor por defecto del módulo hasta que se decidan.
- **Tarjeta con Stripe:** módulo oficial «Stripe – Official SCA-ready» (`stripe_official`), gratuito; Stripe solo cobra su comisión. Pasos:
  1. Comprobar la compatibilidad con PrestaShop 9.2. Lo dice la ficha de [PrestaShop Addons](https://addons.prestashop.com/en/payment-card-wallet/24922-stripe-official-sca-ready.html), en «Compatibilidad». El repositorio antiguo de GitHub está archivado desde 2023: no usarlo.
  2. Instalar el módulo desde el back office, en Módulos → Marketplace (hay que iniciar sesión con la cuenta de PrestaShop). También se puede descargar el zip de Addons y subirlo en el gestor de módulos.
  3. Crear la cuenta de Stripe de Zement e instalar la aplicación «PrestaShop» del Stripe App Marketplace, en modo de pruebas (sandbox). Esa aplicación da la clave publicable y la secreta. Ver la [guía de Stripe](https://docs.stripe.com/use-stripe-apps/prestashop/configuration).
  4. Pegar las claves en Módulos → Stripe → Configurar, con el modo de pruebas activado. Las claves nunca van al repositorio.
  5. Probar un pago con las tarjetas de prueba de Stripe (por ejemplo, 4242 4242 4242 4242) cuando haya productos con precio.
  6. En producción, repetir con las claves reales. Los webhooks los da de alta el propio módulo, pero Stripe no llega a `localhost`. En local, los avisos que dependen de webhooks necesitan `stripe listen --forward-to` (Stripe CLI) o un túnel.
- Si el módulo oficial no admite PrestaShop 9.2, hay módulos de pago que sí lo declaran (PresTeamShop «PTS Stripe», Webkul). Habría que decidir cuál.
