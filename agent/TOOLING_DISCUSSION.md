# Tooling Discussion: Efficiency Assessment

Date: 2026-02-24
Scope: Repository tooling needed to improve development speed, deployment reliability, and operational visibility.

## Current State

What already exists and is useful:
- CI for static deploy and test gates: `.github/workflows/deploy-pages.yml`
- Scheduled API checks: `.github/workflows/api-health-monitor.yml`
- Runtime ops scripts: `skills/ops/cloudflare-stability/scripts/*.sh`
- Repo guidance docs: `README.md`, `DEPLOYMENT.md`, `docs/state-of-play.md`, `agent/AGENTS.md`

Primary constraints today:
- No unified local developer command surface (`make`, `just`, or npm task runner at repo root).
- Push/deploy auth is still environment-sensitive unless bootstrapped.
- SEO/content checks are mostly manual.
- Worker/API contract checks do not run against production responses in CI with strong assertions.

## Assessment: What Tooling This Repo Needs

## 1) Highest-impact additions (do first)

1. Repo task runner (`Makefile` or `justfile`)
- Why: Removes command drift and cuts repeated operator error.
- Add canonical commands:
  - `lint-html`
  - `test-worker`
  - `check-all`
  - `deploy-worker`
  - `smoke-api`
  - `release-log`
  - `bootstrap-git-auth`
- Impact: Faster onboarding and fewer failed releases.

2. Release orchestration script
- Why: Current release spans Pages push + Worker deploy + runtime smoke + evidence log.
- Add `tools/release.sh` to run the full sequence with clear stop-on-fail behavior.
- Impact: One command to reach a reproducible “release complete” state.

3. Pre-push guardrails
- Why: Catch failures before CI cycle time.
- Add lightweight hook (`tools/install-hooks.sh`) and `pre-push` checks:
  - `npx -y htmlhint "site/**/*.html"`
  - `npm --prefix workers/communications run test`
- Impact: Fewer broken pushes and less CI churn.

## 2) Next wave (high value)

1. Root-level package scripts as a standard interface
- Why: Most contributors expect `npm run ...` at repo root.
- Add root `package.json` with scripts that proxy existing commands.
- Impact: Lower friction for contributors and agents.

2. Secrets/config health checker
- Why: Runtime failures often come from missing secrets (`FOURTH_WALL_API_KEY`, etc.).
- Add `tools/check-runtime-config.sh`:
  - verifies required Wrangler auth
  - validates secret presence
  - validates route attachments
- Impact: Detects deploy blockers before production smoke.

3. Sitemap/SEO maintenance automation
- Why: `sitemap.xml` freshness and heading/canonical consistency are manual.
- Add script for:
  - sitemap `lastmod` update
  - page metadata consistency checks
- Impact: Less manual SEO drift and cleaner releases.

## 3) Operational hardening

1. Production contract smoke in CI
- Why: Current scheduled monitor checks behavior, but CI release path can still miss runtime drift.
- Add optional post-deploy job that validates key API contracts and fails loudly.
- Impact: Earlier detection of misconfigured runtime.

2. Structured release evidence artifact
- Why: `docs/operations/release-ops-log.md` is useful but manually appended.
- Emit JSON/markdown artifact per release with:
  - commit SHA
  - deploy timestamp
  - health/storefront/status codes
- Impact: Better incident forensics.

3. Dependency/update automation
- Why: Worker/tooling versions will drift.
- Add Dependabot or Renovate for npm + GitHub Actions.
- Impact: Security and compatibility hygiene with less manual effort.

## Suggested Implementation Sequence

1. Add `Makefile` (or `justfile`) and normalize commands.
2. Add `tools/release.sh` to chain push/deploy/smoke/log.
3. Add hook installer + pre-push checks.
4. Add root `package.json` script façade.
5. Add runtime config checker and sitemap/meta checker.
6. Add post-deploy contract CI job and release artifacts.

## Minimal Success Criteria

Tooling is “efficient enough” when:
- A new operator can run one bootstrap command and one release command.
- Local pre-push checks match CI checks.
- Worker deploy prerequisites are validated before deploy.
- Release evidence is generated automatically.
- Runtime regressions are detected within minutes, not after user reports.
