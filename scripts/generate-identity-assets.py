"""Generate the St. Expedite seal asset family from the preserved source scan."""

from __future__ import annotations

import base64
import io
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
IDENTITY_DIR = ROOT / "assets" / "source" / "img" / "identity"
SOURCE = IDENTITY_DIR / "expedite-seal-source-2026.png"

GREEN = (42, 255, 138)
BLACK = (5, 8, 7)
WHITE = (255, 255, 255)


def alpha_from_source(source: Image.Image) -> Image.Image:
    gray = source.convert("L")
    values = np.asarray(gray, dtype=np.float32)
    alpha = np.clip((247.0 - values) * 5.4, 0, 255).astype(np.uint8)
    return Image.fromarray(alpha, mode="L")


def remove_tiny_components(mask: Image.Image, minimum_size: int = 14) -> Image.Image:
    values = np.asarray(mask, dtype=np.uint8)
    foreground = values >= 112
    height, width = foreground.shape
    visited = np.zeros_like(foreground, dtype=bool)
    cleaned = values.copy()

    for y in range(height):
        for x in range(width):
            if not foreground[y, x] or visited[y, x]:
                continue

            queue = deque([(x, y)])
            visited[y, x] = True
            component: list[tuple[int, int]] = []

            while queue:
                current_x, current_y = queue.popleft()
                component.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if (
                        0 <= next_x < width
                        and 0 <= next_y < height
                        and foreground[next_y, next_x]
                        and not visited[next_y, next_x]
                    ):
                        visited[next_y, next_x] = True
                        queue.append((next_x, next_y))

            if len(component) < minimum_size:
                for component_x, component_y in component:
                    cleaned[component_y, component_x] = 0

    return Image.fromarray(cleaned, mode="L")


def center_mask(mask: Image.Image, size: int = 1280, padding_ratio: float = 0.085) -> Image.Image:
    bbox = mask.getbbox()
    if not bbox:
        raise RuntimeError("Source seal contains no visible artwork")

    artwork = mask.crop(bbox)
    available = round(size * (1 - 2 * padding_ratio))
    scale = min(available / artwork.width, available / artwork.height)
    resized = artwork.resize(
        (round(artwork.width * scale), round(artwork.height * scale)),
        Image.Resampling.LANCZOS,
    )

    canvas = Image.new("L", (size, size), 0)
    x = (size - resized.width) // 2
    y = (size - resized.height) // 2
    canvas.paste(resized, (x, y))
    return canvas


def retain_inner_seal(mask: Image.Image) -> Image.Image:
    """Remove the source scan's outer circumference and registration diamonds."""
    values = np.asarray(mask, dtype=np.uint8)
    height, width = values.shape
    center_x = (width - 1) / 2
    center_y = (height - 1) / 2
    y, x = np.ogrid[:height, :width]
    radius = min(width, height) * 0.365
    keep = ((x - center_x) ** 2 + (y - center_y) ** 2) <= radius**2
    return Image.fromarray(np.where(keep, values, 0).astype(np.uint8), mode="L")


def colorize(mask: Image.Image, color: tuple[int, int, int], size: int) -> Image.Image:
    resized = mask.resize((size, size), Image.Resampling.LANCZOS)
    image = Image.new("RGBA", (size, size), (*color, 0))
    image.putalpha(resized)
    return image


