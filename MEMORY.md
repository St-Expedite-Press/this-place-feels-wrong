# RICE Magazine Memory

Append durable project-level notes here. Keep entries short; do not log secrets, generated noise, or full transcripts.

Entry format:

```markdown
## YYYY-MM-DD — Scope — Short title

**Changed:** Files or surfaces changed.
**Checks:** Validation run and outcome.
**Follow-ups:** Open items, if any.
**Tooling notes:** Skills, scripts, ontology, or guide improvements discovered.
```

---

## 2026-06-27 — Project — Article data model + place rename + work taxonomy

**Changed:** Started systematizing a work data model. New `assets/articles.json` (8 works: id, title, `category` [work type], place, author, date, description, keywords, ref, href, hero) is now the source of truth for editorial works; `site.js` builds its search index from it at runtime (replaced the hardcoded `RICE_INDEX`; baseline = About/Submissions, fallback-safe). Added a second taxonomy `ARTICLE_CATEGORIES` (article/fiction/poetry/photo/archive) to `asset_categories.py` alongside image `CATEGORIES`. Renamed the image geographic field `city`/`city_slug` → `place`/`place_slug` (catalog + build + asset-library filter "City→Place" + check prompt cross-ref); added `place` to the archive-ledger standalone. Renamed visible "parish" labels → "place" (archive.html aside, archive-template dl, search placeholder). `check_assets.py` gained `check_articles()` (ids, category, required fields, href/hero resolve). Updated ASSET_SCHEMA (Works section + two-axis + place note), ONTOLOGY, README.md, assets/README, both AGENTS.
**Checks:** `check_assets.py` PASS (25 editorial, 12 site, 28 slots, 8 articles, pools archive=11); `node --check` both JS OK; node search-index map returns 8 works; no stale `city_slug`/`RICE_INDEX` refs (remaining `city_slug` is the prompt-manifest input variable only).
**Follow-ups:** `photo` work category reserved (no works). Article `date`/`hero` are null for several works; place values for non-parish works ("Delta interior", "Gulf interior") are editorial judgment — refine as desired. Section/template pages still carry their own metadata in HTML; could later render from articles.json.
**Tooling notes:** Two `category` axes (image-slot vs work) intentionally coexist — different concepts, same word, documented in ASSET_SCHEMA. `place` is the shared geographic field across images and articles.

---

## 2026-06-27 — Project — Images relocated to assets/images/<category>/ + random archive slots

**Changed:** Major asset restructure. Moved all images under `assets/` organized only by category: served web renditions in `assets/images/<category>/` (one rendition each, thumb tier dropped), masters in `assets/masters/<category>/` (`_incoming/` holds the unpromoted field-notes-batch). Old `images/` tree deleted. Rewrote `build_asset_library.py` (reads masters/<cat>, writes images/<cat>, files={web,master}, emits per-asset caption/tags) and `build_site_asset_inventory.py` (repathed, scans assets/images minus editorial); new `build_image_pools.py` emits `assets/image-pools.json` for randomizable categories. `check_assets.py` now reconciles all served files (no orphans), validates pools, and validates random slots. Repathed ~46 refs across HTML/CSS + JSON. `site.js` gained `randomizeImageSlots()`: the 4 archive grid cards (`data-random="archive"`) draw random pool images per load, caption follows image; static fallback for no-JS. asset-library uses web (not thumb). Updated ONTOLOGY, both AGENTS.md, assets/README, ASSET_SCHEMA, PHOTO_SLOTS, relocated images AGENTS.
**Checks:** `check_assets.py` PASS (25 editorial, 12 site, 28 slots, pools archive=11/photo=0); `node --check` both JS OK; local http.server returns 200 for archive.html + image-pools.json + sample images; node draw test returns 4 distinct entries; link audit found 0 broken refs.
**Follow-ups:** `photo` pool empty until submissions arrive (then they auto-randomize). Random archive cards still link to the single `archive-template.html`. `assets/masters/` is unreferenced but served by Pages.
**Tooling notes:** Only `archive` (+ future `photo`) randomize; article/feature/system fixed. `git mv` preserved history for all moved binaries.

---

## 2026-06-27 — Project — Photo-slot map + category-correct re-pointing

**Changed:** New `assets/photo-slots.json` (28 slots: page, location, slot_type, category, image, link, structured caption, alt) and `docs/PHOTO_SLOTS.md` table. `check_assets.py` gained `check_photo_slots()` enforcing unique IDs, image/poster existence, and slot category == image's inventory category. Re-pointed 7 wrong-category slot images across `essays/poetry/fiction/archive.html` (system/archive images out of feature strips; system/feature images out of archive cards → editorial archive images). `ONTOLOGY.md` updated.
**Checks:** `check_assets.py` PASS (25 editorial, 12 site, 28 slots); builders reproduce clean; `node --check` OK; `git diff --check` clean.
**Follow-ups:** `photo` category has 0 slots (awaiting submissions). `article` has 1 slot (fiction full-bleed); essay insert is intentionally `archive` (archive-anywhere). Slot map is hand-maintained — keep it in sync with HTML edits.
**Tooling notes:** Slot distribution: feature 17, archive 6, system 4, article 1, photo 0. Feature strips are `feature` slots (purpose-built feature-* covers); reading-page figures take their category from the image they draw.

---

## 2026-06-27 — Project — Asset category schema (archive/article/feature/photo/system)

