#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")
POSTS_DIR=${POSTS_DIR:-"$PROJECT_DIR/content/posts"}
SITE_URL=${SITE_URL:-https://example.com}
SITE_NAME=${SITE_NAME:-"Static Site"}
OUT="$DIST_DIR/feed.xml"
NOW_RFC2822=$(date -u '+%a, %d %b %Y %H:%M:%S +0000')

mkdir -p "$DIST_DIR"

{
  printf '%s\n' '<?xml version="1.0" encoding="UTF-8"?>'
  printf '%s\n' '<rss version="2.0"><channel>'
  printf '<title>%s</title>\n' "$SITE_NAME"
  printf '<link>%s</link>\n' "$SITE_URL"
  printf '<description>%s updates</description>\n' "$SITE_NAME"
  printf '<lastBuildDate>%s</lastBuildDate>\n' "$NOW_RFC2822"

  if [ -d "$POSTS_DIR" ]; then
    find "$POSTS_DIR" -type f \( -name '*.md' -o -name '*.txt' \) | sort | while IFS= read -r post; do
      slug=$(basename "$post")
      slug=${slug%.*}
      title=$(head -n 1 "$post" | sed 's/^# *//; s/^title: *//')
      [ -n "$title" ] || title="$slug"
      pub=$(date -u -r "$post" '+%a, %d %b %Y %H:%M:%S +0000' 2>/dev/null || date -u '+%a, %d %b %Y %H:%M:%S +0000')
      link="$SITE_URL/posts/$slug.html"
      printf '<item><title>%s</title><link>%s</link><pubDate>%s</pubDate></item>\n' "$title" "$link" "$pub"
    done
  fi

  printf '%s\n' '</channel></rss>'
} > "$OUT"

log "Generated feed: $OUT"
