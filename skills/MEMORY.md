# Skills Memory

## 2026-07-16 — Skills — 8 new owner-profile skills

**Changed:** Added `submission-triage`, `release-notes-and-changelog`, `catalog-and-works-sync`, `rice-issue-planning`, `brand-voice-guard`, `cloudflare-ops-brief`, `donation-storefront-reconciliation`, and `social-copy-drafts`. All read/plan/draft skills — none authorize a mutating action beyond what `owner-worker/policy.json` already permits automatically. `cloudflare-ops-brief` deliberately references (does not duplicate) `cloudflare-release-ops` and `ops/cloudflare-stability/SKILL.md`, which already own the deeper Worker/D1 operational checks.
**Checks:** Reviewed against `skills/AGENTS.md`'s "search before creating a competing skill" rule — no other existing skill covered submission triage, changelog drafting, catalog reconciliation, RICE planning, brand voice, donation/storefront reconciliation, or social copy.
**Follow-ups:** Mirrored as `local`-source skills on the live `stexpedite` Hermes profile (`~/.hermes/profiles/stexpedite/skills/stexpedite-press/`) — re-copy from this directory after any edit, the profile copy is not auto-synced. Considered pruning irrelevant bundled skills (comfyui, touchdesigner-mcp, polymarket, petdex, etc.) but `hermes skills opt-out` is all-or-nothing and would also remove genuinely useful bundled skills (github-*, ocr-and-documents); left undone, flagged for a deliberate per-skill pass later.
**Tooling notes:** `hermes skills install` only accepts a registry identifier or an HTTP(S) URL, not a local file path — locally-authored skills are picked up automatically as `local`-source simply by existing under `<profile>/skills/<category>/<name>/SKILL.md`, confirmed via `hermes skills list --source local`.

## 2026-06-25 — Skills — Local agent scaffold

**Changed:** Added local skills guide and memory.
**Checks:** npm run check and git diff --check passed for the scaffold.
**Follow-ups:** Track future skill consolidation, forward-testing, and stale-skill cleanup here.
**Tooling notes:** Skill changes should be treated as maintained operational code.
