# Repository Ontology

Human-readable companion to `project-ontology.json`. Keep this file aligned whenever the machine-readable ontology changes.

## Maintained Surfaces

| Surface | Source of truth | Notes |
|---|---|---|
| Web app | `apps/web/` | Astro static site for public pages. |
| Communications Worker | `apps/communications-worker/` | Cloudflare Worker for `/api/*`, OpenAPI contract, D1 migrations, and tests. |
| Assets | `assets/source/`, `apps/web/public/assets/{css,js,fonts}/` | Canonical media variants are mirrored into the public tree; code/font assets are authored in place. Generated JSON/text manifests record ownership and checksums. |
| Docs | `README.md`, `docs/`, app READMEs | Human-facing project state, deployment, operations, and infrastructure docs. |
| Agent infrastructure | `scripts/`, `ops/`, `skills/`, `kits/`, `AGENTS.md`, `CLAUDE.md` | Shell scripts, runbooks, repo skills, scaffolding kits, and agent doctrine. |

## Directory Agent Framework

Project tasks start at root `AGENTS.md`, `ONTOLOGY.md`, and `MEMORY.md`, then descend into local working-directory guides where present.

| Directory | Local contract | Memory use |
|---|---|---|
| `apps/web/` | `AGENTS.md` | Log web route, Astro, CSS, JS, and generated-output boundary changes in `MEMORY.md`. |
| `apps/communications-worker/` | `AGENTS.md` | Log Worker route, OpenAPI, migration, binding, and test changes in `MEMORY.md`. |
| `assets/` | `AGENTS.md` | Log canonical media, sync, manifest, and provenance changes in `MEMORY.md`. |
| `branding/` | `AGENTS.md` | Log token, design-system, and brand-doc decisions in `MEMORY.md`. |
| `docs/` | `AGENTS.md` | Log ontology, infrastructure, operations, and documentation consistency work in `MEMORY.md`. |
| `ops/` | `AGENTS.md` | Log runtime, smoke, release, and incident-runbook lessons in `MEMORY.md`. |
| `scripts/` | `AGENTS.md` | Log command, wrapper, and validation-script contract changes in `MEMORY.md`. |
| `skills/` | `AGENTS.md` | Log skill consolidation, forward-testing, and stale-skill cleanup in `MEMORY.md`. |
| `kits/` | `AGENTS.md` | Log template, path, and scaffolding-contract decisions in `MEMORY.md`. |

Every file-changing task appends a concise root `MEMORY.md` entry and, when applicable, a local directory `MEMORY.md` entry. Entries should state changed surfaces, checks, follow-ups, and tooling/skills notes. Do not log secrets, `.env` values, or noisy transcripts.

## Agent Orchestration

The primary agent operates orchestration-first: it retains planning, safe decomposition, integration, cross-surface decisions, critical blockers, conflict resolution, and final validation. Spawn parallel subagents whenever work can be safely separated into independent read, implementation, review, or validation tracks.

Every assignment declares explicit scope and success criteria, read/write ownership, non-overlapping boundaries, expected output and integration notes, and locations for raw logs, reports, patches, screenshots, or other evidence. Subagents return a concise result plus those raw artifacts. Never pass secrets or unnecessary sensitive context.

Prefer built-in delegation when the runner can directly select the requested model. Otherwise the orchestrator uses local `OPENROUTER_API_KEY` only as an HTTP authorization header to call `https://openrouter.ai/api/v1/chat/completions` with `deepseek/deepseek-v4-flash`. These calls are bounded, read-only subagents: they receive minimal structured task packets, may run concurrently only when independent, and cannot mutate files or external systems. Verify provider/model metadata, finish reason, and output shape; retry transient failures with bounded backoff, then fall back to built-in subagents with explicit disclosure. Never expose the key or claim an unverified model.

## Skill Lifecycle

