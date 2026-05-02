#!/usr/bin/env sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
. "$script_dir/../lib/repo-root.sh"

repo_root="$(find_repo_root "$0")"
hooks_dir="$repo_root/.githooks"

if [ ! -d "$hooks_dir" ]; then
  echo "Missing hooks directory: $hooks_dir" >&2
  exit 1
fi

chmod +x "$hooks_dir"/*
git -C "$repo_root" config core.hooksPath .githooks

echo "Installed git hooks via core.hooksPath=.githooks"
