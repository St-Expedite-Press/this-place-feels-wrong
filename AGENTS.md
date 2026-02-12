# Agent Protocols (Repo-wide)

These are standing instructions for any agent working in this repository.

## 1) First read: ontology (token-minimization)

Before scanning the repo, open:

- `docs/ontology/project-ontology.json`

Use it to map a question/task to:
- the exact page(s) under `site/`
- the exact worker file(s) under `workers/`
- the relevant deployment workflow(s) under `.github/`

Only open additional files when the ontology points you to them.

## 2) Repository invariants (do not break deploy)

- **GitHub Pages publishes `site/` only.** Do not move public files out of `site/` unless you also update `.github/workflows/deploy-pages.yml`.
- Keep URLs stable: pages should continue to resolve at the domain root (`/contact.html`, `/assets/...`).
- Do not add secrets to git.
  - `.env` is local-only and ignored.
  - Worker secrets belong in Cloudflare (e.g. `RESEND_API_KEY`).

## 3) Working rules

- Prefer `rg` searches over opening many files.
- When asked “how X works,” cite the exact file path(s) and the minimal relevant lines/sections.
- Keep changes scoped:
  - Site UI changes → `site/`
  - Worker/API changes → `workers/communications/`
  - Docs → `docs/` and top-level markdown
- If you add/rename pages or endpoints, update:
  - `docs/ontology/project-ontology.json`
  - `docs/state-of-play.md`

## 4) Sensitive data handling

- Never print or commit API keys, tokens, or email secrets.
- Treat `.env` as sensitive even if gitignored.

## 5) Quick map

- Public site: `site/`
- Deploy workflow: `.github/workflows/deploy-pages.yml`
- Worker: `workers/communications/src/index.ts`
- Email pipeline doc: `docs/infrastructure/email-worker-setup.md`
- Current “what to do next”: `docs/state-of-play.md`
