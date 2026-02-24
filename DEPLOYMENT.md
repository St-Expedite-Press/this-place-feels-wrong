# Deployment (GitHub Pages + Cloudflare Worker)

This repo deploys a static site via GitHub Pages, with Cloudflare in front. `/api/*` requests are routed to a Cloudflare Worker for communications.

## 1) Responsibility split (Pages vs Worker)

GitHub Pages publishes static site assets only:
- Source path in repo: `site/`
- Workflow: `.github/workflows/deploy-pages.yml`
- Quality gates: HTML lint + communications Worker tests
- Artifact behavior: `rsync -a --delete site/ dist/` then publish `dist/`

Cloudflare Worker handles dynamic API endpoints only:
- Worker project: `workers/communications/`
- Worker name: `stexpedite-communications`
- API surface: `GET /api/health`, `GET /api/storefront`, `POST /api/contact`, `POST /api/submit`, `POST /api/updates`
- API surface: `GET /api/health`, `GET /api/storefront`, `GET /api/projects`, `POST /api/contact`, `POST /api/submit`, `POST /api/updates`
- Cross-cutting controls: per-IP rate limiting on POST routes, optional Turnstile validation when `TURNSTILE_SECRET` is configured

## 2) Required runtime prerequisites

Cloudflare:
- Zone: `stexpedite.press`
- Required route: `stexpedite.press/api/*` -> `stexpedite-communications`
- `www` policy: redirect-only to apex, no `www` API route required under current policy

Worker runtime configuration:
- Secret: `RESEND_API_KEY`
- Secret: `FOURTH_WALL_API_KEY` (preferred) or `FW_STOREFRONT_TOKEN` (fallback alias) for `GET /api/storefront`
- Optional secret: `TURNSTILE_SECRET` (enforces Turnstile verification on POST routes)
- Vars: `FROM_EMAIL`, `TO_EMAIL` (from `workers/communications/wrangler.toml`)
- Rate-limit vars: `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`
- D1 binding: `DB` (currently bound to `stexpedite-updates`; required for updates capture persistence)

Important DNS/proxy rule:
- Hostnames used by Worker Routes must be proxied (orange cloud).
- Mail/auth records (MX, SPF, DKIM, DMARC) remain DNS-only (gray cloud).

## 3) Deploy sequence (operator runbook)

One-command orchestration (recommended after one-time setup):

```bash
sh agent/tools/release.sh
```

Dry-run preview:

```bash
sh agent/tools/release.sh --dry-run
```

One-time local setup:

```bash
sh agent/tools/bootstrap-git-auth.sh
sh agent/tools/install-hooks.sh
```

### A) Deploy static Pages content

1. Push changes to `main`.
2. Confirm workflow `.github/workflows/deploy-pages.yml` completes.
3. Confirm custom domain remains set to `stexpedite.press` and matches `site/CNAME`.

### B) Deploy Worker/API code

```bash
cd workers/communications
npx -y wrangler whoami
npx -y wrangler deploy --keep-vars
```

Important:
- Always use `--keep-vars` for this Worker. Without it, Wrangler may remove dashboard-defined plaintext variables that are not declared in `wrangler.toml` (for example `FOURTH_WALL_API_KEY`).

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
  - Also apply `workers/communications/migrations/0002_oncoming_projects.sql` for canonical project catalog.
  - Also apply `workers/communications/migrations/0003_oncoming_projects_presentation.sql` for cover image + popup description fields.
  - Also apply `workers/communications/migrations/0006_updates_signups_substack_schema.sql` for expanded subscriber profile/analytics fields.

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
- On POST bursts beyond limits: `429` and `{ "ok": false, "error": "Too many requests", "retryAfter": <seconds> }`

Repo-local automation (recommended):

```bash
bash agent/tools/check-runtime-config.sh
bash agent/skills/ops/cloudflare-stability/scripts/runtime-audit.sh
bash agent/skills/ops/cloudflare-stability/scripts/smoke-api.sh --full
bash agent/skills/ops/cloudflare-stability/scripts/log-release-evidence.sh
```

## 6) Reference docs

- Agent hub (tools + skills + protocols): `agent/`
- Infrastructure details: `docs/infrastructure/email-worker-setup.md`
- D1 database reference: `docs/infrastructure/d1-database.md`
- Incident runbook: `docs/operations/incident-runbook.md`
- Release evidence log: `docs/operations/release-ops-log.md`
- Current snapshot + verification matrix: `docs/state-of-play.md`
- Ontology (machine): `docs/ontology/project-ontology.json`
- Ontology (human): `docs/ontology/project-ontology.md`
- Ops skill tooling: `agent/skills/ops/cloudflare-stability/`
- Scheduled runtime monitor workflow: `.github/workflows/api-health-monitor.yml` (health + synthetic POST route checks)
