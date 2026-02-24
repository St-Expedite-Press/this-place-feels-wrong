#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
env_file="${1:-"$repo_root/.env"}"

if [ ! -f "$env_file" ]; then
  echo "Missing env file: $env_file" >&2
  exit 1
fi

read_env_var() {
  key="$1"
  sed -n "s/^${key}=//p" "$env_file" | tail -n 1 | tr -d '\r'
}

token="$(read_env_var GITHUB_PAT_WRITE)"
repo_url="$(read_env_var GITHUB_REPO_URL)"

if [ -z "$token" ]; then
  echo "GITHUB_PAT_WRITE is missing in $env_file" >&2
  exit 1
fi

if [ -z "$repo_url" ]; then
  repo_url="$(git -C "$repo_root" remote get-url origin)"
fi

case "$repo_url" in
  https://github.com/*) ;;
  *)
  echo "Expected an https://github.com/... URL, got: $repo_url" >&2
  exit 1
  ;;
esac

git -C "$repo_root" remote set-url origin "$repo_url"
git -C "$repo_root" config credential.helper "store --file .git/credentials"

{
  echo "protocol=https"
  echo "host=github.com"
  echo "username=x-access-token"
  echo "password=$token"
} | git -C "$repo_root" credential approve

git -C "$repo_root" ls-remote --heads origin >/dev/null
echo "GitHub credentials are configured for this repo."
