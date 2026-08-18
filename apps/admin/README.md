# St. Expedite admin

A minimal, single-owner Astro static app for reading data the backend Worker
already collects but has no UI for: `updates_signups`, `contact_submissions`,
and `donations`. It builds to `dist/` and calls the backend's `/api/admin/*`
routes on `https://stexpedite.press` — it never touches D1 directly.

Auth is magic-link email, not a password: enter the owner address, and if it
matches the Worker's `OWNER_EMAIL`, a one-time sign-in link is emailed via the
existing Resend integration. Clicking it sets an `HttpOnly`/`Secure` session
cookie scoped to `.stexpedite.press` (shared across this app's subdomain and
the API's), which every dashboard fetch sends via `credentials: "include"`.
There is no visitor-facing account system anywhere in this repo — this is
strictly a one-person admin surface.

```bash
npm run build:admin
npm run dev:admin
```

The source is `public/` (Astro's static-asset convention) plus
`src/pages/index.astro`. No shared package dependency — this app talks to the
Worker over plain `fetch`, not `packages/chat-client`. Live at
`https://admin.stexpedite.press` (Cloudflare Pages project
`stexpedite-admin`); `deploy-admin.yml` validates PRs and deploys on manual
dispatch, same pattern as chat/rice/stex.
