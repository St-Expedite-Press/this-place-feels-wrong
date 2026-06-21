# Branding Package

Exportable brand and web-element guidance for St. Expedite Press.

This directory is documentation and design-system source material only. It does not change runtime behavior, routes, API contracts, generated output, or deployed assets.

## Contents

- `ux-assessment.md` - repo-wide visual and UX assessment with prioritized aesthetic changes.
- `brand-guidelines.md` - brand premise, palette, typography, imagery, layout, motion, and accessibility rules.
- `web-elements.md` - reusable recipes for creating more site components and branded web surfaces.
- `tokens/brand-tokens.json` - machine-readable design tokens for external tools and design handoff.
- `tokens/brand-tokens.css` - two-vocabulary token file: `--brand-*` names for design tools and mockups, with implementation aliases (`--bg`, `--panel`, `--mode-*`, etc.) declared as `var(--brand-*)` references so both name sets work when this file is loaded alone. Source of truth for all values; `tokens.css` in the live site should mirror these.
- `assets/README.md` - asset handoff notes and source paths for exported image/gif material.
- `export-manifest.json` - package manifest for handoff or zipping.

## Current Brand Position

The live site has a strong, memorable visual system: black void field, electric green signal, magenta relief, crow/portal imagery, and literary serif typography. The aesthetic is distinct and should be preserved.

The main UX opportunity is not to make the site more generic. It is to control intensity. High-ritual visual effects should stay concentrated in moments that benefit from spectacle, while reading, commerce, donation, and form flows should become calmer, clearer, and easier to scan.

## Live Implementation Status

The first implementation pass is active in the app:

- Astro routes assign `data-brand-mode` as `ritual`, `editorial`, or `utility`.
- Shared CSS consumes mode variables from `apps/web/public/assets/css/tokens.css`.
- Forms, donation, catalog, store, and service CTAs have calmer utility/editorial treatments.
- Homepage portal media uses a generated motion-ready SVG for a short ritual reveal, quiet breathing, and rare registration faults, with WebP/PNG fallbacks and a static reduced-motion state.
- The homepage now exposes one document `h1`; visible portal titles are presentation text.

## Implementation Status

- ✅ Visual intensity tiers — `ritual`, `editorial`, `utility` modes implemented via `data-brand-mode` + `tokens.css`
- ✅ Readable text tiers — `--text-readable` / `--text-readable-muted` in use on all editorial/utility pages
- ✅ CTA, nav pill, card, and form states normalized across all pages
- ✅ Fonts self-hosted (Cinzel + Cormorant Garamond, 12 woff2 files, no Google Fonts CDN)
- ✅ BasePortal.astro — shared layout for portal-only pages (index, 404)
- ✅ Base.astro — shared layout for all interior and task pages, including donate
- ⬜ Book and product imagery — Lift Wind cover pending; store has one product
- ⬜ Scroll-reveal animations on interior page cards (IntersectionObserver, prefers-reduced-motion gated)

## Source Of Truth

- Live CSS tokens: `apps/web/public/assets/css/tokens.css`
- Shared CSS: `apps/web/public/assets/css/interior-base.css`, `components.css`, `layout.css`
- Homepage portal: `apps/web/src/pages/index.astro` (uses `BasePortal.astro` layout)
- Shared layout components: `apps/web/src/layouts/` (Base.astro, BasePortal.astro), `apps/web/src/components/`
- Site metadata and navigation: `apps/web/src/data/site.json`
- Canonical source assets: `assets/source/`

## Guardrails

- Do not hand-edit `apps/web/dist/`.
- Do not add new generated assets directly under `apps/web/public/assets/img/` or `gif/`; add source files under `assets/source/`, then run `npm run assets:sync` and `npm run assets:check`.
- Keep the homepage as the standalone portal page unless the architecture is intentionally changed.
- Preserve the press identity. Avoid generic SaaS cards, stock gradients, default purple-on-white AI styling, and ornamental effects that do not improve orientation.
