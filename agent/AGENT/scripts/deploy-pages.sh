#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"
require_cmd wrangler

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")
PROJECT_NAME=${PROJECT_NAME:-}

[ -d "$DIST_DIR" ] || fail "Dist directory not found: $DIST_DIR. Run build first."
[ -n "$PROJECT_NAME" ] || fail "Set PROJECT_NAME for Cloudflare Pages deploy"

wrangler pages deploy "$DIST_DIR" --project-name "$PROJECT_NAME"
