#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"

usage() {
  cat <<USAGE
Usage:
  sh agent/AGENT/scripts/scaffold-static.sh <target-dir> [site-name]
USAGE
}

[ "$#" -ge 1 ] || {
  usage
  exit 1
}

TARGET_DIR=$1
SITE_NAME=${2:-"Static Site"}

if [ -e "$TARGET_DIR" ] && [ "$(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 2>/dev/null | wc -l | tr -d ' ')" != "0" ]; then
  fail "Target directory exists and is not empty: $TARGET_DIR"
fi

mkdir -p "$TARGET_DIR"
cp -R "$TEMPLATE_ROOT/." "$TARGET_DIR/"

if command -v rg >/dev/null 2>&1; then
  rg -l '__SITE_NAME__' "$TARGET_DIR" | while IFS= read -r file; do
    sed -i "s/__SITE_NAME__/$SITE_NAME/g" "$file"
  done
else
  find "$TARGET_DIR" -type f | while IFS= read -r file; do
    if grep -q '__SITE_NAME__' "$file"; then
      sed -i "s/__SITE_NAME__/$SITE_NAME/g" "$file"
    fi
  done
fi

log "Scaffolded static project at $TARGET_DIR"
log "Next: sh agent/AGENT/scripts/dev.sh $TARGET_DIR"
