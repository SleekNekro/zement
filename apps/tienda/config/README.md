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
- **Impuestos sin configurar** (no hay reglas de IVA en la tienda local): los productos se importan con `id_tax_rules_group = 0`. TODO: crear la regla de IVA (21 % ES + UE) y asignarla antes de activar productos.

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
  - **Privacidad:** consentimiento de `psgdpr` en los 8 idiomas, con enlace a la política de privacidad de la web. `ps_dataprivacy` desactivado.
  - **Traducciones:** títulos y URL de las páginas de PrestaShop, estados de pedido, tratamientos y transportistas, traducidos para IT, PL, NO y FI, que se habían quedado en inglés. En español, el título del alta es «Crear una cuenta».
- **Productos sin precio** (`catalog.json`, `price: null`): la ficha se ve, pero sin «0,00 €», sin cantidad ni «Añadir al carrito», sin «Fuera de stock» y sin «Notificarme».
- **Productos sin foto:** superficie azul de marca con el logotipo en lugar de «Imagen no disponible».
- Desde la auditoría (`docs/AUDITORIA-TIENDA.md`, 26/11/2026), también:
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
- TODO: correo real del contacto «Servicio al cliente» (sigue el de pruebas).
