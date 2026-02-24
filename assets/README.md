# Asset Storage

This directory is the canonical storage location for media source files used by the site.

## Layout

- `assets/source/img/` - canonical image files (png, jpg, webp, svg)
- `assets/source/gif/` - canonical gif files
- `assets/manifest.txt` - generated checksum/size inventory of published assets

Published site assets remain in `site/assets/` because GitHub Pages serves from `site/`.

## Workflow

1. Add or update source media in `assets/source/img/` or `assets/source/gif/`.
2. Run:
   - `sh agent/tools/sync-assets.sh`
3. Commit source files, updated `site/assets/*`, and `assets/manifest.txt`.

## Notes

- `sync-assets.sh` mirrors source -> published paths using `rsync --delete`.
- If `cwebp` is installed, `.webp` siblings are generated for raster files (`png/jpg/jpeg`).
- Do not edit `site/assets/img/*` and `site/assets/gif/*` directly; treat them as generated publish artifacts.
