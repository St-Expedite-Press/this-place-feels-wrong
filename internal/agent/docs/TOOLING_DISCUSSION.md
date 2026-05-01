# Tooling Discussion: Efficiency Assessment

Date: 2026-05-01
Scope: Repository tooling needed to keep the Astro site, Cloudflare Worker, docs, and agent workflows easy to operate.

## Current State

Useful baseline:

- CI validation and Pages deploy: `.github/workflows/deploy-pages.yml`
- Scheduled production API checks: `.github/workflows/api-health-monitor.yml`
- Runtime ops scripts: `internal/agent/skills/ops/cloudflare-stability/scripts/*.sh`
- Repo command surface: `npm run build`, `npm run check`, `npm run dev:web`, `npm run dev:worker`, `npm run deploy:web`, `npm run deploy:worker`
- Asset sync and drift checks: `npm run assets:sync`, `npm run assets:check`
- Agent instruction files: `AGENTS.md`, `CLAUDE.md`
- Repo-scoped Codex skills: `.agents/skills/`

Primary constraints:

- Shell scripts require `sh`; on Windows the npm aliases use `scripts/run-bash.mjs` with WSL or Git Bash.
- Runtime verification depends on Cloudflare credentials and production network access.
- OpenAPI and route docs must be kept in sync with `apps/communications-worker/src/index.ts`.

## Implemented Baseline

- Root `package.json` and `Makefile` expose stable repo-level commands.
- `internal/agent/tools/release.sh` chains validation, deploy, smoke, and evidence logging.
- `.githooks/pre-push` runs `npm run check`.
- `check-runtime-config.sh`, `check-assets-sync.sh`, and Cloudflare stability scripts catch deploy and content drift.
- `AGENTS.md` and repo-scoped skills make Codex/Claude task routing explicit.

## Recommended Next Upgrades

- Add contract assertions that compare implemented Worker routes to OpenAPI in CI.
- Add structured SEO metadata checks for canonical URLs, headings, sitemap freshness, and robots output.
- Persist smoke output and runtime audit evidence as CI artifacts.
- Add schema validation for `docs/ontology/project-ontology.json` and `internal/agent/kits/static-web/agent.config.json`.

## Minimal Success Criteria

Tooling is efficient enough when:

- A new operator can run one bootstrap command and one release command.
- Local pre-push checks match CI checks.
- Worker deploy prerequisites are validated before deploy.
- Asset drift is caught before release.
- Release evidence is generated automatically.
- Runtime regressions are detected within minutes, not after user reports.
