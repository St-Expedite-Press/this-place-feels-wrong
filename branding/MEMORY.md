# Branding Memory

## 2026-07-16 — Branding — Fixed stale `apps/web` references

**Changed:** Fixed `apps/web` → `apps/stex` path references left over from an earlier app rename, in `branding/AGENTS.md`, `branding/README.md`, `branding/assets/README.md`, `branding/color-chart.html`, `branding/export-manifest.json`, and `branding/tokens/brand-tokens.{json,css}` (7 files) — part of Phase 0 of a larger asset/framework standardization effort (see root `MEMORY.md`).
**Checks:** `grep -rn "apps/web" branding/` returns nothing.
**Follow-ups:** Noticed but did not fix (out of scope for a path-prefix fix): `branding/export-manifest.json` and `branding/tokens/*` also reference CSS filenames that no longer exist (`base.css`, `donate.css` vs. actual `donate-portal.css`) and omit newer files (`chat.css`, `a11y.css`) — a separate content-drift issue worth its own pass.

## 2026-06-25 — Branding — Local agent scaffold

**Changed:** Added local branding guide and memory.
**Checks:** npm run check and git diff --check passed for the scaffold.
**Follow-ups:** Log future token and design-system synchronization decisions here.
**Tooling notes:** Branding remains documentation/export guidance unless explicitly mirrored into runtime CSS.
