# State of Play

Repo snapshot for the current Astro app, Cloudflare Worker, and agent tooling layout.

## Active Layout

- Web source: `apps/web/src/`
- Web authored assets: `apps/web/public/assets/`
- Web build output: `apps/web/dist/`
- Communications Worker: `apps/communications-worker/`
- Canonical media sources: `assets/source/`
- Exportable brand package: `branding/`
- All agent infrastructure: `agent/` (skills, ops, tools, kits, AGENT.md)
- Archived product material: `archive/`

## Runtime Contract

Public pages remain rooted at the site domain:

- `/`
- `/books`
- `/about`
- `/contact`
- `/donate`
- `/donate/thanks`
- `/submit`
- `/gallery`
- `/lab`
- `/services`

API routes remain under `/api/*`:

- `GET /api/health`
- `GET /api/storefront`
- `GET /api/projects`
- `POST /api/contact`
- `POST /api/submit`
- `POST /api/donate/session`
- `POST /api/updates`
- `POST /api/updates/import`
- `POST /api/updates/unsubscribe`

## Build And Validation

- Primary build: `npm run build`
- Primary validation: `npm run check`
- Asset sync check: `npm run assets:check`
- Runtime config check: `npm run runtime:config`
- Runtime audit: `npm run runtime:audit`
- Production smoke: `npm run smoke:api`
- Build artifact is generated into `apps/web/dist/` from source in `apps/web/src/`.

## Agent Workflow

- `agent/AGENT.md` is the canonical instruction file for all agents.
- `CLAUDE.md` imports `agent/AGENT.md` and contains only Claude-specific notes.
- `.claude/` and `CLAUDE.local.md` remain local-only.
- Repo-scoped Codex skills live under `agent/skills/`.
- Operational runbooks live under `agent/ops/`.
- Shell tools live under `agent/tools/`.

## Historical Notes

- The homepage is generated from source instead of copied from a static exception.
- The former checked-in public output snapshot was removed from `archive/site-legacy/`; recover it from git history if needed.
- The former `workers/communications/` project lives in `apps/communications-worker/`.
- The former `agent/` subtree was at `internal/agent/` and is now at `agent/`.
- The former `.agents/skills/` subtree is now at `agent/skills/`.
- `AGENTS.md` at the root is replaced by `agent/AGENT.md`.
- Repository licensing is proprietary.