**Changed:** Added a coarse `category` routing layer above the role/family taxonomy across both inventories. New `scripts/asset_categories.py` is the single source of truth (5 slugs + media-suffix filter); `build_asset_library.py`, `build_site_asset_inventory.py`, and `check_assets.py` import it. Each asset now emits `category`, each inventory emits a `categories` block. Asset browser (`asset-library.html`/`.js`) gained a Category filter and detail field. New `docs/ASSET_SCHEMA.md`; updated `ONTOLOGY.md` and `assets/README.md`. Fixed a latent inventory bug: builders/checker now ignore non-media companion files (`AGENTS.md`, `MEMORY.md`) in `images/`.
**Checks:** `python scripts/build_asset_library.py` + `build_site_asset_inventory.py` regenerated cleanly (only `category`/date drift, no checksum churn); `check_assets.py` PASS (25 editorial, 12 site); `node --check asset-library.js site.js` OK; `git diff --check` clean.
**Follow-ups:** `photo` category is defined but unused until photo submissions land. Decide categories for the untracked `images/editorial/field-notes-batch/` set if it is promoted to masters.
**Tooling notes:** Categories change in one place (`CATEGORIES` in `asset_categories.py`); never hand-add `category` to JSON. Street field notes (SFN) mapped to `archive` as a reusable pool, not `feature`.

---

## 2026-06-25 — Project — Agent ontology and memory scaffold

**Changed:** Added project `ONTOLOGY.md` and `MEMORY.md`; updated agent guidance to require ontology-first navigation, memory logging, and tooling/skills assessment.
**Checks:** `git diff --check` passed for the documentation scaffold.
**Follow-ups:** Keep local directory memories concise and archive stale details during periodic curation.
**Tooling notes:** RICE now has the same agent-file trio as the press project without adding runtime dependencies.

---

## 2026-06-26 — Docs — Pre-Raphaelite Punk layered into image doctrine

**Changed:** `docs/IMAGE_STYLE_GUIDE.md` gained a "Pre-Raphaelite Punk layer" plus reinforcements across §1, §4, §7, §8, §11, §12. No prompt records or masters changed.
**Checks:** `git diff --check` clean.
**Follow-ups:** Layer is doctrine only; backfill into `docs/city-image-prompts.json` when authoring new prompts.
**Tooling notes:** Decision held the §2 B&W photocopy base; splendor carried by form/light/material, color only as a single rupture (`#D9FF00`, or oxide-red `#8A281F` for devotional traces).

---

## 2026-06-27 — Images — Field-notes-batch generated (10 images)

**Changed:** Added untracked `images/editorial/field-notes-batch/` (10 images + `index.json` + `README.md` + `_color-originals/`). Exploratory, not in the catalog/pipeline. See `images/MEMORY.md` for detail.
**Checks:** Aspect ratios and grayscale verified; two color portraits corrected to the §2 photocopy treatment.
**Follow-ups:** Approve before promoting to masters; decide on committing. Renew the HF token if true FLUX.2 klein is wanted later.
**Tooling notes:** FLUX.2 klein unreachable (OpenRouter has no FLUX; `HUGGINGFACE_WRITE` expired). Generated on `google/gemini-3.1-flash-image` via OpenRouter.

---

## 2026-06-26 — Docs — Site-wide B&W, narrative, and AI-hygiene mandates

**Changed:** `docs/IMAGE_STYLE_GUIDE.md` — added a "Clear narrative" principle (§1), a site-wide "Photographic register" + absolute no-color-photography rule (§2), a "Generation hygiene — AI symptoms and artifact bloat" section, and matching §11 rejection items.
**Checks:** `git diff --check` clean.
**Follow-ups:** "Hipster photography" interpreted as B&W film-grain hand-camera documentary, fenced from lifestyle/fashion; confirm if another register was meant.
**Tooling notes:** B&W is now absolute and site-wide; every image needs a one-sentence narrative and a 100%-zoom artifact pass.

---

## 2026-06-30 — Site — Seed redesign and integrity repair

**Changed:** Reframed the site as `RICE 1 / Seed / Editorial Sample`; added `year.html`; created stable sample-work and reconstruction routes; made planned work non-linking; withdrew the synthetic ledger; closed ordering/submissions truthfully; integrated updates with the press Worker; replaced acid yellow/full-color/autoplay treatment with the warm-paper, carbon, Seed-green system and self-hosted fonts. Added responsive WebP generation, route/disclosure validation, sanitized `_site/` staging, and a Pages Actions workflow that excludes internal editorial material.
**Checks:** Full asset pipeline and public build pass (25 editorial, 12 site, 12 slots, 9 works, 99 responsive variants, 66 public files); JS/Python syntax and `git diff --check` pass; initial transfer measured 448 KB home / 346 KB splash / 370 KB reading; local Edge QA passed desktop/mobile reflow, search, filters, reading-mode exit/focus, reconstruction routes, closed submissions, no-JS privacy, 200% text zoom, and mocked signup success/duplicate/429/500/offline states.
**Follow-ups:** No push or deployment performed. Duosuma, reservations, and payments remain intentionally inactive.
**Tooling notes:** In-app browser bootstrap was blocked by missing host sandbox metadata; local headless Edge with a temporary Playwright-core install supplied visual and interaction evidence. Public-release checks should always target `_site/`.
