# Release Ops Log

Deployment and runtime verification evidence entries.

Historical note: entries before the 2026-03-16 repo refactor may refer to the old directory layout.

## 2026-03-05T00:31:00Z
- Commit: `4bee96e`
- Checks:
  - `npm run check` (root)
  - `GET https://stexpedite.press/api/health` -> `200` / `ok:true`
  - `GET https://stexpedite.press/api/storefront` -> `200` / `ok:true`
  - `GET https://stexpedite.press/api/projects` -> `200` / `ok:true`
  - synthetic negative probes for `POST /api/updates`, `POST /api/contact`, `POST /api/submit` -> `400` / `ok:false`
- Scope: stabilization deploy verification + books/projects wiring confirmation

## 2026-02-21T01:56:13Z
- Commit: `249c45e`
- Checks:
  - runtime audit script executed
  - API smoke script executed
- Scope: Cloudflare Worker + D1 + API runtime

## 2026-02-21T01:59:13Z
- Commit: `249c45e`
- Checks:
  - runtime audit script executed
  - API smoke script executed
- Scope: Cloudflare Worker + D1 + API runtime

## 2026-02-21T02:04:27Z
- Commit: `249c45e`
- Checks:
  - runtime audit script executed
  - API smoke script executed
- Scope: Cloudflare Worker + D1 + API runtime

## 2026-02-23T00:33:23Z
- Commit: `52e242d`
- Checks:
  - worker test suite
  - HTML lint on generated site output
  - ontology JSON parse validation
- Scope: Worker hardening update (error envelope, rate limit, Turnstile hook), monitor and docs sync

## 2026-02-23T03:26:13Z
- Commit: `cd701f1`
- Checks:
  - runtime audit script executed
  - API smoke script executed
- Scope: Cloudflare Worker + D1 + API runtime
