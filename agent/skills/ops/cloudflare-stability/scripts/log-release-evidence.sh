#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../../../../.." && pwd)"
LOG_FILE="$ROOT_DIR/docs/operations/release-ops-log.md"

mkdir -p "$(dirname "$LOG_FILE")"

ts_utc="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
head_sha="$(cd "$ROOT_DIR" && git rev-parse --short HEAD)"

if [ ! -f "$LOG_FILE" ]; then
  cat > "$LOG_FILE" <<'EOF'
# Release Ops Log

Deployment and runtime verification evidence entries.
EOF
fi

cat >> "$LOG_FILE" <<EOF

## $ts_utc
- Commit: \`$head_sha\`
- Checks:
  - runtime audit script executed
  - API smoke script executed
- Scope: Cloudflare Worker + D1 + API runtime
EOF

echo "[log-release-evidence] appended entry to $LOG_FILE"
