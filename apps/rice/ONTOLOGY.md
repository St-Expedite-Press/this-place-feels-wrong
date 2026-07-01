# RICE Magazine Ontology

Read this after `AGENTS.md`. It defines source ownership, update coupling, and
the public/private boundary for `rice_site/`.

## Maintained surfaces

| Surface | Source of truth | Notes |
|---|---|---|
| Public page markup | Root `*.html` | Framework-free. Stable work routes use title slugs; `*-template.html` files are compatibility redirects. |
| Visual system | `styles.css`, `fonts.css`, `assets/fonts/` | Seed palette, locally hosted fonts, responsive/reduced-motion/forced-colors behavior. |
| Site behavior | `site.js` | Search, filters, reading mode, and press-Worker updates signup. |
| Work records | `assets/articles.json` | Includes publication state, season, sample flag, nullable route, hero, and disclosure. |
| Image metadata | `assets/catalog.json`, `assets/site-assets.json` | Internal generated inventories; never publish directly. |
| Image slots | `assets/photo-slots.json`, `docs/PHOTO_SLOTS.md` | Public rendered slots and category bindings. |
| Fallback images | `assets/images/<category>/` | Canonical web fallbacks. Editorial files derive from masters. |
| Responsive images | `assets/responsive/`, `assets/responsive.json` | Generated monochrome 640/960/1440 WebP variants. |
| Masters | `assets/masters/<category>/` | Internal canonical originals; excluded from Pages. |
| Internal asset browser | `asset-library.*` | Repository-local only; excluded from `_site/`. |
| Public artifact | `scripts/build_public_site.py` → `_site/` | Allowlisted deployment output; `_site/` is ignored and generated. |
| Pages workflow | `.github/workflows/pages.yml` | Builds and deploys `_site/`; does not publish the repository root. |
| Asset tooling | `scripts/build_*.py`, `scripts/check_assets.py` | Rebuild and validate inventories, renditions, work routes, and publication boundaries. |

## Update coupling

- Work changes go through `assets/articles.json`. `sample`/`published` records
  require a route whose `<h1>` equals the title; `planned`/`withdrawn` records
  require `href: null`.
- Any public reconstruction needs a stable `RICE-VR-*` record and visible
  “visual reconstruction / not authenticated” disclosure on index and detail.
- Image source changes require the asset-library, site-inventory, pool, and
  responsive builders before `check_assets.py`.
- Public image-slot changes must be mirrored in `assets/photo-slots.json` and
  `docs/PHOTO_SLOTS.md`.
- Public-file, route, or privacy-boundary changes require
  `build_public_site.py`, this ontology, `AGENTS.md`, and README review.
- Worker signup changes are cross-repository work: update the press Worker,
  tests, OpenAPI/docs when its contract changes, and validate each repository
  independently.

## Validation

```powershell
node --check site.js
node --check asset-library.js
python -m py_compile scripts/*.py
python scripts/build_asset_library.py
python scripts/build_site_asset_inventory.py
python scripts/build_image_pools.py
python scripts/build_responsive_images.py
python scripts/check_assets.py
python scripts/build_public_site.py
git diff --check
```

For markup or styling changes, preview representative pages at 390, 768, and
1440 CSS pixels; test keyboard focus, reading-mode exit, reduced motion,
forced colors, and 200%/400% zoom. Inspect `_site/`, not the repository root,
for release-boundary verification.

## Memory rule

Every file-changing task appends a concise project `MEMORY.md` entry and a
local entry for every touched governed subtree.
