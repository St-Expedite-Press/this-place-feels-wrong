# Agent Operating Guide

This is the canonical project instruction file for Codex and other coding agents. Claude Code reads it through `CLAUDE.md`.

## Project Shape

- Product: St. Expedite Press public web presence and communications API.
- Web source: `apps/web/src/` and `apps/web/public/assets/`.
- Web output: `apps/web/dist/`; generated only, never edited by hand.
- Worker source: `apps/communications-worker/src/index.ts`.
- Worker contract: `apps/communications-worker/openapi.yaml`.
- D1 migrations: `apps/communications-worker/migrations/`; append-only.
- Internal tooling and runbooks: `internal/agent/`.
- Repo-scoped Codex skills: `.agents/skills/`.
- Archive: `archive/`; non-live historical material.

## Task Routing Loop

1. Classify the task as `web`, `worker`, `docs`, `ops`, `assets`, `archive`, or `tooling`.
2. Before editing, read `README.md`, `docs/state-of-play.md`, `docs/ontology/project-ontology.json`, and the nearest domain README.
3. For implementation tasks, also read the owning source file, nearest test or contract, and relevant internal runbook.
4. Keep the edit surface narrow and behavior-preserving unless the user explicitly requests a behavior change.
5. Update affected docs in the same change when paths, commands, routes, assets, or workflows move.
6. Run the narrowest meaningful validation, escalating to `npm run check` for broad changes.

Use the Karpathy-style loop for larger autonomous work: keep the instruction file small, identify explicit in-scope files, run bounded checks, write logs outside the main context, and keep diffs reviewable.

## Command Matrix

- Build site: `npm run build`.
- Run web dev server: `npm run dev:web`.
- Run Worker dev server: `npm run dev:worker`.
- Sync assets: `npm run assets:sync`.
- Check asset drift: `npm run assets:check`.
- Check links: `npm run check:links`.
- Check accessibility heuristics: `npm run check:a11y`.
- Check HTML: `npm run lint:html`.
- Test Worker: `npm run test:worker`.
- Full local gate: `npm run check`.
- Deploy Pages: `npm run deploy:web`.
- Deploy Worker: `npm run deploy:worker`.
- Dry-run release: `npm run release:dry-run`.
- Runtime audit: `npm run runtime:audit`.
- Production API smoke: `npm run smoke:api`.

On Windows, root scripts that call shell files go through `scripts/run-bash.mjs`, which uses WSL when available and falls back to Git Bash.

## Safety Rules

- Do not edit `apps/web/dist/`; regenerate it.
- Do not edit existing D1 migration files; add a new numbered migration.
- Do not commit secrets or local machine config.
- Keep `.claude/`, `CLAUDE.local.md`, `.env`, `.dev.vars`, `.wrangler/`, `.reports/`, and local caches out of version control.
- Preserve public URLs and `/api/*` response contracts unless a breaking change is explicitly requested.
- When touching assets, edit `assets/source/`, run `npm run assets:sync`, and then `npm run assets:check`.
- Treat `archive/anglossic_quiz/` as preserved historical product material unless the user explicitly asks to retire it.

## Subagent Policy

Use subagents when the work can proceed in parallel without blocking the main implementation path. Prefer read-only explorers for evidence gathering and focused workers for disjoint edit scopes.

Recommended roles:

- `repo-mapper`: read-only inventory of files, docs, commands, and stale references.
- `docs-curator`: documentation consistency, source-of-truth updates, and link/path correction.
- `toolchain-auditor`: package scripts, Make targets, GitHub Actions, MCP config, hooks, and release commands.
- `web-surface-reviewer`: Astro pages, CSS/JS assets, accessibility, links, and visual QA.
- `worker-contract-reviewer`: Worker routes, OpenAPI, migrations, D1 assumptions, and tests.
- `ops-release-reviewer`: Cloudflare runtime checks, release scripts, smoke tests, and incident docs.
- `cleanup-verifier`: ignored artifacts, archive candidates, duplicate assets, stale generated output, and final no-behavior-change review.

Do not delegate the immediate blocking task. Give each subagent a concrete scope, read/write ownership, and expected output.

## Source Of Truth Updates

Update these together when their surfaces change:

- Site routes or assets: `README.md`, `docs/state-of-play.md`, `docs/ontology/project-ontology.json`, `apps/web/src/README.pages.md`.
- Worker routes or payloads: `apps/communications-worker/openapi.yaml`, `apps/communications-worker/README.md`, `docs/infrastructure/*.md`, `docs/ontology/project-ontology.json`.
- Tooling commands: `package.json`, `Makefile`, `scripts/README.md`, `internal/agent/tools/README.md`, `.github/workflows/README.md`.
- Agent workflows: `AGENTS.md`, `CLAUDE.md`, `.agents/skills/**`, `internal/agent/docs/**`.
