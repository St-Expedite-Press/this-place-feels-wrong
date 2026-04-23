# Tooling Discussion: Efficiency Assessment

Date: 2026-03-16
Scope: Repository tooling needed to improve development speed, deployment reliability, and operational visibility after the app/worker/internal split.

## Current State

What already exists and is useful:
- CI for static deploy and test gates: `.github/workflows/deploy-pages.yml`
- Scheduled API checks: `.github/workflows/api-health-monitor.yml`
- Runtime ops scripts: `internal/agent/skills/ops/cloudflare-stability/scripts/*.sh`
- Repo guidance docs: `README.md`, `DEPLOYMENT.md`, `docs/state-of-play.md`, `internal/agent/docs/AGENTS.md`
- Root operator command surface: `npm run build`, `npm run check`, `npm run dev:web`, `npm run dev:worker`, `npm run deploy:web`, `npm run deploy:worker`
- Clean generated web artifact at `apps/web/dist/`

Primary constraints today:
- Push/deploy auth is still environment-sensitive unless bootstrapped.
- SEO/content checks are still partly heuristic rather than schema-driven.
- Worker/API contract checks still rely on local tests plus runtime smoke rather than contract assertions in CI.

## Implemented Baseline

1. Root task runner
- `package.json` and `Makefile` now expose stable repo-level commands.
- Impact: lower operator friction and less command drift.

2. Release orchestration
- `internal/agent/tools/release.sh` chains validation, deploy, smoke, and evidence logging.
- Impact: release steps are explicit and reproducible.

3. Pre-push guardrails
- `.githooks/pre-push` now runs `npm run check`.
- `internal/agent/tools/install-hooks.sh` installs the tracked hook set.
- Impact: local push gates match the current repo layout.

4. Runtime config and asset integrity checks
- `internal/agent/tools/check-runtime-config.sh` verifies deploy prerequisites.
- `internal/agent/tools/check-assets-sync.sh` validates `assets/source/` against `apps/web/public/assets/`.
- Impact: catches deploy and content drift earlier.

## Recommended Next Upgrades

1. Add stronger contract assertions in CI
- Validate selected production-like API response shapes in a dedicated test job.
- Impact: catch runtime contract drift before or immediately after release.

2. Make SEO checks less heuristic
- Add explicit metadata rules for canonical URLs, headings, structured data, and sitemap freshness.
- Impact: reduces manual SEO review.

3. Add release artifacts in CI
- Persist smoke output and runtime audit evidence as downloadable artifacts.
- Impact: easier incident review and release forensics.

## Minimal Success Criteria

Tooling is “efficient enough” when:
- A new operator can run one bootstrap command and one release command.
- Local pre-push checks match CI checks.
- Worker deploy prerequisites are validated before deploy.
- Release evidence is generated automatically.
- Runtime regressions are detected within minutes, not after user reports.
