# St. Expedite Press — Agent Guide

This file governs all work in this repository: the St. Expedite site, RICE Magazine, the standalone public chat, the shared backend, and the Osiris agent framework. It is the single source of truth for agents; `CLAUDE.md` imports it. `apps/rice/` is the canonical maintained RICE source. The archived `St-Expedite-Press/rice-magazine` repository is historical reference only: do not edit, deploy, or import from it as an active sibling. RICE uses this monorepo's backend through `GET /api/works?program=rice` (with `apps/rice/assets/articles.json` as its static availability fallback), `POST /api/updates`, and the constrained `POST /api/chat` public-Hermes bridge.

## Session start loop

1. Read this file in full.
2. Read `ONTOLOGY.md` for the navigation map, source ownership, update coupling, and validation commands.
3. Read the last relevant entries in `MEMORY.md`, and confirm the current phase in `PHASE-PLAN.md`.
4. If working under a directory with its own `AGENTS.md`/`MEMORY.md` (`apps/stex/`, `apps/rice/`, `apps/chat/`, `apps/backend/`, `agents/`, `packages/`, `assets/`, `branding/`, `docs/`, `scripts/`, `ops/`, `skills/`, `kits/`), read those local files first.
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
| Web source | `apps/stex/src/` | Astro pages, layouts, components, `data/site.json` (stexpedite.press) |
| Web assets | `apps/stex/public/assets/` | Authored CSS, JS, fonts, synced images |
| Web output | `apps/stex/dist/` | **Generated only — never edit by hand** |
| RICE app | `apps/rice/` | Static site + Python build (rice.stexpedite.press); output `apps/rice/_site/` (**generated**). See `apps/rice/ONTOLOGY.md` |
| Chat app | `apps/chat/` | Standalone OpenUI-style public chat — general chat / press knowledge-base toggle plus a manuscript Submit work dialog; the site's single intake surface (nav "Chat" link, `/connect` redirects here); output `apps/chat/dist/` (**generated**) |
| Backend | `apps/backend/src/index.ts` | Shared Cloudflare Worker API (RICE consumes `/api/works`, `/api/updates`, and `/api/chat`) |
| Worker contract | `apps/backend/openapi.yaml` | OpenAPI spec — source of truth for `/api/*` |
| D1 migrations | `apps/backend/migrations/` | **Append-only — never edit existing files** |
| Shared packages | `packages/` | Browser chat transport, public contracts, and content-model schemas |
| Agent framework | `agents/` | Public/owner identity, capability policy, knowledge allowlist, and evals |
| Media source | `assets/source/` | Canonical media, mirrored into the web tree; manifests at `assets/manifest.*` |
| Branding | `branding/` | Design docs + tokens; no runtime behavior |
| Tooling | `scripts/`, `ops/`, `skills/`, `kits/` | Root scripts, runbooks, repo skills, scaffolding kits |
| Public Hermes ops | `ops/hermes/` | Least-privileged public profile; never expose the private `stexpedite` profile |

