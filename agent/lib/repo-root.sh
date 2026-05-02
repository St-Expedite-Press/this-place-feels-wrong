#!/usr/bin/env sh

find_repo_root() {
  start_path="$1"
  current_dir="$(CDPATH= cd -- "$(dirname -- "$start_path")" && pwd)"

  while [ -n "$current_dir" ]; do
    if [ -d "$current_dir/.git" ] && [ -f "$current_dir/package.json" ]; then
      printf '%s\n' "$current_dir"
      return 0
    fi

    parent_dir="$(CDPATH= cd -- "$current_dir/.." && pwd)"
    if [ "$parent_dir" = "$current_dir" ]; then
      break
    fi
    current_dir="$parent_dir"
  done

  echo "Unable to locate repo root from: $start_path" >&2
  return 1
}
