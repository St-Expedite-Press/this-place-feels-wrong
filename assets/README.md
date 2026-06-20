# Asset Storage

This directory is the canonical storage location for media source files used by the site.

## Layout

- `assets/source/img/` - canonical image files (png, jpg, webp, svg)
- `assets/source/gif/` - canonical gif files
- `assets/manifest.json` - generated machine-readable ownership/checksum inventory
- `assets/manifest.txt` - generated human-readable ownership/checksum inventory

Authored site assets live in `apps/web/public/assets/`. The generated public output is written to `apps/web/dist/assets/` during build.

## Workflow

1. Add or update source media in `assets/source/img/` or `assets/source/gif/`.
2. Run:
   - `npm run assets:sync`
   - `npm run assets:check`
3. Commit source files, updated `apps/web/public/assets/*`, and both generated manifests.

## Notes

- `sync-assets.sh` mirrors source -> authored asset paths and clears removed files before copying.
- Every shipped image/GIF variant is canonical in `assets/source/`, including optimized WebP files. Conversion happens before accessioning; sync is deterministic and does not invent variants.
- CSS, JavaScript, fonts, and `apps/web/public/assets/README.md` are authored directly in the public tree and are recorded as `authored-public`.
- Do not edit `apps/web/public/assets/img/*` and `apps/web/public/assets/gif/*` directly; treat them as synchronized authored assets derived from `assets/source/`.
