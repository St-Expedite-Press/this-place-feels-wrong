---
name: cloudflare-stability
description: Operate and stabilize the Cloudflare communications stack for this repository, including Worker runtime checks, D1 verification, API smoke tests, and release evidence logging. Use when validating or hardening `/api/*` availability, deploying Worker changes, or updating operations documentation.
---

# Cloudflare Stability

Operational skill for maintaining stable runtime behavior on:
- Cloudflare Worker: `stexpedite-communications`
- D1 database: `stexpedite-updates`
- Production host: `https://stexpedite.press`

## Scripts

- `scripts/runtime-audit.sh`
  - Read-only checks:
    - Wrangler auth
    - secret presence
    - D1 presence
    - D1 schema table presence
    - health endpoint response
- `scripts/smoke-api.sh`
  - Runs production API smoke checks for:
    - `/api/health`
    - `/api/updates`
    - optional contact/submit probe with explicit `--full` flag
- `scripts/log-release-evidence.sh`
  - Appends a timestamped release verification entry to:
    - `docs/operations/release-ops-log.md`

## References

- `references/thresholds.md`
  - Page/ticket thresholds and response targets.
- `references/incident-response.md`
  - Incident decision tree and rollback/rotation checklist.

## Usage

From repo root:

```bash
bash skills/ops/cloudflare-stability/scripts/runtime-audit.sh
bash skills/ops/cloudflare-stability/scripts/smoke-api.sh
bash skills/ops/cloudflare-stability/scripts/log-release-evidence.sh
```

Full smoke (includes contact/submit test payloads):

```bash
bash skills/ops/cloudflare-stability/scripts/smoke-api.sh --full
```
