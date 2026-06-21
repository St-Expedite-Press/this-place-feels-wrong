#!/usr/bin/env sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
. "$script_dir/lib/repo-root.sh"

repo_root="$(find_repo_root "$0")"
source_root="$repo_root/assets/source"
publish_root="$repo_root/apps/web/public/assets"

[ -d "$source_root" ] || { echo "Missing: $source_root" >&2; exit 1; }
[ -d "$publish_root" ] || { echo "Missing: $publish_root" >&2; exit 1; }
[ -f "$repo_root/assets/manifest.txt" ] || { echo "Missing: assets/manifest.txt" >&2; exit 1; }
[ -f "$repo_root/assets/manifest.json" ] || { echo "Missing: assets/manifest.json" >&2; exit 1; }

diff_log="$(mktemp)"
source_img_list="$(mktemp)"
publish_img_list="$(mktemp)"
source_gif_list="$(mktemp)"
publish_gif_list="$(mktemp)"
source_video_list="$(mktemp)"
publish_video_list="$(mktemp)"

find "$source_root/img" -type f | sed "s#^$source_root/img/##" | sort > "$source_img_list"
find "$publish_root/img" -type f | sed "s#^$publish_root/img/##" | sort > "$publish_img_list"
find "$source_root/gif" -type f | sed "s#^$source_root/gif/##" | sort > "$source_gif_list"
find "$publish_root/gif" -type f | sed "s#^$publish_root/gif/##" | sort > "$publish_gif_list"
find "$source_root/video" -type f | sed "s#^$source_root/video/##" | sort > "$source_video_list"
find "$publish_root/video" -type f | sed "s#^$publish_root/video/##" | sort > "$publish_video_list"

if ! diff -u "$source_img_list" "$publish_img_list" > "$diff_log" 2>&1 || ! diff -u "$source_gif_list" "$publish_gif_list" >> "$diff_log" 2>&1 || ! diff -u "$source_video_list" "$publish_video_list" >> "$diff_log" 2>&1; then
  echo "Asset drift detected between assets/source and apps/web/public/assets:" >&2
  cat "$diff_log" >&2
  rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list" "$source_video_list" "$publish_video_list"
  echo "Run: npm run assets:sync" >&2
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
    rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list" "$source_video_list" "$publish_video_list"
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
    rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list" "$source_video_list" "$publish_video_list"
    exit 1
  fi
done < "$source_gif_list"

while IFS= read -r rel; do
  [ -n "$rel" ] || continue
  src="$source_root/video/$rel"
  dst="$publish_root/video/$rel"
  src_sha="$(sha256sum "$src" | awk '{print $1}')"
  dst_sha="$(sha256sum "$dst" | awk '{print $1}')"
  if [ "$src_sha" != "$dst_sha" ]; then
    echo "Asset drift detected for video/$rel" >&2
    rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list" "$source_video_list" "$publish_video_list"
    exit 1
  fi
done < "$source_video_list"

rm -f "$diff_log" "$source_img_list" "$publish_img_list" "$source_gif_list" "$publish_gif_list" "$source_video_list" "$publish_video_list"

node "$repo_root/scripts/build-asset-manifest.mjs" --check
echo "[check-assets-sync] PASS"
