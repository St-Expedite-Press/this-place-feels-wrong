# Skills Taxonomy (Repo-local)

This folder contains repo-local operational skills and tools.

## Taxonomy

- `agent/skills/ops/`
  - Runbooks, automation, and checks for deployment/runtime stability.
- `agent/skills/security/`
  - Reserved for abuse controls and security response tooling.
- `agent/skills/content/`
  - Reserved for editorial/site content workflows.

## Active skills

- `agent/skills/ops/cloudflare-stability/`
  - Purpose: keep Cloudflare Worker + D1 + API runtime stable and verifiable.
  - Includes executable scripts and reference thresholds/runbooks.

## Structure contract

Every skill directory should include:
- `SKILL.md` (frontmatter + usage guidance)
- `scripts/` (automations; executable; idempotent where possible)
- `references/` (policy thresholds, operating procedures)

When adding or changing scripts:
- Keep scripts shell-safe (`set -euo pipefail`).
- Prefer read-only checks by default; explicit mutating actions should be opt-in.
- Document inputs, outputs, and side effects in `SKILL.md`.
