# St. Expedite backend

Cloudflare Worker for the St. Expedite Press API surface.

## Routes

- `GET /api/health`
- `GET /api/storefront`
- `GET /api/projects`
- `GET /api/works`
- `POST /api/chat` (constrained Hermes SSE bridge)
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
cd apps/backend
npm run test
npm run deploy
```

## Runtime Dependencies

- Resend for contact and submission email delivery
- Stripe Checkout for donations
- D1 for updates, projects data, contact logs, and rate limiting
- Optional Turnstile validation on POST routes
- Fourthwall storefront API for merch data
- Hermes API for public chatbot responses; `HERMES_API_URL` is the full HTTPS chat-completions endpoint and `HERMES_API_KEY` is a Worker secret

The chat route accepts only bounded, alternating `user`/`assistant` text messages, applies the shared D1 rate limit and optional Turnstile check, and streams Hermes SSE without exposing its credential. Do not point it at a privileged Hermes profile.

`POST /api/submit` accepts the existing JSON inquiry or a multipart manuscript
submission. Multipart delivery requires author metadata, consent, Turnstile,
and one allowlisted file up to 10 MiB. The editor email receives the attachment;
the submitter receives a reference receipt. D1 stores metadata only, never the
manuscript contents. Apply migration `0019_submission_attachments.sql` before
deploying this contract.

## First-party browser origins

Browser CORS permits `stexpedite.press`, `www.stexpedite.press`, the
St. Expedite Press GitHub Pages origin used by RICE
(`https://st-expedite-press.github.io`), and localhost/loopback development
origins. RICE submits updates with source `rice-magazine-seed`; no cookie or
credential sharing is enabled.

## Contract Files

- implementation: `apps/backend/src/index.ts`
- config: `apps/backend/wrangler.toml`
- contract: `apps/backend/openapi.yaml`
- migrations: `apps/backend/migrations/`
- tests: `apps/backend/test/index.test.ts`
