# Communications Worker

Cloudflare Worker for the St. Expedite Press API surface.

## Routes

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

## Local Commands

From repo root:

```bash
npm run dev:worker
npm run test:worker
npm run deploy:worker
```

Direct worker commands:

```bash
cd apps/communications-worker
npm run test
npm run deploy
```

## Runtime Dependencies

- Resend for contact and submission email delivery
- Stripe Checkout for donations
- D1 for updates, projects data, contact logs, and rate limiting
- Optional Turnstile validation on POST routes
- Fourthwall storefront API for merch data

## First-party browser origins

Browser CORS permits `stexpedite.press`, `www.stexpedite.press`, the
St. Expedite Press GitHub Pages origin used by RICE
(`https://st-expedite-press.github.io`), and localhost/loopback development
origins. RICE submits updates with source `rice-magazine-seed`; no cookie or
credential sharing is enabled.

## Contract Files

- implementation: `apps/communications-worker/src/index.ts`
- config: `apps/communications-worker/wrangler.toml`
- contract: `apps/communications-worker/openapi.yaml`
- migrations: `apps/communications-worker/migrations/`
- tests: `apps/communications-worker/test/index.test.ts`
