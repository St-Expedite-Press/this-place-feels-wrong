#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/../../.." && pwd)"
source_root="$repo_root/assets/source"
publish_root="$repo_root/apps/web/public/assets"
manifest_file="$repo_root/assets/manifest.txt"

[ -d "$source_root" ] || { echo "Missing: $source_root" >&2; exit 1; }
[ -d "$publish_root" ] || { echo "Missing: $publish_root" >&2; exit 1; }
[ -f "$manifest_file" ] || { echo "Missing: $manifest_file" >&2; exit 1; }

diff_log="$(mktemp)"
source_img_list="$(mktemp)"
publish_img_list="$(mktemp)"
source_gif_list="$(mktemp)"
publish_gif_list="$(mktemp)"

find "$source_root/img" -type f | sed "s#^$source_root/img/##" | sort > "$source_img_list"
find "$publish_root/img" -type f | sed "s#^$publish_root/img/##" | sort > "$publish_img_list"
find "$source_root/gif" -type f | sed "s#^$source_root/gif/##" | sort > "$source_gif_list"
find "$publish_root/gif" -type f | sed "s#^$publish_root/gif/##" | sort > "$publish_gif_list"

if ! diff -u "$source_img_list" "$publish_img_list" > "$diff_log" 2>&1 || ! diff -u "$source_gif_list" "$publish_gif_list" >> "$diff_log" 2>&1; then
  echo "Asset drift detected between assets/source and apps/web/public/assets:" >&2
  cat "$diff_log" >&2
  rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list"
  echo "Run: sh internal/agent/tools/sync-assets.sh" >&2
  exit 1
fi

while IFS= read -r rel; do
  [ -n "$rel" ] || continue
  src="$source_root/img/$rel"
  dst="$publish_root/img/$rel"
  src_sha="$(sha256sum "$src" | awk '{print $1}')"
  dst_sha="$(sha256sum "$dst" | awk '{print $1}')"
  if [ "$src_sha" != "$dst_sha" ]; then
    echo "Asset drift detected for img/$rel" >&2
    rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list"
    exit 1
  fi
done < "$source_img_list"

while IFS= read -r rel; do
  [ -n "$rel" ] || continue
  src="$source_root/gif/$rel"
  dst="$publish_root/gif/$rel"
  src_sha="$(sha256sum "$src" | awk '{print $1}')"
  dst_sha="$(sha256sum "$dst" | awk '{print $1}')"
  if [ "$src_sha" != "$dst_sha" ]; then
    echo "Asset drift detected for gif/$rel" >&2
    rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list"
    exit 1
  fi
done < "$source_gif_list"

rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list"

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
  echo "Asset manifest is out of date. Run: sh internal/agent/tools/sync-assets.sh" >&2
  exit 1
fi

rm -f "$tmp_manifest" "$normalized_manifest"
echo "[check-assets-sync] PASS"
