# Internal Skills Taxonomy

This folder contains internal operational skills and tools used by repo scripts and runbooks.

Repo-scoped Codex skills for day-to-day agent invocation live under `.agents/skills/`.

## Taxonomy

- `internal/agent/skills/ops/`
  - runbooks, automation, and checks for deployment/runtime stability
- `internal/agent/skills/security/`
  - reserved for abuse controls and security response tooling
- `internal/agent/skills/content/`
  - reserved for editorial/site content workflows

## Active Internal Skill

- `internal/agent/skills/ops/cloudflare-stability/`
  - Purpose: keep Cloudflare Worker, D1, and API runtime stable and verifiable.
  - Includes executable scripts and reference thresholds/runbooks.

## Repo-Scoped Codex Skills

- `.agents/skills/docs-assay/`
- `.agents/skills/static-site-qa/`
- `.agents/skills/cloudflare-release-ops/`
- `.agents/skills/worker-contract-review/`

## Structure Contract

Every internal skill directory should include:

- `SKILL.md` for usage guidance
- `scripts/` for automations when needed
- `references/` for policy thresholds or operating procedures when needed

When adding or changing scripts, keep scripts shell-safe with `set -euo pipefail` where compatible, prefer read-only checks by default, and document inputs, outputs, and side effects in `SKILL.md`.
