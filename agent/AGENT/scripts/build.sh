#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"

PROJECT_DIR=$(project_dir_from_arg "$@")
SITE_DIR=$(resolve_site_dir "$PROJECT_DIR")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")

[ -d "$SITE_DIR" ] || fail "Site directory not found: $SITE_DIR"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"
cp -R "$SITE_DIR/." "$DIST_DIR/"

sh "$SCRIPT_DIR/generate-sitemap.sh" "$PROJECT_DIR"
sh "$SCRIPT_DIR/generate-feed.sh" "$PROJECT_DIR"

log "Built site from $SITE_DIR to $DIST_DIR"
