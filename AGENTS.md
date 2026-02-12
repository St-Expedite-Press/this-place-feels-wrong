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

## 4) Sensitive data handling

- Never print or commit API keys, tokens, or secrets.
- Treat `.env` as sensitive even if gitignored.

## 5) Quick map

- Public site: `site/`
- Deploy workflow: `.github/workflows/deploy-pages.yml`
- Worker: `workers/communications/src/index.ts`
- Email pipeline doc: `docs/infrastructure/email-worker-setup.md`
- State of play: `docs/state-of-play.md`
