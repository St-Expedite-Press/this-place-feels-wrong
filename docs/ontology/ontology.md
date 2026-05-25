# Repository Ontology

Human-readable companion to `project-ontology.json`. Keep this file aligned whenever the machine-readable ontology changes.

## Maintained Surfaces

| Surface | Source of truth | Notes |
|---|---|---|
| Web app | `apps/web/` | Astro static site for public pages. |
| Communications Worker | `apps/communications-worker/` | Cloudflare Worker for `/api/*`, OpenAPI contract, D1 migrations, and tests. |
| Assets | `assets/source/` | Canonical media sources; sync into `apps/web/public/assets/`. |
| Docs | `README.md`, `docs/`, app READMEs | Human-facing project state, deployment, operations, and infrastructure docs. |
| Agent infrastructure | `agent/`, `AGENTS.md`, `CLAUDE.md` | Shared agent operating guide, repo skills, runbooks, tools, and reusable kits. |

## Public Web Routes

| Route | Source |
|---|---|
| `/` | `apps/web/src/pages/index.astro` |
| `/books` | `apps/web/src/pages/books.astro` |
| `/about` | `apps/web/src/pages/about.astro` |
| `/contact` | `apps/web/src/pages/contact.astro` |
| `/donate` | `apps/web/src/pages/donate.astro` |
| `/donate/thanks` | `apps/web/src/pages/donate/thanks.astro` |
| `/submit` | `apps/web/src/pages/submit.astro` |
| `/gallery` | `apps/web/src/pages/gallery.astro` |
| `/lab` | `apps/web/src/pages/lab.astro` |
| `/services` | `apps/web/src/pages/services.astro` |

## API Routes

| Route | Contract |
|---|---|
| `GET /api/health` | Runtime health and dependency flags. |
| `GET /api/storefront` | Fourthwall storefront catalog. |
| `GET /api/projects` | D1-backed projects catalog. |
| `POST /api/contact` | Contact form email and D1 log. |
| `POST /api/submit` | Submission inquiry email and D1 log. |
| `POST /api/donate/session` | Stripe Checkout session creation. |
| `POST /api/stripe/webhook` | Stripe checkout webhook receiver. |
| `POST /api/updates` | Updates signup capture. |
| `POST /api/updates/import` | Token-gated updates enrichment import. |
| `POST /api/updates/unsubscribe` | Updates unsubscribe marker. |

## Update Rule

When changing routes, commands, validation scripts, deployment/runtime surfaces, agent workflows, skills, runbooks, or maintained path ownership, update both:

- `docs/ontology/project-ontology.json`
- `docs/ontology/ontology.md`

Then run:

```bash
npm run check:tooling-integrity
```

## Validation Commands

| Command | Purpose |
|---|---|
| `npm run check` | Full repo gate: tooling integrity, build, HTML lint, links, a11y, Worker tests, and dependency audit. |
| `npm run check:tooling-integrity` | Ontology, path, and API route parity checks. |
| `npm run check:audit` | Root, web, and Worker dependency audit at high severity or above. |
| `npm run assets:check` | Verify source/public asset sync. |
| `npm run runtime:config` | Check Cloudflare runtime prerequisites. |

## Task Closeout Rule

For any task that changes files or performs a repo investigation, final responses should include:

- `Tool calls`: concise list of commands/scripts/tooling used, grouped by purpose.
- `Checks`: validation commands and outcomes.
- `Tooling/skills scrum`: one to three notes on what would improve future agent work, including whether a repo skill, runbook, or ontology rule should change.
