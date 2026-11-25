"""Extrae el contenido de las fichas técnicas PDF de Zement a JSON estructurado.

Uso (desde la raíz del repo, con PyMuPDF instalado en un entorno virtual):

    python -I apps/tienda/catalog/scripts/extract_sheets.py "<carpeta de fichas>" apps/tienda/catalog

Cada PDF se llama «<PRODUCTO> <IDIOMA>.pdf» (p. ej. «ZEMENT PRIME ESPAÑOL.pdf»). Se genera un
JSON por producto en `<salida>/products/<slug>.json` con el contenido de los 8 idiomas.

Las fichas comparten maqueta, así que el contenido se reconoce por tipografía, tamaño y color:
- título: LMRoman17 32 pt; subtítulo: Inter-Light 8,6 pt dorado espaciado;
- cifras destacadas: LMRoman17 20 pt con su etiqueta Inter-Light 6,9 pt debajo;
- encabezados de sección: LMRoman12 10,2 pt; subencabezados de tabla: LMRoman12 9 pt claro;
- envases (PRESENTACIÓN): LMRoman12 11,5 pt claro; claves de tabla: Inter-Medium azul;
- viñetas: guion Inter-Medium dorado; párrafo destacado: Inter-Regular 8,7 pt.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf

LANGUAGES = {
    "ESPAÑOL": "es",
    "INGLÉS": "en",
    "ALEMÁN": "de",
    "FRANCÉS": "fr",
    "ITALIANO": "it",
    "POLACO": "pl",
    "NORUEGO": "no",
    "FINLANDÉS": "fi",
}

HEADER_LIMIT = 60
FOOTER_LIMIT = 740
COLUMN_SPLIT = 300
STATS_TOP = 135
SUPERSCRIPTS = str.maketrans("0123456789-+", "⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺")
SUBSCRIPTS = str.maketrans("0123456789-+", "₀₁₂₃₄₅₆₇₈₉₋₊")

GOLD = 0xB9A27A
NAVY = 0x1C2B45
CREAM = 0xF6F1E7
SUBTITLE = 0xCDBB97


@dataclass
class Span:
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    size: float
    font: str
    color: int

    @property
    def column(self) -> str:
        return "left" if self.x0 < COLUMN_SPLIT else "right"


@dataclass
class Line:
    spans: list[Span]

    @property
    def x0(self) -> float:
        return self.spans[0].x0

    @property
    def y0(self) -> float:
        return min(s.y0 for s in self.spans)

    @property
    def yc(self) -> float:
        main = [s for s in self.spans if not s.font.startswith("sup")] or self.spans
        return sum((s.y0 + s.y1) / 2 for s in main) / len(main)

    @property
    def first(self) -> Span:
        return self.spans[0]

    @property
    def text(self) -> str:
        return "".join(s.text for s in self.spans).strip()


@dataclass
class Section:
    title: str
    page: int
    column: str
    x0: float
    y0: float
    spans: list[Span] = field(default_factory=list)
    swatches: list[dict] = field(default_factory=list)


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def unspace(value: str) -> str:
    """«I M P R I M A C I Ó N  S E L L A D O R A» → «IMPRIMACIÓN SELLADORA»."""
    words = re.split(r"\s{2,}", value.strip())
    return " ".join(word.replace(" ", "") for word in words)


def is_font(span: Span, family: str, low: float, high: float) -> bool:
    return span.font.startswith(family) and low <= span.size <= high


def read_spans(page: pymupdf.Page) -> list[Span]:
    spans: list[Span] = []

    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for raw in line["spans"]:
                if not raw["text"].strip():
                    continue

                x0, y0, x1, y1 = raw["bbox"]
                spans.append(
                    Span(raw["text"], x0, y0, x1, y1, raw["size"], raw["font"], raw["color"])
                )

    return merge_superscripts(spans)


def merge_superscripts(spans: list[Span]) -> list[Span]:
    """Une los exponentes («m» + «2») al texto anterior como carácter volado («m²»)."""
    result: list[Span] = []

    for span in spans:
        previous = result[-1] if result else None
        is_script = (
            previous is not None
            and span.size < previous.size * 0.92
            and abs(span.x0 - previous.x1) < 2
            and abs(span.y0 - previous.y0) < 10
            and len(span.text.strip()) <= 3
        )

        if is_script and previous is not None:
            text = span.text.strip()
            if re.fullmatch(r"[0-9+-]+", text):
                table = SUPERSCRIPTS if span.y0 < previous.y0 else SUBSCRIPTS
                text = text.translate(table)
            previous.text += text
            previous.x1 = span.x1
            continue

        # Texto que sigue a un exponente en la misma línea («/kg» tras «m²»).
        if (
            previous is not None
            and abs(span.x0 - previous.x1) < 2
            and abs(span.y0 - previous.y0) < 1
            and span.font == previous.font
            and abs(span.size - previous.size) < 0.2
        ):
            previous.text += span.text
            previous.x1 = span.x1
            continue

        result.append(span)

    return result


def group_lines(spans: list[Span]) -> list[Line]:
    lines: list[Line] = []

    for span in sorted(spans, key=lambda s: (round(s.y0, 0), s.x0)):
        for line in lines:
            if abs(line.first.y0 - span.y0) < 2.5 and line.first.column == span.column:
                line.spans.append(span)
                line.spans.sort(key=lambda s: s.x0)
                break
        else:
            lines.append(Line([span]))

    # Una «línea» con un hueco horizontal grande son en realidad dos celdas (clave y valor).
    split: list[Line] = []

    for line in lines:
        current = [line.spans[0]]
        for span in line.spans[1:]:
            previous = current[-1]
            is_cell_change = (
                previous.font.startswith("Inter-Medium")
                and previous.color == NAVY
                and span.font.startswith("Inter-Light")
                and span.x0 - previous.x1 > 3
            )
            if span.x0 - previous.x1 > 30 or is_cell_change:
                split.append(Line(current))
                current = [span]
            else:
                current.append(span)
        split.append(Line(current))

    return sorted(split, key=lambda line: (line.y0, line.x0))


def read_stats(spans: list[Span], first_heading_y: float) -> list[dict]:
    area = [s for s in spans if STATS_TOP < s.y0 < first_heading_y]
    values = [s for s in area if s.font.startswith("LMRoman17") and s.size > 15]
    labels = [s for s in area if s.font.startswith("Inter") and s.size < 8]

    if not values:
        return []

    # Columnas: tantas como grupos de cifras separados horizontalmente.
    values.sort(key=lambda s: s.x0)
    groups: list[list[Span]] = [[values[0]]]

    for span in values[1:]:
        if span.x0 - groups[-1][-1].x1 > 30:
            groups.append([span])
        else:
            groups[-1].append(span)

    centers = [(g[0].x0 + g[-1].x1) / 2 for g in groups]
    stats = [{"value": "".join(s.text for s in g).strip(), "label": []} for g in groups]

    for label in sorted(labels, key=lambda s: (round(s.y0), s.x0)):
        center = (label.x0 + label.x1) / 2
        index = min(range(len(centers)), key=lambda i: abs(centers[i] - center))
        stats[index]["label"].append(label)

    for stat in stats:
        rows = group_lines(stat["label"])
        stat["label"] = " ".join(line.text for line in rows).strip()
        stat["label"] = re.sub(r"\s+", " ", stat["label"])

    return stats


def read_swatches(page: pymupdf.Page, labels: list[Span]) -> list[dict]:
    """Asocia cada código de color NCS con el rectángulo de color dibujado encima."""
    rects = [d for d in page.get_drawings() if d.get("fill") and d["rect"].width > 20]
    swatches = []

    for label in labels:
        center = (label.x0 + label.x1) / 2
        candidates = [
            d
            for d in rects
            if d["rect"].x0 - 1 <= center <= d["rect"].x1 + 1
            and 0 <= label.y0 - d["rect"].y1 < 25
            and d["rect"].height > 20
        ]
        color = None

        if candidates:
            fill = min(candidates, key=lambda d: label.y0 - d["rect"].y1)["fill"]
            color = "#" + "".join(f"{round(c * 255):02x}" for c in fill)

        swatches.append({"code": label.text.strip(), "color": color})

    return swatches


def join_text(lines: list[Line]) -> str:
    text = ""

    for line in lines:
        part = line.text

        if text.endswith("-") and part[:1].islower() and not text.endswith(" -"):
            text += part
        elif text:
            text += " " + part
        else:
            text = part

    return re.sub(r"\s+", " ", text).strip()


def build_blocks(section: Section) -> list[dict]:
    lines = group_lines(section.spans)
    blocks: list[dict] = []
    keys = [
        line
        for line in lines
        if line.first.font.startswith("Inter-Medium") and line.first.color == NAVY
    ]
    key_x = min((k.x0 for k in keys), default=None)
    value_x = section.x0 + 60

    # Claves de tabla de varias líneas: se agrupan si están muy juntas.
    key_rows: list[list[Line]] = []

    for key in keys:
        last = key_rows[-1][-1] if key_rows else None
        if last is not None and key.y0 - last.y0 < 13 and abs(key.x0 - last.x0) < 2:
            key_rows[-1].append(key)
        else:
            key_rows.append([key])

    rows = [
        {
            "key": join_text(r).rstrip(":").strip(),
            "yc": sum(k.yc for k in r) / len(r),
            "values": [],
            "y0": r[0].y0,
        }
        for r in key_rows
    ]
    current_para: list[Line] = []
    current_bullet: list[Line] | None = None
    events: list[tuple[float, dict]] = []

    def flush_para() -> None:
        nonlocal current_para
        if current_para:
            kind = "lead" if current_para[0].first.font.startswith("Inter-Regular") else "p"
            events.append((current_para[0].y0, {"type": kind, "text": join_text(current_para)}))
            current_para = []

    def flush_bullet() -> None:
        nonlocal current_bullet
        if current_bullet:
            events.append((current_bullet[0].y0, {"type": "li", "text": join_text(current_bullet)}))
        current_bullet = None

    for line in lines:
        first = line.first

        if line in keys:
            flush_para()
            flush_bullet()
            continue

        is_value = (
            rows
            and first.font.startswith("Inter-Light")
            and first.x0 > value_x
            and key_x is not None
            and first.x0 > key_x + 40
        )

        if is_value:
            flush_para()
            flush_bullet()
            row = min(rows, key=lambda r: abs(r["yc"] - line.yc))
            row["values"].append(line)
            continue

        if (
            first.font.startswith("Inter-Medium")
            and first.color == GOLD
            and first.text.strip() == "–"
        ):
            flush_para()
            flush_bullet()
            current_bullet = [Line(line.spans[1:])] if len(line.spans) > 1 else []
            continue

        if current_bullet is not None and first.x0 > section.x0 + 8 and first.size < 9:
            current_bullet.append(line)
            continue

        flush_bullet()

        if is_font(first, "LMRoman12", 8.5, 9.5):
            flush_para()
            events.append((line.y0, {"type": "subhead", "text": line.text.rstrip(":").strip()}))
            continue

        if is_font(first, "LMRoman12", 11, 12):
            flush_para()
            events.append((line.y0, {"type": "pack", "text": line.text}))
            continue

        if first.size < 7:
            # Códigos de la carta de colores (se leen aparte, con su color).
            continue

        if current_para:
            previous = current_para[-1]
            gap = line.y0 - previous.y0
            same_style = abs(previous.first.size - first.size) < 0.3
            if gap > first.size * 1.6 or not same_style:
                flush_para()

        current_para.append(line)

    flush_para()
    flush_bullet()

    for row in rows:
        events.append(
            (row["y0"], {"type": "row", "key": row["key"], "value": join_text(row["values"])})
        )

    events.sort(key=lambda e: e[0])

    # Agrupa elementos consecutivos del mismo tipo (viñetas → lista, filas → tabla…).
    for _, event in events:
        kind = event["type"]
        last = blocks[-1] if blocks else None

        if kind == "li":
            if last and last["type"] == "list":
                last["items"].append(event["text"])
            else:
                blocks.append({"type": "list", "items": [event["text"]]})
        elif kind in ("row", "subhead"):
            if last and last["type"] == "table":
                table = last
            else:
                table = {"type": "table", "groups": []}
                blocks.append(table)
            if kind == "subhead" or not table["groups"]:
                table["groups"].append(
                    {"title": event["text"] if kind == "subhead" else None, "rows": []}
                )
            if kind == "row":
                table["groups"][-1]["rows"].append({"key": event["key"], "value": event["value"]})
        elif kind == "pack":
            if last and last["type"] == "packs":
                last["items"].append(event["text"])
            else:
                blocks.append({"type": "packs", "items": [event["text"]]})
        else:
            blocks.append(event)

    if section.swatches:
        blocks.insert(0, {"type": "swatches", "items": section.swatches})

    return blocks


def extract(path: Path) -> dict:
    doc = pymupdf.open(path)
    sections: list[Section] = []
    result: dict = {"file": path.name}

    for page_number, page in enumerate(doc, start=1):
        spans = read_spans(page)
        body = [s for s in spans if HEADER_LIMIT < s.y0 < FOOTER_LIMIT]
        header = [s for s in spans if s.y0 <= HEADER_LIMIT and s.color == NAVY]
        footer = [s for s in spans if s.y0 >= FOOTER_LIMIT and s.size < 7]
        headings = [s for s in body if is_font(s, "LMRoman12", 9.8, 10.6) and s.color == NAVY]

        if page_number == 1:
            result["label"] = unspace(header[0].text) if header else ""
            result["disclaimer"] = re.sub(
                r"\s+", " ", " ".join(s.text for s in sorted(footer, key=lambda s: s.y0))
            ).strip()
            title = [s for s in body if s.font.startswith("LMRoman17") and s.size > 25]
            subtitle = [s for s in body if s.color == SUBTITLE]
            result["name"] = title[0].text.strip() if title else ""
            result["subtitle"] = unspace(" ".join(s.text for s in subtitle))
            first_y = min((h.y0 for h in headings), default=FOOTER_LIMIT)
            result["stats"] = read_stats(body, first_y)
            body = [s for s in body if s.y0 >= first_y - 1]

        page_sections = [
            Section(
                unspace(h.text) if "  " in h.text else h.text.strip(),
                page_number,
                h.column,
                h.x0,
                h.y0,
            )
            for h in headings
        ]
        sections.extend(page_sections)
        swatch_labels: dict[int, list[Span]] = {}

        for span in body:
            if span in headings:
                continue

            same_column = [
                s for s in page_sections if s.column == span.column and s.y0 <= span.y0 + 1
            ]
            candidates = same_column or [s for s in page_sections if s.y0 <= span.y0 + 1]

            if not candidates:
                print(f"  ! texto sin sección en {path.name} p{page_number}: {span.text!r}")
                continue

            owner = max(candidates, key=lambda s: s.y0)

            if span.size < 7 and span.font.startswith("Inter-Light"):
                swatch_labels.setdefault(id(owner), []).append(span)

            owner.spans.append(span)

        for section in page_sections:
            labels = swatch_labels.get(id(section))
            if labels:
                labels.sort(key=lambda s: (round(s.y0), s.x0))
                section.swatches = read_swatches(page, labels)

    order = sorted(sections, key=lambda s: (s.page, 0 if s.column == "left" else 1, s.y0))
    result["sections"] = [{"title": s.title, "blocks": build_blocks(s)} for s in order]
    result["pages"] = len(doc)

    return result


def save_images(path: Path, folder: Path, slug: str) -> list[str]:
    """Guarda en JPEG las imágenes grandes de la ficha (muestra del efecto acabado)."""
    doc = pymupdf.open(path)
    names: list[str] = []
    folder.mkdir(parents=True, exist_ok=True)

    for page in doc:
        for image in page.get_images(full=True):
            xref, width, height = image[0], image[2], image[3]
            if min(width, height) < 400:
                continue

            pixmap = pymupdf.Pixmap(doc, xref)
            if pixmap.n - pixmap.alpha > 3:
                pixmap = pymupdf.Pixmap(pymupdf.csRGB, pixmap)

            name = f"{slug}.jpg" if not names else f"{slug}-{len(names) + 1}.jpg"
            (folder / name).write_bytes(pixmap.tobytes("jpeg", jpg_quality=85))
            names.append(name)

    return names


def main() -> None:
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    products: dict[str, dict] = {}

    for pdf in sorted(source.glob("*.pdf")):
        stem = unicodedata.normalize("NFC", pdf.stem)
        product, _, language = stem.rpartition(" ")

        if language not in LANGUAGES:
            print(f"  ! idioma no reconocido: {pdf.name}")
            continue

        slug = slugify(product)
        entry = products.setdefault(slug, {"key": slug, "source": product, "languages": {}})
        entry["languages"][LANGUAGES[language]] = extract(pdf)

        if language == "ESPAÑOL":
            entry["images"] = save_images(pdf, output / "images", slug)

    folder = output / "products"
    folder.mkdir(parents=True, exist_ok=True)

    for slug, entry in products.items():
        entry["languages"] = dict(sorted(entry["languages"].items()))
        target = folder / f"{slug}.json"
        target.write_text(json.dumps(entry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"{len(products)} productos extraídos en {folder}")


if __name__ == "__main__":
    main()
