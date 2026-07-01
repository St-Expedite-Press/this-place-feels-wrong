"""Build the client-side image pools for randomizable slot categories.

Reads the editorial catalog and standalone inventory, selects assets in the
randomizable categories, and emits ``assets/image-pools.json`` — a small file
the site fetches at runtime to fill random slots (e.g. the archive grid).

Run from the repository root:
    python scripts/build_image_pools.py
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from asset_categories import validate_category

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "assets" / "catalog.json"
SITE_PATH = ROOT / "assets" / "site-assets.json"
OUTPUT = ROOT / "assets" / "image-pools.json"

# Categories whose slots draw a random image per page load.
POOL_CATEGORIES = ("archive", "photo")


def entry(src: str, alt: str, caption, tags, focal: str) -> dict:
    return {
        "src": src,
        "alt": alt,
        "caption": caption or {"title": None, "byline": None, "series": None},
        "tags": tags or [],
        "focal_point": focal,
    }


def build() -> None:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    site = json.loads(SITE_PATH.read_text(encoding="utf-8"))

    pools = {category: [] for category in POOL_CATEGORIES}

    for asset in catalog["assets"]:
        if asset["category"] in pools:
            pools[asset["category"]].append(
                entry(asset["files"]["web"]["path"], asset["alt"], asset.get("caption"),
                      asset.get("tags"), asset.get("focal_point", "center center"))
            )

    for asset in site["assets"]:
        if asset["category"] in pools:
            pools[asset["category"]].append(
                entry(asset["path"], asset.get("alt", ""), asset.get("caption"),
                      asset.get("tags"), "center center")
            )

    for category in pools:
        validate_category(category, "image-pools")
        pools[category].sort(key=lambda item: item["src"])

    payload = {
        "schema_version": 1,
        "generated": date.today().isoformat(),
        "scope": "Runtime image pools for randomizable slot categories.",
        "pools": pools,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    counts = ", ".join(f"{cat}={len(items)}" for cat, items in pools.items())
    print(f"Built image pools at {OUTPUT.relative_to(ROOT).as_posix()} ({counts})")


if __name__ == "__main__":
    build()
