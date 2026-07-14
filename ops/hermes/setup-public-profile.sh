#!/usr/bin/env bash
set -euo pipefail

profile="stexpedite-public"
profile_dir="/home/ec2-user/.hermes/profiles/${profile}"
source_env="/home/ec2-user/.hermes/profiles/stexpedite/.env"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/../.." && pwd)"

if ! hermes profile show "${profile}" >/dev/null 2>&1; then
  hermes profile create "${profile}" \
    --no-skills \
    --description "Public, read-only editorial guide for St. Expedite Press and RICE Magazine. It has no administrative or host tools."
fi

tmp_env="$(mktemp)"
trap 'rm -f "${tmp_env}"' EXIT

grep -m1 '^OPENROUTER_API_KEY=' "${source_env}" > "${tmp_env}"
if grep -m1 '^API_SERVER_KEY=' "${profile_dir}/.env" >> "${tmp_env}" 2>/dev/null; then
  :
else
  printf 'API_SERVER_KEY=%s\n' "$(openssl rand -hex 32)" >> "${tmp_env}"
fi
printf '%s\n' \
  'API_SERVER_ENABLED=true' \
  'API_SERVER_HOST=127.0.0.1' \
  'API_SERVER_PORT=8643' \
  'API_SERVER_MODEL_NAME=stexpedite-public' >> "${tmp_env}"
install -m 600 "${tmp_env}" "${profile_dir}/.env"
install -m 600 "${repo_root}/agents/public-guide/SOUL.md" "${profile_dir}/SOUL.md"

hermes -p "${profile}" config set model.default openrouter/free
hermes -p "${profile}" config set model.provider auto
hermes -p "${profile}" config set model.base_url https://openrouter.ai/api/v1
hermes -p "${profile}" config set agent.max_turns 4
hermes -p "${profile}" config set agent.reasoning_effort none
hermes -p "${profile}" config set memory.memory_enabled false
hermes -p "${profile}" config set memory.user_profile_enabled false
hermes -p "${profile}" config set streaming.enabled true
hermes -p "${profile}" config set terminal.home_mode profile

hermes -p "${profile}" tools disable --platform api_server \
  web browser terminal file code_execution vision video image_gen video_gen \
  x_search tts skills todo memory context_engine session_search clarify \
  delegation cronjob homeassistant spotify yuanbao computer_use

hermes -p "${profile}" gateway install
sudo loginctl enable-linger "${USER}"
hermes -p "${profile}" gateway restart