def save_svg(mask: Image.Image, path: Path) -> None:
    buffer = io.BytesIO()
    mask.save(buffer, format="PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {mask.width} {mask.height}" role="img" aria-labelledby="title">
  <title id="title">St. Expedite Press seal</title>
  <mask id="seal-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="{mask.width}" height="{mask.height}">
    <image width="{mask.width}" height="{mask.height}" href="data:image/png;base64,{encoded}" />
  </mask>
  <rect class="seal-mark" width="100%" height="100%" fill="currentColor" mask="url(#seal-mask)" />
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def save_motion_svg(mask: Image.Image, path: Path) -> None:
    """Build the homepage-only layered seal animation from the canonical mask."""
    buffer = io.BytesIO()
    mask.save(buffer, format="PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {mask.width} {mask.height}" role="img" aria-labelledby="title desc">
  <title id="title">Animated St. Expedite Press seal</title>
  <desc id="desc">The institutional crow seal reveals, breathes softly, and occasionally registers a restrained signal fault.</desc>
  <defs>
    <mask id="seal-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="{mask.width}" height="{mask.height}">
      <image width="{mask.width}" height="{mask.height}" href="data:image/png;base64,{encoded}" />
    </mask>
    <filter id="seal-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.1647 0 0 0 0 1 0 0 0 0 0.5412 0 0 0 .45 0" result="green-glow" />
      <feMerge>
        <feMergeNode in="green-glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <style>
    .seal-arrival,
    .seal-breath,
    .signal-echo {{
      transform-box: fill-box;
      transform-origin: center;
    }}
    .seal-arrival {{
      animation: seal-arrival 1.6s cubic-bezier(.2,.72,.22,1) both;
    }}
    .seal-breath {{
      animation: seal-breath 8s ease-in-out 1.6s infinite;
    }}
    .arrival-echo {{
      opacity: 0;
      animation: arrival-echo 1.6s steps(1, end) both;
    }}
    .signal-echo {{
      opacity: 0;
      animation: signal-fault 12s steps(1, end) 1.6s infinite;
    }}
    .signal-echo--green {{
      animation-delay: 1.64s;
    }}
    .signal-sweep {{
      opacity: 0;
      mix-blend-mode: screen;
      animation: signal-sweep 1.6s cubic-bezier(.2,.72,.22,1) both;
    }}
    @keyframes seal-arrival {{
      0% {{ opacity: 0; transform: scale(.94); clip-path: inset(50% 0 50% 0); }}
      18% {{ opacity: .24; }}
      48% {{ opacity: .82; clip-path: inset(18% 0 20% 0); }}
      72% {{ opacity: 1; transform: scale(1.012); clip-path: inset(0); }}
      100% {{ opacity: 1; transform: scale(1); clip-path: inset(0); }}
    }}
    @keyframes seal-breath {{
      0%, 100% {{ opacity: .93; transform: scale(.997); }}
      50% {{ opacity: 1; transform: scale(1.006); }}
    }}
    @keyframes arrival-echo {{
      0%, 24%, 100% {{ opacity: 0; transform: translate(0); }}
      25% {{ opacity: .38; transform: translate(-8px, 3px); }}
      31% {{ opacity: 0; transform: translate(0); }}
      52% {{ opacity: .22; transform: translate(5px, -2px); }}
      58% {{ opacity: 0; transform: translate(0); }}
    }}
    @keyframes signal-fault {{
      0%, 94%, 96%, 98%, 100% {{ opacity: 0; transform: translate(0); }}
      95% {{ opacity: .28; transform: translate(-2px, 1px); }}
      97% {{ opacity: .18; transform: translate(2px, -1px); }}
    }}
    @keyframes signal-sweep {{
      0%, 12% {{ opacity: 0; transform: translateY(-260px); }}
      22% {{ opacity: .7; }}
      68% {{ opacity: .35; }}
      82%, 100% {{ opacity: 0; transform: translateY(1500px); }}
    }}
    @media (prefers-reduced-motion: reduce) {{
      .seal-arrival,
      .seal-breath {{
        animation: none;
        opacity: 1;
        transform: none;
        clip-path: none;
      }}
      .arrival-echo,
      .signal-echo,
      .signal-sweep {{
        display: none;
        animation: none;
      }}
    }}
  </style>
  <g class="seal-arrival">
    <g class="seal-breath" filter="url(#seal-glow)">
      <rect width="100%" height="100%" fill="#2aff8a" mask="url(#seal-mask)" />
    </g>
  </g>
  <rect class="arrival-echo" width="100%" height="100%" fill="#d96aff" mask="url(#seal-mask)" />
  <rect class="signal-echo signal-echo--magenta" width="100%" height="100%" fill="#d96aff" mask="url(#seal-mask)" />
  <rect class="signal-echo signal-echo--green" width="100%" height="100%" fill="#2aff8a" mask="url(#seal-mask)" />
  <rect class="signal-sweep" x="0" y="-90" width="100%" height="90" fill="#e8f8ee" mask="url(#seal-mask)" />
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def make_social_image(mask: Image.Image) -> Image.Image:
    width, height = 1200, 630
    background = Image.new("RGB", (width, height), BLACK)

    seal_alpha = mask.resize((520, 520), Image.Resampling.LANCZOS)
    glow = seal_alpha.filter(ImageFilter.GaussianBlur(18))
    glow_layer = Image.new("RGBA", (width, height), (*GREEN, 0))
    glow_canvas = Image.new("L", (width, height), 0)
    glow_canvas.paste(glow.point(lambda value: round(value * 0.22)), (76, 55))
    glow_layer.putalpha(glow_canvas)
    background = Image.alpha_composite(background.convert("RGBA"), glow_layer)

    seal = colorize(mask, GREEN, 520)
    background.alpha_composite(seal, (76, 55))

    return background.convert("RGB")


def main() -> None:
    source = Image.open(SOURCE)
    distressed = center_mask(retain_inner_seal(alpha_from_source(source)))

    clean = distressed.point(lambda value: 255 if value >= 96 else 0)
    clean = clean.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    clean = remove_tiny_components(clean)

    colorize(distressed, BLACK, 1280).save(
        IDENTITY_DIR / "expedite-seal-distressed.png", optimize=True
    )
    colorize(clean, BLACK, 1280).save(
        IDENTITY_DIR / "expedite-seal-clean.png", optimize=True
    )
    colorize(distressed, GREEN, 768).save(
        IDENTITY_DIR / "expedite-seal-green-768.png", optimize=True
    )
    colorize(distressed, GREEN, 768).save(
        IDENTITY_DIR / "expedite-seal-green-768.webp",
        format="WEBP",
        lossless=True,
        method=6,
    )
    colorize(clean, WHITE, 768).save(
        IDENTITY_DIR / "expedite-seal-white-768.png", optimize=True
    )
    colorize(clean, BLACK, 768).save(
        IDENTITY_DIR / "expedite-seal-black-768.png", optimize=True
    )

    save_svg(clean, IDENTITY_DIR / "expedite-seal-master.svg")
    save_svg(distressed, IDENTITY_DIR / "expedite-seal-distressed.svg")
    save_motion_svg(
        distressed, IDENTITY_DIR / "expedite-seal-motion.svg"
    )

    social = make_social_image(distressed)
    social.save(IDENTITY_DIR / "expedite-seal-og-1200x630.png", optimize=True)
    social.save(
        IDENTITY_DIR / "expedite-seal-og-1200x630.webp",
        format="WEBP",
        quality=90,
        method=6,
    )

    print("[identity-assets] generated St. Expedite seal family")


if __name__ == "__main__":
    main()
