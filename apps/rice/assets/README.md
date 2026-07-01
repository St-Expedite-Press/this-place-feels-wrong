# RICE Asset Management

RICE separates internal editorial custody from the public Pages artifact.

## Inventories and outputs

- `catalog.json` — generated internal editorial provenance, prompts, masters,
  fallback renditions, rights, and disclosures.
- `site-assets.json` — generated inventory of standalone fallback media.
- `articles.json` — authored work records with publication state and routes.
- `photo-slots.json` — authored public image-slot map.
- `image-pools.json` — generated internal selection pools; no public runtime
  randomization.
- `responsive.json` and `responsive/` — generated monochrome 640/960/1440
  WebP variants.

Fallback images live in `images/<category>/`; canonical editorial originals
live in `masters/<category>/`. Neither masters nor internal catalogs are copied
to `_site/`.

## Work states

Every work uses one state:

- `sample` — complete and readable, visibly labeled, with a stable route;
- `planned` — proposal only, `href: null`;
- `published` — formally released with a stable route;
- `withdrawn` — retained for audit history, `href: null`.

`check_assets.py` confirms that available work titles match destination `<h1>`
text, planned/withdrawn work cannot link, heroes resolve, and archive
reconstructions have visible disclosure.

## Image rules

The image categories remain `archive`, `article`, `feature`, `photo`, and
`system`, defined in `scripts/asset_categories.py`. `place` is the shared
geographic field.

Generated archival material must use a stable `RICE-VR-*` identifier and the
visible language “RICE visual reconstruction” and “not an authenticated…”.
Synthetic record text never carries a factual claim.

## Workflow

```powershell
python scripts/build_asset_library.py
python scripts/build_site_asset_inventory.py
python scripts/build_image_pools.py
python scripts/build_responsive_images.py
python scripts/check_assets.py
python scripts/build_public_site.py
```

The repository-local `asset-library.html` may expose masters and prompts for
editorial work. `build_public_site.py` excludes it and every master from the
deployment artifact.
