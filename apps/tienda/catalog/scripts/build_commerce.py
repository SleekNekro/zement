"""Prepara los datos comerciales del módulo zementcommerce.

Junta commerce.json (calculadora, sistemas, relacionados y asesor de proyecto) con lo que la
tienda enseña de cada producto en los listados, sacado de las fichas (products/*.json):
subtítulo, formato, dato clave y normas (EN 13813, EN 13501-1), en los 8 idiomas.

Formatos: los de la tarifa (catalog.json → formats, con los nombres de formatNames) mandan sobre
la presentación de la ficha; también dan los envases de la calculadora.

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
SIZE = re.compile(r"^(\d+(?:[.,]\d+)?(?:\+\d+(?:[.,]\d+)?)*)\s*(kg|L)$")


def format_name(format_: dict, names: dict, iso: str) -> str:
    """«Cubo de 20 kg», «20 kg bucket»… (catalog.json → formatNames)."""
    container = names[format_["container"]]
    return container.get(iso, container["es"]).replace("{size}", format_["size"])


def pack_of(format_: dict) -> dict | None:
    """Envase para la calculadora: «14+1 kg» → 15 kg, «5 L» → 5 L."""
    match = SIZE.match(format_["size"].strip())
    if not match:
        return None
    size = sum(float(part.replace(",", ".")) for part in match.group(1).split("+"))
    return {"size": int(size) if size.is_integer() else size, "unit": match.group(2)}


def calculator_with_packs(calculator: dict, formats: list[dict]) -> dict:
    """Envases de la calculadora = formatos de la tarifa, en el mismo orden que las combinaciones.

    Si el consumo va en una unidad que no se puede pasar a la del envase (L ↔ kg sin densidad),
    la calculadora da la cantidad sin número de envases (pack: null).
    """
    packs = [pack_of(f) for f in formats]
    if not formats or None in packs:
        return calculator
    data = {key: value for key, value in calculator.items() if key != "packs"}
    convertible = all(
        p["unit"] == data["rateUnit"]
        or (p["unit"] == "L" and data["rateUnit"] == "kg" and data.get("density"))
        for p in packs
    )
    if not convertible:
        data["pack"] = None
        return data
    data["pack"] = packs[0]
    if len(packs) > 1:
        data["packs"] = packs
    return data


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


AGGREGATE = re.compile(r"árido|granulometr", re.IGNORECASE)
THICKNESS = re.compile(r"espesor.*capa", re.IGNORECASE)


def row_position(content: dict, pattern: re.Pattern[str]) -> tuple[int, int, int, int] | None:
    """Posición de la primera fila de tabla cuya clave encaja, en la ficha en español.

    Las fichas de los 8 idiomas tienen la misma estructura, así que la misma posición da el
    valor traducido en cada idioma.
    """
    for s, section in enumerate(content["sections"]):
        for b, block in enumerate(section["blocks"]):
            if block["type"] != "table":
                continue
            for g, group in enumerate(block["groups"]):
                for r, row in enumerate(group["rows"]):
                    if pattern.search(row["key"]):
                        return s, b, g, r
    return None


def row_value(content: dict, position: tuple[int, int, int, int] | None) -> str | None:
    if position is None:
        return None
    s, b, g, r = position
    return content["sections"][s]["blocks"][b]["groups"][g]["rows"][r]["value"]


def product_info(
    sheet: dict,
    layer: dict[str, str] | None,
    aggregate_label: dict[str, str],
    formats: list[dict],
    format_names: dict,
) -> dict[str, dict]:
    info: dict[str, dict] = {}
    position = row_position(sheet["languages"]["es"], AGGREGATE)
    thickness_position = row_position(sheet["languages"]["es"], THICKNESS)
    for iso, content in sheet["languages"].items():
        packs = [
            item
            for section in content["sections"]
            for block in section["blocks"]
            if block["type"] == "packs"
            for item in block["items"]
        ]
        # Formato: el de la tarifa; sin tarifa, el primero de la presentación de la ficha.
        sold = [format_name(f, format_names, iso) for f in formats]
        format_ = sold[0] if sold else first_format(content["name"], packs)
        # Dato clave: la primera cifra de la ficha que no repita el formato («5 L»).
        stat = next(
            (s for s in content["stats"] if not format_ or s["value"] not in format_),
            None,
        )
        aggregate_value = row_value(content, position)
        aggregate = (
            f"{aggregate_label.get(iso, aggregate_label['en'])} {aggregate_value}"
            if aggregate_value
            else None
        )
        info[iso] = {
            "subtitle": content["subtitle"],
            "formats": " · ".join(sold) if len(sold) > 1 else format_,
            "layer": layer.get(iso, layer["en"]) if layer else None,
            "aggregate": aggregate,
            "aggregateValue": aggregate_value,
            "thickness": row_value(content, thickness_position),
            "format": format_,
            "stat": {"value": stat["value"], "label": stat["label"]} if stat else None,
            "norms": norms(content),
        }
    return info


def info_without_sheet(entry: dict, format_names: dict, languages: list[str]) -> dict[str, dict]:
    """Producto sin ficha técnica todavía: solo sus formatos (TODO: ficha)."""
    info = {}
    for iso in languages:
        sold = [format_name(f, format_names, iso) for f in entry.get("formats", [])]
        info[iso] = {
            "subtitle": None,
            "formats": " · ".join(sold) if len(sold) > 1 else (sold[0] if sold else None),
            "layer": None,
            "aggregate": None,
            "aggregateValue": None,
            "thickness": None,
            "format": sold[0] if sold else None,
            "stat": None,
            "norms": [],
        }
    return info


def main() -> None:
    commerce = json.loads((CATALOG / "commerce.json").read_text(encoding="utf-8"))
    catalog = json.loads((CATALOG / "catalog.json").read_text(encoding="utf-8"))
    products = {}
    # Capa (base / acabado) solo en los microcementos: en corcho, Mittel y Fein son el grano.
    categories_by_product = {entry["key"]: entry["category"] for entry in catalog["products"]}
    formats_by_product = {entry["key"]: entry.get("formats", []) for entry in catalog["products"]}
    format_names = {k: v for k, v in catalog["formatNames"].items() if not k.startswith("$")}
    layers = {key: value for key, value in commerce["layers"].items() if not key.startswith("$")}

    for path in sorted((CATALOG / "products").glob("*.json")):
        sheet = json.loads(path.read_text(encoding="utf-8"))
        layer = None
        if categories_by_product.get(sheet["key"]) == "microcemento":
            layer = layers.get(sheet["key"].split("-")[0])
        products[sheet["key"]] = product_info(
            sheet,
            layer,
            commerce["aggregateLabel"],
            formats_by_product.get(sheet["key"], []),
            format_names,
        )

    for entry in catalog["products"]:
        if entry.get("sheet", True) is False:
            products[entry["key"]] = info_without_sheet(entry, format_names, catalog["languages"])

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
        "calculator": {
            key: calculator_with_packs(value, formats_by_product.get(key, []))
            for key, value in commerce["calculator"].items()
        },
        "systems": commerce["systems"],
        "related": related,
        "projects": commerce["projects"],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{OUTPUT.relative_to(CATALOG.parent.parent.parent)}: {len(products)} productos")


if __name__ == "__main__":
    main()
