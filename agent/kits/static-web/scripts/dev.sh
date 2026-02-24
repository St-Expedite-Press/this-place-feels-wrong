#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"
require_cmd python3

PROJECT_DIR=$(project_dir_from_arg "$@")
SITE_DIR=$(resolve_site_dir "$PROJECT_DIR")
HOST=${HOST:-127.0.0.1}
PORT=${PORT:-4173}

[ -d "$SITE_DIR" ] || fail "Site directory not found: $SITE_DIR"

log "Serving $SITE_DIR at http://$HOST:$PORT"
cd "$SITE_DIR"
python3 -m http.server "$PORT" --bind "$HOST"
