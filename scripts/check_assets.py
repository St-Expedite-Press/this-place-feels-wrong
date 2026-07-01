"""Validate RICE asset inventories, files, measurements, and checksums."""

from __future__ import annotations

import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path

from PIL import Image, ImageOps

from asset_categories import is_media, validate_article_category, validate_category


ROOT = Path(__file__).resolve().parents[1]
IMAGES_ROOT = ROOT / "assets" / "images"
PUBLICATION_STATES = {"sample", "planned", "published", "withdrawn"}


class HeadingParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_h1 = False
        self.h1_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "h1":
            self.in_h1 = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "h1":
            self.in_h1 = False

    def handle_data(self, data: str) -> None:
        if self.in_h1:
            self.h1_parts.append(data)

    @property
    def h1(self) -> str:
        return " ".join(" ".join(self.h1_parts).split())


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def check_file(record: dict, label: str) -> None:
    path = ROOT / record["path"]
    if not path.is_file():
        raise RuntimeError(f"{label}: missing {record['path']}")
    if path.stat().st_size != record["bytes"]:
        raise RuntimeError(f"{label}: byte count drift for {record['path']}")
    if sha256(path) != record["sha256"]:
        raise RuntimeError(f"{label}: checksum drift for {record['path']}")
    if "width" in record:
        with Image.open(path) as image:
            image = ImageOps.exif_transpose(image)
            if (image.width, image.height) != (record["width"], record["height"]):
                raise RuntimeError(f"{label}: dimensions drift for {record['path']}")


def image_category_index(editorial: dict, site: dict) -> dict:
    """Map every catalogued served image path to its asset category."""
    index: dict[str, str] = {}
    for asset in editorial["assets"]:
        index[asset["files"]["web"]["path"]] = asset["category"]
    for asset in site["assets"]:
        index[asset["path"]] = asset["category"]
    return index


def check_image_pools(category_of: dict) -> str:
    """Validate image-pools.json: every entry resolves to a real, in-category file."""
    pools_path = ROOT / "assets" / "image-pools.json"
    if not pools_path.is_file():
        return "no pools"
    pools = json.loads(pools_path.read_text(encoding="utf-8"))["pools"]
    summary = []
    for category, entries in pools.items():
        validate_category(category, "image-pools")
        for item in entries:
            src = item["src"]
            if not (ROOT / src).is_file():
                raise RuntimeError(f"image-pools {category}: missing {src}")
            if category_of.get(src) != category:
                raise RuntimeError(
                    f"image-pools {category}: {src} is category "
                    f"'{category_of.get(src)}', not '{category}'"
                )
        summary.append(f"{category}={len(entries)}")
    return ", ".join(summary)


def check_responsive_images() -> int:
    path = ROOT / "assets" / "responsive.json"
    if not path.is_file():
        raise RuntimeError("Missing assets/responsive.json")
    manifest = json.loads(path.read_text(encoding="utf-8"))
    covered: set[str] = set()
    for output in manifest["outputs"]:
        check_file(output, "responsive image")
        covered.add(output["path"])
        if output["width"] not in {640, 960, 1440}:
            raise RuntimeError(f"responsive image: unsupported width {output['width']}")
    present = {
        item.relative_to(ROOT).as_posix()
        for item in (ROOT / "assets" / "responsive").rglob("*.webp")
    }
    if present != covered:
        raise RuntimeError(
            "Responsive image set mismatch; "
            f"orphans={sorted(present - covered)}, missing={sorted(covered - present)}"
        )
    return len(covered)


def check_articles(category_of: dict) -> int:
    """Validate the article data model (assets/articles.json)."""
    path = ROOT / "assets" / "articles.json"
    if not path.is_file():
        return 0
    manifest = json.loads(path.read_text(encoding="utf-8"))
    seen: set[str] = set()
    for article in manifest["articles"]:
        aid = article["id"]
        if aid in seen:
            raise RuntimeError(f"Duplicate article ID: {aid}")
        seen.add(aid)
        validate_article_category(article["category"], f"article {aid}")
        for field in ("title", "place", "description", "publication_state", "season", "disclosure"):
            if not article.get(field):
                raise RuntimeError(f"article {aid}: missing required field '{field}'")
        state = article["publication_state"]
        if state not in PUBLICATION_STATES:
            raise RuntimeError(f"article {aid}: invalid publication_state '{state}'")
        href = article.get("href")
        if state in {"planned", "withdrawn"} and href is not None:
            raise RuntimeError(f"article {aid}: {state} work must not have an href")
        if state in {"sample", "published"} and not href:
            raise RuntimeError(f"article {aid}: {state} work requires an href")
        if href:
            target = ROOT / href
            if not target.is_file():
                raise RuntimeError(f"article {aid}: href target missing ({href})")
            parser = HeadingParser()
            parser.feed(target.read_text(encoding="utf-8"))
            if parser.h1.casefold() != article["title"].casefold():
                raise RuntimeError(
                    f"article {aid}: destination h1 '{parser.h1}' does not match title '{article['title']}'"
                )
            if article["category"] == "archive":
                html = target.read_text(encoding="utf-8").casefold()
                if "visual reconstruction" not in html or "not an authenticated" not in html:
                    raise RuntimeError(f"article {aid}: archive reconstruction lacks visible disclosure")
        hero = article.get("hero")
        if hero is not None:
            if not (ROOT / hero).is_file():
                raise RuntimeError(f"article {aid}: hero image missing ({hero})")
            if hero not in category_of:
                raise RuntimeError(f"article {aid}: hero {hero} is not in any image inventory")
    return len(manifest["articles"])


