"""Build the inventory for standalone RICE site media.

Standalone media now live in ``assets/images/<category>/`` alongside the
editorial collection. This script records the explicitly-managed standalone
files; editorial assets are cataloged by ``build_asset_library.py``.

Run from the repository root:
    python scripts/build_site_asset_inventory.py
"""

from __future__ import annotations

import hashlib
import json
from datetime import date
from pathlib import Path

from PIL import Image, ImageOps

from asset_categories import category_block, is_media, validate_category


ROOT = Path(__file__).resolve().parents[1]
IMAGES_ROOT = ROOT / "assets" / "images"
CATALOG_PATH = ROOT / "assets" / "catalog.json"
OUTPUT = ROOT / "assets" / "site-assets.json"

# filename -> managed standalone media metadata. `caption`/`tags` are only
# meaningful for randomizable categories (archive); others leave them empty.
ASSETS = {
    "archive-ledger.jpg": {
        "category": "archive",
        "role": "archive-document",
        "used_by": [],
        "place": "Acadia Parish",
        "tags": ["ledger"],
        "caption": {"title": "Withdrawn synthetic ledger", "byline": None, "series": "Internal / not public"},
    },
    "archive-placeholder.png": {"category": "system", "role": "fallback-texture", "used_by": []},
    "feature-archive.png": {"category": "feature", "role": "section-feature", "used_by": []},
    "feature-essays.jpg": {"category": "feature", "role": "section-feature", "used_by": ["index.html", "essays.html"]},
    "feature-fiction.jpg": {"category": "feature", "role": "section-feature", "used_by": ["index.html", "fiction.html"]},
    "feature-poetry.jpg": {"category": "feature", "role": "section-feature", "used_by": ["index.html", "poetry.html"]},
    "feature.png": {"category": "feature", "role": "general-feature", "used_by": []},
    "issue-specimen.jpg": {"category": "feature", "role": "publication-specimen", "used_by": ["shop.html", "year.html"]},
    "logo.png": {"category": "system", "role": "site-identity", "used_by": ["all HTML pages"]},
    "noise.png": {"category": "system", "role": "retired-surface-texture", "used_by": []},
    "rice-field-loop.mp4": {"category": "system", "role": "retired-splash-video", "used_by": []},
    "rice_field.png": {"category": "system", "role": "splash-cover", "used_by": ["splash.html"]},
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def build() -> None:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    editorial_paths = {asset["files"]["web"]["path"] for asset in catalog["assets"]}

    expected = {f"assets/images/{meta['category']}/{name}" for name, meta in ASSETS.items()}
    present = {rel(p) for p in IMAGES_ROOT.rglob("*") if is_media(p)}
    standalone_present = present - editorial_paths
    if standalone_present != expected:
        missing = sorted(expected - standalone_present)
        unmanaged = sorted(standalone_present - expected)
        raise RuntimeError(f"Site asset inventory mismatch; missing={missing}, unmanaged={unmanaged}")

    records = []
    for name, meta in ASSETS.items():
        validate_category(meta["category"], name)
        path = IMAGES_ROOT / meta["category"] / name
        stem = Path(name).stem.upper().replace("-", "_")
        record = {
            "id": f"RICE-SITE-{stem}",
            "path": rel(path),
            "category": meta["category"],
            "role": meta["role"],
            "used_by": meta["used_by"],
            "bytes": path.stat().st_size,
            "sha256": sha256(path),
        }
        if path.suffix.lower() != ".mp4":
            with Image.open(path) as image:
                image = ImageOps.exif_transpose(image)
                record["width"] = image.width
                record["height"] = image.height
                record["format"] = image.format
        else:
            record["format"] = "MP4"
        if "place" in meta:
            record["place"] = meta["place"]
        if "tags" in meta:
            record["tags"] = meta["tags"]
        if "caption" in meta:
            record["caption"] = meta["caption"]
        records.append(record)

    inventory = {
        "schema_version": 2,
        "generated": date.today().isoformat(),
        "scope": "Standalone site media in assets/images/<category>/; editorial collection assets are cataloged separately.",
        "source_of_truth": "assets/images/",
        "categories": category_block(),
        "assets": records,
    }
    OUTPUT.write_text(json.dumps(inventory, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(records)} site assets at {rel(OUTPUT)}")


if __name__ == "__main__":
    build()
