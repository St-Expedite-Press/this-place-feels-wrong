"""Build the RICE editorial image catalog and web derivatives.

Run from the repository root:
    python scripts/build_asset_library.py
"""

from __future__ import annotations

import json
import hashlib
import shutil
from datetime import date
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PROMPT_PATHS = [
    ROOT / "docs" / "city-image-prompts.json",
    ROOT / "docs" / "city-intimate-prompts.json",
]
LEGACY_ROOT = ROOT / "images" / "city-field-notes"
LIBRARY_ROOT = ROOT / "images" / "editorial" / "city-field-notes"
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
        "orientation": "landscape",
        "focal_point": "68% center",
        "alt": "Deadpan documentary view of present-day service infrastructure in {city}.",
    },
    "working-interior": {
        "code": "WIN",
        "label": "Working interior",
        "family": "article-figure",
        "orientation": "landscape",
        "focal_point": "center center",
        "alt": "Working interior in {city} showing practical equipment and evidence of recent use.",
    },
    "archival-evidence": {
        "code": "ARC",
        "label": "Archival evidence",
        "family": "archive-object",
        "orientation": "portrait",
        "focal_point": "center center",
        "alt": "Generated archival reconstruction composed from documents and material evidence associated with {city}.",
    },
    "maker-portrait": {
        "code": "POR",
        "label": "Maker portrait",
        "family": "author-portrait",
        "orientation": "portrait",
        "focal_point": "center 35%",
        "alt": "Direct-flash documentary portrait of a contemporary writer or maker in {city}.",
    },
    "nocturnal-aftermath": {
        "code": "NOC",
        "label": "Nocturnal aftermath",
        "family": "fiction-feature",
        "orientation": "landscape",
        "focal_point": "68% center",
        "alt": "Empty nighttime work site in {city} showing evidence of recent labor.",
    },
    "service-threshold": {
        "code": "SVT",
        "label": "Service threshold",
        "family": "city-intimate-portrait",
        "orientation": "portrait",
        "focal_point": "center 35%",
        "alt": "Candid 2011 documentary reconstruction of a young adult woman at a service threshold in {city}.",
    },
    "print-room-companion": {
        "code": "PRC",
        "label": "Print-room companion",
        "family": "city-intimate-portrait",
        "orientation": "portrait",
        "focal_point": "center 35%",
        "alt": "Candid 2011 documentary reconstruction of a young adult woman working in a print room in {city}.",
    },
    "domestic-assembly": {
        "code": "DOM",
        "label": "Domestic assembly",
        "family": "city-intimate-portrait",
        "orientation": "portrait",
        "focal_point": "center 35%",
        "alt": "Candid 2011 documentary reconstruction of a young adult woman assembling a small publication at home in {city}.",
    },
    "aftershow-passage": {
        "code": "ASP",
        "label": "Aftershow passage",
        "family": "city-intimate-portrait",
        "orientation": "portrait",
        "focal_point": "center 35%",
        "alt": "Candid 2011 documentary reconstruction of a young adult woman walking after a DIY event in {city}.",
    },
    "laundromat-dawn": {
        "code": "LND",
        "label": "Laundromat dawn",
        "family": "city-intimate-portrait",
        "orientation": "portrait",
        "focal_point": "center 35%",
        "alt": "Candid 2011 documentary reconstruction of a young adult woman in a laundromat in {city}.",
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


def source_for(city_slug: str, filename: str, master_path: Path) -> Path:
    legacy_path = LEGACY_ROOT / city_slug / filename
    if master_path.exists():
        return master_path
    if not legacy_path.exists():
        raise FileNotFoundError(f"Missing master for {city_slug}/{filename}")
    master_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(legacy_path), str(master_path))
    return master_path


def build() -> None:
    manifests = [
        (path, json.loads(path.read_text(encoding="utf-8")))
        for path in PROMPT_PATHS
    ]
    records = []

    for prompt_path, manifest in manifests:
        for city in manifest["cities"]:
            city_slug = city["slug"]
            city_code = CITY_CODES[city_slug]
            city_name = city["city"]

            for image in city["images"]:
                role = image["role"]
                role_meta = ROLE_META[role]
                stem = Path(image["filename"]).stem
                asset_id = f"RICE-CFN-{city_code}-{role_meta['code']}-001"

                master = LIBRARY_ROOT / city_slug / "master" / f"{stem}.jpg"
                web = LIBRARY_ROOT / city_slug / "web" / f"{stem}.jpg"
                thumb = LIBRARY_ROOT / city_slug / "thumb" / f"{stem}.jpg"
                source = source_for(city_slug, image["filename"], master)

                with Image.open(source) as original:
                    original = ImageOps.exif_transpose(original)
                    master_meta = {
                        "width": original.width,
                        "height": original.height,
                        "bytes": source.stat().st_size,
                        "sha256": sha256(source),
                    }

                web_meta = save_jpeg(source, web, (1800, 1800), 86)
                web_meta["sha256"] = sha256(web)
                thumb_meta = save_jpeg(source, thumb, (640, 640), 78)
                thumb_meta["sha256"] = sha256(thumb)

                records.append(
                    {
                        "id": asset_id,
                        "title": f"{city_name.split(',')[0]} / {role_meta['label']}",
                        "collection": "city-field-notes",
                        "city": city_name,
                        "city_slug": city_slug,
                        "role": role,
                        "role_label": role_meta["label"],
                        "family": role_meta["family"],
                        "orientation": role_meta["orientation"],
                        "status": "approved",
                        "rights": "St. Expedite Press editorial use",
                        "provenance": "AI-generated editorial reconstruction",
                        "disclosure": manifest["disclosure"],
                        "model": manifest["model"],
                        "generated": date.today().isoformat(),
                        "alt": role_meta["alt"].format(city=city_name),
                        "focal_point": role_meta["focal_point"],
                        "accent": "#D9FF00",
                        "prompt": image["prompt"],
                        "prompt_source": relative(prompt_path),
                        "files": {
                            "master": {"path": relative(master), **master_meta},
                            "web": {"path": relative(web), **web_meta},
                            "thumb": {"path": relative(thumb), **thumb_meta},
                        },
                    }
                )

    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    catalog = {
        "schema_version": 1,
        "generated": date.today().isoformat(),
        "collection": {
            "id": "city-field-notes",
            "title": "Southern City Field Notes",
            "description": "Ten repeated editorial image roles across five Southern cities.",
            "style_guide": "docs/IMAGE_STYLE_GUIDE.md",
            "prompt_manifests": [relative(path) for path in PROMPT_PATHS],
        },
        "roles": [
            {
                "id": role,
                "label": meta["label"],
                "family": meta["family"],
                "code": meta["code"],
            }
            for role, meta in ROLE_META.items()
        ],
        "assets": records,
    }
    CATALOG_PATH.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if LEGACY_ROOT.exists() and not any(LEGACY_ROOT.rglob("*.*")):
        shutil.rmtree(LEGACY_ROOT)

    print(f"Built {len(records)} assets at {relative(CATALOG_PATH)}")


if __name__ == "__main__":
    build()
