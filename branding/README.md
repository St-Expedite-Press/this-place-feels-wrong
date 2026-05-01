# Branding Package

Exportable brand and web-element guidance for St. Expedite Press.

This directory is documentation and design-system source material only. It does not change runtime behavior, routes, API contracts, generated output, or deployed assets.

## Contents

- `ux-assessment.md` - repo-wide visual and UX assessment with prioritized aesthetic changes.
- `brand-guidelines.md` - brand premise, palette, typography, imagery, layout, motion, and accessibility rules.
- `web-elements.md` - reusable recipes for creating more site components and branded web surfaces.
- `tokens/brand-tokens.json` - machine-readable design tokens for external tools and design handoff.
- `tokens/brand-tokens.css` - portable CSS custom properties derived from the current site tokens plus proposed role aliases.
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
- Homepage portal media loads a still WebP first and progressively hydrates animation after user intent or post-load idle time.
- The homepage now exposes one document `h1`; visible portal titles are presentation text.

## Recommended Implementation Order

1. Create visual intensity tiers: `ritual`, `editorial`, and `utility`.
2. Add readable text tiers for long-form body copy and dense forms.
3. Normalize CTA, navigation, card, and status states across pages.
4. Bring book and product imagery forward with calmer frames and clearer metadata.
5. Extract homepage portal patterns into reusable documented primitives before making large visual changes.

## Source Of Truth

- Live CSS tokens: `apps/web/public/assets/css/tokens.css`
- Shared CSS: `apps/web/public/assets/css/base.css`, `components.css`, `layout.css`
- Homepage portal: `apps/web/src/pages/index.astro`
- Shared layout components: `apps/web/src/components/`
- Site metadata and navigation: `apps/web/src/data/site.json`
- Canonical source assets: `assets/source/`

## Guardrails

- Do not hand-edit `apps/web/dist/`.
- Do not add new generated assets directly under `apps/web/public/assets/img/` or `gif/`; add source files under `assets/source/`, then run `npm run assets:sync` and `npm run assets:check`.
- Keep the homepage as the standalone portal page unless the architecture is intentionally changed.
- Preserve the press identity. Avoid generic SaaS cards, stock gradients, default purple-on-white AI styling, and ornamental effects that do not improve orientation.
