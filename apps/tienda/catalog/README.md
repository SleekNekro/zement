# Catálogo de la tienda

El catálogo de PrestaShop se genera a partir de las **fichas técnicas PDF** de Zement (41 productos × 8 idiomas: ES, EN, DE, FR, IT, PL, NO, FI). Los PDF no se guardan en Git (≈ 200 MB): se pasan como carpeta al importar.

```
catalog/
├── catalog.json          Familias (8 idiomas), tarifa por formato, descuentos e IVA
├── products/<clave>.json Contenido de cada ficha en los 8 idiomas (generado, no editar a mano)
├── images/<clave>.jpg    Muestra del «efecto acabado» sacada de la ficha (19 productos)
└── scripts/
    ├── extract_sheets.py      PDF → products/*.json + images/
    ├── install-languages.php  Instala los 8 idiomas con sus paquetes oficiales
    ├── import-catalog.php     Crea o actualiza familias, productos, imagen y PDF por idioma
    ├── ZementSheetHtml.php    JSON de la ficha → HTML de la página de producto
    └── import.sh              Prepara los ficheros y lo ejecuta todo en el contenedor
```

## Actualizar el catálogo

1. **Fichas nuevas o corregidas** → regenerar los JSON (necesita PyMuPDF en un entorno virtual):

   ```sh
   python3 -m venv .venv-catalog && .venv-catalog/bin/pip install -r apps/tienda/catalog/scripts/requirements.txt
   .venv-catalog/bin/python -I apps/tienda/catalog/scripts/extract_sheets.py "<carpeta de fichas>" apps/tienda/catalog
   ```

   Los PDF se llaman `<PRODUCTO> <IDIOMA>.pdf` (p. ej. `ZEMENT PRIME ESPAÑOL.pdf`). Un producto nuevo hay que añadirlo también a `catalog.json` con su familia.

2. **Importar en la tienda local** (idempotente: se puede repetir):

   ```sh
   pnpm tienda:catalog "<carpeta de fichas>"
   ```

   El producto se reconoce por su URL en español (= clave del JSON). Al repetir se actualizan textos, familia, imagen, PDF, precios, formatos, descuentos e IVA; la referencia solo cambia si `catalog.json` trae un valor.

## Cómo se ve en la tienda

- **Menú principal**: las 8 familias en el orden de `catalog.json` (la importación ajusta `MOD_BLOCKTOPMENU_ITEMS` de `ps_mainmenu` y la posición de cada categoría).

- **Resumen** (junto al botón de compra): subtítulo de la ficha + párrafo «Producto».
- **Descripción**: cifras destacadas, todas las secciones (tablas, listas, envases, carta de colores NCS) y el aviso legal de la ficha.
- **Ficha técnica**: el PDF del idioma de la página y enlaces a los otros 7 (plantilla `theme/zement/templates/catalog/product.tpl`).
- La extracción se valida comparando la estructura de los 8 idiomas de cada producto (mismas secciones, filas y envases): 0 diferencias el 25/11/2026.

## Pendiente (TODO: contenido real)

- **Productos sin precio** (no están en la tarifa del 27/11/2026): Repair 10, 20 y 40, Flex Sanitary, Dune, Dune Fix, Latex, Latex Flex, Color Lab, Quartz Sand y las mallas de 80 y 160 g. Se ven con «Solicitar presupuesto».
- **Referencias (SKU)**: `null` en todos los formatos.
- **Metallic Direkt**: está en la tarifa, pero aún no tiene ficha técnica. Se vende solo con nombre y formatos; faltan los textos, la imagen y el PDF.
- **Formatos de la tarifa que no coinciden con la ficha** (manda la tarifa; revisar las fichas):
  - Mittel Direkt Level 2K: kit de 14+1 kg en la tarifa; 19 + 1 kg en la ficha.
  - Protect Sanitary 2K: kit de 3+1 kg en la tarifa; 4 + 1 kg en la ficha. Protect Solvent Grip 2K: 3+1 kg; 3,3 + 1 kg en la ficha. Protect Solvent Metallic 2K: 3+1 kg; 2,5 + 1 kg en la ficha.
  - Prime: garrafa de 5 kg y bote de 1 kg en la tarifa; garrafas de 5 L y 25 L en la ficha. Prime Tack: garrafa de 5 kg; 5 L y 25 L en la ficha. Prime Grip: solo cubo de 5 kg; también 10 kg en la ficha.
  - Zement Metallic y Metallic Lasur: botes de 5 y 2 kg en la tarifa; envases de 5 L en la ficha. Su consumo va en litros por m² y no hay densidad, así que la calculadora da la cantidad sin número de envases.
  - Zement Seal: garrafa de 5 L en la tarifa; envases metálicos (A + B) en la ficha.
  - Formatos nuevos de la tarifa, sin dato en la ficha: cubos de 5 kg de Fein y Mittel (Aqua Mix y Direkt 1K) y kits de 5 kg de Fein y Mittel Direkt 2K.
  - Protectores: la tarifa calcula el €/kg con el diluyente o el agua que se añade en destino («+ 1 L agua», «+ 1 en destino»); el formato que se vende es el kit de 3+1 kg.
