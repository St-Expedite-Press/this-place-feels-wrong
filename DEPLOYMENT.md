# Deployment

This repository contains four independent deployment units:

- St. Expedite Pages publishes `apps/stex/dist/`.
- RICE Pages publishes the allowlisted `apps/rice/_site/` artifact.
- Chat Pages publishes `apps/chat/dist/` after an explicit preview/release action.
- Cloudflare Workers runs `apps/backend/` for `/api/*`.

## St. Expedite site

- Source: `apps/stex/src/`
- Authored assets: `apps/stex/public/assets/`
- Build command: `npm run build`
- Output artifact: `apps/stex/dist/`
- Workflow: `.github/workflows/deploy-stex.yml`
- Trigger: push to `main` or manual dispatch
- Deploy auth: `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`
- GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

Deploy manually:

```bash
npm run deploy:web
```

## RICE and chat

```bash
npm run build:rice
npm run build:chat
npm run deploy:rice
npm run deploy:chat
```

Chat deployment is manual until the Pages project, custom hostname, strict
origin pairing, Worker secrets, and canary checks are complete.

## Backend Worker

- Project: `apps/backend/`
- Worker name: `stexpedite-communications`
- Contract: `apps/backend/openapi.yaml`
- Routes:
  - `stexpedite.press/api/*`
  - `www.stexpedite.press/api/*`

Runtime bindings and secrets:

- `DB`: Cloudflare D1 binding for updates, projects, contact logs, and rate limits
- `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`: contact and submission email
- `STRIPE_SECRET_KEY`: donation Checkout sessions
- `FOURTH_WALL_API_KEY`: storefront data
- `TURNSTILE_SECRET`: Turnstile verification (required before public chat release)
- `UPDATES_IMPORT_TOKEN`: authenticated updates import
- `HERMES_API_URL`, `HERMES_API_KEY`: isolated public-guide upstream only
- `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`: optional rate-limit tuning

Deploy manually:

```bash
npm run deploy:backend
```

Before deploying manuscript uploads, apply D1 migration
`apps/backend/migrations/0019_submission_attachments.sql`. Submission files
are limited to 10 MiB and forwarded as Resend attachments; only metadata is
written to D1.

## Local Setup

```bash
npm run run:bash -- scripts/bootstrap-git-auth.sh
npm run run:bash -- scripts/install-hooks.sh
npm run sync:backend-dev-vars
```

`npm run dev:backend` syncs allowlisted root `.env` keys into `apps/backend/.dev.vars` before starting Wrangler. Compatibility aliases remain available.

## Verification

Repo verification:

```bash
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

- Legacy Cloudflare global API key/email auth is removed from the supported Pages deploy path.
- Use a token with at least `Pages Write` for Pages deploys. If the same token is reused for Worker deploy/runtime commands, keep the required Worker/D1 permissions as well.
- Do not commit `.env`, `.dev.vars`, `.wrangler/`, `.claude/`, or local release scratch output.
- Existing D1 migration files are append-only history and should not be edited.
