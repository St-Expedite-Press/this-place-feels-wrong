#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
AGENT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
TEMPLATE_ROOT="$AGENT_ROOT/templates/static-basic"

log() {
  printf '%s\n' "$*"
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

project_dir_from_arg() {
  [ "$#" -ge 1 ] || fail "Missing project directory argument"
  TARGET=$1
  [ -d "$TARGET" ] || fail "Project directory not found: $TARGET"
  printf '%s\n' "$TARGET"
}

resolve_dist_dir() {
  PROJECT_DIR=$1
  if [ -n "${DIST_DIR:-}" ]; then
    printf '%s\n' "$DIST_DIR"
  else
    printf '%s/dist\n' "$PROJECT_DIR"
  fi
}

resolve_site_dir() {
  PROJECT_DIR=$1
  if [ -n "${SITE_DIR:-}" ]; then
    printf '%s\n' "$SITE_DIR"
  else
    printf '%s/site\n' "$PROJECT_DIR"
  fi
}