- **Palé**: solo el formato principal tiene las unidades por palé (de la ficha). Faltan las de los formatos pequeños y las de los productos cuya ficha no las da.
- **Fotos de producto**: 22 productos no traen imagen en la ficha (imprimaciones, barnices, morteros, aditivos, mallas).
  - Los que se venden en cubo, garrafa o bote llevan una foto de su envase: `node apps/tienda/catalog/scripts/generate-packaging.mjs` (necesita Google Chrome y macOS) la compone sobre fotos reales de los envases, con el logotipo de Zement, la etiqueta de imprenta y un círculo con el acabado del producto. Las fotos base van en `images/envases-base/` (`cubo.webp`, `garrafa.webp`, `tarrina.webp`): es una carpeta local que no se sube a Git. Genera `images/envases/`; después hay que repetir `pnpm tienda:catalog`.
  - Cada formato enseña su envase; la foto del formato principal es la portada.
  - Faltan los kits (2K y protectores) y los productos sin formato de venta.
- **Nombres de las familias** en DE, FR, IT, PL, NO y FI: traducción propuesta, revisar con Zement. La agrupación en familias también es una propuesta.

## Datos comerciales

- [`commerce.json`](commerce.json): consumos y envases para la calculadora, sistemas en orden de aplicación, productos relacionados y proyectos del asesor de la portada. Cada cifra lleva la frase de la ficha (`source`).
- Tras cambiarlo, o tras volver a extraer las fichas: `pnpm tienda:commerce`. Genera los datos del módulo `zementcommerce` y los aplica en la tienda.

## Tarifa, formatos, descuentos e IVA

Tarifa online de Zement del 27/11/2026: PVP web en euros por envase, **sin IVA**, franco fábrica Castellón; el porte va aparte.

- `formats` (en `catalog.json`): formatos de venta de cada producto, en el orden de la tarifa.
  - `container` (cubo, kit, bote, garrafa) + `size` («20 kg», «14+1 kg») dan el nombre en cada idioma con `formatNames`.
  - `price` es el PVP web sin IVA y `reference`, el SKU (TODO).
  - El primero es el formato principal: da el precio del producto. Con varios, se crean como combinaciones del atributo «Formato».
  - Sin `formats`, el producto no tiene precio: se ve la ficha con «Solicitar presupuesto».
  - También dan los envases de la calculadora y el formato que se ve en las tarjetas (`build_commerce.py`).
- `pallet`: unidades del formato principal en un palé, según la ficha.
- `discounts`: −22 % por palé, −12 % Aplicador, −40 % Distribuidor. **No se suman**: cada cliente paga el mejor que le corresponda.
  - Se crean como precios específicos de cada producto. PrestaShop aplica uno solo por línea y sumaría el descuento general del grupo, así que este se deja al 0 % (`config/scripts/setup-pro.php`).
  - Para cada producto con precio: cada grupo profesional desde 1 unidad con su descuento; todos desde el palé del formato principal con −22 %; cada grupo profesional desde el palé con el mayor de los dos.
  - Se comprobaron los 40 formatos para clientes, aplicadores y distribuidores, de 1 unidad y por palé: 306 precios iguales a la tarifa.
- `tax`: «IVA 21 % (UE)», el 21 % en los 27 países de la UE; fuera de la UE, sin IVA (exportación).
  - Decisión del 27/11/2026: vale mientras las ventas a particulares de otros países de la UE no pasen de 10.000 € al año. TODO: confirmarlo con la gestoría; después, IVA de cada país (OSS). TODO: confirmar también la exportación sin IVA y la inversión del sujeto pasivo para empresas de la UE con NIF-IVA.
- Tras cambiar la tarifa: `pnpm tienda:catalog "<carpeta de fichas>"` y después `pnpm tienda:commerce`.
