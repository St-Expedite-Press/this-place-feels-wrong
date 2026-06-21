"""Grade FLUX redlight proofs toward a damaged 2011 compact-camera JPEG."""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_GLOB = "images/editorial/city-field-notes/*/proof/*-redlight-proof-v2.jpg"


def grade(source: Path) -> Path:
    destination = source.with_name(source.name.replace("-v2.jpg", "-graded-v3.jpg"))
    with Image.open(source) as original:
        image = ImageOps.fit(
            ImageOps.exif_transpose(original).convert("RGB"),
            (1400, 1050),
            method=Image.Resampling.LANCZOS,
        )

    image = image.filter(ImageFilter.GaussianBlur(0.55))
    image = ImageEnhance.Brightness(image).enhance(0.48)
    image = ImageEnhance.Contrast(image).enhance(1.3)

    red, green, blue = image.split()
    red = red.point(lambda value: min(255, int(value * 1.35 + 8)))
    green = green.point(lambda value: int(value * 0.42))
    blue = blue.point(lambda value: int(value * 0.28))
    image = Image.merge("RGB", (red, green, blue))

    vignette = Image.new("L", image.size, 0)
    center = Image.new("L", (820, 700), 255)
    vignette.paste(center, ((image.width - center.width) // 2 + 90, 105))
    vignette = vignette.filter(ImageFilter.GaussianBlur(260))
    image = ImageChops.multiply(image, Image.merge("RGB", (vignette,) * 3))

    noise = Image.effect_noise(image.size, 34).convert("L")
    noise_rgb = Image.merge("RGB", (
        noise.point(lambda value: int(value * 0.65)),
        noise.point(lambda value: int(value * 0.25)),
        noise.point(lambda value: int(value * 0.35)),
    ))
    image = ImageChops.add(image, noise_rgb, scale=1.0, offset=-28)

    random.seed(source.name)
    if random.random() > 0.5:
        image = image.transform(
            image.size,
            Image.Transform.AFFINE,
            (1, 0.003, -2, -0.002, 1, 1),
            resample=Image.Resampling.BICUBIC,
        )

    image.save(destination, "JPEG", quality=67, optimize=True, progressive=False, subsampling=2)
    return destination


def main() -> None:
    sources = sorted(ROOT.glob(SOURCE_GLOB))
    for source in sources:
        destination = grade(source)
        print(destination.relative_to(ROOT))


if __name__ == "__main__":
    main()
