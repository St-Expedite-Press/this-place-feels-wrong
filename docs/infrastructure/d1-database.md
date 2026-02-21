# D1 Database Reference (`stexpedite-updates`)

Canonical reference for the Cloudflare D1 database used by the communications Worker.

## 1) Current database contract

- Cloudflare D1 database name: `stexpedite-updates`
- Database ID: `3bf56a30-c0cc-4b0f-a82a-caf740623af6`
- Worker binding name: `DB`
- Binding location: `workers/communications/wrangler.toml`
- Migration file: `workers/communications/migrations/0001_updates_signups.sql`

Worker behavior dependency:
- `POST /api/updates` writes to D1 when `DB` is bound.
- If `DB` is missing/unbound, Worker returns:
  - status `500`
  - `{ "ok": false, "error": "Updates list not configured" }`

## 2) Current schema

Application table:
- `updates_signups`

Columns:
- `email` (`TEXT PRIMARY KEY`)
- `first_seen_at` (`TEXT NOT NULL`)
- `last_seen_at` (`TEXT NOT NULL`)
- `source` (`TEXT`)
- `user_agent` (`TEXT`)
- `unsubscribed_at` (`TEXT`)

## 3) Verification commands

Run from `workers/communications/`.

Auth:

```bash
npx -y wrangler whoami
```

Database presence:

```bash
npx -y wrangler d1 list
```

Schema check (remote):

```bash
npx -y wrangler d1 execute stexpedite-updates --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Migration status (remote):

```bash
npx -y wrangler d1 migrations list stexpedite-updates --remote
```

## 4) Change procedure

When schema changes are required:
1. Add a new SQL migration file under `workers/communications/migrations/`.
2. Apply migrations remotely:
   - `npx -y wrangler d1 migrations apply stexpedite-updates --remote`
3. Deploy Worker:
   - `npx -y wrangler deploy`
4. Run smoke test:
   - `POST https://stexpedite.press/api/updates`

## 5) Documentation update requirements

When D1 name/ID/binding/schema/migration state changes, update:
- `docs/infrastructure/d1-database.md` (this file)
- `docs/infrastructure/email-worker-setup.md`
- `docs/state-of-play.md`
- `DEPLOYMENT.md`
- `docs/ontology/project-ontology.json` (if contracts/paths or maintenance pointers changed)

## 6) Data governance policy (current default)

Retention:
- Keep `updates_signups` records for 24 months rolling.
- Perform monthly cleanup of stale records older than retention window.

Unsubscribe handling:
- Use `unsubscribed_at` as the canonical opt-out marker.
- Do not reactivate unsubscribed rows unless there is explicit new opt-in.

Deletion requests:
- For verified deletion request, delete by email within 7 days.
- Record completion in operations log (date, actor, email hash or redacted reference).

Export/reporting:
- Generate monthly CSV export snapshot for operator review.
- Minimum fields: `email`, `first_seen_at`, `last_seen_at`, `source`, `unsubscribed_at`.

Suggested operator commands:

```bash
# Example retention cleanup (adjust date window as needed)
npx -y wrangler d1 execute stexpedite-updates --remote --command "DELETE FROM updates_signups WHERE last_seen_at < datetime('now','-24 months');"

# Example verified deletion by email
npx -y wrangler d1 execute stexpedite-updates --remote --command "DELETE FROM updates_signups WHERE email = 'user@example.com';"

# Example monthly export query
npx -y wrangler d1 execute stexpedite-updates --remote --command "SELECT email, first_seen_at, last_seen_at, source, unsubscribed_at FROM updates_signups ORDER BY last_seen_at DESC;"
```

Automation helper:
- Use `skills/ops/cloudflare-stability/scripts/runtime-audit.sh` before/after D1 maintenance tasks.
