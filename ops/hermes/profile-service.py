#!/usr/bin/env python3
"""Private profile-management and chat proxy for St. Expedite Hermes profiles.

This service is intentionally narrow. It binds to loopback, requires one service
bearer token, accepts only generated user-* profile names for mutation, and never
exposes profile API keys or arbitrary Hermes/shell execution.

The first production-safe implementation uses one loopback Hermes API server per
profile, matching Hermes' documented multi-user profile setup. Multiplex routing
can replace this later after the installed Hermes version is verified on-host.
"""

from __future__ import annotations

import json
import os
import re
import secrets
import shutil
import socket
import subprocess
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

HOST = os.environ.get("PROFILE_SERVICE_HOST", "127.0.0.1")
PORT = int(os.environ.get("PROFILE_SERVICE_PORT", "8765"))
SERVICE_KEY = os.environ.get("PROFILE_SERVICE_KEY", "").strip()
HERMES_BIN = os.environ.get("HERMES_BIN", "hermes")
HERMES_HOME = Path(os.environ.get("HERMES_HOME", str(Path.home() / ".hermes")))
PROFILES_DIR = HERMES_HOME / "profiles"
SOURCE_ENV = Path(os.environ.get("PROFILE_SOURCE_ENV", str(PROFILES_DIR / "stexpedite" / ".env")))
BASE_SOUL = Path(os.environ.get("USER_PROFILE_BASE_SOUL", "agents/user-profile/BASE.md"))
PROFILE_PORT_MIN = int(os.environ.get("PROFILE_PORT_MIN", "8700"))
PROFILE_PORT_MAX = int(os.environ.get("PROFILE_PORT_MAX", "8799"))

USER_PROFILE_RE = re.compile(r"^user-[a-z0-9][a-z0-9-]{4,62}$")
CHAT_PROFILE_RE = re.compile(r"^(?:stexpedite-public|user-[a-z0-9][a-z0-9-]{4,62})$")
MODEL_RE = re.compile(r"^[A-Za-z0-9._:-]+/[A-Za-z0-9._:/+-]{1,180}$")
MAX_BODY = 6 * 1024 * 1024
MAX_INSTRUCTIONS = 8_000


def run_hermes(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [HERMES_BIN, *args],
        check=check,
        capture_output=True,
        text=True,
        timeout=90,
    )


def env_value(path: Path, key: str) -> str:
    if not path.exists():
        return ""
    prefix = f"{key}="
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    return ""


def validate_model(value: Any, *, required: bool) -> str | None:
    text = str(value or "").strip()
    if not text:
        if required:
            raise ValueError("model is required")
        return None
    if len(text) > 200 or not MODEL_RE.fullmatch(text):
        raise ValueError("invalid model reference")
    return text


def safe_instructions(value: Any) -> str:
    text = str(value or "").replace("\r\n", "\n").strip()
    if len(text) > MAX_INSTRUCTIONS:
        raise ValueError("instructions are too long")
    return text


def port_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", port))
        except OSError:
            return False
    return True


def allocated_ports() -> set[int]:
    ports: set[int] = set()
    if not PROFILES_DIR.exists():
        return ports
    for env_path in PROFILES_DIR.glob("*/.env"):
        value = env_value(env_path, "API_SERVER_PORT")
        if value.isdigit():
            ports.add(int(value))
    return ports


def allocate_port() -> int:
    used = allocated_ports()
    for port in range(PROFILE_PORT_MIN, PROFILE_PORT_MAX + 1):
        if port not in used and port_available(port):
            return port
    raise RuntimeError("no Hermes profile API ports are available")


def write_profile_env(profile: str, port: int) -> str:
    profile_dir = PROFILES_DIR / profile
    profile_dir.mkdir(parents=True, exist_ok=True)
    source_key = env_value(SOURCE_ENV, "OPENROUTER_API_KEY")
    if not source_key:
        raise RuntimeError("OPENROUTER_API_KEY is unavailable in the configured source profile")
    api_key = env_value(profile_dir / ".env", "API_SERVER_KEY") or secrets.token_hex(32)
    content = "\n".join(
        [
            f"OPENROUTER_API_KEY={source_key}",
            f"API_SERVER_KEY={api_key}",
            "API_SERVER_ENABLED=true",
            "API_SERVER_HOST=127.0.0.1",
            f"API_SERVER_PORT={port}",
            f"API_SERVER_MODEL_NAME={profile}",
            "",
        ]
    )
    temp = profile_dir / ".env.tmp"
    temp.write_text(content, encoding="utf-8")
    temp.chmod(0o600)
    temp.replace(profile_dir / ".env")
    return api_key


