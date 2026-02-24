#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"

PROJECT_DIR=$(project_dir_from_arg "$@")

sh "$SCRIPT_DIR/build.sh" "$PROJECT_DIR"
sh "$SCRIPT_DIR/check-links.sh" "$PROJECT_DIR"
sh "$SCRIPT_DIR/check-a11y.sh" "$PROJECT_DIR"
sh "$SCRIPT_DIR/check-lighthouse.sh" "$PROJECT_DIR"

log "All checks complete"
