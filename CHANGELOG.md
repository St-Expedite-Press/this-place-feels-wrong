# Changelog

This changelog is a human-readable summary of notable repo iterations.

## 1.0.7 - Full audit pass and professional refactor

**Fixes (audit-driven):**
- Self-hosted Cinzel + Cormorant Garamond (12 woff2 files in `assets/fonts/`, `fonts.css` with unicode-range splitting). Google Fonts CDN dependency removed.
- `BasePortal.astro` — new shared layout for portal pages (`index`, `donate`, `404`). Eliminated ~120 lines of duplicated `<head>` boilerplate. `Head.astro` extended with `ogTitle`, `ogDescription`, `pageTitle`, `head-extra` slot.
- Fixed critical ViewTransitions bug in `gallery-page.js` — module-scope DOM queries now inside `astro:page-load` handler.
- Stripe webhook "not configured" response changed from 500 → 200 (prevents Stripe retry flood).
- `SiteHeader.astro` — `subtitle` and `eyebrow` now conditionally rendered; empty values suppress the element.
- `donate-portal.css` — layout changed from `align-content: space-between` to `center` to close the ~350px vertical void on the donate page.
- `books.css` — `.book-row__title` now uses `var(--font-body)` weight 600 instead of Cinzel uppercase, for correct literary title rendering.
- `mission.css` — `.mission-essay` constrained to `65ch`; `.essay-phase` headings increased to 0.8rem / `var(--text-soft)`.
- `components.css` — nav pill font-size 0.72rem → 0.8rem (Cinzel below legibility floor at 11.5px).
- `books.astro` — removed duplicate intro sentence; swapped button priority (Submission → primary).
- `about.astro` — removed duplicate Osiris opening paragraph.
- `dialog.js` — open/close now toggles `aria-expanded` on trigger element.
- `lab.astro` — `aria-expanded` + `aria-controls` added to compass launch button.
- `index.astro` — `aria-label="Primary"` on mobile-index-nav.
- All font literals in `donate-portal.css` and `a11y.css` replaced with `var(--font-display)` / `var(--font-body)`.
- `wrangler.toml` — required secrets documented.
- `site.json` — donate description rewritten in press voice; `donateThanks` intro text de-duplicated; Submit added to footerLinks; "The press catalog" and "Experimental instruments" subtitles removed.
- `donate/thanks.astro` — `robots: noindex,nofollow`.
- `gallery.astro` / `gallery-page.js` — fallback text hidden after products load.
- `layout.css` — nav pills switch to `overflow-x: auto; flex-wrap: nowrap` at ≤480px.
- `branding/web-elements.md` — stale `content-shell.css` reference updated.
- `docs/state-of-play.md` — layout architecture and font delivery sections added.
- `apps/web/src/layouts/README.md` — full layout prop documentation added.

**New files:** `BasePortal.astro`, `fonts.css`, `assets/fonts/` (12 woff2), `lift-wind-cover.webp`, migration `0015_buy_url_lift_wind.sql`.

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