def check_photo_slots(editorial: dict, site: dict) -> int:
    """Validate the rendered photo-slot inventory against the asset categories."""
    slots_path = ROOT / "assets" / "photo-slots.json"
    if not slots_path.is_file():
        return 0
    manifest = json.loads(slots_path.read_text(encoding="utf-8"))
    category_of = image_category_index(editorial, site)
    pools = {}
    pools_path = ROOT / "assets" / "image-pools.json"
    if pools_path.is_file():
        pools = json.loads(pools_path.read_text(encoding="utf-8"))["pools"]

    seen: set[str] = set()
    for slot in manifest["slots"]:
        sid = slot["id"]
        if sid in seen:
            raise RuntimeError(f"Duplicate slot ID: {sid}")
        seen.add(sid)
        validate_category(slot["category"], f"slot {sid}")
        # Each image/poster (including the no-JS fallback) must be category-correct.
        for key in ("image", "poster"):
            ref = slot.get(key)
            if ref is None:
                continue
            if not (ROOT / ref).is_file():
                raise RuntimeError(f"slot {sid}: missing {key} {ref}")
            actual = category_of.get(ref)
            if actual is None:
                raise RuntimeError(f"slot {sid}: {key} {ref} is not in any asset inventory")
            if actual != slot["category"]:
                raise RuntimeError(
                    f"slot {sid}: {key} {ref} is category '{actual}' "
                    f"but the slot is assigned '{slot['category']}'"
                )
        # Random slots must draw from a non-empty pool of their category.
        if slot.get("random"):
            pool = slot.get("pool")
            if pool != slot["category"]:
                raise RuntimeError(f"slot {sid}: random pool '{pool}' must equal slot category '{slot['category']}'")
            if not pools.get(pool):
                raise RuntimeError(f"slot {sid}: random pool '{pool}' is empty or missing in image-pools.json")
    return len(manifest["slots"])


def main() -> None:
    editorial = json.loads((ROOT / "assets" / "catalog.json").read_text(encoding="utf-8"))
    site = json.loads((ROOT / "assets" / "site-assets.json").read_text(encoding="utf-8"))
    prompts = json.loads((ROOT / "docs" / "city-image-prompts.json").read_text(encoding="utf-8"))
    prompt_records = {
        (city["slug"], image["role"]): image["prompt"]
        for city in prompts["cities"]
        for image in city["images"]
    }

    ids: set[str] = set()
    for asset in editorial["assets"]:
        if asset["id"] in ids:
            raise RuntimeError(f"Duplicate asset ID: {asset['id']}")
        ids.add(asset["id"])
        validate_category(asset.get("category", ""), asset["id"])
        prompt_key = (asset["place_slug"], asset["role"])
        if prompt_records.get(prompt_key) != asset["prompt"]:
            raise RuntimeError(f"{asset['id']}: prompt metadata is out of date")
        if asset["model"] != prompts["model"] or asset["disclosure"] != prompts["disclosure"]:
            raise RuntimeError(f"{asset['id']}: generation metadata is out of date")
        for tier in ("web", "master"):
            check_file(asset["files"][tier], f"{asset['id']} {tier}")
        if max(asset["files"]["web"]["width"], asset["files"]["web"]["height"]) > 1800:
            raise RuntimeError(f"{asset['id']}: web derivative exceeds 1800 px")

    if len(prompt_records) != len(editorial["assets"]):
        raise RuntimeError("Prompt manifest and editorial catalog counts differ")

    for asset in site["assets"]:
        if asset["id"] in ids:
            raise RuntimeError(f"Duplicate asset ID: {asset['id']}")
        ids.add(asset["id"])
        validate_category(asset.get("category", ""), asset["id"])
        check_file(asset, asset["id"])

    # Every served image file must be covered by exactly one inventory.
    served = {p.relative_to(ROOT).as_posix() for p in IMAGES_ROOT.rglob("*") if is_media(p)}
    covered = {a["files"]["web"]["path"] for a in editorial["assets"]} | {a["path"] for a in site["assets"]}
    if served != covered:
        raise RuntimeError(
            "Served image set mismatch; "
            f"orphans={sorted(served - covered)}, missing={sorted(covered - served)}"
        )

    category_of = image_category_index(editorial, site)
    pool_summary = check_image_pools(category_of)
    slot_count = check_photo_slots(editorial, site)
    article_count = check_articles(category_of)
    responsive_count = check_responsive_images()

    print(
        f"[check-assets] PASS: {len(editorial['assets'])} editorial assets, "
        f"{len(site['assets'])} standalone site assets, "
        f"{slot_count} photo slots, {article_count} articles, "
        f"{responsive_count} responsive variants, pools [{pool_summary}]"
    )


if __name__ == "__main__":
    main()
