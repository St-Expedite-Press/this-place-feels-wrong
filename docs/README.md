# Documentation

The documentation hub for the St. Expedite Press monorepo. The root [`README.md`](../README.md) points here; this index accounts for every non-conventional document in the repository. Operational per-directory files (`AGENTS.md`, `MEMORY.md`, `README.md`, `SKILL.md`) live beside the code they govern — see [Conventions](#conventions).

## Framework

- [`../AGENTS.md`](../AGENTS.md) — agent doctrine
- [`../ONTOLOGY.md`](../ONTOLOGY.md) — current navigation/ownership map; scheduled for terminology cleanup only after functional migrations stabilize
- [`../CLAUDE.md`](../CLAUDE.md) — Claude Code entrypoint
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
- **Standalone chat** — [`../apps/chat/README.md`](../apps/chat/README.md) · shared client: [`../packages/chat-client/README.md`](../packages/chat-client/README.md)
- **Backend Worker** — [`../apps/backend/README.md`](../apps/backend/README.md) · canonical legacy-compatible API: [`../apps/backend/openapi.yaml`](../apps/backend/openapi.yaml) · temporary profile-native migration contract: [`../apps/backend/openapi-profile-native.yaml`](../apps/backend/openapi-profile-native.yaml)
- **Shared contracts and content model** — [`../packages/contracts/README.md`](../packages/contracts/README.md) · [`../packages/content-model/README.md`](../packages/content-model/README.md)
- **Agent/runtime configuration** — [`../agents/README.md`](../agents/README.md) · public assistant [`SOUL.md`](../agents/public-guide/SOUL.md) · owner [`SOUL.md`](../agents/owner-worker/SOUL.md) · visitor-profile baseline [`../agents/user-profile/BASE.md`](../agents/user-profile/BASE.md)

## Hermes runtime

- [`../ops/hermes/README.md`](../ops/hermes/README.md) — public and visitor Hermes profile runbook
- [`../agents/user-profile/BASE.md`](../agents/user-profile/BASE.md) — immutable baseline instructions applied before user-authored assistant instructions
- `../ops/hermes/profile-service.py` — loopback-only profile provisioning/chat service (code, not a documentation file)
- `../ops/hermes/setup-profile-service.sh` — profile-service setup (code, not a documentation file)

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

## Design & proposals

- [`design/visitor-presets-and-portable-graph.md`](design/visitor-presets-and-portable-graph.md) — historical design for Worker-executed visitor presets; compatibility code remains during the Hermes-profile migration, but do not extend this design
- [`design/kb-chat-sessions-graphrag.md`](design/kb-chat-sessions-graphrag.md) — earlier proposal for KB chat/session retrieval; verify against current Hermes/profile architecture before implementing

## Project history

- [`../CHANGELOG.md`](../CHANGELOG.md)

## Conventions

Documentation that lives beside the code it governs is indexed here by rule rather than one-by-one:

- `**/AGENTS.md` — per-directory agent scope + rules
- `**/MEMORY.md` — per-directory change log
- `**/README.md` — per-directory orientation
- `**/SKILL.md` — repo skills under `skills/` and `ops/`
- `archive/**`, `audit/**`, `kits/**` — historical material, audits, and reusable scaffolding kits

Coverage is enforced by [`../scripts/check-docs-coverage.mjs`](../scripts/check-docs-coverage.mjs) (`npm run check:docs`).
