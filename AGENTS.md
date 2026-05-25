# St. Expedite Press — Agent Delegation Guide

This file governs how agents decompose and route work in this repository. It is the companion to `CLAUDE.md` and the preamble to `agent/AGENT.md` (the full project source of truth).

---

## Delegation Model

Every task entering this repo passes through three lenses before any file is touched:

1. **Classify** — what domain does this belong to? (`web`, `worker`, `docs`, `ops`, `assets`, `tooling`)
2. **Consult** — read `docs/ontology/project-ontology.json` to identify owning paths, valid commands, and contract surfaces; use `docs/ontology/ontology.md` for the human-readable surface map
3. **Route** — assign to the narrowest responsible subagent below

The main agent may complete narrow blocking work inline. For broader work, it decomposes tasks, routes independent work to subagents, reviews results, and updates docs.

---

## Subagent Roster

| Role | Owns | When to spawn |
|------|------|---------------|
| `web-surface` | `apps/web/src/`, CSS, JS, a11y, links, Astro pages | Any page, style, or client-side behavior change |
| `worker-contract` | `apps/communications-worker/src/index.ts`, `openapi.yaml`, `migrations/`, `test/` | Any API route, D1 schema, or Worker env change |
| `docs-curator` | `README.md`, `AGENTS.md`, `agent/AGENT.md`, `docs/`, ontology JSON | Any documentation or ontology update |
| `ops-release` | `agent/ops/`, `agent/tools/release.sh`, `wrangler.toml`, smoke tests | Any deploy, runtime audit, or release gate task |
| `assets` | `assets/source/`, `npm run assets:sync`, `npm run assets:check` | Any image/media add or format conversion |

Spawn subagents in parallel when tasks are independent. Never delegate the immediately blocking task — complete it inline if it is narrow.

---

## Agent Infrastructure Layout

```
agent/
├── AGENT.md                    ← full project source of truth (read this first)
├── skills/                     ← repo-scoped task-specific agents
│   ├── cloudflare-release-ops/ ← release + runtime validation
│   ├── docs-assay/             ← documentation consistency audit
│   ├── static-site-qa/         ← HTML, a11y, links, SEO checks
│   └── worker-contract-review/ ← OpenAPI + D1 + Worker contract review
├── ops/                        ← operational runbooks
│   └── cloudflare-stability/
│       ├── SKILL.md
│       ├── references/         ← incident response, thresholds
│       └── scripts/            ← smoke-api.sh, runtime-audit.sh, log-release-evidence.sh
├── tools/                      ← shell scripts invoked via npm run
│   ├── check-assets-sync.sh
│   ├── check-runtime-config.sh
│   ├── check-site-seo.sh
│   ├── release.sh
│   ├── sync-assets.sh
│   └── …
├── lib/
│   └── repo-root.sh            ← shared path resolution helper
└── kits/
    └── static-web/             ← reusable static-site scaffolding template
```

### Skills

Each skill in `agent/skills/` is a self-contained agent definition:

| Skill | When to invoke |
|-------|---------------|
| `cloudflare-release-ops` | Pre-deploy runtime check, post-deploy verification |
| `docs-assay` | Documentation consistency review, ontology audit |
| `static-site-qa` | Full HTML + a11y + links + SEO gate |
| `worker-contract-review` | OpenAPI ↔ Worker source parity check |

Each skill directory contains `SKILL.md` (instructions) and `agents/openai.yaml` (agent manifest).

### Ops Runbooks (`agent/ops/`)

The `cloudflare-stability` runbook governs the runtime health and release safety of the Cloudflare Worker and D1 database.

- `SKILL.md` — procedure overview
- `references/incident-response.md` — escalation and rollback steps
- `references/thresholds.md` — acceptable error rates, latency bounds
- `scripts/smoke-api.sh` — production endpoint smoke test (run via `npm run smoke:api`)
- `scripts/runtime-audit.sh` — read-only Cloudflare runtime audit (run via `npm run runtime:audit`)
- `scripts/log-release-evidence.sh` — post-deploy evidence capture

### Tools (`agent/tools/`)

Shell scripts invoked through `npm run` aliases defined in `package.json` and `Makefile`. Never invoke these directly without the `npm run` wrapper — the wrapper handles WSL/Git Bash routing on Windows.

---

## Task Routing Quick Reference

| Task type | Read first | Subagent | Run after |
|-----------|------------|----------|-----------|
| Edit Astro page | Target `.astro`, its CSS, its JS | `web-surface` | `npm run check` |
| Edit Worker route | `openapi.yaml`, `src/index.ts` | `worker-contract` | `npm run test:worker` |
| Add D1 migration | Latest migration in `migrations/` | `worker-contract` | `wrangler d1 execute … --file=migrations/NNNN_….sql` |
| Edit CSS token | `tokens.css`, affected pages | `web-surface` | `npm run check:a11y` |
| Update docs | Affected docs + ontology JSON | `docs-curator` | `npm run check:tooling-integrity` |
| Release | `docs/state-of-play.md`, last migration | `ops-release` | `npm run release:dry-run` then `npm run release` |
| Add media | `assets/source/` | `assets` | `npm run assets:sync && npm run assets:check` |

---

## Task Closeout

At the end of each task that changes files or performs repo investigation, include:

- `Tool calls` — concise list of commands, scripts, and repo tools used, grouped by purpose.
- `Checks` — validation commands and outcomes.
- `Tooling/skills scrum` — one to three notes on what would improve future agent work, including whether a repo skill, runbook, or ontology rule should change.

When any maintained surface changes, update both `docs/ontology/project-ontology.json` and `docs/ontology/ontology.md`.

---

## Safety Rules

- Never edit `apps/web/dist/` — generated output only.
- Never edit existing D1 migration files — always add a new numbered file.
- Never commit `.env`, `.dev.vars`, `.wrangler/`, `.claude/`, `CLAUDE.local.md`.
- Preserve public URLs and `/api/*` response contracts unless a breaking change is explicitly authorized.
- When touching CSS: all colors must be tokens from `tokens.css`. No raw hex values in component CSS.
- When touching assets: edit `assets/source/` only, then sync and check.

---

## Source of Truth Chain

```
CLAUDE.md          → gateway, imports agent/AGENT.md, points here
AGENTS.md          → this file: delegation model + subagent roster
agent/AGENT.md     → full project ontology, CSS rules, command matrix, safety rules
docs/ontology/     → machine-readable constraint and path map
```

When these conflict: `agent/AGENT.md` wins for project facts; `AGENTS.md` wins for delegation policy.
