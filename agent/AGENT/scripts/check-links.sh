#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")
[ -d "$DIST_DIR" ] || fail "Dist directory not found: $DIST_DIR. Run build first."

BROKEN_LOG=$(mktemp)
HTML_LIST=$(mktemp)
find "$DIST_DIR" -type f -name '*.html' | sort > "$HTML_LIST"

while IFS= read -r html; do
  [ -n "$html" ] || continue
  DIR=$(dirname "$html")
  TMP=$(mktemp)

  if command -v rg >/dev/null 2>&1; then
    rg -No '(href|src)="([^"]+)"' "$html" | sed -E 's/^[^\"]+\"([^\"]+)\"/\1/' > "$TMP" || true
  else
    grep -Eo '(href|src)="[^"]+"' "$html" | sed -E 's/^[^\"]+\"([^\"]+)\"/\1/' > "$TMP" || true
  fi

  while IFS= read -r ref; do
    [ -n "$ref" ] || continue
    case "$ref" in
      http://*|https://*|mailto:*|tel:*|javascript:*|\#*)
        continue
        ;;
      /*)
        target="$DIST_DIR$ref"
        ;;
      *)
        target="$DIR/$ref"
        ;;
    esac

    target=${target%%\?*}
    target=${target%%#*}

    case "$target" in
      */)
        target="${target}index.html"
        ;;
      *)
        if [ -d "$target" ]; then
          target="$target/index.html"
        fi
        ;;
    esac

    if [ ! -e "$target" ]; then
      printf 'Broken ref in %s -> %s\n' "$html" "$ref" >> "$BROKEN_LOG"
    fi
  done < "$TMP"

  rm -f "$TMP"
done < "$HTML_LIST"

if [ -s "$BROKEN_LOG" ]; then
  cat "$BROKEN_LOG"
  rm -f "$BROKEN_LOG" "$HTML_LIST"
  fail "Link check failed"
fi

rm -f "$BROKEN_LOG" "$HTML_LIST"
log "Link check passed"
