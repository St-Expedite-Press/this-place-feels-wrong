# Communications Worker

Cloudflare Worker that powers form submissions for this site:

- `POST /api/contact` — contact form submissions
- `POST /api/submit` — submissions/inquiries (no file uploads)

The site is hosted on GitHub Pages; this Worker is meant to be deployed on Cloudflare and routed for `stexpedite.press/api/*`.

## Setup

1. Install Wrangler (once):

   `npm i -g wrangler`

2. Authenticate:

   `wrangler login`

3. Configure secrets (do **not** commit these):

   `wrangler secret put RESEND_API_KEY`

4. Deploy:

   `wrangler deploy`

5. In Cloudflare dashboard, add a route:

   `stexpedite.press/api/*` → this Worker

## Required bindings

Environment variables (set in `wrangler.toml` or Cloudflare dashboard):

- `FROM_EMAIL` (example: `St. Expedite Press <no-reply@stexpedite.press>`)
- `TO_EMAIL` (example: `editor@stexpedite.press`)

Secret:

- `RESEND_API_KEY`

## Notes

- The frontend falls back to `mailto:` if the Worker route is not configured or the request fails.
- For real spam protection, add Cloudflare Turnstile (optional) and validate tokens server-side.

