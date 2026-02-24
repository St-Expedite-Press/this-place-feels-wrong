#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"
require_cmd netlify

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")

[ -d "$DIST_DIR" ] || fail "Dist directory not found: $DIST_DIR. Run build first."

netlify deploy --prod --dir "$DIST_DIR"
