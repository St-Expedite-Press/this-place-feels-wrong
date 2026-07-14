# Apps

Four independently deployable products live here:

- `stex/` — Astro site for `stexpedite.press`.
- `rice/` — static/Python editorial site for `rice.stexpedite.press`.
- `chat/` — full-page OpenUI-style public guide; uses the backend only.
- `backend/` — Cloudflare Worker, D1 migrations, and `/api/*` contract.

Shared transport and data contracts live in `../packages/`; agent identity and
capability policy live in `../agents/`.
