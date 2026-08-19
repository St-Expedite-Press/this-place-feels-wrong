# St. Expedite Press — project map

The repository navigation and ownership map. Read after `AGENTS.md` before making cross-cutting changes. This file retains its historical filename (`ONTOLOGY.md`) during the functional migration; do not create new terminology around it. It is an architecture/navigation document.

## Summary

| Field | Value |
|---|---|
| Live sites | `https://stexpedite.press` · `https://rice.stexpedite.press` · `https://chat.stexpedite.press` · `https://admin.stexpedite.press` |
| Stack | Astro · static+Python (RICE) · Cloudflare Pages · Worker · D1 · Turnstile · isolated Hermes profiles |
| Repository | `St-Expedite-Press/this-place-feels-wrong` |
| Agent instructions | `AGENTS.md` · `CLAUDE.md` |
| Change/history docs | `MEMORY.md` · `PHASE-PLAN.md` |
| Documentation hub | `docs/README.md` (`npm run check:docs`) |

## Maintained applications and runtime

| Component | Source of truth | Purpose |
|---|---|---|
| St. Expedite site | `apps/stex/` | public Press site |
| RICE | `apps/rice/` | publication site and archive |
| Standalone chat | `apps/chat/` | public/default assistant, visitor login, private assistants, submission/update UI |
| Admin | `apps/admin/` | owner-only operational views and remaining legacy preset/model/graph controls |
| Backend Worker | `apps/backend/` | public API, auth, authorization, rate limits, D1 persistence, profile routing |
| Shared chat transport | `packages/chat-client/` | browser request/SSE protocol shared by chat surfaces |
| Shared contracts/content | `packages/contracts/`, `packages/content-model/` | reusable application contracts |
| Hermes profile configuration | `agents/`, `ops/hermes/` | public and visitor assistant runtime instructions/provisioning |
| Canonical media | `assets/source/` | source media copied into app outputs |
| Branding | `branding/`, `docs/branding/` | tokens, exports, prose guidance |
| Tooling | `scripts/`, `ops/`, `skills/`, `kits/` | build, validation, operations, reusable tooling |

RICE remains self-contained under `apps/rice/`; its archived standalone repository is historical only. RICE search reads `GET /api/works?program=rice` first and falls back to its generated article manifest. Newsletter signup uses `/api/updates`.

## Standalone chat migration

The target model for `chat.stexpedite.press` is:

```text
browser
  |
  v
Cloudflare Worker
  |  authentication / profile ownership / Turnstile / rate limits
  |  temporary D1 transcript persistence / verified public context
  v
private Hermes profile service
  |
  +--> stexpedite-public       (default public assistant)
  |
  +--> user-* profile          (private visitor assistant)
```

Rules:

- An assistant in the standalone UI corresponds to a real Hermes profile.
- Anonymous visitors use `stexpedite-public` automatically.
- The default profile is a general-purpose assistant and may receive verified public St. Expedite/RICE context when relevant.
- Authenticated visitors may select only public profiles or private profiles they own.
- Changing assistants starts a new conversation.
- D1 owns application identity/authorization and temporary transcript storage; Hermes owns assistant instructions/model execution.
- Browser clients never receive raw Hermes profile names, Hermes API keys, provider keys, filesystem paths, or privileged tool configuration.
- Visitor profile text cannot grant tools. Host-side provisioning reapplies the server-owned API-server tool policy.
- Manuscript submission remains outside chat/Hermes.

The first implementation uses one loopback Hermes gateway per visitor profile, managed by `ops/hermes/profile-service.py`. Current Hermes multiplex support may be evaluated later, but changing gateway topology must not change application profile ids or browser contracts.

### Compatibility boundary

Embedded St. Expedite and RICE chat clients still use the existing server-owned `surface` behavior during this migration. The standalone client hides its obsolete surface toggle and uses profile identity instead.

Old D1 presets and the Worker-direct OpenRouter preset executor remain only for unmigrated legacy preset ids. Do not extend that system. New assistant creation must produce a real Hermes profile.

Profile-native additions are documented in `apps/backend/openapi-profile-native.yaml` during the compatibility window. Before final cutover, fold those routes/fields into `apps/backend/openapi.yaml` and remove the transitional contract.

## Public profile and visitor profile boundaries

`stexpedite-public` remains least-privileged: memory off; host/file/browser/code/deployment tools off; vision only for explicitly attached images.

Visitor-created profiles are private to their owning visitor account and use the baseline policy in `agents/user-profile/BASE.md`. They may choose only owner-allow-listed models. The initial supported configuration is a main model plus an optional Hermes delegation model. Do not recreate arbitrary model pipelines in the Worker.

Verified publication context is restricted to the public source allow-list in `agents/knowledge/sources.json`; submissions, donor/subscriber data, private memory, environment data, and logs remain excluded.

## St. Expedite page routes

