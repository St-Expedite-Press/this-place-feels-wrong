#!/usr/bin/env sh
set -eu

FULL_MODE=0
if [ "${1:-}" = "--full" ]; then
  FULL_MODE=1
fi

BASE_URL="https://stexpedite.press"
ts="$(date +%s)"

post_with_retry() {
  url="$1"
  payload="$2"
  attempts=0
  max_attempts=3

  while [ "$attempts" -lt "$max_attempts" ]; do
    attempts=$((attempts + 1))
    resp="$(curl -sS -i -X POST "$url" -H "content-type: application/json" --data "$payload")"
    status="$(printf "%s" "$resp" | sed -n '1s/.* \([0-9][0-9][0-9]\).*/\1/p')"
    body="$(printf "%s" "$resp" | sed -n '/^\r$/,$p' | tail -n +2)"
    if [ "$status" = "200" ]; then
      printf "%s\n" "$body"
      return 0
    fi
    if [ "$attempts" -lt "$max_attempts" ]; then
      sleep "$attempts"
    fi
  done

  printf "%s\n" "$resp" >&2
  return 1
}

post_expect_status() {
  url="$1"
  payload="$2"
  expected_statuses="$3"

  resp="$(curl -sS -i -X POST "$url" -H "content-type: application/json" --data "$payload")"
  status="$(printf "%s" "$resp" | sed -n '1s/.* \([0-9][0-9][0-9]\).*/\1/p')"
  body="$(printf "%s" "$resp" | sed -n '/^\r$/,$p' | tail -n +2)"

  status_ok=1
  for expected_status in $expected_statuses; do
    if [ "$status" = "$expected_status" ]; then
      status_ok=0
      break
    fi
  done

  if [ "$status_ok" -ne 0 ]; then
    printf "%s\n" "$resp" >&2
    return 1
  fi

  printf "%s\n" "$body"
}

echo "[smoke-api] health"
curl -fsS "$BASE_URL/api/health" | rg '"ok":true'

echo "[smoke-api] storefront"
curl -fsS "$BASE_URL/api/storefront" | rg '"ok":true'

echo "[smoke-api] projects"
curl -fsS "$BASE_URL/api/projects" | rg '"ok":true'

echo "[smoke-api] donate negative"
post_expect_status "$BASE_URL/api/donate/session" '{"amount":"4"}' "400 403" | rg '"ok":false'

echo "[smoke-api] updates"
post_with_retry "$BASE_URL/api/updates" "{\"email\":\"smoke+$ts@example.com\",\"source\":\"skill-smoke\"}" | rg '"ok":true'

echo "[smoke-api] unsubscribe negative"
post_expect_status "$BASE_URL/api/updates/unsubscribe" '{"email":"not-an-email"}' "400 403" | rg '"ok":false'

if [ "$FULL_MODE" -eq 1 ]; then
  echo "[smoke-api] contact"
  post_with_retry "$BASE_URL/api/contact" "{\"reason\":\"Smoke\",\"email\":\"smoke+$ts@example.com\",\"message\":\"contact smoke\"}" | rg '"ok":true'

  echo "[smoke-api] submit"
  post_with_retry "$BASE_URL/api/submit" "{\"email\":\"smoke+$ts@example.com\",\"note\":\"submit smoke\"}" | rg '"ok":true'
fi

echo "[smoke-api] PASS"
