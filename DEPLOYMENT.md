# Deployment

This repository deploys in two parts:

- static Pages artifact from `dist/site/`
- Cloudflare Worker from `apps/communications-worker/`

## Static Site

- Source: `apps/web/src/`
- Build command: `npm run build`
- Output artifact: `dist/site/`
- Workflow: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` or manual dispatch

GitHub Pages now uploads `dist/site/` directly. The old checked-in `site/` tree is archived and not part of deployment.

## Communications Worker

- Project: `apps/communications-worker/`
- Worker name: `stexpedite-communications`
- Routes:
  - `stexpedite.press/api/*`
  - `www.stexpedite.press/api/*`

Required runtime pieces:

- secret: `RESEND_API_KEY`
- D1 binding: `DB`

Optional runtime pieces:

- `FOURTH_WALL_API_KEY` or `FW_STOREFRONT_TOKEN`
- `TURNSTILE_SECRET`
- `UPDATES_IMPORT_TOKEN`

## Operator Commands

One-time local setup:

```bash
sh internal/agent/tools/bootstrap-git-auth.sh
sh internal/agent/tools/install-hooks.sh
```

Deploy Pages:

```bash
npm run deploy:web
```

Deploy Worker:

```bash
npm run deploy:worker
```

Release orchestration:

```bash
sh internal/agent/tools/release.sh --dry-run
sh internal/agent/tools/release.sh
```

## Verification

Repo verification:

```bash
npm run check
sh internal/agent/tools/check-runtime-config.sh
```

Runtime smoke:

```bash
sh internal/agent/skills/ops/cloudflare-stability/scripts/runtime-audit.sh
sh internal/agent/skills/ops/cloudflare-stability/scripts/smoke-api.sh --full
sh internal/agent/skills/ops/cloudflare-stability/scripts/log-release-evidence.sh
```

## Local Development

Web:

```bash
npm run dev:web
```

Worker:

```bash
npm run dev:worker
```

`npm run dev:worker` syncs supported keys from the repo root `.env` into `apps/communications-worker/.dev.vars` before starting Wrangler remote dev mode.
