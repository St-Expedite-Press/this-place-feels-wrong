# St. Expedite Press — Agent Guide

This file governs all work in this repository (a monorepo: an Astro site plus a Cloudflare Worker API). It is the single source of truth for agents. `CLAUDE.md` imports it. The sibling RICE repository is independent — do not import its code, assets, packages, deployment assumptions, or Git history unless the user explicitly asks for an integration. The two share only one seam: RICE calls `POST /api/updates` on this Worker.

## Session start loop

1. Read this file in full.
2. Read `ONTOLOGY.md` for the navigation map, source ownership, update coupling, and validation commands.
3. Read the last relevant entries in `MEMORY.md`, and confirm the current phase in `PHASE-PLAN.md`.
4. If working under a directory with its own `AGENTS.md`/`MEMORY.md` (`apps/web/`, `apps/communications-worker/`, `assets/`, `branding/`, `docs/`, `scripts/`, `ops/`, `skills/`, `kits/`), read those local files first.
5. Confirm worktree status with `git status -sb` before editing, and preserve unrelated work.

## Closeout loop

Every file-changing task ends by:

- running the narrowest meaningful checks (see Commands);
- appending a concise entry to root `MEMORY.md`, plus a local `MEMORY.md` when the touched subtree has one;
- updating `ONTOLOGY.md` and this file in the same change when routes, ownership, commands, or workflow rules change;
- a short note on whether a script, skill, or runbook helped or got in the way.

## Agent orchestration

The primary agent is the orchestrator and keeps minimal context: the goal, governing instructions, decisions, interfaces, and verified conclusions.

- Spawn parallel subagents whenever work separates into independent read-only investigations or non-overlapping file ownership. Give each explicit scope, owned paths, prohibited paths/actions, expected output, and validation requirements.
- Supply relevant raw artifacts directly (file contents, paths, diffs, logs, screenshots, command output). Avoid redundant rediscovery.
- The primary agent integrates results, prevents conflicting edits, runs final checks, and reports. Subagents do not push, deploy, alter secrets, or broaden scope without authorization.

Prefer built-in subagents when the runtime can select the requested model directly. If it cannot select `deepseek/deepseek-v4-flash`, the orchestrator must use the local `OPENROUTER_API_KEY` to make bounded chat-completions calls to `https://openrouter.ai/api/v1/chat/completions` with that model, treating them as read-only delegated subagents.

- Use the key only in the orchestrator-built HTTP authorization header. Never print, log, commit, place it in a prompt, or pass it to a child process or agent.
- Send a minimal task packet: task ID, objective, acceptance criteria, relevant artifact paths or excerpts, prohibited actions, required output schema.
- Parallelize only independent read-only calls. Serialize overlapping or dependent tasks.
- Verify provider/model metadata, finish reason, and output shape before integration.
- Retry transient failures with bounded backoff. If OpenRouter remains unavailable, use built-in runtime subagents and disclose the fallback.
- OpenRouter delegates do not write files or mutate external systems. The primary agent performs all authorized changes and validation.

## Architecture

| Layer | Path | Purpose |
|---|---|---|
| Web source | `apps/web/src/` | Astro pages, layouts, components, `data/site.json` (stexpedite.press) |
| Web assets | `apps/web/public/assets/` | Authored CSS, JS, fonts, synced images |
| Web output | `apps/web/dist/` | **Generated only — never edit by hand** |
| RICE app | `apps/rice/` | Static site + Python build (rice.stexpedite.press); output `apps/rice/_site/` (**generated**). See `apps/rice/ONTOLOGY.md` |
| Worker | `apps/communications-worker/src/index.ts` | Cloudflare Worker API (RICE consumes `POST /api/updates`) |
| Worker contract | `apps/communications-worker/openapi.yaml` | OpenAPI spec — source of truth for `/api/*` |
| D1 migrations | `apps/communications-worker/migrations/` | **Append-only — never edit existing files** |
| Media source | `assets/source/` | Canonical media, mirrored into the web tree; manifests at `assets/manifest.*` |
| Branding | `branding/` | Design docs + tokens; no runtime behavior |
| Tooling | `scripts/`, `ops/`, `skills/`, `kits/` | Root scripts, runbooks, repo skills, scaffolding kits |

Page routes and their CSS/JS stacks live in `ONTOLOGY.md`. Worker API routes:

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health probe |
| GET | `/api/storefront` | Fourthwall catalog snapshot |
| GET | `/api/projects` | D1-backed projects list |
| POST | `/api/contact` | General inquiry → Resend |
| POST | `/api/submit` | Manuscript inquiry → Resend |
| POST | `/api/donate/session` | Stripe checkout session |
| POST | `/api/stripe/webhook` | Stripe webhook → D1 log + receipt |
| POST | `/api/updates` | Newsletter signup (also consumed by RICE) |
| POST | `/api/updates/import` | Bulk import (protected) |
| POST | `/api/updates/unsubscribe` | Unsubscribe |

