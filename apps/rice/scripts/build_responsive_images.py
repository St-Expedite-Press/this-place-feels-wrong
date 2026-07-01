"""Build monochrome responsive WebP variants for public RICE imagery."""

from __future__ import annotations

import hashlib
import json
from datetime import date
from pathlib import Path

from PIL import Image, ImageOps

from asset_categories import is_media


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "assets" / "images"
OUTPUT_ROOT = ROOT / "assets" / "responsive"
MANIFEST_PATH = ROOT / "assets" / "responsive.json"
WIDTHS = (640, 960, 1440)
SKIP_NAMES = {"logo.png", "noise.png", "archive-placeholder.png"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build() -> None:
    outputs: list[dict] = []
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    expected: set[Path] = set()
    for source in sorted(SOURCE_ROOT.rglob("*")):
        if not source.is_file() or not is_media(source) or source.suffix.lower() == ".mp4":
            continue
        if source.name in SKIP_NAMES:
            continue
        category = source.parent.name
        with Image.open(source) as raw:
            image = ImageOps.exif_transpose(raw).convert("L")
            image = ImageOps.autocontrast(image, cutoff=1).convert("RGB")
            for width in WIDTHS:
                ratio = width / image.width
                height = max(1, round(image.height * ratio))
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                destination = OUTPUT_ROOT / category / f"{source.stem}-{width}.webp"
                destination.parent.mkdir(parents=True, exist_ok=True)
                resized.save(destination, "WEBP", quality=78, method=6)
                expected.add(destination)
                outputs.append(
                    {
                        "source": source.relative_to(ROOT).as_posix(),
                        "path": destination.relative_to(ROOT).as_posix(),
                        "width": width,
                        "height": height,
                        "bytes": destination.stat().st_size,
                        "sha256": sha256(destination),
                    }
                )

    for existing in OUTPUT_ROOT.rglob("*.webp"):
        if existing not in expected:
            existing.unlink()

    manifest = {
        "schema_version": 1,
        "generated": date.today().isoformat(),
        "format": "WebP",
        "treatment": "monochrome / autocontrast / quality 78",
        "widths": list(WIDTHS),
        "outputs": outputs,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(outputs)} responsive variants at {MANIFEST_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    build()
