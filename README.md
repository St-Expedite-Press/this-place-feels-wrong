# St. Expedite Press — monorepo

Proprietary monorepo for five St. Expedite products plus their shared contracts and agent/runtime configuration.

| App | Path | Production | Stack |
|---|---|---|---|
| St. Expedite | `apps/stex/` | [stexpedite.press](https://stexpedite.press) | Astro → Cloudflare Pages |
| RICE | `apps/rice/` | [rice.stexpedite.press](https://rice.stexpedite.press) | Static + Python build → Cloudflare Pages |
| Chat | `apps/chat/` | [chat.stexpedite.press](https://chat.stexpedite.press) | Static Astro client → Cloudflare Pages |
| Admin | `apps/admin/` | [admin.stexpedite.press](https://admin.stexpedite.press) | Single-owner dashboard, Astro → Cloudflare Pages |
| Backend | `apps/backend/` | `stexpedite.press/api/*` | Cloudflare Worker + D1 |

The public institution has two wings. **Press** is a publisher: email capture first, catalog browsing second, then store/submissions/support. **Lab** is a founder-facing creative-systems practice whose flagship proof is Signal Atlas. Commissioned Lab work helps fund the publishing program.

The private owner/deployment Hermes profile is never exposed to public chat.

## Chat product and architecture

`chat.stexpedite.press` is intended to become a **general ChatGPT alternative and a public showcase for the St. Expedite agent framework**. It is not merely a Press concierge. The standalone chat is migrating to a simple runtime rule: **one selectable assistant = one Hermes profile**.

Anonymous visitors use the locked `stexpedite-public` Hermes profile. It is a general-purpose assistant that also receives verified public St. Expedite/RICE context from the Worker when relevant. Authenticated visitors may create and select private Hermes profiles that they own. The Worker authorizes and routes profiles; it does not give the browser Hermes/provider credentials or privileged tool access.

Current migration structure:

```text
chat.stexpedite.press
        |
        v
Cloudflare Worker
  auth / limits / D1 transcript / profile ownership
        |
        v
private Hermes profile service
        |
        +--> stexpedite-public
        |
        +--> user-* Hermes profile
```

The first implementation uses one loopback Hermes API server per visitor profile. See [`ops/hermes/README.md`](ops/hermes/README.md) for provisioning and security boundaries. The baseline policy applied to visitor-created profiles is [`agents/user-profile/BASE.md`](agents/user-profile/BASE.md).

Embedded St. Expedite and RICE chat surfaces remain on their existing bounded `surface` behavior during this migration. Legacy Worker-executed preset pipelines remain only for unmigrated preset IDs and should not receive new features.

## Profile-native chat cutover

The authoritative production migration procedure is the **Profile-native chat cutover runbook** in [`ops/hermes/README.md`](ops/hermes/README.md#profile-native-chat-cutover-runbook).

It covers, in order:

1. repository/CI preflight;
2. verification of the actual Hermes CLI installed on EC2;
3. host-local configuration backup;
4. local D1 migration validation;
5. default `stexpedite-public` verification;
6. installation and health-check of the private profile service;
7. disposable real-profile create/chat/delete testing;
8. authenticated Tunnel/origin exposure without opening EC2 profile ports;
9. remote D1 migration;
10. Worker secret/configuration setup;
11. Worker-first deployment and regression testing;
12. profile API ownership/isolation testing;
13. streaming, abort, Turnstile, rate-limit, image, and log-safety testing;
14. standalone chat UI deployment;
15. an observation/inventory period for old preset IDs;
16. a separate final cleanup change that removes the legacy Worker→OpenRouter preset executor only after migration is proven.

The runbook also contains explicit Worker/UI, profile-service, host-configuration, and D1 rollback procedures plus a final production checklist. Do not shortcut the cleanup gate: the additive profile architecture can be deployed while the old executor remains available as a compatibility path.

## Command surface

One command surface drives all products from the repo root:

```bash
# dev
npm run dev:web
npm run dev:rice
npm run dev:chat
npm run dev:admin
npm run dev:worker

# build
npm run build:web
npm run build:rice
npm run build:chat
npm run build:admin
npm run build:all

# deploy — explicit only
npm run deploy:web
npm run deploy:rice
npm run deploy:chat
npm run deploy:admin
npm run deploy:all
npm run deploy:worker

# checks
npm run check
npm run check:rice
npm run check:docs
npm run test:backend
npm run test:chat-client
```

Deploy auth uses `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`. CI deploy workflows remain path-filtered and explicit; pull-request validation must not deploy production resources.

## Routes

**Web (`apps/stex`):** a splash at `/` (email signup + two doors) opening into two wings. **Press**: `/press` · `/press/books` · `/press/preorder` · `/press/store` · `/press/about` · `/press/donate`. **Lab**: `/lab` · `/lab/practice` · `/lab/instruments` · `/lab/architecture` · `/lab/schedule`. Legacy routes 301 into the wings via `apps/stex/public/_redirects`, as documented in `ONTOLOGY.md`.

The Press homepage is a publisher funnel: mailing-list signup is the first action, catalog/current-title browsing is the second, and store/submissions/support are subordinate. Phase One completes when the press has a meaningful catalog of original and archival titles. RICE print is Phase Two and is triggered by an owner-defined target number of $25 pre-orders; the exact count is intentionally unresolved in `PHASE-PLAN.md`.

The Lab is aimed primarily at startups, founders, and small teams building unusual creative/cultural products that need aesthetic product design, memory/knowledge layers, specialized creative agents, or agent infrastructure. Signal Atlas is the marquee proof of practice. There is no public rate card; the entry point is a free 30-minute consultation.

**RICE (`apps/rice`):** `/` · `/splash` · `/project` · essays/fiction/poetry/archive + sample pages.

**Chat (`apps/chat`):** general assistant client and agent-framework showcase, plus manuscript submission, transcript download/upload, visitor sign-in, private assistant creation/selection, and updates signup. The browser calls first-party Worker routes only.

**Admin (`apps/admin`):** single-owner, magic-link-gated administration for signups/submissions/donations plus the existing model/preset/graph controls while migration is incomplete.

**Worker API:** see [`apps/backend/openapi.yaml`](apps/backend/openapi.yaml). Profile-native chat adds `/api/profiles`, `/api/profile-models`, `/api/profiles/create`, and profile-aware `/api/chat`; legacy preset routes remain during the compatibility window.

Full route/ownership map: [`ONTOLOGY.md`](ONTOLOGY.md).

## Documentation

All documentation is indexed in [`docs/README.md`](docs/README.md), with coverage enforced by `npm run check:docs`.

Framework entrypoints: [`AGENTS.md`](AGENTS.md) · [`ONTOLOGY.md`](ONTOLOGY.md) · [`PHASE-PLAN.md`](PHASE-PLAN.md) · [`CLAUDE.md`](CLAUDE.md) · [`MEMORY.md`](MEMORY.md).

Document roles:

- `AGENTS.md` — coding-agent rules and safety boundaries;
- `ONTOLOGY.md` — current architecture, ownership, routes, and runtime map;
- `PHASE-PLAN.md` — current roadmap and unresolved owner decisions;
- `MEMORY.md` — chronological implementation/deployment record;
- `CHANGELOG.md` — historical release summary.

Per-directory convention:

- `**/AGENTS.md` — scope and rules
- `**/MEMORY.md` — change log
- `**/README.md` — orientation/runbooks
- `**/SKILL.md` — executable skills under `skills/`/`ops/`
- `archive/`, `audit/`, `kits/` — historical/audit/scaffolding material

Operational architecture: [Hermes chat runtime and cutover runbook](ops/hermes/README.md) · [agent configuration](agents/README.md) · [visitor profile baseline](agents/user-profile/BASE.md) · [repository retirement gate](ops/repository-retirement.md).

## Deployment model

- St. Expedite, RICE, chat, and admin are independently released Pages products.
- The Worker serves `stexpedite.press/api/*` and integrates D1, Resend, Stripe, Fourthwall, Turnstile, and authenticated Hermes origins.
- `stexpedite-public` and visitor-created `user-*` Hermes profiles are isolated from the private owner profile.
- Visitor profile provisioning is performed only by the loopback/private service under `ops/hermes/`; the browser never receives raw Hermes profile names or API keys.
- D1 chat transcripts may be retained temporarily for refresh/recovery; this is distinct from Hermes long-term memory.
- Never edit generated `dist/`/`_site/` output by hand. D1 migrations are append-only.

This repository is not licensed for public redistribution or reuse.