Page routes and their CSS/JS stacks live in `ONTOLOGY.md`. Worker API routes:

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health probe |
| GET | `/api/storefront` | Fourthwall catalog snapshot |
| GET | `/api/projects` | D1-backed projects list |
| GET | `/api/works` | Unified D1-backed works catalog; filter RICE with `?program=rice` |
| POST | `/api/chat` | Turnstile/rate-limited SSE bridge to the isolated public Hermes profile |
| POST | `/api/contact` | General inquiry → Resend (no longer linked from any UI — folded into chat's `editor@stexpedite.press` guidance; intentionally orphaned, not a bug) |
| POST | `/api/submit` | Manuscript inquiry → Resend |
| POST | `/api/donate/session` | Stripe checkout session |
| POST | `/api/stripe/webhook` | Stripe webhook → D1 log + receipt |
| POST | `/api/updates` | Newsletter signup (also consumed by RICE) |
| POST | `/api/updates/import` | Bulk import (protected) |
| POST | `/api/updates/unsubscribe` | Unsubscribe |

Runtime services: D1 (`DB`), Resend, Stripe, Fourthwall, Turnstile, and the isolated public Hermes API — all via Worker bindings/secrets (see `apps/backend/wrangler.toml`). The public bridge must not target an owner/deployment profile.

## Design system

Dark void aesthetic — do not genericize it. Fonts: Cinzel (display), Cormorant Garamond (body), system mono (`--font-mono`) for kickers/metadata/instrument text.

- All UI color is a token from `apps/stex/public/assets/css/tokens.css` (loaded first on every page). No raw hex/rgba in component CSS — use `--line-*`, `--surface-*`, `--green-*`, `--mode-*`.
- Three brand modes via `data-brand-mode` on `<body>`: `ritual` (home), `editorial` (books/about/work/store), `utility` (connect/donate). Components consume `--mode-*` vars; override at the mode level, never inline.
- Body copy is `--text-readable` (warm cream), not green. Signal green is brand/accent, not every paragraph. Magenta `--relief` is anomaly/relief only.
- The interior surface is **de-boxed**: open blocks separated by hairline rules (`--line-*`) and whitespace, not rounded bordered panels. Keep buttons/inputs as the only bordered controls. Guard animations behind `prefers-reduced-motion`; keep the grain texture and cursor glow.

## Commands

One command surface drives all four products:

```
# build
npm run build            # St. Expedite (alias: build:web) → apps/stex/dist/
npm run build:rice       # RICE → apps/rice/_site/
npm run build:chat       # standalone chat → apps/chat/dist/
npm run build:all
# dev
npm run dev:web          # Astro dev (:4321)
npm run dev:rice         # RICE static server (:4173)
npm run dev:chat         # standalone chat
npm run dev:worker       # Wrangler dev (Worker)
# deploy (explicit authorization required)
npm run deploy:web  |  deploy:rice  |  deploy:chat  |  deploy:worker
# checks
npm run check            # docs + build + lint:html + links + a11y + worker tests + audit
npm run check:rice       # RICE asset integrity
npm run check:docs       # documentation coverage (no orphaned docs)
npm run assets:sync | assets:check
```

Run the narrowest relevant checks: web/CSS/Astro → `build` + `lint:html` + `check:links` + `check:a11y`; RICE → `check:rice` + `build:rice`; Worker → `test:worker` and update `openapi.yaml`; docs moves → `check:docs`; media → `assets:sync` + `assets:check`. On Windows, shell scripts route through `scripts/run-bash.mjs` (WSL → Git Bash).

## Git and editing discipline

- Keep the edit surface narrow and behaviour-preserving unless a change is requested. Preserve public URLs and `/api/*` contracts unless a breaking change is explicitly asked for.
- Never edit `apps/stex/dist/`, `apps/rice/_site/`, or `apps/chat/dist/` (generated), or existing D1 migrations (append a new numbered file).
- Do not commit, push, deploy, release, or mutate external services unless the user explicitly asks. Treat `archive/` as read-only.
- Preserve the configured commit identity unless the user requests otherwise.

Remote: `https://github.com/St-Expedite-Press/this-place-feels-wrong` · Default branch: `main`.

## Deployment

Each product deploys independently. `deploy-stex.yml` and `deploy-rice.yml` preserve the existing Pages projects. `deploy-chat.yml` and `deploy-backend.yml` validate pull requests but require manual dispatch to mutate Cloudflare. A successful local build does not authorize a push or deploy.

## Secrets

Secrets stay local. Never commit, print, or copy `.env`/`.dev.vars` contents, tokens, or credentials. Load only the specific variable an authorized task needs; report variable names and presence, never values. Keep secrets out of fixtures, prompts, skills, logs, screenshots, and Git history. Local-only, never committed: `.claude/`, `CLAUDE.local.md`, `.env`, `.dev.vars`, `.wrangler/`, `.reports/`.

## Skills

Repo skills live in `skills/` (`cloudflare-release-ops`, `docs-assay`, `static-site-qa`, `worker-contract-review`, `submission-triage`, `release-notes-and-changelog`, `catalog-and-works-sync`, `rice-issue-planning`, `brand-voice-guard`, `cloudflare-ops-brief`, `donation-storefront-reconciliation`, `social-copy-drafts`); runbooks in `ops/`; kits in `kits/`. Before creating a skill, search existing ones and prefer updating a near match. For new or materially revised skills follow the `skill-creator` anatomy (narrow trigger, concise `SKILL.md`, referenced scripts, explicit inputs/outputs, validation), then forward-test with a fresh subagent. Never embed secret values in a skill.

The public-guide Hermes profile has its own curated, tool-free knowledge skills at `agents/public-guide/skills/` (`press-voice`, `submission-guidance`, `rice-context`, `image-discussion`) — content/procedure only, no capability grant; mirrored as local skills on the live `stexpedite-public` profile. All new skills for both `stexpedite` (owner) and `stexpedite-public` are also mirrored into the corresponding live Hermes profile's `skills/stexpedite-press/` directory (a `local`-source category, distinct from the profile's bundled `builtin` skills) — repo files are the source of truth; re-copy after editing.
