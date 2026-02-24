#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
dry_run=0
skip_push=0
skip_deploy=0
skip_smoke=0
skip_log=0

usage() {
  cat <<'EOF'
Usage: sh agent/tools/release.sh [options]

Options:
  --dry-run      Print commands without executing.
  --skip-push    Skip git push.
  --skip-deploy  Skip worker deploy.
  --skip-smoke   Skip runtime smoke checks.
  --skip-log     Skip release evidence logging.
EOF
}

run_step() {
  cmd="$1"
  if [ "$dry_run" -eq 1 ]; then
    echo "[dry-run] $cmd"
    return 0
  fi
  sh -c "$cmd"
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) dry_run=1 ;;
    --skip-push) skip_push=1 ;;
    --skip-deploy) skip_deploy=1 ;;
    --skip-smoke) skip_smoke=1 ;;
    --skip-log) skip_log=1 ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

echo "[release] repo checks"
run_step "cd \"$repo_root\" && npx -y htmlhint \"site/**/*.html\""
run_step "cd \"$repo_root\" && npm --prefix workers/communications run test"

echo "[release] runtime config checks"
run_step "cd \"$repo_root\" && sh agent/tools/check-runtime-config.sh"

if [ "$skip_push" -eq 0 ]; then
  echo "[release] push main"
  run_step "cd \"$repo_root\" && git push origin main"
fi

if [ "$skip_deploy" -eq 0 ]; then
  echo "[release] deploy worker"
  run_step "cd \"$repo_root\" && npm --prefix workers/communications run deploy"
fi

if [ "$skip_smoke" -eq 0 ]; then
  echo "[release] smoke api"
  run_step "cd \"$repo_root\" && sh agent/skills/ops/cloudflare-stability/scripts/smoke-api.sh"
fi

if [ "$skip_log" -eq 0 ]; then
  echo "[release] log evidence"
  run_step "cd \"$repo_root\" && sh agent/skills/ops/cloudflare-stability/scripts/log-release-evidence.sh"
fi

echo "[release] COMPLETE"
