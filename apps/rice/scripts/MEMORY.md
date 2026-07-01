# RICE Scripts Memory

## 2026-06-27 — Scripts — Work taxonomy + place rename + article validation

**Changed:** `asset_categories.py` gained `ARTICLE_CATEGORIES` + `validate_article_category` + `article_category_block` (work taxonomy, distinct from image `CATEGORIES`). `build_asset_library.py` emits `place`/`place_slug` (was `city`/`city_slug`); `build_site_asset_inventory.py` emits optional `place`. `check_assets.py` prompt cross-ref uses `place_slug` and gained `check_articles()` (validates `assets/articles.json`: ids, work category, required fields, href/hero resolution); summary now reports article count.
**Checks:** `python -m py_compile scripts/*.py` OK; full build + `check_assets.py` PASS (8 articles).
**Follow-ups:** None.
**Tooling notes:** `build_asset_library.py` still reads the prompt manifest's `city`/`slug` input keys (local vars); only the emitted catalog fields were renamed to `place`.

---

## 2026-06-27 — Scripts — New layout pipeline + image-pools generator

**Changed:** `build_asset_library.py` reads masters from `assets/masters/<category>/` and writes one web rendition to `assets/images/<category>/` (no thumb); catalog `files` = `{web, master}`, each asset gains `caption`/`tags`; catalog `schema_version` 2. `build_site_asset_inventory.py` ASSETS is now dict-valued, repathed, and reconciles `assets/images/**` minus editorial. New `build_image_pools.py` → `assets/image-pools.json` (archive/photo, each entry src/alt/caption/tags/focal_point). `check_assets.py`: served-file reconciliation (orphan detection), pool consistency, and random-slot/pool checks; dropped thumb checks.
**Checks:** `python -m py_compile scripts/*.py` OK; full build + `check_assets.py` PASS.
**Follow-ups:** None.
**Tooling notes:** Run order is build_asset_library → build_site_asset_inventory → build_image_pools → check_assets (pools depend on both inventories).

---

## 2026-06-27 — Scripts — Photo-slot validation in check_assets.py

**Changed:** `check_assets.py` gained `image_category_index()` and `check_photo_slots()`. Loads `assets/photo-slots.json` (skips gracefully if absent), validates unique slot IDs, image/poster existence, valid category, and that each slot's image category equals its assigned category. Summary line now reports slot count.
**Checks:** `python -m py_compile` OK; `check_assets.py` PASS (28 slots).
**Follow-ups:** None.
**Tooling notes:** The category index maps every editorial tier path (master/web/thumb) + site path → category, so slots may reference any tier.

---

## 2026-06-27 — Scripts — Shared asset-category module + media filter

**Changed:** New `asset_categories.py` (canonical `CATEGORIES`, `category_block()`, `validate_category()`, `MEDIA_SUFFIXES`/`is_media()`). `build_asset_library.py` adds a `category` per `ROLE_META` role and emits it + a `categories` block. `build_site_asset_inventory.py` ASSETS map is now `(category, role, used_by)`. `check_assets.py` validates every asset's category. Builders/checker now filter `images/` by media extension so companion `.md` files are ignored.
**Checks:** `python -m py_compile` on all four scripts OK; full rebuild + `check_assets.py` PASS.
**Follow-ups:** None.
**Tooling notes:** Scripts run as `python scripts/x.py`, so the script dir is on `sys.path` and `import asset_categories` resolves. Add new categories only in `asset_categories.py`.

---

## 2026-06-25 — Scripts — Local agent scaffold

**Changed:** Added local scripts guide and memory.
**Checks:** git diff --check passed for the documentation scaffold.
**Follow-ups:** Note future generator contract changes here and mirror them in `../ONTOLOGY.md`.
**Tooling notes:** Script work now has a local place to record validation and generator lessons.

---

## 2026-06-30 — Scripts — Responsive media and public artifact boundary

**Changed:** Added `build_responsive_images.py` for monochrome 640/960/1440 WebP outputs and `build_public_site.py` for allowlisted `_site/` packaging. Extended `check_assets.py` with publication-state, destination-title, archive-disclosure, and responsive-manifest validation.
**Checks:** All scripts compile; full builders, `check_assets.py`, and public staging pass.
**Follow-ups:** None.
**Tooling notes:** The public builder validates local links and rejects internal catalog/master/browser leakage.
