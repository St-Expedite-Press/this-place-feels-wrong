"""Build the RICE editorial image catalog and web derivatives.

Reads original masters from ``assets/masters/<category>/`` and writes a
canonical fallback rendition to ``assets/images/<category>/``. Responsive
monochrome WebP variants are generated separately by
``build_responsive_images.py``.

    python scripts/build_asset_library.py
"""

from __future__ import annotations

import json
import hashlib
from datetime import date
from pathlib import Path

from PIL import Image, ImageOps

from asset_categories import category_block, validate_category


ROOT = Path(__file__).resolve().parents[1]
PROMPTS = ROOT / "docs" / "city-image-prompts.json"
MASTERS_ROOT = ROOT / "assets" / "masters"
IMAGES_ROOT = ROOT / "assets" / "images"
CATALOG_PATH = ROOT / "assets" / "catalog.json"

CITY_CODES = {
    "new-orleans": "NOL",
    "athens": "ATH",
    "asheville": "AVL",
    "savannah": "SAV",
    "richmond": "RIC",
}

ROLE_META = {
    "street-field-note": {
        "code": "SFN",
        "label": "Street field note",
        "family": "section-feature",
        "category": "archive",
        "orientation": "landscape",
        "focal_point": "68% center",
        "tags": ["field", "weather"],
        "alt": "Deadpan documentary view of present-day service infrastructure in {city}.",
    },
    "working-interior": {
        "code": "WIN",
        "label": "Working interior",
        "family": "article-figure",
        "category": "article",
        "orientation": "landscape",
        "focal_point": "center center",
        "tags": ["interior"],
        "alt": "Working interior in {city} showing practical equipment and evidence of recent use.",
    },
    "archival-evidence": {
        "code": "ARC",
        "label": "Archival evidence",
        "family": "archive-object",
        "category": "archive",
        "orientation": "portrait",
        "focal_point": "center center",
        "tags": ["ledger", "document"],
        "alt": "Generated archival reconstruction composed from documents and material evidence associated with {city}.",
    },
    "maker-portrait": {
        "code": "POR",
        "label": "Maker portrait",
        "family": "author-portrait",
        "category": "article",
        "orientation": "portrait",
        "focal_point": "center 35%",
        "tags": ["portrait"],
        "alt": "Direct-flash documentary portrait of a contemporary writer or maker in {city}.",
    },
    "nocturnal-aftermath": {
        "code": "NOC",
        "label": "Nocturnal aftermath",
        "family": "fiction-feature",
        "category": "article",
        "orientation": "landscape",
        "focal_point": "68% center",
        "tags": ["night"],
        "alt": "Empty nighttime work site in {city} showing evidence of recent labor.",
    },
}


def save_jpeg(source: Path, destination: Path, max_size: tuple[int, int], quality: int) -> dict:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        image.save(destination, "JPEG", quality=quality, optimize=True, progressive=True)
        return {"width": image.width, "height": image.height, "bytes": destination.stat().st_size}


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build() -> None:
    manifest = json.loads(PROMPTS.read_text(encoding="utf-8"))
    records = []

    for city in manifest["cities"]:
        city_slug = city["slug"]
        city_code = CITY_CODES[city_slug]
        city_name = city["city"]
        city_short = city_name.split(",")[0]

        for image in city["images"]:
            role = image["role"]
            role_meta = ROLE_META[role]
            category = role_meta["category"]
            validate_category(category, role)
            stem = Path(image["filename"]).stem
            asset_id = f"RICE-CFN-{city_code}-{role_meta['code']}-001"

            master = MASTERS_ROOT / category / f"{stem}.jpg"
            web = IMAGES_ROOT / category / f"{stem}.jpg"
            if not master.exists():
                raise FileNotFoundError(f"Missing master for {asset_id}: {relative(master)}")

            with Image.open(master) as original:
                original = ImageOps.exif_transpose(original)
                master_meta = {
                    "width": original.width,
                    "height": original.height,
                    "bytes": master.stat().st_size,
                    "sha256": sha256(master),
                }

            web_meta = save_jpeg(master, web, (1800, 1800), 86)
            web_meta["sha256"] = sha256(web)

            records.append(
                {
                    "id": asset_id,
                    "title": f"{city_short} / {role_meta['label']}",
                    "collection": "city-field-notes",
                    "place": city_name,
                    "place_slug": city_slug,
                    "category": category,
                    "role": role,
                    "role_label": role_meta["label"],
                    "family": role_meta["family"],
                    "orientation": role_meta["orientation"],
                    "status": "approved",
                    "rights": "St. Expedite Press editorial use",
                    "provenance": "AI-generated editorial reconstruction",
                    "disclosure": manifest["disclosure"],
                    "model": manifest["model"],
                    "generated": "2026-06-19",
                    "alt": role_meta["alt"].format(city=city_name),
                    "focal_point": role_meta["focal_point"],
                    "accent": "#3F5228",
                    "tags": role_meta["tags"],
                    "caption": {
                        "title": f"{city_short} / {role_meta['label']}",
                        "byline": None,
                        "series": asset_id,
                    },
                    "prompt": image["prompt"],
                    "prompt_source": relative(PROMPTS),
                    "files": {
                        "web": {"path": relative(web), **web_meta},
                        "master": {"path": relative(master), **master_meta},
                    },
                }
            )

    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    catalog = {
        "schema_version": 2,
        "generated": date.today().isoformat(),
        "collection": {
            "id": "city-field-notes",
            "title": "Southern Place Field Notes",
            "description": "Five repeated editorial image roles across five Southern cities.",
            "style_guide": "docs/IMAGE_STYLE_GUIDE.md",
            "prompt_manifest": relative(PROMPTS),
        },
        "categories": category_block(),
        "roles": [
            {
                "id": role,
                "label": meta["label"],
                "family": meta["family"],
                "category": meta["category"],
                "code": meta["code"],
            }
            for role, meta in ROLE_META.items()
        ],
        "assets": records,
    }
    CATALOG_PATH.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Built {len(records)} assets at {relative(CATALOG_PATH)}")


if __name__ == "__main__":
    build()
