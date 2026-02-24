#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
strict=0

if [ "${1:-}" = "--strict" ]; then
  strict=1
fi

issues=0
files="$(find "$repo_root/site" -maxdepth 1 -type f -name '*.html' ! -name 'interior-content-template.html' | sort)"

old_ifs="$IFS"
IFS='
'
for file in $files; do
  rel="${file#"$repo_root"/}"
  content="$(cat "$file")"
  h1_count="$(printf "%s" "$content" | rg -i -o '<h1[ >]' | wc -l | tr -d ' ')"
  canonical_count="$(printf "%s" "$content" | rg -i -o '<link[^>]+rel=["'"'"']canonical["'"'"']' 2>/dev/null || true)"
  canonical_count="$(printf "%s" "$canonical_count" | wc -l | tr -d ' ')"

  if [ "$h1_count" -ne 1 ]; then
    echo "[seo-check] ${rel}: expected 1 h1, found ${h1_count}"
    issues=$((issues + 1))
  fi

  if [ "$canonical_count" -lt 1 ]; then
    echo "[seo-check] ${rel}: missing canonical link"
    issues=$((issues + 1))
  fi
done
IFS="$old_ifs"

if [ "$issues" -eq 0 ]; then
  echo "[seo-check] PASS"
  exit 0
fi

echo "[seo-check] Found ${issues} issue(s)."
if [ "$strict" -eq 1 ]; then
  exit 1
fi

echo "[seo-check] Advisory mode only; exiting 0."
