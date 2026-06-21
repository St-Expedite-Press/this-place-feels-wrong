"""Validate RICE asset inventories, files, measurements, and checksums."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]


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


def main() -> None:
    editorial = json.loads((ROOT / "assets" / "catalog.json").read_text(encoding="utf-8"))
    site = json.loads((ROOT / "assets" / "site-assets.json").read_text(encoding="utf-8"))
    prompt_paths = [
        ROOT / "docs" / "city-image-prompts.json",
        ROOT / "docs" / "city-intimate-prompts.json",
    ]
    prompts = [json.loads(path.read_text(encoding="utf-8")) for path in prompt_paths]
    prompt_records = {
        (city["slug"], image["role"]): {
            "prompt": image["prompt"],
            "model": manifest["model"],
            "disclosure": manifest["disclosure"],
        }
        for manifest in prompts
        for city in manifest["cities"]
        for image in city["images"]
    }

    ids: set[str] = set()
    for asset in editorial["assets"]:
        if asset["id"] in ids:
            raise RuntimeError(f"Duplicate asset ID: {asset['id']}")
        ids.add(asset["id"])
        prompt_key = (asset["city_slug"], asset["role"])
        prompt_record = prompt_records.get(prompt_key)
        if not prompt_record or prompt_record["prompt"] != asset["prompt"]:
            raise RuntimeError(f"{asset['id']}: prompt metadata is out of date")
        if (
            asset["model"] != prompt_record["model"]
            or asset["disclosure"] != prompt_record["disclosure"]
        ):
            raise RuntimeError(f"{asset['id']}: generation metadata is out of date")
        for tier in ("master", "web", "thumb"):
            check_file(asset["files"][tier], f"{asset['id']} {tier}")
        if max(asset["files"]["web"]["width"], asset["files"]["web"]["height"]) > 1800:
            raise RuntimeError(f"{asset['id']}: web derivative exceeds 1800 px")
        if max(asset["files"]["thumb"]["width"], asset["files"]["thumb"]["height"]) > 640:
            raise RuntimeError(f"{asset['id']}: thumbnail exceeds 640 px")

    if len(prompt_records) != len(editorial["assets"]):
        raise RuntimeError("Prompt manifest and editorial catalog counts differ")

    site_paths = {record["path"] for record in site["assets"]}
    actual_site_paths = {
        path.relative_to(ROOT).as_posix()
        for path in (ROOT / "images").iterdir()
        if path.is_file()
    }
    if site_paths != actual_site_paths:
        raise RuntimeError(
            "Standalone site inventory mismatch; "
            f"missing={sorted(site_paths - actual_site_paths)}, "
            f"unmanaged={sorted(actual_site_paths - site_paths)}"
        )
    for asset in site["assets"]:
        if asset["id"] in ids:
            raise RuntimeError(f"Duplicate asset ID: {asset['id']}")
        ids.add(asset["id"])
        check_file(asset, asset["id"])

    print(
        f"[check-assets] PASS: {len(editorial['assets'])} editorial assets, "
        f"{len(site['assets'])} standalone site assets"
    )


if __name__ == "__main__":
    main()
