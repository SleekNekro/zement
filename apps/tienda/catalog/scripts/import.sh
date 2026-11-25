#!/usr/bin/env bash
# Importa el catálogo en la tienda local (Docker).
#
# Uso: pnpm tienda:catalog "<carpeta de fichas técnicas PDF>" [--deactivate-others]
#
# 1. Copia catalog.json, products/, images/ y los scripts PHP al contenedor.
# 2. Copia cada PDF con un nombre estable (<clave>-<idioma>.pdf).
# 3. Instala los idiomas que falten e importa familias, productos, imágenes y fichas.
set -euo pipefail

SHEETS_DIR="${1:?Indica la carpeta de las fichas técnicas PDF}"
shift
CONTAINER="${ZEMENT_PS_CONTAINER:-zement-prestashop-1}"
CATALOG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp -R "$CATALOG_DIR/catalog.json" "$CATALOG_DIR/products" "$CATALOG_DIR/images" "$STAGE/"
mkdir -p "$STAGE/scripts" "$STAGE/pdfs"
cp "$CATALOG_DIR"/scripts/*.php "$STAGE/scripts/"

python3 -I - "$CATALOG_DIR/products" "$SHEETS_DIR" "$STAGE/pdfs" <<'PY'
import json, shutil, sys, unicodedata
from pathlib import Path

products, sheets, target = (Path(p) for p in sys.argv[1:4])
files = {unicodedata.normalize("NFC", p.name): p for p in sheets.glob("*.pdf")}
missing = 0

for path in sorted(products.glob("*.json")):
    entry = json.loads(path.read_text(encoding="utf-8"))
    for iso, content in entry["languages"].items():
        source = files.get(unicodedata.normalize("NFC", content["file"]))
        if source is None:
            print(f"  ! no encuentro {content['file']}")
            missing += 1
            continue
        shutil.copyfile(source, target / f"{entry['key']}-{iso}.pdf")

print(f"PDF preparados en {target} ({missing} sin encontrar)")
PY

docker exec "$CONTAINER" rm -rf /tmp/zement-catalog
docker cp "$STAGE" "$CONTAINER:/tmp/zement-catalog"
docker exec "$CONTAINER" php /tmp/zement-catalog/scripts/install-languages.php
docker exec "$CONTAINER" php /tmp/zement-catalog/scripts/import-catalog.php "$@"
docker exec "$CONTAINER" sh -c 'chown -R www-data:www-data img/p download var && rm -rf /tmp/zement-catalog'
