#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"

PROJECT_DIR=$(project_dir_from_arg "$@")
SITE_DIR=$(resolve_site_dir "$PROJECT_DIR")
IMG_DIR=${IMG_DIR:-"$SITE_DIR/assets/img"}

[ -d "$IMG_DIR" ] || {
  log "No image directory found at $IMG_DIR; skipping"
  exit 0
}

if ! command -v cwebp >/dev/null 2>&1; then
  log "cwebp not installed; skipping image optimization"
  exit 0
fi

find "$IMG_DIR" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) | while IFS= read -r file; do
  out="${file%.*}.webp"
  cwebp -quiet -q 82 "$file" -o "$out"
  log "Wrote $out"
done

log "Image optimization completed"
