# Documentation

The single documentation hub for the St. Expedite Press four-product monorepo
and its Osiris agent framework. The root [`README.md`](../README.md) points
here; this index accounts for every document in the repository. Operational
per-directory files (`AGENTS.md`, `MEMORY.md`, `README.md`, `SKILL.md`) live
beside the code they govern — see [Conventions](#conventions).

## Framework

- [`../AGENTS.md`](../AGENTS.md) — agent doctrine (single source of truth)
- [`../ONTOLOGY.md`](../ONTOLOGY.md) — navigation map: surfaces, routes, ownership, validation
- [`../CLAUDE.md`](../CLAUDE.md) — Claude Code entrypoint (imports AGENTS.md)
- [`../MEMORY.md`](../MEMORY.md) — durable change log
- [`../PHASE-PLAN.md`](../PHASE-PLAN.md) — current phase
- [`../PROCESSES.md`](../PROCESSES.md) — working processes
- [`../STEX_SANDBATCH.md`](../STEX_SANDBATCH.md) — founder/press context

## Sites & services

- **St. Expedite (stexpedite.press)** — [`../apps/stex/README.md`](../apps/stex/README.md) · pages: [`../apps/stex/src/README.pages.md`](../apps/stex/src/README.pages.md)
- **RICE (rice.stexpedite.press)** — [`../apps/rice/README.md`](../apps/rice/README.md) · ontology: [`../apps/rice/ONTOLOGY.md`](../apps/rice/ONTOLOGY.md)
  - [`../apps/rice/docs/ASSET_SCHEMA.md`](../apps/rice/docs/ASSET_SCHEMA.md)
  - [`../apps/rice/docs/IMAGE_STYLE_GUIDE.md`](../apps/rice/docs/IMAGE_STYLE_GUIDE.md)
  - [`../apps/rice/docs/PHOTO_SLOTS.md`](../apps/rice/docs/PHOTO_SLOTS.md)
  - [`../apps/rice/docs/CITY_IMAGE_PROMPTS.md`](../apps/rice/docs/CITY_IMAGE_PROMPTS.md)
- **Standalone chat** — [`../apps/chat/`](../apps/chat/) · shared client: [`../packages/chat-client/README.md`](../packages/chat-client/README.md)
- **Backend Worker** — [`../apps/backend/README.md`](../apps/backend/README.md)
- **Shared contracts and content model** — [`../packages/contracts/README.md`](../packages/contracts/README.md) · [`../packages/content-model/README.md`](../packages/content-model/README.md)
- **Osiris agent framework** — [`../agents/README.md`](../agents/README.md) · public [`SOUL.md`](../agents/public-guide/SOUL.md) · owner [`SOUL.md`](../agents/owner-worker/SOUL.md)

## Deployment & operations

- [`../DEPLOYMENT.md`](../DEPLOYMENT.md) — deploy runbook (Cloudflare Pages + Worker)
- [`state-of-play.md`](state-of-play.md) — current build/validation/runtime state
- [`infrastructure/d1-database.md`](infrastructure/d1-database.md)
- [`infrastructure/email-worker-setup.md`](infrastructure/email-worker-setup.md)
- [`operations/incident-runbook.md`](operations/incident-runbook.md)
- [`operations/release-ops-log.md`](operations/release-ops-log.md)
- Cloudflare stability runbook: [`../ops/cloudflare-stability/references/incident-response.md`](../ops/cloudflare-stability/references/incident-response.md) · [`../ops/cloudflare-stability/references/thresholds.md`](../ops/cloudflare-stability/references/thresholds.md)

## Brand

- [`branding/brand-guidelines.md`](branding/brand-guidelines.md)
- [`branding/web-elements.md`](branding/web-elements.md)
- [`branding/ux-assessment.md`](branding/ux-assessment.md)

## Press catalog & proposals

- [`press/st-expedite-press-complete.md`](press/st-expedite-press-complete.md)
- [`press/commonsplaces-complete.md`](press/commonsplaces-complete.md)
- [`press/proposals/commit-to-blue-full-book-proposal.md`](press/proposals/commit-to-blue-full-book-proposal.md)
- [`press/proposals/grammars-and-poetrics-proposal.md`](press/proposals/grammars-and-poetrics-proposal.md)

## Project history

- [`../CHANGELOG.md`](../CHANGELOG.md)

## Conventions

Documentation that lives beside the code it governs is indexed here by rule
rather than one-by-one (the docs-coverage checker treats these as accounted
for):

- `**/AGENTS.md` — per-directory agent scope + rules
- `**/MEMORY.md` — per-directory change log
- `**/README.md` — per-directory orientation
- `**/SKILL.md` — repo skills under `skills/` and `ops/`
- `archive/**`, `audit/**`, `kits/**` — historical material, audits, and reusable scaffolding kits

Coverage is enforced by [`../scripts/check-docs-coverage.mjs`](../scripts/check-docs-coverage.mjs) (`npm run check:docs`).
