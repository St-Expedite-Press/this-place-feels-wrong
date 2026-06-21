#!/usr/bin/env sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
. "$script_dir/lib/repo-root.sh"

repo_root="$(find_repo_root "$0")"
source_root="$repo_root/assets/source"
publish_root="$repo_root/apps/web/public/assets"

dry_run=0
if [ "${1:-}" = "--dry-run" ]; then
  dry_run=1
fi

require_dir() {
  [ -d "$1" ] || {
    echo "Missing directory: $1" >&2
    exit 1
  }
}

run_cmd() {
  if [ "$dry_run" -eq 1 ]; then
    echo "[dry-run] $*"
    return 0
  fi
  "$@"
}

require_dir "$source_root"
require_dir "$publish_root"

run_cmd mkdir -p "$source_root/img" "$source_root/gif" "$source_root/video"
run_cmd mkdir -p "$publish_root/img" "$publish_root/gif" "$publish_root/video"

# Sync canonical source media into authored asset paths.
run_cmd find "$publish_root/img" -mindepth 1 -delete
run_cmd find "$publish_root/gif" -mindepth 1 -delete
run_cmd find "$publish_root/video" -mindepth 1 -delete
run_cmd cp -R "$source_root/img/." "$publish_root/img/"
run_cmd cp -R "$source_root/gif/." "$publish_root/gif/"
run_cmd cp -R "$source_root/video/." "$publish_root/video/"

if [ "$dry_run" -eq 1 ]; then
  echo "[dry-run] build assets/manifest.json and assets/manifest.txt"
  exit 0
fi

node "$repo_root/scripts/build-asset-manifest.mjs"

echo "[sync-assets] synced source assets to apps/web/public/assets"
echo "[sync-assets] wrote asset manifests"
