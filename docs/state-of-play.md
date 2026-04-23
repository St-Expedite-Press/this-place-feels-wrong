# State of Play

Repo snapshot updated for the `apps/` refactor.

## Active Layout

- Web source: `apps/web/src/`
- Web build output: `apps/web/dist/`
- Communications Worker: `apps/communications-worker/`
- Internal maintenance tooling: `internal/agent/`
- Archived legacy material: `archive/`

## Current Runtime Contract

Public pages remain rooted at the site domain:

- `/`
- `/books`
- `/about`
- `/donate`
- `/submit`
- `/gallery`
- `/lab`
- `/services`

API routes remain unchanged:

- `GET /api/health`
- `GET /api/storefront`
- `GET /api/projects`
- `POST /api/contact`
- `POST /api/submit`
- `POST /api/updates`
- `POST /api/updates/import`

## Build And Validation

- Primary build: `npm run build`
- Primary validation: `npm run check`
- Build artifact is generated into `apps/web/dist/` from source in `apps/web/src/`
- Generated output is cleaned on each build to prevent stale files from persisting

## Notable Refactor Outcomes

- The homepage is now generated from source instead of copied from a static exception.
- The former checked-in public output tree now lives in `archive/site-legacy/`.
- The former `workers/communications/` project now lives in `apps/communications-worker/`.
- The former `agent/` subtree now lives in `internal/agent/`.
- Repository licensing is now explicitly proprietary.
