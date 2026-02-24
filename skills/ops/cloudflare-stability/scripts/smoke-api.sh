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

echo "[smoke-api] health"
curl -fsS "$BASE_URL/api/health" | rg '"ok":true'

echo "[smoke-api] updates"
post_with_retry "$BASE_URL/api/updates" "{\"email\":\"smoke+$ts@example.com\",\"source\":\"skill-smoke\"}" | rg '"ok":true'

if [ "$FULL_MODE" -eq 1 ]; then
  echo "[smoke-api] contact"
  post_with_retry "$BASE_URL/api/contact" "{\"reason\":\"Smoke\",\"email\":\"smoke+$ts@example.com\",\"message\":\"contact smoke\"}" | rg '"ok":true'

  echo "[smoke-api] submit"
  post_with_retry "$BASE_URL/api/submit" "{\"email\":\"smoke+$ts@example.com\",\"note\":\"submit smoke\"}" | rg '"ok":true'
fi

echo "[smoke-api] PASS"
