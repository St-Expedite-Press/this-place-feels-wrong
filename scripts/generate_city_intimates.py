"""Generate the 2011 city-intimacy masters with FLUX.2 Flex via OpenRouter.

Run from the repository root:
    python scripts/generate_city_intimates.py
"""

from __future__ import annotations

import base64
import argparse
import io
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ENV = ROOT.parent / ".env"
LIBRARY_ROOT = ROOT / "images" / "editorial" / "city-field-notes"
ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"


def load_env_value(name: str) -> str | None:
    if os.environ.get(name):
        return os.environ[name]
    if not WORKSPACE_ENV.exists():
        return None
    for raw_line in WORKSPACE_ENV.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == name:
            return value.strip().strip('"').strip("'")
    return None


def request_image(api_key: str, model: str, prompt: str, aspect_ratio: str) -> bytes:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "modalities": ["image"],
        "image_config": {
            "aspect_ratio": aspect_ratio,
            "image_size": "1K",
        },
    }
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://st-expedite-press.github.io/rice-magazine/",
            "X-Title": "RICE Magazine City Field Notes",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=240) as response:
        result = json.loads(response.read().decode("utf-8"))
    images = result.get("choices", [{}])[0].get("message", {}).get("images", [])
    if not images:
        raise RuntimeError("OpenRouter returned no image")
    data_url = images[0]["image_url"]["url"]
    _, encoded = data_url.split(",", 1)
    return base64.b64decode(encoded)


def save_master(image_bytes: bytes, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(io.BytesIO(image_bytes)) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.save(destination, "JPEG", quality=95, optimize=True, progressive=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--manifest",
        default="docs/city-intimate-prompts.json",
        help="Prompt manifest relative to the repository root.",
    )
    parser.add_argument(
        "--tier",
        choices=("master", "proof"),
        default="master",
        help="Destination tier. Proofs are not cataloged as approved assets.",
    )
    args = parser.parse_args()
    manifest_path = ROOT / args.manifest

    api_key = load_env_value("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    shared = manifest["shared_prompt"]
    negative = manifest["negative_prompt"]
    jobs = [
        (city, image)
        for city in manifest["cities"]
        for image in city["images"]
    ]

    for index, (city, image) in enumerate(jobs, start=1):
        destination = LIBRARY_ROOT / city["slug"] / args.tier / image["filename"]
        if destination.exists():
            print(f"[{index:02d}/{len(jobs)}] exists: {destination.relative_to(ROOT)}")
            continue
        prompt = (
            f"{image['prompt']}\n\n"
            f"{shared}\n\n"
            f"Avoid: {negative}"
        )
        for attempt in range(1, 4):
            try:
                image_bytes = request_image(
                    api_key,
                    manifest["model"],
                    prompt,
                    image["aspect_ratio"],
                )
                save_master(image_bytes, destination)
                print(f"[{index:02d}/{len(jobs)}] generated: {destination.relative_to(ROOT)}")
                break
            except (urllib.error.URLError, TimeoutError, RuntimeError, KeyError, ValueError) as error:
                if attempt == 3:
                    raise RuntimeError(
                        f"Failed after 3 attempts: {city['slug']}/{image['filename']}"
                    ) from error
                time.sleep(attempt * 5)


if __name__ == "__main__":
    main()
