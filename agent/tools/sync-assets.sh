#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
source_root="$repo_root/assets/source"
publish_root="$repo_root/site/assets"
manifest_file="$repo_root/assets/manifest.txt"

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

run_cmd mkdir -p "$source_root/img" "$source_root/gif"
run_cmd mkdir -p "$publish_root/img" "$publish_root/gif"

# Sync canonical source media into deploy-ready asset paths.
run_cmd rsync -a --delete "$source_root/img/" "$publish_root/img/"
run_cmd rsync -a --delete "$source_root/gif/" "$publish_root/gif/"

# Generate webp siblings for raster images when cwebp is available.
if command -v cwebp >/dev/null 2>&1; then
  find "$publish_root/img" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) | while IFS= read -r file; do
    out="${file%.*}.webp"
    run_cmd cwebp -quiet -q 82 "$file" -o "$out"
  done
else
  echo "[sync-assets] cwebp not installed; skipping webp generation"
fi

if [ "$dry_run" -eq 1 ]; then
  echo "[dry-run] write manifest to $manifest_file"
  exit 0
fi

# Build manifest for reproducibility/auditing.
{
  echo "# Asset Manifest"
  echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "# sha256  bytes  path"
  find "$publish_root" -type f | sort | while IFS= read -r file; do
    sha="$(sha256sum "$file" | awk '{print $1}')"
    bytes="$(wc -c < "$file" | tr -d ' ')"
    rel="${file#"$repo_root"/}"
    printf '%s  %s  %s\n' "$sha" "$bytes" "$rel"
  done
} > "$manifest_file"

echo "[sync-assets] synced source assets to site/assets"
echo "[sync-assets] wrote manifest: $manifest_file"
