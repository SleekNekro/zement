"""Prepara los datos comerciales del módulo zementcommerce.

Junta commerce.json (calculadora, sistemas, relacionados y asesor de proyecto) con lo que la
tienda enseña de cada producto en los listados, sacado de las fichas (products/*.json):
subtítulo, formato, dato clave y normas (EN 13813, EN 13501-1), en los 8 idiomas.

Uso: python3 apps/tienda/catalog/scripts/build_commerce.py
Salida: apps/tienda/modules/zementcommerce/data/commerce.json
"""

from __future__ import annotations

import json
import re
from pathlib import Path

CATALOG = Path(__file__).resolve().parent.parent
OUTPUT = CATALOG.parent / "modules" / "zementcommerce" / "data" / "commerce.json"
NORM = re.compile(r"\b(EN\s?13813|EN\s?13501(?:-1)?)\b")


def first_format(name: str, items: list[str]) -> str | None:
    """Primer formato de venta, sin la línea que repite el nombre ni el prefijo «Nombre:».

    Los bicomponentes («Componente A: 3 kg», «Componente B (catalizador): 1 kg») se juntan en
    «3 kg + 1 kg», que vale para cualquier idioma.
    """
    items = [item.strip() for item in items if item.strip().lower() != name.strip().lower()]
    if not items:
        return None
    # Separador de etiqueta «: » (con espacio): en finés «5 kg:n» lleva dos puntos sin espacio.
    first = items[0]
    if ": " in first and first.lower().startswith(name.lower()):
        first = first.split(": ", 1)[1].strip()
    elif len(items) > 1 and ": " in first and ": " in items[1]:
        first = " + ".join(item.split(": ", 1)[1].strip() for item in items[:2])
    return first[:1].upper() + first[1:]


def norms(content: dict) -> list[dict[str, str]]:
    found: list[dict[str, str]] = []
    for section in content["sections"]:
        for block in section["blocks"]:
            if block["type"] != "table":
                continue
            for group in block["groups"]:
                for row in group["rows"]:
                    match = NORM.search(row["key"])
                    if match and row["value"].strip():
                        code = match.group(1).replace("EN13", "EN 13")
                        found.append({"norm": code, "value": row["value"].strip()})
    return found


def product_info(sheet: dict) -> dict[str, dict]:
    info: dict[str, dict] = {}
    for iso, content in sheet["languages"].items():
        packs = [
            item
            for section in content["sections"]
            for block in section["blocks"]
            if block["type"] == "packs"
            for item in block["items"]
        ]
        format_ = first_format(content["name"], packs)
        # Dato clave: la primera cifra de la ficha que no repita el formato («5 L»).
        stat = next(
            (s for s in content["stats"] if not format_ or s["value"] not in format_),
            None,
        )
        info[iso] = {
            "subtitle": content["subtitle"],
            "format": format_,
            "stat": {"value": stat["value"], "label": stat["label"]} if stat else None,
            "norms": norms(content),
        }
    return info


def main() -> None:
    commerce = json.loads((CATALOG / "commerce.json").read_text(encoding="utf-8"))
    catalog = json.loads((CATALOG / "catalog.json").read_text(encoding="utf-8"))
    products = {}

    for path in sorted((CATALOG / "products").glob("*.json")):
        sheet = json.loads(path.read_text(encoding="utf-8"))
        products[sheet["key"]] = product_info(sheet)

    related = {k: v for k, v in commerce["related"].items() if not k.startswith("$")}
    keys = set(products)
    referenced = (
        set(commerce["calculator"])
        | {step["product"] for system in commerce["systems"] for step in system["steps"]}
        | set(related)
        | {key for items in related.values() for key in items}
    )
    unknown = sorted(referenced - keys)
    if unknown:
        raise SystemExit(f"commerce.json cita productos que no existen: {', '.join(unknown)}")

    categories = {category["key"]: category["name"]["es"] for category in catalog["categories"]}
    missing = sorted(
        {p["target"]["category"] for p in commerce["projects"] if "category" in p["target"]}
        - set(categories)
    )
    if missing:
        raise SystemExit(f"commerce.json cita familias que no existen: {', '.join(missing)}")

    data = {
        "categories": categories,
        "products": products,
        "calculator": commerce["calculator"],
        "systems": commerce["systems"],
        "related": related,
        "projects": commerce["projects"],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{OUTPUT.relative_to(CATALOG.parent.parent.parent)}: {len(products)} productos")


if __name__ == "__main__":
    main()
