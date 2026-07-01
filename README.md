# RICE Magazine

RICE is the framework-free web edition and prelaunch proof for *A Year of
RICE*: four seasonal Southern literary and documentary journals, sixteen
college towns, one finite year. The SEC map is the route, never the coverage.

The current public issue is **RICE 1: Seed / Spring / Earth**. Its three
complete pieces are visibly labeled editorial samples; planned work has no
false destination. Ordering, reservations, and submissions remain closed.

## Public routes

- `index.html` — magazine-first Seed issue and contents register
- `crowley-modernism.html`, `the-pump-house.html`,
  `crawfish-pond-with-saints.html` — stable editorial-sample routes
- `essays.html`, `fiction.html`, `poetry.html` — available and planned work
- `archive.html` — disclosed visual reconstructions with stable records
- `year.html` — public explanation of the four-volume cycle
- `shop.html` — proposed Seed object and truthful prelaunch status
- `submissions.html` — closed status and future Duosuma intake policy
- `splash.html` — optional static cover view

The old `*-template.html` URLs are `noindex` compatibility redirects.

## Visual and interaction system

`styles.css` implements a warm-stock, carbon-ink, Seed-green system.
`fonts.css` self-hosts licensed Latin WOFF2 subsets of Source Serif 4, Archivo,
and IBM Plex Mono; licenses live beside the font files.

`site.js` provides:

- search from the public work manifest;
- issue/archive filters;
- a reading mode whose exit remains available;
- updates signup through `https://stexpedite.press/api/updates`.

There is no autoplay gallery or splash video. Images are monochrome and
generated into 640/960/1440 WebP variants.

## Editorial data

`assets/articles.json` is the authored work source of truth. Every record has a
`publication_state` (`sample`, `planned`, `published`, or `withdrawn`), `season`,
`is_sample`, nullable `href`, and disclosure. Planned and withdrawn work cannot
link; available routes must have an `<h1>` matching the record title.

Image sources and internal provenance remain governed by `assets/catalog.json`,
`assets/site-assets.json`, and `docs/ASSET_SCHEMA.md`. The repository-local
asset browser is deliberately excluded from the public artifact.

## Build and validation

```powershell
python scripts/build_asset_library.py
python scripts/build_site_asset_inventory.py
python scripts/build_image_pools.py
python scripts/build_responsive_images.py
python scripts/check_assets.py
python scripts/build_public_site.py
node --check site.js
git diff --check
```

`build_public_site.py` stages `_site/` from an allowlist. It publishes only
approved pages, local fonts, referenced responsive/fallback imagery, and a
sanitized available-work manifest. It excludes masters, prompts, catalogs,
scripts, docs, the internal asset browser, retired media, and withdrawn work.

GitHub Pages deploys the `_site/` artifact through
`.github/workflows/pages.yml`. A local build does not authorize a push or
deployment.

## Local preview

```powershell
python -m http.server 4173
```

Open `http://127.0.0.1:4173/index.html`. Preview `_site/` separately after the
public build when verifying the exact deployment artifact.