Runtime services: D1 (`DB`), Resend, Stripe, Fourthwall, Turnstile — all via Worker bindings/secrets (see `apps/communications-worker/wrangler.toml`).

## Design system

Dark void aesthetic — do not genericize it. Fonts: Cinzel (display), Cormorant Garamond (body), system mono (`--font-mono`) for kickers/metadata/instrument text.

- All UI color is a token from `apps/web/public/assets/css/tokens.css` (loaded first on every page). No raw hex/rgba in component CSS — use `--line-*`, `--surface-*`, `--green-*`, `--mode-*`.
- Three brand modes via `data-brand-mode` on `<body>`: `ritual` (home), `editorial` (books/about/work/store), `utility` (connect/donate). Components consume `--mode-*` vars; override at the mode level, never inline.
- Body copy is `--text-readable` (warm cream), not green. Signal green is brand/accent, not every paragraph. Magenta `--relief` is anomaly/relief only.
- The interior surface is **de-boxed**: open blocks separated by hairline rules (`--line-*`) and whitespace, not rounded bordered panels. Keep buttons/inputs as the only bordered controls. Guard animations behind `prefers-reduced-motion`; keep the grain texture and cursor glow.

## Commands

One command surface drives both sites + the worker:

```
# build            web / rice / both
npm run build            # web (alias: build:web) → apps/web/dist/
npm run build:rice       # RICE → apps/rice/_site/
npm run build:all
# dev
npm run dev:web          # Astro dev (:4321)
npm run dev:rice         # RICE static server (:4173)
npm run dev:worker       # Wrangler dev (Worker)
# deploy (Cloudflare Pages, one token)
npm run deploy:web  |  deploy:rice  |  deploy:all  |  deploy:worker
# checks
npm run check            # docs + build + lint:html + links + a11y + worker tests + audit
npm run check:rice       # RICE asset integrity
npm run check:docs       # documentation coverage (no orphaned docs)
npm run assets:sync | assets:check
```

Run the narrowest relevant checks: web/CSS/Astro → `build` + `lint:html` + `check:links` + `check:a11y`; RICE → `check:rice` + `build:rice`; Worker → `test:worker` and update `openapi.yaml`; docs moves → `check:docs`; media → `assets:sync` + `assets:check`. On Windows, shell scripts route through `scripts/run-bash.mjs` (WSL → Git Bash).

## Git and editing discipline

- Keep the edit surface narrow and behaviour-preserving unless a change is requested. Preserve public URLs and `/api/*` contracts unless a breaking change is explicitly asked for.
- Never edit `apps/web/dist/` (generated) or existing D1 migrations (append a new numbered file).
- Do not commit, push, deploy, release, or mutate external services unless the user explicitly asks. Treat `archive/` as read-only.
- Preserve the configured commit identity unless the user requests otherwise.

Remote: `https://github.com/St-Expedite-Press/this-place-feels-wrong` · Default branch: `main`.

## Deployment

Each app deploys independently via path-filtered workflows on push to `main`:
`.github/workflows/deploy-pages.yml` builds + deploys `apps/web/dist` to Cloudflare Pages (`stexpedite-press`, ignores `apps/rice/**`); `.github/workflows/deploy-rice.yml` builds + deploys `apps/rice/_site` to Cloudflare Pages (`rice-magazine`, triggers on `apps/rice/**`). The Worker deploys separately via `npm run deploy:worker`. A successful local build does not authorize a push or deploy.

## Secrets

Secrets stay local. Never commit, print, or copy `.env`/`.dev.vars` contents, tokens, or credentials. Load only the specific variable an authorized task needs; report variable names and presence, never values. Keep secrets out of fixtures, prompts, skills, logs, screenshots, and Git history. Local-only, never committed: `.claude/`, `CLAUDE.local.md`, `.env`, `.dev.vars`, `.wrangler/`, `.reports/`.

## Skills

Repo skills live in `skills/` (`cloudflare-release-ops`, `docs-assay`, `static-site-qa`, `worker-contract-review`); runbooks in `ops/`; kits in `kits/`. Before creating a skill, search existing ones and prefer updating a near match. For new or materially revised skills follow the `skill-creator` anatomy (narrow trigger, concise `SKILL.md`, referenced scripts, explicit inputs/outputs, validation), then forward-test with a fresh subagent. Never embed secret values in a skill.
