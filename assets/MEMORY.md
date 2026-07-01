# RICE Assets Memory

## 2026-06-27 — Assets — articles.json data model + place rename

**Changed:** New `articles.json` (8 works: id, title, category[work type], place, author, date, description, keywords, ref, href, hero) — hand-authored source of truth, validated by check_assets. Renamed image `city`/`city_slug` → `place`/`place_slug` in `catalog.json`; added `place` to the archive-ledger entry in `site-assets.json`. `README.md` updated.
**Checks:** `python ../scripts/check_assets.py` PASS (8 articles; href/hero resolve).
**Follow-ups:** photo work category empty; some `date`/`hero` null.
**Tooling notes:** `place` is shared across images and articles; article `category` (work type) is a separate axis from image `category` (slot).

---

## 2026-06-27 — Assets — Category-organized image tree + pools

**Changed:** Images now live under `assets/`: served renditions in `images/<category>/` (one web file each), masters in `masters/<category>/` (+ `_incoming/`). New `image-pools.json` (generated) lists archive/photo pool images for runtime random slots. `catalog.json` files block is now `{web, master}` (no thumb) and each asset carries `caption`/`tags`; `site-assets.json` repathed with caption/tags on the archive entry. `README.md` updated for the new layout/workflow. Relocated `images/AGENTS.md` + `MEMORY.md` to `assets/images/`.
**Checks:** `python ../scripts/check_assets.py` PASS; no orphan served files; pools archive=11.
**Follow-ups:** photo pool empty (reserved).
**Tooling notes:** Served files are generated/declared — never hand-add to `assets/images/`; the checker rejects orphans.

---

## 2026-06-27 — Assets — photo-slots.json slot inventory

**Changed:** Added `photo-slots.json` — 28 rendered image/media slots with page, location, slot_type, category, image, link, structured caption (title/byline/series), and alt. Hand-maintained source of truth for the slot→category map.
**Checks:** `python ../scripts/check_assets.py` PASS (28 slots); every slot's image category equals its assigned category.
**Follow-ups:** Mirror any HTML slot change here; add `photo` slots when submissions arrive.
**Tooling notes:** Unlike the two image inventories, this file is authored, not generated; the validator cross-checks it against `catalog.json`/`site-assets.json`.

---

## 2026-06-27 — Assets — Category field added to both inventories

**Changed:** `catalog.json` and `site-assets.json` now carry a per-asset `category` (`archive`/`article`/`feature`/`photo`/`system`) and a top-level `categories` block. `README.md` documents the scheme. Distribution: editorial 15 article / 10 archive; site 6 feature / 5 system / 1 archive.
**Checks:** `python ../scripts/check_assets.py` PASS; regeneration showed no checksum/measurement drift.
**Follow-ups:** No `photo` assets yet.
**Tooling notes:** Categories are generated from `scripts/asset_categories.py`; do not hand-edit the `category` field in these JSON files.

---

## 2026-06-25 — Assets — Local agent scaffold

**Changed:** Added local asset guide and memory.
**Checks:** git diff --check passed for the documentation scaffold.
**Follow-ups:** Keep entries focused on inventory, provenance, and generator behavior.
**Tooling notes:** Asset work should continue to flow through the Python scripts rather than manual generated-field edits.

---

## 2026-06-30 — Assets — Publication states and responsive public media

**Changed:** `articles.json` schema v2 adds publication state, season, sample flag, nullable routes, and disclosures; only complete samples link. Replaced the slot map with 12 deterministic public slots and stable reconstruction records. Added 99 generated monochrome WebP variants plus manifest and local font assets/licenses. Marked the synthetic ledger withdrawn/internal.
**Checks:** Full asset build and `check_assets.py` pass; public artifact copies only referenced fallbacks/responsive assets and sanitized available-work JSON.
**Follow-ups:** Internal image pools remain generated but are no longer consumed at runtime.
**Tooling notes:** Destination-title and visible-reconstruction checks now enforce editorial integrity at build time.
