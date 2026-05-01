# Brand Asset Handoff

This directory documents the image and media assets that belong in a branding export. It intentionally does not duplicate binary files from the live app.

## Canonical Source Assets

Copy from `assets/source/` when preparing an external package:

- `assets/source/img/crow_glitch_text_still.png`
- `assets/source/img/crow_glitch_text_still.webp`
- `assets/source/img/crow_glitch_text.webp`
- `assets/source/gif/crow_glitch_text.gif`
- `assets/source/img/void_engine_twinkle_green.png`
- `assets/source/img/void_engine_twinkle_green.webp`
- `assets/source/img/favicon.svg`
- `assets/source/img/les-fievres-cover.svg`
- `assets/source/img/covers/lift-wind-cover.jpg`

Published copies live under `apps/web/public/assets/` and are synchronized from the source tree.

## Usage Roles

- Crow glitch still: primary identity image, social preview, portal fallback.
- Crow glitch gif/webp: ritual motion and homepage atmosphere.
- Void engine twinkle: background texture, high-atmosphere surfaces only.
- Favicon: small identity mark and browser icon.
- Book covers: catalog, commerce, and editorial object presentation.

## Export Notes

- Keep original filenames unless a downstream tool requires naming changes.
- Do not use the void texture behind dense form inputs or long text.
- Do not stretch book covers to fill arbitrary card ratios.
- If new assets are created, place source versions under `assets/source/`, then run `npm run assets:sync` and `npm run assets:check`.

