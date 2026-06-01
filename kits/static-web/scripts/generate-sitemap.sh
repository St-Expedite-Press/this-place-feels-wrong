#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")
SITE_URL=${SITE_URL:-https://example.com}
OUT="$DIST_DIR/sitemap.xml"

mkdir -p "$DIST_DIR"

{
  printf '%s\n' '<?xml version="1.0" encoding="UTF-8"?>'
  printf '%s\n' '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  find "$DIST_DIR" -type f -name '*.html' | sort | while IFS= read -r html; do
    rel=${html#"$DIST_DIR"/}
    case "$rel" in
      404.html)
        continue
        ;;
      index.html)
        loc="$SITE_URL/"
        ;;
      */index.html)
        loc="$SITE_URL/${rel%/index.html}/"
        ;;
      *)
        loc="$SITE_URL/$rel"
        ;;
    esac
    lastmod=$(date -u +%Y-%m-%d)
    printf '  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n' "$loc" "$lastmod"
  done
  printf '%s\n' '</urlset>'
} > "$OUT"

log "Generated sitemap: $OUT"