The site is organized into two wings. `/` is a splash that captures an email
address and sends the visitor through one of two doors; every other public page
belongs to **Press** (the publishing house) or **Lab** (the working practice).
Wing pages use `Base.astro` with a `wing` prop; the home page uses
`BasePortal.astro`. `HeroBar` renders the active wing's nav plus a crossing link
to the other wing, both read from `site.wings` in `src/data/site.json`.

| Route | Source | Wing | Brand mode | Page CSS/JS |
|---|---|---|---|---|
| `/` | `pages/index.astro` | — | ritual | `portal.css`, `index-effects.js`, `splash-entry.js` → `splash-signup.js` (`POST /api/updates`, `source: "splash"`) |
| `/press` | `pages/press/index.astro` | press | editorial | `wings.css` |
| `/press/books` | `pages/press/books.astro` | press | editorial | `books.css`, `books-page.js` |
| `/press/store` | `pages/press/store.astro` | press | editorial | `gallery.css`, `gallery-page.js` |
| `/press/about` | `pages/press/about.astro` | press | editorial | `mission.css` |
| `/press/donate`, `/press/donate/thanks` | `pages/press/donate*.astro` | press | utility | forms/donation JS/CSS |
| `/lab` | `pages/lab/index.astro` | lab | editorial | `wings.css` |
| `/lab/practice` | `pages/lab/practice.astro` | lab | editorial | `services.css` |
| `/lab/instruments` | `pages/lab/instruments.astro` | lab | editorial | `lab.css`, `lab-anglossic-*.js`, `dialog.js` |
| `/connect` | `pages/connect.astro` | — | redirect | → `https://chat.stexpedite.press`; manuscript deep-link opens `?open=submit` |
| `/404` | `pages/404.astro` | — | editorial | shared |

Legacy routes are 301s served from `apps/stex/public/_redirects` (a real
Cloudflare Pages redirect, replacing the old meta-refresh stub pages):
`/books` → `/press/books`, `/gallery` → `/press/store`, `/about` →
`/press/about`, `/donate` → `/press/donate`, `/donate/thanks` →
`/press/donate/thanks`, `/work` and `/services` → `/lab/practice`, `/submit` →
`/connect?about=manuscript`, `/contact` → `/connect`. The Stripe
`success_url` in `apps/backend/src/index.ts` points at `/press/donate/thanks`
directly; the redirect covers checkouts started before that Worker deploy.

`packages/chat-client/browser.js` remains the shared request/SSE implementation. During migration it can send either a new `profileId` or an old `presetId`; `profile-*` ids are profile-native, while old preset ids stay on compatibility code.

The durable EC2 checkout is `/home/ec2-user/src/this-place-feels-wrong`. Cloudflare serves public Pages/Worker surfaces; EC2 hosts the canonical checkout and Hermes runtime. Do not open visitor Hermes loopback API ports or the profile-service port directly in the security group.

## API ownership

- `apps/backend/src/entry.ts` — top Worker entry; scopes standalone profile-native chat without changing embedded chat semantics accidentally.
- `apps/backend/src/profile-entry.ts` — profile-native profile/list/create/delete/chat routing and legacy route delegation.
- `apps/backend/src/index.ts` — legacy/full Worker implementation during migration.
- `apps/backend/openapi.yaml` — canonical legacy-compatible public API contract.
- `apps/backend/openapi-profile-native.yaml` — temporary migration contract for new profile behavior; merge into canonical OpenAPI before cutover.
- `apps/backend/migrations/0028_assistant_profiles.sql` — application profile index and conversation/profile binding.

## Update discipline

- Code and executable contracts are the primary source of runtime truth.
- `openapi.yaml`/migration schemas describe public/data contracts.
- README/this map explain the architecture.
- `AGENTS.md` contains behavioral constraints for coding agents.
- `MEMORY.md` is a change log, not a second architecture specification.
- Do not preserve dead fields, terms, or documents merely because an earlier agent introduced them.
- Do not add a persistent concept unless it changes real runtime behavior.

When Worker routes change during this migration, update either the canonical OpenAPI contract or the explicitly temporary profile-native migration contract, and keep the transition documented.

## Validation

Use the narrowest relevant checks, then the full relevant PR gates:

```text
npm run test:backend
npm run test:chat-client
npm run build:chat
npm run check:docs
python3 -m py_compile ops/hermes/profile-service.py
bash -n ops/hermes/setup-public-profile.sh ops/hermes/setup-profile-service.sh
```

The PR workflows `.github/workflows/deploy-chat.yml` (validation job only on pull requests), `.github/workflows/validate-chat.yml`, and backend validation must pass before runtime cutover.

A production cutover additionally requires real EC2 disposable-profile creation/deletion, tool isolation verification, D1 migration testing, Worker/profile-service secret configuration, streaming/abort/image tests, and cost-limit review.

Do not deploy, mutate production secrets, alter Cloudflare resources, or merge the compatibility removal until those runtime checks are complete.
