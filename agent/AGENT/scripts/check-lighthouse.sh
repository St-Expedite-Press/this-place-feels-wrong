#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"
require_cmd python3

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")
[ -d "$DIST_DIR" ] || fail "Dist directory not found: $DIST_DIR. Run build first."

if ! command -v npx >/dev/null 2>&1; then
  log "npx not installed; skipping Lighthouse"
  exit 0
fi

if ! command -v google-chrome >/dev/null 2>&1 && ! command -v chromium-browser >/dev/null 2>&1 && [ -z "${CHROME_PATH:-}" ]; then
  log "Chrome/Chromium not found; set CHROME_PATH to enable Lighthouse"
  exit 0
fi

HOST=${HOST:-127.0.0.1}
PORT=${PORT:-4175}
URL="http://$HOST:$PORT/index.html"
OUT_DIR="$PROJECT_DIR/.reports"
OUT_FILE="$OUT_DIR/lighthouse.json"
mkdir -p "$OUT_DIR"

(
  cd "$DIST_DIR"
  python3 -m http.server "$PORT" --bind "$HOST" >/dev/null 2>&1 &
  SERVER_PID=$!
  trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT INT TERM
  sleep 2
  npx -y lighthouse "$URL" --quiet --output json --output-path "$OUT_FILE" --chrome-flags="--headless --no-sandbox"
)

log "Lighthouse report written to $OUT_FILE"
