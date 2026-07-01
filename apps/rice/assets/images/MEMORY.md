# RICE Served Images Memory

## 2026-06-27 — Images — Relocated to assets/images/<category>/

**Changed:** This directory moved from `rice_site/images/` to `rice_site/assets/images/` and is now organized only by category (`archive`/`article`/`feature`/`photo`/`system`), holding one served web rendition per image. Masters now live in `../masters/<category>/`; the old `field-notes-batch/` candidates moved to `../masters/_incoming/`. The thumb tier was dropped. `AGENTS.md` rewritten for the new role.
**Checks:** `../../scripts/check_assets.py` PASS; no orphan served files.
**Follow-ups:** Earlier entries below reference the old `images/...` paths; kept for history.
**Tooling notes:** Do not hand-add files here — editorial renditions are generated, standalone files declared in `build_site_asset_inventory.py`.

---

## 2026-06-25 — Images — Local agent scaffold

**Changed:** Added local image guide and memory.
**Checks:** git diff --check passed for the documentation scaffold.
**Follow-ups:** Record future image provenance and derivative-generation changes here.
**Tooling notes:** Image edits should remain generator-driven with catalog updates handled by scripts.

---

## 2026-06-27 — Images — Field-notes-batch generated (10 images)

**Changed:** Added untracked `images/editorial/field-notes-batch/` — ten editorial images from the anti-sheen camerawork prompts, plus `index.json`, `README.md`, and `_color-originals/`. Not wired into `assets/catalog.json` or the build pipeline.
**Checks:** All ten verified at correct aspect ratios (16:9 / 4:3 / 3:4) and grayscale (color-spread ~0). Portraits 04 and 10 returned in color and were corrected to the §2 photocopy treatment; color originals kept.
**Follow-ups:** Promote to canonical masters only if approved (then through `scripts/build_asset_library.py`). Decide whether to commit or keep local.
**Tooling notes:** Requested FLUX.2-klein-9B unavailable — OpenRouter hosts no FLUX, and the `HUGGINGFACE_WRITE` token (only route to klein, via Replicate) is expired (HF whoami 401). Fell back to `google/gemini-3.1-flash-image` via OpenRouter. Generator: scratchpad `gen_openrouter.py` (key read in-process, never logged). Gemini resists B&W on faces — enforce grayscale post-step for portraits.

---

## 2026-06-30 — Images — Responsive Seed derivatives

**Changed:** Added generator-owned monochrome 640/960/1440 WebP variants under `assets/responsive/`; fallback image files remain in this directory. The retired ledger and video are excluded from the staged public site even though their internal source records remain.
**Checks:** Responsive manifest/checksum validation passed for 99 variants; `_site/` boundary contains only referenced public image files.
**Follow-ups:** None.
**Tooling notes:** Public pages should prefer `<picture>`/`srcset` and retain an inventoried fallback.
