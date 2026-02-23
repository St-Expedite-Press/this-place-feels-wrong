# Agent Protocols (Repo-wide)

Standing instructions for any agent working in this repository.

## 1) Token minimization: consult the ontology first

Before scanning the repo, open:
- `docs/ontology/project-ontology.json`

Use it to map a request to the exact files/endpoints involved. Only open additional files once the ontology points you to them.

## 2) Repo invariants (do not break deploy)

- GitHub Pages publishes `site/` only. Do not move public files out of `site/` unless you also update `.github/workflows/deploy-pages.yml`.
- Keep URLs stable: pages should continue to resolve at the domain root (e.g. `/contact.html`, `/assets/...`).
- Do not commit secrets.
  - `.env` is local-only and ignored.
  - Worker secrets belong in Cloudflare (e.g. `RESEND_API_KEY`).

## 3) Working rules

- Prefer `rg` searches over opening many files.
- When explaining "how X works", cite the exact file paths and the minimal relevant code sections.
- Keep changes scoped:
  - Site UI changes -> `site/`
  - Worker/API changes -> `workers/communications/`
  - Docs -> `docs/` and top-level Markdown
- If you add/rename pages, assets, or endpoints, update:
  - `docs/ontology/project-ontology.json`
  - `docs/state-of-play.md`
- If you change Worker bindings, D1 schema, or migrations, also update:
  - `docs/infrastructure/d1-database.md`
  - `docs/infrastructure/email-worker-setup.md`
  - `docs/state-of-play.md`

## 4) Sensitive data handling

- Never print or commit API keys, tokens, or secrets.
- Treat `.env` as sensitive even if gitignored.

## 5) Quick map

- Public site: `site/`
- Deploy workflow: `.github/workflows/deploy-pages.yml`
- Worker: `workers/communications/src/index.ts`
- Email pipeline doc: `docs/infrastructure/email-worker-setup.md`
- D1 database doc: `docs/infrastructure/d1-database.md`
- Incident runbook: `docs/operations/incident-runbook.md`
- Release ops log: `docs/operations/release-ops-log.md`
- Ops skills: `skills/ops/cloudflare-stability/`
- State of play: `docs/state-of-play.md`

## 6) Context engineering + token budget rules

Use these rules to minimize context load while keeping answers high quality.

### A) Work in budget tiers
- `quick` (default): one intent, 1-3 files, no broad repo scan.
- `standard`: one subsystem, up to ~8 files, only direct dependencies.
- `deep`: cross-subsystem or incident work; expand deliberately with checkpoints.

Escalate tiers only when blocked.

### B) Retrieval order (always)
1. Read `docs/ontology/project-ontology.json`.
2. Use `rg` to locate exact anchors/paths.
3. Open only the minimal file slices needed.
4. Expand to adjacent files only if evidence requires it.

Do not start with broad `cat`/full-file reads across many files.

### C) Build a compact working set
- Keep an explicit list of active files/anchors for the task.
- Remove files from the working set once decisions are finalized.
- Prefer file snippets/line ranges over entire files.

### D) Evidence before expansion
- If a claim is uncertain, run a targeted command (`rg`, one query, one file slice) first.
- Avoid speculative edits across duplicated files until one canonical pattern is confirmed.

### E) Output compression rules
- Report decisions, changed files, and validation results first.
- Cite only the minimal path/line evidence needed.
- Avoid repeating repo background that is already in ontology/state docs.

### F) Stop conditions
- If required context is missing after targeted retrieval, ask one precise question.
- If runtime state (Cloudflare/dashboard) differs from repo state, note the mismatch explicitly and separate:
  - repo-truth
  - runtime-truth