Inventory and search repo, installed, and available skills before authoring. Update or extend a suitable skill before creating a duplicate. New or materially revised skills follow the `skill-creator` structure, are validated with their referenced paths and scripts, and are forward-tested by fresh subagents without the authoring context.

Curate the skill surface over time: consolidate overlapping workflows and retire or archive stale duplicates while preserving maintained entrypoints. When skills or agent workflows change paths, commands, ownership, validation, or policy, synchronize `AGENTS.md`, `project-ontology.json`, and this document.

## Tooling And MCP Capabilities

Repo-configured MCP servers are declared in `.mcp.json`:

| Server | Purpose |
|---|---|
| `cloudflare` | Cloudflare account, Pages, Worker, and runtime inspection when the active session exposes it. |
| `playwright` | Visual and interaction testing for live or local web surfaces. |

Documented project MCP workflows may also use `playwright-ea`, `screenshot-fast`, `firecrawl`, and `page-design-guide` when a host/session exposes those servers. Treat them as available capabilities, not as guaranteed tools in every Codex session.

Current Codex sessions may also expose connectors for GitHub, Google Drive, Figma, Canva, Node REPL, and multi-agent delegation. Use those only when present in the active tool list, and keep external mutations such as PR creation, reviewer changes, Drive edits, or Figma/Canva writes behind explicit user authorization.

Shell-backed project work should use PowerShell, Git scoped to this repository, Node/npm scripts, Python scripts, and Wrangler through npm or make wrappers.

## Environment Surfaces

Environment files are local-only. Document variable names and presence only; never print, copy, commit, or paste values.

| Surface | Role | Variable names |
|---|---|---|
| Workspace `.env` | Broad local workstation credentials and cross-project metadata | GitHub, OpenAI/OpenRouter, AWS, Fourthwall, Stripe, RICE URL, browser/session, media-tool, and debug variables |
| Repository `.env` | Press-local deploy/runtime/operator configuration | Cloudflare, Resend, Stripe, Fourthwall, GitHub write token, Telegram, AWS, CensusData, and OpenAI-related variables |
| `.env.example` | Commit-safe variable template for this repository | `CF_PAGES_PROJECT`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `FOURTH_WALL_API_KEY`, `FOURTH_WALL_HMAC`, `FOURTH_WALL_PASSWORD`, `FOURTH_WALL_USERNAME`, `GITHUB_PAT_WRITE`, `GITHUB_REPO_URL`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TELEGRAM_TOKEN`, `TELEGRAM_WEBHOOK_URL` |

Worker production secrets belong in Wrangler or Cloudflare secret storage, not in Git. Do not assume either local `.env` is loaded automatically; load only the specific variable required by an authorized task.

## Deployment Auth

- Pages deploy contract: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- Optional local override for `npm run deploy:web`: `CF_PAGES_PROJECT`
- GitHub Actions Pages deploy secret names match the env vars exactly
- Legacy `CLOUDFLARE_API_KEY` and `CLOUDFLARE_EMAIL` are not part of the maintained Pages deploy surface

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
| `npm run assets:check` | Verify canonical media parity and generated JSON/text asset inventories. |
| `npm run identity:build` | Rebuild the institutional seal derivatives from the preserved source scan. |
| `npm run runtime:config` | Check Cloudflare runtime prerequisites. |

`assets/manifest.json` is the machine contract for published asset ownership, source mapping, byte size, and SHA-256 checksums. `assets/manifest.txt` is its review-friendly companion.

The generated `img/identity/expedite-seal-motion.svg` is the homepage-only animated identity derivative. It is rebuilt from the preserved seal scan and contains its own reduced-motion fallback.

## Task Closeout Rule

For any task that changes files or performs a repo investigation, final responses should include:

- `Tool calls`: concise list of commands/scripts/tooling used, grouped by purpose.
- `Checks`: validation commands and outcomes.
- `Tooling/skills scrum`: one to three notes on what would improve future agent work, including whether a repo skill, runbook, or ontology rule should change.
