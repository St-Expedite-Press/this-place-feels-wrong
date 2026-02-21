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
- API surface: `GET /api/health`, `POST /api/contact`, `POST /api/submit`, `POST /api/updates`

## 2) Required runtime prerequisites

Cloudflare:
- Zone: `stexpedite.press`
- Required route: `stexpedite.press/api/*` -> `stexpedite-communications`
- `www` policy: redirect-only to apex, no `www` API route required under current policy

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

Health path:

```bash
curl -i "https://stexpedite.press/api/health"
```

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
- Health: `200` and JSON with `ok: true`
- With D1 bound: `200` and `{ "ok": true }`
- Without D1 bound: `500` and `{ "ok": false, "error": "Updates list not configured" }`

Repo-local automation (recommended):

```bash
bash skills/ops/cloudflare-stability/scripts/runtime-audit.sh
bash skills/ops/cloudflare-stability/scripts/smoke-api.sh --full
bash skills/ops/cloudflare-stability/scripts/log-release-evidence.sh
```

## 6) Reference docs

- Infrastructure details: `docs/infrastructure/email-worker-setup.md`
- D1 database reference: `docs/infrastructure/d1-database.md`
- Incident runbook: `docs/operations/incident-runbook.md`
- Release evidence log: `docs/operations/release-ops-log.md`
- Current snapshot + verification matrix: `docs/state-of-play.md`
- Ontology (machine): `docs/ontology/project-ontology.json`
- Ontology (human): `docs/ontology/project-ontology.md`
- Ops skill tooling: `skills/ops/cloudflare-stability/`
- Scheduled health monitor workflow: `.github/workflows/api-health-monitor.yml`
