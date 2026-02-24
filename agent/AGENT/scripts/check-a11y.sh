#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")
[ -d "$DIST_DIR" ] || fail "Dist directory not found: $DIST_DIR. Run build first."

FAIL_LOG=$(mktemp)
HTML_LIST=$(mktemp)
find "$DIST_DIR" -type f -name '*.html' | sort > "$HTML_LIST"

while IFS= read -r html; do
  [ -n "$html" ] || continue

  if ! grep -qi '<html[^>]*lang=' "$html"; then
    printf 'A11Y: missing html lang attr: %s\n' "$html" >> "$FAIL_LOG"
  fi

  if ! grep -qi '<title>' "$html"; then
    printf 'A11Y: missing title tag: %s\n' "$html" >> "$FAIL_LOG"
  fi

  if ! grep -qi '<h1[ >]' "$html"; then
    printf 'A11Y: missing h1: %s\n' "$html" >> "$FAIL_LOG"
  fi

  if grep -Eqi '<img[^>]*>' "$html" && ! grep -Eqi '<img[^>]*alt=' "$html"; then
    printf 'A11Y: image without alt likely present: %s\n' "$html" >> "$FAIL_LOG"
  fi
done < "$HTML_LIST"

if [ -s "$FAIL_LOG" ]; then
  cat "$FAIL_LOG"
  rm -f "$FAIL_LOG" "$HTML_LIST"
  fail "Accessibility heuristic checks failed"
fi

rm -f "$FAIL_LOG" "$HTML_LIST"
log "Accessibility heuristic checks passed"
