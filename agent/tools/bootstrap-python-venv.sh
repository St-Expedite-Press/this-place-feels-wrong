#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
venv_dir="${1:-"$repo_root/.venv"}"
python_bin="${PYTHON_BIN:-python3}"

if ! command -v "$python_bin" >/dev/null 2>&1; then
  echo "Missing Python interpreter: $python_bin" >&2
  exit 1
fi

echo "[venv] creating ${venv_dir}"
if "$python_bin" -m venv "$venv_dir" >/dev/null 2>&1; then
  :
else
  echo "[venv] standard venv creation failed; retrying with --without-pip"
  "$python_bin" -m venv "$venv_dir" --without-pip
fi

venv_python="$venv_dir/bin/python"

if ! "$venv_python" -m pip --version >/dev/null 2>&1; then
  echo "[venv] bootstrapping pip via get-pip.py"
  tmp_get_pip="$(mktemp)"
  curl -fsSL https://bootstrap.pypa.io/get-pip.py -o "$tmp_get_pip"
  "$venv_python" "$tmp_get_pip"
  rm -f "$tmp_get_pip"
fi

echo "[venv] upgrading pip/setuptools/wheel"
"$venv_python" -m pip install --upgrade pip setuptools wheel >/dev/null

echo "[venv] ready: $venv_dir"
echo "[venv] activate with: . \"$venv_dir/bin/activate\""