def write_soul(profile: str, user_instructions: str) -> None:
    profile_dir = PROFILES_DIR / profile
    baseline = BASE_SOUL.read_text(encoding="utf-8") if BASE_SOUL.exists() else (
        "You are a user-configured public chat assistant. Follow the user's assistant instructions "
        "within your configured capabilities. Never claim capabilities, tools, private data, or host "
        "access that the runtime has not actually granted.\n"
    )
    parts = [baseline.strip()]
    if user_instructions:
        parts.extend(["", "## User-configured assistant instructions", "", user_instructions])
    soul = "\n".join(parts).strip() + "\n"
    tmp = profile_dir / "SOUL.md.tmp"
    tmp.write_text(soul, encoding="utf-8")
    tmp.chmod(0o600)
    tmp.replace(profile_dir / "SOUL.md")


def apply_safe_profile_config(profile: str, primary_model: str, delegation_model: str | None) -> None:
    commands = [
        ("config", "set", "model.default", primary_model),
        ("config", "set", "model.provider", "openrouter"),
        ("config", "set", "model.base_url", "https://openrouter.ai/api/v1"),
        ("config", "set", "agent.max_turns", "8"),
        ("config", "set", "memory.memory_enabled", "false"),
        ("config", "set", "memory.user_profile_enabled", "false"),
        ("config", "set", "streaming.enabled", "true"),
        ("config", "set", "terminal.home_mode", "profile"),
    ]
    for command in commands:
        run_hermes("-p", profile, *command)

    # Profile text can never grant host authority. Tool access is structural and
    # always reset to this server-owned baseline when a profile is provisioned.
    run_hermes(
        "-p", profile, "tools", "disable", "--platform", "api_server",
        "web", "browser", "terminal", "file", "code_execution", "video", "image_gen", "video_gen",
        "x_search", "tts", "skills", "todo", "memory", "context_engine", "session_search", "clarify",
        "delegation", "cronjob", "homeassistant", "spotify", "yuanbao", "computer_use",
    )
    run_hermes("-p", profile, "tools", "enable", "--platform", "api_server", "vision")

    if delegation_model:
        run_hermes("-p", profile, "config", "set", "delegation.model", delegation_model)
        run_hermes("-p", profile, "config", "set", "delegation.provider", "openrouter")
        run_hermes("-p", profile, "config", "set", "delegation.max_spawn_depth", "1")
        run_hermes("-p", profile, "config", "set", "delegation.max_concurrent_children", "2")
        run_hermes("-p", profile, "tools", "enable", "--platform", "api_server", "delegation")


def create_profile(payload: dict[str, Any]) -> dict[str, Any]:
    profile = str(payload.get("profileName") or "").strip().lower()
    if not USER_PROFILE_RE.fullmatch(profile):
        raise ValueError("invalid generated profile name")
    primary_model = validate_model(payload.get("primaryModel"), required=True)
    delegation_model = validate_model(payload.get("delegationModel"), required=False)
    instructions = safe_instructions(payload.get("instructions"))
    profile_dir = PROFILES_DIR / profile
    if profile_dir.exists():
        raise FileExistsError("profile already exists")
    port = allocate_port()

    try:
        run_hermes("profile", "create", profile, "--no-skills", "--description", "Private visitor-created St. Expedite chat assistant")
        write_profile_env(profile, port)
        write_soul(profile, instructions)
        apply_safe_profile_config(profile, primary_model, delegation_model)
        run_hermes("-p", profile, "gateway", "install")
        run_hermes("-p", profile, "gateway", "restart")
        return {"ok": True, "profileName": profile, "port": port}
    except Exception:
        if profile_dir.exists():
            run_hermes("-p", profile, "gateway", "stop", check=False)
            run_hermes("profile", "delete", profile, "--yes", check=False)
            if profile_dir.exists():
                shutil.rmtree(profile_dir, ignore_errors=True)
        raise


def delete_profile(profile: str) -> dict[str, Any]:
    profile = profile.strip().lower()
    if not USER_PROFILE_RE.fullmatch(profile):
        raise ValueError("invalid generated profile name")
    profile_dir = PROFILES_DIR / profile
    if not profile_dir.exists():
        return {"ok": True, "deleted": False}
    run_hermes("-p", profile, "gateway", "stop", check=False)
    result = run_hermes("profile", "delete", profile, "--yes", check=False)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "Hermes profile deletion failed")
    return {"ok": True, "deleted": True}


