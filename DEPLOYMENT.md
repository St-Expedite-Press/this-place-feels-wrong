# Deployment (GitHub Pages + Cloudflare Worker)

This repo deploys a static site via GitHub Pages, with Cloudflare in front. `/api/*` requests are routed to a Cloudflare Worker for communications.

## 1) Responsibility split (Pages vs Worker)

GitHub Pages publishes static site assets only:
- Source path in repo: `site/`
- Workflow: `.github/workflows/deploy-pages.yml`
- Artifact behavior: `rsync -a --delete site/ dist/` then publish `dist/`

Cloudflare Worker handles dynamic API endpoints only:
- Worker project: `workers/communications/`
- Worker name: `stexpedite-communications`
- API surface: `POST /api/contact`, `POST /api/submit`, `POST /api/updates`

## 2) Required runtime prerequisites

Cloudflare:
- Zone: `stexpedite.press`
- Required route: `stexpedite.press/api/*` -> `stexpedite-communications`
- Optional conditional route: `www.stexpedite.press/api/*` if `www` is directly served before redirect

Worker runtime configuration:
- Secret: `RESEND_API_KEY`
- Vars: `FROM_EMAIL`, `TO_EMAIL` (from `workers/communications/wrangler.toml`)
- D1 binding: `DB` (currently bound to `stexpedite-updates`; required for updates capture persistence)

Important DNS/proxy rule:
- Hostnames used by Worker Routes must be proxied (orange cloud).
- Mail/auth records (MX, SPF, DKIM, DMARC) remain DNS-only (gray cloud).

## 3) Deploy sequence (operator runbook)

### A) Deploy static Pages content

1. Push changes to `main`.
2. Confirm workflow `.github/workflows/deploy-pages.yml` completes.
3. Confirm custom domain remains set to `stexpedite.press` and matches `site/CNAME`.

### B) Deploy Worker/API code

```bash
cd workers/communications
npx -y wrangler whoami
npx -y wrangler deploy
```

### C) Verify secret and route attachments

```bash
cd workers/communications
npx -y wrangler secret list
```

Required checks:
- `RESEND_API_KEY` appears in secret list.
- Dashboard route `stexpedite.press/api/*` targets `stexpedite-communications`.
- If needed, `www.stexpedite.press/api/*` is also attached.

## 4) D1 status and lifecycle

Current configured database:
- Name: `stexpedite-updates`
- Binding: `DB`
- Migration applied: `workers/communications/migrations/0001_updates_signups.sql`

Check current D1 status:

```bash
cd workers/communications
npx -y wrangler d1 list
```

If binding is removed or missing, expected fallback:
- `POST /api/updates` returns `500` with `{ "ok": false, "error": "Updates list not configured" }`.

## 5) Post-deploy smoke checks

Contact success path:

```bash
curl -i -X POST "https://stexpedite.press/api/contact" \
  -H "content-type: application/json" \
  --data '{"reason":"Test","email":"test@example.com","message":"Hello"}'
```

Submission success path:

```bash
curl -i -X POST "https://stexpedite.press/api/submit" \
  -H "content-type: application/json" \
  --data '{"email":"test@example.com","note":"Hello"}'
```

Updates path (documents both valid outcomes):

```bash
curl -i -X POST "https://stexpedite.press/api/updates" \
  -H "content-type: application/json" \
  --data '{"email":"test@example.com","source":"deploy-smoke"}'
```

Expected:
- With D1 bound: `200` and `{ "ok": true }`
- Without D1 bound: `500` and `{ "ok": false, "error": "Updates list not configured" }`

## 6) Reference docs

- Infrastructure details: `docs/infrastructure/email-worker-setup.md`
- D1 database reference: `docs/infrastructure/d1-database.md`
- Current snapshot + verification matrix: `docs/state-of-play.md`
- Ontology (machine): `docs/ontology/project-ontology.json`
- Ontology (human): `docs/ontology/project-ontology.md`
