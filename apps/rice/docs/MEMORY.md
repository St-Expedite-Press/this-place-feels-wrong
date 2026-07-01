# RICE Docs Memory

## 2026-06-27 — Docs — Work taxonomy + place in ASSET_SCHEMA

**Changed:** `ASSET_SCHEMA.md` now documents the two `category` axes (image-slot vs work), the `place` field (shared, renamed from image `city` / article "parish"), and a new "Works — assets/articles.json" section (work taxonomy + per-work fields + that site.js search reads it).
**Checks:** `git diff --check` clean.
**Follow-ups:** None.
**Tooling notes:** ASSET_SCHEMA is now the human-facing home for both taxonomies and the article data model.

---

## 2026-06-27 — Docs — New image layout + randomization in schema docs

**Changed:** `ASSET_SCHEMA.md` now documents the `assets/images/<category>/` + `assets/masters/<category>/` layout and a Randomization section (archive/photo pools, `data-random`, caption-follows-image). `PHOTO_SLOTS.md` notes the new paths, marks the 4 archive grid cards as random with a no-JS fallback, and updates the add/change workflow (random slot + `build_image_pools.py`).
**Checks:** `git diff --check` clean.
**Follow-ups:** Keep tables in sync with `photo-slots.json`.
**Tooling notes:** Image names in PHOTO_SLOTS tables are basenames under `assets/images/<category>/`.

---

## 2026-06-27 — Docs — Photo-slot map doc

**Changed:** Added `PHOTO_SLOTS.md` — the slot→category table (feature 17, archive 6, system 4, article 1, photo 0), caption metadata per slot, a re-pointing log of the 7 corrected slots, and the add/change workflow.
**Checks:** `git diff --check` clean.
**Follow-ups:** Keep the table in sync with `assets/photo-slots.json` and the HTML.
**Tooling notes:** Companion to `ASSET_SCHEMA.md`; points to `photo-slots.json` as source of truth.

---

## 2026-06-27 — Docs — Asset category schema doc

**Changed:** Added `ASSET_SCHEMA.md` defining the five-slug category layer (`archive`/`article`/`feature`/`photo`/`system`), the editorial role→category and standalone asset→category mappings, and the add/recategorize workflow.
**Checks:** `git diff --check` clean.
**Follow-ups:** Keep the mapping table in sync if `ROLE_META` or the standalone `ASSETS` map changes.
**Tooling notes:** Doc points to `scripts/asset_categories.py` as the single source of truth.

---

## 2026-06-25 — Docs — Local agent scaffold

**Changed:** Added local docs guide and memory.
**Checks:** git diff --check passed for the documentation scaffold.
**Follow-ups:** Keep prompt doctrine and prompt manifests synchronized.
**Tooling notes:** Documentation work now has a local memory surface for image-doctrine and prompt changes.

---

## 2026-06-26 — Docs — Layer Pre-Raphaelite Punk into image doctrine

**Changed:** `IMAGE_STYLE_GUIDE.md` — added a "Pre-Raphaelite Punk layer" section after the opening framing, plus surgical reinforcements (Beauty-under-pressure forward link, a "Reliquary and romance" subject group in §4, a Pre-Raphaelite Punk negative addendum in §7, a "Pre-Raphaelite Punk feature" preset in §8, four rejection items in §11, one final-test item in §12).
**Checks:** `git diff --check` clean (only the repo's standing LF→CRLF notice).
**Follow-ups:** Doctrine only — no prompt records regenerated. `city-image-prompts.json` and existing masters are unchanged; apply or backfill the layer when authoring new prompts.
**Tooling notes:** Tonality decision encoded: hold the §2 monochrome photocopy base; carry splendor through form/drape/light/material; color only as a single rupture (acid `#D9FF00`, or oxide-red `#8A281F` for devotional traces).

---

## 2026-06-26 — Docs — Site-wide B&W, narrative, and AI-hygiene mandates

**Changed:** `IMAGE_STYLE_GUIDE.md` — §1 gained a "Clear narrative" principle; §2 gained a "Photographic register" subsection (site-wide black-and-white hand-camera "hipster"/35mm documentary, no exceptions for splash/shop/about) and an absolute no-color-photography tonality rule (color only as a registration mark); new "Generation hygiene — AI symptoms and artifact bloat" section before §11 with a full reject/regenerate checklist; §11 gained matching AI-artifact, synthetic-surface, and one-sentence-narrative items.
**Checks:** `git diff --check` clean.
**Follow-ups:** Interpreted "hipster photography" as B&W film-grain hand-camera documentary, explicitly fenced off from commercial lifestyle/fashion; confirm if a different register was meant.
**Tooling notes:** B&W is now an absolute site-wide mandate, not "primarily"; every published image must carry a one-sentence narrative and pass a 100%-zoom artifact inspection.

---

## 2026-06-30 — Docs — Seed visual and public-integrity doctrine

**Changed:** Replaced acid-yellow screen direction with Seed registration green; updated paper colors and monochrome interaction rules; renamed the place-field-notes collection; replaced random-slot documentation with the 12-slot deterministic public map; documented publication states, responsive outputs, stable reconstruction IDs, and the private/public asset boundary.
**Checks:** Prompt/catalog rebuild, asset validation, public build, and `git diff --check` passed.
**Follow-ups:** Older screenshots remain historical; new Seed desktop/mobile/year/reading screenshots document the current implementation.
**Tooling notes:** Archive disclosure language is now validator-enforced, not merely advisory.
