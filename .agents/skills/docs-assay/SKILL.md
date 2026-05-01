---
name: docs-assay
description: Audit and reconcile this repository's Markdown, OpenAPI, ontology, README, and agent-facing documentation. Use when docs may be stale after path, command, route, workflow, asset, or tooling changes, or when asked to perform repo-wide documentation cleanup.
---

# Docs Assay

## Workflow

1. Start from `README.md`, `docs/state-of-play.md`, and `docs/ontology/project-ontology.json`.
2. Inventory docs with `rg --files -g '*.md' -g '!node_modules' -g '!apps/web/dist'`.
3. Search for stale path and command patterns before editing:
   - `dist/site`
   - `build-site.mjs`
   - `check-generated-site.mjs`
   - removed shell wrappers such as `dev-web.sh`, `dev-worker.sh`, and `deploy-web.sh`
   - `workers/communications` outside explicit historical notes
4. Reconcile route lists against `apps/communications-worker/src/index.ts` and `apps/communications-worker/openapi.yaml`.
5. Update source-of-truth docs first, then small directory READMEs.
6. Verify every referenced local path exists unless it is explicitly historical archive material.

## Required Follow-Up

- If site routes, assets, or build paths changed, update `README.md`, `docs/state-of-play.md`, `docs/ontology/project-ontology.*`, and nearest app READMEs.
- If Worker routes or payloads changed, update `apps/communications-worker/openapi.yaml`, `apps/communications-worker/README.md`, and infrastructure docs.
- If agent workflows changed, update `AGENTS.md`, `CLAUDE.md`, `.agents/skills/**`, and `internal/agent/docs/**`.

## Validation

Run targeted searches after edits:

```bash
rg -n "dist/site|build-site|check-generated-site|dev-web\\.sh|dev-worker\\.sh|deploy-web\\.sh" README.md DEPLOYMENT.md docs internal apps scripts .github .githooks
npm run check:links
```