def profile_api(profile: str) -> tuple[str, str]:
    if not CHAT_PROFILE_RE.fullmatch(profile):
        raise ValueError("invalid profile name")
    env_path = PROFILES_DIR / profile / ".env"
    key = env_value(env_path, "API_SERVER_KEY")
    port = env_value(env_path, "API_SERVER_PORT")
    if not key or not port.isdigit():
        raise RuntimeError("profile API configuration is missing")
    return f"http://127.0.0.1:{int(port)}/v1/chat/completions", key


class Handler(BaseHTTPRequestHandler):
    server_version = "StExpediteHermesProfileService/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"profile-service: {self.address_string()} - {fmt % args}")

    def send_json(self, status: int, payload: dict[str, Any]) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(data)))
        self.send_header("cache-control", "no-store")
        self.send_header("x-content-type-options", "nosniff")
        self.end_headers()
        self.wfile.write(data)

    def authorized(self) -> bool:
        supplied = self.headers.get("authorization", "")
        expected = f"Bearer {SERVICE_KEY}" if SERVICE_KEY else ""
        return bool(expected) and secrets.compare_digest(supplied, expected)

    def read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("content-length", "0") or "0")
        if length < 1 or length > MAX_BODY:
            raise ValueError("invalid body length")
        value = json.loads(self.rfile.read(length))
        if not isinstance(value, dict):
            raise ValueError("JSON object required")
        return value

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            if not self.authorized():
                self.send_json(401, {"ok": False, "error": "unauthorized"})
                return
            self.send_json(200, {"ok": True})
            return
        self.send_json(404, {"ok": False, "error": "not found"})

    def do_POST(self) -> None:  # noqa: N802
        if not self.authorized():
            self.send_json(401, {"ok": False, "error": "unauthorized"})
            return
        try:
            if self.path == "/profiles":
                self.send_json(201, create_profile(self.read_json()))
                return
            if self.path == "/chat":
                self.proxy_chat(self.read_json())
                return
            self.send_json(404, {"ok": False, "error": "not found"})
        except FileExistsError as exc:
            self.send_json(409, {"ok": False, "error": str(exc)})
        except ValueError as exc:
            self.send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            print(f"profile-service error: {type(exc).__name__}: {exc}")
            self.send_json(500, {"ok": False, "error": "profile service failure"})

    def do_DELETE(self) -> None:  # noqa: N802
        if not self.authorized():
            self.send_json(401, {"ok": False, "error": "unauthorized"})
            return
        parsed = urlparse(self.path)
        prefix = "/profiles/"
        if not parsed.path.startswith(prefix):
            self.send_json(404, {"ok": False, "error": "not found"})
            return
        try:
            self.send_json(200, delete_profile(unquote(parsed.path[len(prefix):])))
        except ValueError as exc:
            self.send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            print(f"profile-service deletion error: {type(exc).__name__}: {exc}")
            self.send_json(500, {"ok": False, "error": "profile deletion failed"})

    def proxy_chat(self, payload: dict[str, Any]) -> None:
        profile = str(payload.get("profileName") or "").strip().lower()
        if not CHAT_PROFILE_RE.fullmatch(profile):
            raise ValueError("invalid profile name")
        messages = payload.get("messages")
        if not isinstance(messages, list) or not messages:
            raise ValueError("messages are required")
        request_body = json.dumps({"model": profile, "messages": messages, "stream": True}).encode("utf-8")
        url, key = profile_api(profile)
        upstream_request = urllib.request.Request(
            url,
            data=request_body,
            method="POST",
            headers={
                "authorization": f"Bearer {key}",
                "content-type": "application/json",
                "accept": "text/event-stream",
            },
        )
        try:
            upstream = urllib.request.urlopen(upstream_request, timeout=180)
        except urllib.error.HTTPError as exc:
            detail = exc.read(512).decode("utf-8", "replace")
            print(f"Hermes upstream {exc.code}: {detail}")
            self.send_json(502, {"ok": False, "error": "Hermes profile unavailable"})
            return
        self.send_response(200)
        self.send_header("content-type", upstream.headers.get("content-type", "text/event-stream"))
        self.send_header("cache-control", "no-store")
        self.send_header("x-content-type-options", "nosniff")
        self.send_header("connection", "close")
        self.end_headers()
        try:
            while True:
                chunk = upstream.read(8192)
                if not chunk:
                    break
                self.wfile.write(chunk)
                self.wfile.flush()
        finally:
            upstream.close()
            self.close_connection = True


def main() -> None:
    if not SERVICE_KEY:
        raise SystemExit("PROFILE_SERVICE_KEY is required")
    if HOST not in {"127.0.0.1", "::1", "localhost"}:
        raise SystemExit("profile service must bind to loopback")
    if not shutil.which(HERMES_BIN):
        raise SystemExit(f"Hermes executable not found: {HERMES_BIN}")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Hermes profile service listening on {HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
