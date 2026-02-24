#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"
require_cmd python3

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")
HOST=${HOST:-127.0.0.1}
PORT=${PORT:-4174}

[ -d "$DIST_DIR" ] || fail "Dist directory not found: $DIST_DIR. Run build first."

log "Previewing $DIST_DIR at http://$HOST:$PORT"
cd "$DIST_DIR"
python3 -m http.server "$PORT" --bind "$HOST"
