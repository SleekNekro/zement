# Catálogo de la tienda

El catálogo de PrestaShop se genera a partir de las **fichas técnicas PDF** de Zement (41 productos × 8 idiomas: ES, EN, DE, FR, IT, PL, NO, FI). Los PDF no se guardan en Git (≈ 200 MB): se pasan como carpeta al importar.

```
catalog/
├── catalog.json          Familias (nombre en 8 idiomas) y, por producto: familia, referencia y precio
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

   El producto se reconoce por su URL en español (= clave del JSON). Al repetir se actualizan textos, familia, imagen y PDF; el precio y la referencia solo cambian si `catalog.json` trae un valor.

## Cómo se ve en la tienda

- **Menú principal**: las 8 familias en el orden de `catalog.json` (la importación ajusta `MOD_BLOCKTOPMENU_ITEMS` de `ps_mainmenu` y la posición de cada categoría).

- **Resumen** (junto al botón de compra): subtítulo de la ficha + párrafo «Producto».
- **Descripción**: cifras destacadas, todas las secciones (tablas, listas, envases, carta de colores NCS) y el aviso legal de la ficha.
- **Ficha técnica**: el PDF del idioma de la página y enlaces a los otros 7 (plantilla `theme/zement/templates/catalog/product.tpl`).
- La extracción se valida comparando la estructura de los 8 idiomas de cada producto (mismas secciones, filas y envases): 0 diferencias el 25/11/2026.

## Pendiente (TODO: contenido real)

- **Precios y referencias (SKU)**: `null` en `catalog.json`. Sin precio, el producto se importa **desactivado**.
- **Formatos de venta**: las fichas indican la presentación (p. ej. «Garrafa de 5 L / 25 L», «Palé de 36 unidades»), pero no qué se vende por separado. Las combinaciones por envase se crearán cuando llegue la tarifa.
- **IVA**: la tienda local no tiene reglas de impuestos; asignarlas antes de activar productos.
- **Fotos de producto**: 22 productos no traen imagen en la ficha (imprimaciones, barnices, morteros, aditivos, mallas).
- **Nombres de las familias** en DE, FR, IT, PL, NO y FI: traducción propuesta, revisar con Zement. La agrupación en familias también es una propuesta.

## Datos comerciales

- [`commerce.json`](commerce.json): consumos y envases para la calculadora, sistemas en orden de aplicación, productos relacionados y proyectos del asesor de la portada. Cada cifra lleva la frase de la ficha (`source`).
- Tras cambiarlo, o tras volver a extraer las fichas: `pnpm tienda:commerce`. Genera los datos del módulo `zementcommerce` y los aplica en la tienda.
