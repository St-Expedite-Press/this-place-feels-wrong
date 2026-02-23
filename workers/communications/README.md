# Communications Worker

Cloudflare Worker that powers form submissions for this site:

- `GET /api/health` - lightweight runtime status probe
- `POST /api/contact` - contact form submissions (sends branded HTML + plain-text fallback via Resend)
- `POST /api/submit` - submissions/inquiries (sends branded HTML + plain-text fallback via Resend)
- `POST /api/updates` - capture an updates/signup email list (stores in D1 if configured; does not send email)

OpenAPI contract:
- `workers/communications/openapi.yaml`

The site is hosted on GitHub Pages; this Worker is meant to be deployed on Cloudflare and routed for `stexpedite.press/api/*`.

Current production route:
- `stexpedite.press/api/*` -> `stexpedite-communications`

## Setup

1. Install Wrangler (once):
   - `npm i -g wrangler`

2. Authenticate:
   - `wrangler login`

3. Configure secrets (do not commit these):
   - `wrangler secret put RESEND_API_KEY`

4. Deploy:
   - `wrangler deploy`

5. In Cloudflare dashboard, add a route:
   - `stexpedite.press/api/*` -> this Worker

## Required bindings

Environment variables (set in `wrangler.toml` or Cloudflare dashboard):
- `FROM_EMAIL` (example: `St. Expedite Press <no-reply@stexpedite.press>`)
- `TO_EMAIL` (example: `editor@stexpedite.press`)
- `RATE_LIMIT_MAX` (default `20`; requests per window per IP+route)
- `RATE_LIMIT_WINDOW_MS` (default `60000`; rolling window in milliseconds)

Secret:
- `RESEND_API_KEY`
- `TURNSTILE_SECRET` (optional; when set, POST routes require a valid token)

D1 (optional, for `/api/updates`):
- Create a D1 database (Cloudflare dashboard or `wrangler d1 create ...`).
- Bind it to the Worker with binding name `DB`.
- Apply the migration in `migrations/0001_updates_signups.sql`.

## Notes

- The frontend falls back to `mailto:` if the Worker route is not configured or the request fails.
- Use `GET /api/health` for operational smoke checks after deploys.
- POST routes include Worker-side rate limiting and optional Turnstile validation.
- To export the updates list, query D1 from the Cloudflare dashboard, or use `wrangler d1 execute` (do not expose a public list endpoint).

## Testing

From `workers/communications/`:

```bash
npm install
npm run test
```

The suite validates:
- health route behavior
- contact success path
- structured 500 error envelope
- Turnstile-required rejection path
- rate-limit enforcement

## Email branding knobs

Branded HTML email styles are centralized in:
- `workers/communications/src/index.ts` (`const BRAND = { ... }`)

Primary customization fields:
- `name`
- `siteUrl`
- `logoUrl`
- `accent`, `accentSoft`
- `bg`, `panel`, `panelAlt`, `border`
- `text`, `textMuted`, `textSubtle`

Template entry points:
- `renderEmailShell(...)` (shared layout)
- `renderContactEditorHtml(...)`
- `renderSubmitEditorHtml(...)`
- `renderReceiptHtml(...)`
