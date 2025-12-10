# Assets & Media

## Current Assets
- `assets/img/deprecated_images/`: original sigils (`logo_blackonly_tight.svg`, `background_traced_optimized.svg`).
- `assets/img/crow_frames/`: 7 PNG frames for crow glitch animation.
- `assets/gif/crow_glitch_text.gif`: assembled glitch animation.

## Usage Guidance
- Prefer SVG for sigils/logos; keep monochrome and unaltered proportions.
- For animations, use existing frames/gif; avoid adding large video assets.
- Keep opacity low (3–10%) when using background sigils; never interfere with legibility.

## Optimization
- If adding new raster assets: target ≤ 200 KB per image when possible; strip metadata.
- Use PNG or optimized SVG; avoid heavy JPG compression artifacts on dark backgrounds.

## Placement
- Background masks: use `background_traced_optimized.svg` via CSS masks in textures only.
- Logos: center/top; minimum widths should respect existing layouts.

## Don’ts
- No new color introductions; keep neon green as the only accent.
- No drop shadows beyond the defined glow stacks; no gradients beyond current subtle radials.
