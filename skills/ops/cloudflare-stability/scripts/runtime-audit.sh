#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../../../.." && pwd)"
WORKER_DIR="$ROOT_DIR/workers/communications"

echo "[runtime-audit] worker auth"
(cd "$WORKER_DIR" && npx -y wrangler whoami >/dev/null)

echo "[runtime-audit] secret check"
secret_json="$(cd "$WORKER_DIR" && npx -y wrangler secret list)"
if ! printf "%s" "$secret_json" | rg -q '"name":\s*"RESEND_API_KEY"'; then
  echo "Missing RESEND_API_KEY in Cloudflare Worker secrets." >&2
  exit 1
fi

echo "[runtime-audit] d1 presence"
d1_list="$(cd "$WORKER_DIR" && npx -y wrangler d1 list)"
if ! printf "%s" "$d1_list" | rg -q 'stexpedite-updates'; then
  echo "D1 database stexpedite-updates not found." >&2
  exit 1
fi

echo "[runtime-audit] d1 schema"
d1_schema="$(cd "$WORKER_DIR" && npx -y wrangler d1 execute stexpedite-updates --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")"
if ! printf "%s" "$d1_schema" | rg -q 'updates_signups'; then
  echo "D1 table updates_signups not found." >&2
  exit 1
fi

echo "[runtime-audit] health endpoint"
health_resp="$(curl -fsS https://stexpedite.press/api/health)"
if ! printf "%s" "$health_resp" | rg -q '"ok":true'; then
  echo "Health endpoint did not return ok:true." >&2
  exit 1
fi

echo "[runtime-audit] PASS"
