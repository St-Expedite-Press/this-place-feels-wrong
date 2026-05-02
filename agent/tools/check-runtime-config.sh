#!/usr/bin/env sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
. "$script_dir/../lib/repo-root.sh"

repo_root="$(find_repo_root "$0")"
worker_dir="$repo_root/apps/communications-worker"
base_url="${BASE_URL:-https://stexpedite.press}"

echo "[runtime-config] wrangler auth"
(cd "$worker_dir" && npx -y wrangler whoami >/dev/null)

echo "[runtime-config] secret inventory"
secret_payload="$(cd "$worker_dir" && npx -y wrangler secret list)"

for secret_name in RESEND_API_KEY; do
  if ! printf "%s" "$secret_payload" | rg -q "\"name\":\\s*\"${secret_name}\""; then
    echo "Missing required secret: ${secret_name}" >&2
    exit 1
  fi
done

has_storefront_secret=0
has_stripe_secret=0
for secret_name in FOURTH_WALL_API_KEY FW_STOREFRONT_TOKEN STRIPE_SECRET_KEY TURNSTILE_SECRET; do
  if printf "%s" "$secret_payload" | rg -q "\"name\":\\s*\"${secret_name}\""; then
    if [ "$secret_name" = "FW_STOREFRONT_TOKEN" ]; then
      echo "[runtime-config] compatibility storefront secret present: ${secret_name}"
    else
      echo "[runtime-config] optional secret present: ${secret_name}"
    fi
    if [ "$secret_name" = "FOURTH_WALL_API_KEY" ] || [ "$secret_name" = "FW_STOREFRONT_TOKEN" ]; then
      has_storefront_secret=1
    fi
    if [ "$secret_name" = "STRIPE_SECRET_KEY" ]; then
      has_stripe_secret=1
    fi
  fi
done

if [ "$has_storefront_secret" -eq 0 ]; then
  echo "Warning: storefront secret FOURTH_WALL_API_KEY not found. /api/storefront is expected to fail until configured." >&2
fi

if [ "$has_stripe_secret" -eq 0 ]; then
  echo "Warning: Stripe secret not found. /api/donate/session is expected to fail until configured." >&2
fi

echo "[runtime-config] d1 inventory"
d1_payload="$(cd "$worker_dir" && npx -y wrangler d1 list)"
if ! printf "%s" "$d1_payload" | rg -q 'stexpedite-updates'; then
  echo "Missing D1 database stexpedite-updates." >&2
  exit 1
fi

echo "[runtime-config] health check"
health_payload="$(curl -fsS "$base_url/api/health")"
if ! printf "%s" "$health_payload" | rg -q '"ok":true'; then
  echo "Health endpoint is not returning ok:true" >&2
  exit 1
fi

echo "[runtime-config] PASS"
