# Changelog

This changelog is a human-readable summary of notable repo iterations.

## 1.0.6 - Agent workflow and docs assay
- Added root `AGENTS.md` as the canonical agent instruction file and replaced `CLAUDE.md` with a compact Claude import shim.
- Added repo-scoped Codex skills under `.agents/skills/` for docs assay, static-site QA, Cloudflare release ops, and Worker contract review.
- Reconciled docs, command aliases, OpenAPI route coverage, ontology, and internal agent references with the current Astro/Worker layout.
- Added npm aliases for asset checks, SEO checks, runtime checks, smoke checks, and release orchestration.

## 1.0.5 - Deep structure + docs refresh
- Moved deployable site files under `site/` without changing public URLs (GitHub Pages publishes `site/` as the artifact).
- Refreshed docs to match current architecture (GitHub Pages + Cloudflare Worker + optional D1 updates list).
- Updated `.gitignore` to cover Wrangler local artifacts and local D1/SQLite files.

## 1.0.4 - Updates capture endpoint
- Added `POST /api/updates` to store update signups into D1 (optional; requires `DB` binding).
- Wired best-effort capture from `site/index.html` and the Updates section in `site/contact.html`.

## 1.0.3 - Performance + shared shell
- Refactored portal + interior pages to use shared CSS (`site/assets/css/base.css`, `site/assets/css/effects.css`, `site/assets/css/a11y.css`, `site/assets/css/content-shell.css`).
- Consolidated pointer effects into shared JS (`site/assets/js/cursor-glow.js`, `site/assets/js/index-effects.js`).
- Optimized portal media (animated WebP preferred, smaller GIF fallback, static reduced-motion image).

## 1.0.2 - Ontology visualization (historical)
- Added local venv setup and installed graphviz (0.21) for ontology rendering.
- Generated `ontology/stxp.png` from `stxp.dot`.

## 1.0.1 - Docs and naming pass (historical)
- Added an `under-construction.html` stub and pointed portal links to it with a return-to-portal CTA.
- Added file-naming conventions guide for agents and referenced it in docs.

## 1.0.0 - Neon portal baseline (historical)
- Established the neon portal surface and documented the live page.
- Consolidated CSS/JS into a consistent palette, motion, and theme system.
