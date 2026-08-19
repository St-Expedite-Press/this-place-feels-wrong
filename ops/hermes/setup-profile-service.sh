#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
config_dir="${HOME}/.config/stexpedite"
env_file="${config_dir}/profile-service.env"
unit_dir="${HOME}/.config/systemd/user"
unit_file="${unit_dir}/stexpedite-profile-service.service"

mkdir -p "${config_dir}" "${unit_dir}"
chmod 700 "${config_dir}"

if [[ ! -f "${env_file}" ]]; then
  umask 077
  cat >"${env_file}" <<EOF
PROFILE_SERVICE_KEY=$(openssl rand -hex 32)
PROFILE_SERVICE_HOST=127.0.0.1
PROFILE_SERVICE_PORT=8765
PROFILE_PORT_MIN=8700
PROFILE_PORT_MAX=9699
PROFILE_SOURCE_ENV=${HOME}/.hermes/profiles/stexpedite/.env
USER_PROFILE_BASE_SOUL=${repo_root}/agents/user-profile/BASE.md
HERMES_BIN=${HOME}/.local/bin/hermes
EOF
fi
chmod 600 "${env_file}"

cat >"${unit_file}" <<EOF
[Unit]
Description=St. Expedite Hermes profile service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${repo_root}
EnvironmentFile=${env_file}
ExecStart=/usr/bin/python3 ${repo_root}/ops/hermes/profile-service.py
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
# Hermes profile create/config writes under ~/.hermes. The gateway install/delete
# path also manages per-profile user units under ~/.config/systemd/user; both
# must remain writable inside the otherwise read-only home sandbox.
ReadWritePaths=${HOME}/.hermes ${HOME}/.config/systemd/user

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now stexpedite-profile-service.service
sudo loginctl enable-linger "${USER}" >/dev/null 2>&1 || true

printf '%s\n' \
  "Profile service installed." \
  "Environment: ${env_file}" \
  "Health check (requires bearer from env file): http://127.0.0.1:8765/health" \
  "Do not expose this port directly. Route any remote Worker access through the authenticated Cloudflare Tunnel/origin boundary."
