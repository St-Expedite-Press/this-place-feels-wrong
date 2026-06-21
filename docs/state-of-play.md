# State of Play

Repo snapshot for the current Astro app, Cloudflare Worker, and agent tooling layout.

## Active Layout

- Web source: `apps/web/src/`
- Web authored assets: `apps/web/public/assets/`
- Web build output: `apps/web/dist/`
- Communications Worker: `apps/communications-worker/`
- Canonical media sources: `assets/source/`
- Generated asset inventories: `assets/manifest.json`, `assets/manifest.txt`
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
- `POST /api/stripe/webhook`
- `POST /api/updates`
- `POST /api/updates/import`
- `POST /api/updates/unsubscribe`

## Build And Validation

- Primary build: `npm run build`
- Primary validation: `npm run check`
- Tooling integrity check: `npm run check:tooling-integrity`
- Asset sync/inventory check: `npm run assets:check`
- Institutional seal derivative build: `npm run identity:build`
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

## Layout Architecture

Two layouts, one for interior/task pages and one for portal-only pages:

- `apps/web/src/layouts/Base.astro` — shared interior/task shell: `<Head />`, `<HeroBar />`, `<SiteHeader />`, page-intro section, standardized `.page-content` flow, `<slot />`, `<Footer />`. Used by books, about, contact, donate, donate/thanks, submit, gallery, lab, and services.
- `apps/web/src/layouts/BasePortal.astro` — portal-only shell: `<Head />`, `<HeroBar />`, `.texture--grain`, `.cursor-glow`, `<slot />`. Used by `index.astro` and `404.astro`.

Shared interior primitives live in `layout.css` and `components.css`: `.page-content`, `.section-block`, `.section-header`, `.section-grid`, `.editorial-card`, `.quiet-panel`, and `.section-actions`. Page-specific styles may alter texture and domain behavior, but should not redefine basic page rhythm or card anatomy.

See `apps/web/src/layouts/README.md` for full prop documentation.

## Font Delivery

Fonts are self-hosted. No Google Fonts CDN dependency.

- Font files: `apps/web/public/assets/fonts/` (12 woff2 files: Cinzel latin/latin-ext, Cormorant Garamond normal/italic across 4 unicode subsets)
- `@font-face` declarations: `apps/web/public/assets/css/fonts.css`
- Referenced via `site.fontStylesheet = "/assets/css/fonts.css"` in `site.json`

## Institutional Identity

- Preserved seal source: `assets/source/img/identity/expedite-seal-source-2026.png`
- Reproducible derivative generator: `scripts/generate-identity-assets.py`
- Homepage: generated motion-ready distressed seal inside the existing circular portal frame; reveal, breathing, and rare signal faults are homepage-only and reduce to a static mark
- Default social preview: `assets/img/identity/expedite-seal-og-1200x630.webp`
- Browser favicon: existing `assets/img/favicon.svg`, intentionally unchanged
- Flying crow assets remain available as secondary ritual imagery.

## Historical Notes

- The homepage is generated from source instead of copied from a static exception.
- The former checked-in public output snapshot was removed from `archive/site-legacy/`; recover it from git history if needed.
- The former `workers/communications/` project lives in `apps/communications-worker/`.
- The former `agent/` subtree was at `internal/agent/` and is now at `agent/`.
- The former `.agents/skills/` subtree is now at `agent/skills/`.
- `AGENTS.md` at the root is replaced by `agent/AGENT.md`.
- Repository licensing is proprietary.
