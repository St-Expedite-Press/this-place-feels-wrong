# Asset Storage

This directory is the canonical storage location for media source files used by the site.

## Layout

- `assets/source/img/` - canonical image files (png, jpg, webp, svg)
- `assets/source/gif/` - canonical gif files
- `assets/manifest.txt` - generated checksum/size inventory of authored web assets

Authored site assets live in `apps/web/public/assets/`. The generated public output is written to `apps/web/dist/assets/` during build.

## Workflow

1. Add or update source media in `assets/source/img/` or `assets/source/gif/`.
2. Run:
   - `npm run assets:sync`
   - `npm run assets:check`
3. Commit source files, updated `apps/web/public/assets/*`, and `assets/manifest.txt`.

## Notes

- `sync-assets.sh` mirrors source -> authored asset paths and clears removed files before copying.
- If `cwebp` is installed, `.webp` siblings are generated for raster files (`png/jpg/jpeg`).
- Do not edit `apps/web/public/assets/img/*` and `apps/web/public/assets/gif/*` directly; treat them as synchronized authored assets derived from `assets/source/`.
