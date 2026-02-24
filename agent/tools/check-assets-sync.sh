#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
source_root="$repo_root/assets/source"
publish_root="$repo_root/site/assets"
manifest_file="$repo_root/assets/manifest.txt"

[ -d "$source_root" ] || { echo "Missing: $source_root" >&2; exit 1; }
[ -d "$publish_root" ] || { echo "Missing: $publish_root" >&2; exit 1; }
[ -f "$manifest_file" ] || { echo "Missing: $manifest_file" >&2; exit 1; }

diff_log="$(mktemp)"
rsync -an --delete "$source_root/img/" "$publish_root/img/" > "$diff_log"
rsync -an --delete "$source_root/gif/" "$publish_root/gif/" >> "$diff_log"

if [ -s "$diff_log" ]; then
  echo "Asset drift detected between assets/source and site/assets:" >&2
  cat "$diff_log" >&2
  rm -f "$diff_log"
  echo "Run: sh agent/tools/sync-assets.sh" >&2
  exit 1
fi
rm -f "$diff_log"

tmp_manifest="$(mktemp)"
{
  echo "# Asset Manifest"
  echo "# Generated: CHECK"
  echo "# sha256  bytes  path"
  find "$publish_root" -type f | sort | while IFS= read -r file; do
    sha="$(sha256sum "$file" | awk '{print $1}')"
    bytes="$(wc -c < "$file" | tr -d ' ')"
    rel="${file#"$repo_root"/}"
    printf '%s  %s  %s\n' "$sha" "$bytes" "$rel"
  done
} > "$tmp_manifest"

normalized_manifest="$(mktemp)"
sed '2s|.*|# Generated: CHECK|' "$manifest_file" > "$normalized_manifest"

if ! diff -u "$normalized_manifest" "$tmp_manifest" >/dev/null 2>&1; then
  rm -f "$tmp_manifest" "$normalized_manifest"
  echo "Asset manifest is out of date. Run: sh agent/tools/sync-assets.sh" >&2
  exit 1
fi

rm -f "$tmp_manifest" "$normalized_manifest"
echo "[check-assets-sync] PASS"
