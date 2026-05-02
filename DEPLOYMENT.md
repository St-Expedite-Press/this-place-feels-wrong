# Deployment

This repository deploys in two parts:

- Cloudflare Pages publishes the static Astro artifact from `apps/web/dist/`.
- Cloudflare Workers runs `apps/communications-worker/` for `/api/*`.

## Static Site

- Source: `apps/web/src/`
- Authored assets: `apps/web/public/assets/`
- Build command: `npm run build`
- Output artifact: `apps/web/dist/`
- Workflow: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` or manual dispatch

Deploy manually:

```bash
npm run deploy:web
```

## Communications Worker

- Project: `apps/communications-worker/`
- Worker name: `stexpedite-communications`
- Contract: `apps/communications-worker/openapi.yaml`
- Routes:
  - `stexpedite.press/api/*`
  - `www.stexpedite.press/api/*`

Runtime bindings and secrets:

- `DB`: Cloudflare D1 binding for updates, projects, contact logs, and rate limits
- `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`: contact and submission email
- `STRIPE_SECRET_KEY`: donation Checkout sessions
- `FOURTH_WALL_API_KEY`: storefront data
- `TURNSTILE_SECRET`: optional POST-route verification
- `UPDATES_IMPORT_TOKEN`: authenticated updates import
- `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`: optional rate-limit tuning

Deploy manually:

```bash
npm run deploy:worker
```

## Local Setup

```bash
sh agent/tools/bootstrap-git-auth.sh
sh agent/tools/install-hooks.sh
npm run sync:worker-dev-vars
```

`npm run dev:worker` syncs supported root `.env` keys into `apps/communications-worker/.dev.vars` before starting Wrangler.

## Verification

Repo verification:

```bash
npm run check:tooling-integrity
npm run assets:check
npm run check
npm run runtime:config
```

Runtime verification:

```bash
npm run runtime:audit
npm run smoke:api
npm run smoke:api:full
npm run release:log
```

Release orchestration:

```bash
npm run release:dry-run
npm run release
```

## Notes

- Wrangler uses `CLOUDFLARE_API_KEY` and `CLOUDFLARE_EMAIL` in this repo's current deploy pattern.
- Do not commit `.env`, `.dev.vars`, `.wrangler/`, `.claude/`, or local release scratch output.
- Existing D1 migration files are append-only history and should not be edited.
