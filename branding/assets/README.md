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
- `assets/source/img/identity/expedite-seal-source-2026.png`
- `assets/source/img/identity/expedite-seal-master.svg`
- `assets/source/img/identity/expedite-seal-distressed.svg`
- `assets/source/img/identity/expedite-seal-clean.png`
- `assets/source/img/identity/expedite-seal-distressed.png`
- `assets/source/img/identity/expedite-seal-green-768.png`
- `assets/source/img/identity/expedite-seal-green-768.webp`
- `assets/source/img/identity/expedite-seal-white-768.png`
- `assets/source/img/identity/expedite-seal-black-768.png`
- `assets/source/img/identity/expedite-seal-og-1200x630.png`
- `assets/source/img/identity/expedite-seal-og-1200x630.webp`
- `assets/source/img/les-fievres-cover.svg`
- `assets/source/img/covers/lift-wind-cover.jpg`
- `assets/source/img/covers/lift-wind-cover.webp`

Published copies live under `apps/web/public/assets/` and are synchronized from the source tree.

## Usage Roles

- St. Expedite seal: primary institutional identity and homepage portal image.
- Seal social image: default social preview.
- Crow glitch still/gif/webp: secondary ritual imagery and preserved historical portal assets.
- Void engine twinkle: background texture, high-atmosphere surfaces only.
- Favicon: existing small identity mark and browser icon; intentionally unchanged.
- Book covers: catalog, commerce, and editorial object presentation.

## Export Notes

- Keep original filenames unless a downstream tool requires naming changes.
- Preserve `expedite-seal-source-2026.png` unchanged. Run `npm run identity:build` to rebuild derivatives.
- Use the clean seal at small sizes and the distressed seal at large display sizes.
- The SVG masters use an embedded monochrome mask and inherit `currentColor`.
- Do not use the void texture behind dense form inputs or long text.
- Do not stretch book covers to fill arbitrary card ratios.
- If new assets are created, place source versions under `assets/source/`, then run `npm run assets:sync` and `npm run assets:check`.

