"""Stage the public GitHub Pages artifact without internal editorial material."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = (ROOT / "_site").resolve()
PUBLIC_FILES = {
    "404.html",
    "about.html",
    "archive.html",
    "archive-template.html",
    "crawfish-pond-with-saints.html",
    "crowley-modernism.html",
    "damp-heat-index.html",
    "essay-template.html",
    "essays.html",
    "fiction-template.html",
    "fiction.html",
    "field-at-1942.html",
    "fonts.css",
    "index.html",
    "poem-template.html",
    "poetry.html",
    "project.html",
    "robots.txt",
    "shop.html",
    "site.js",
    "sitemap.xml",
    "splash.html",
    "styles.css",
    "submissions.html",
    "the-pump-house.html",
    "year.html",
}
ASSET_PATTERN = re.compile(r"""assets/[A-Za-z0-9_./-]+""")
BANNED_PARTS = {
    "asset-library.html",
    "asset-library.css",
    "asset-library.js",
    "assets/catalog.json",
    "assets/site-assets.json",
    "assets/image-pools.json",
    "assets/masters/",
    "docs/",
    "scripts/",
}


def safe_reset_output() -> None:
    if OUTPUT.parent != ROOT.resolve() or OUTPUT.name != "_site":
        raise RuntimeError(f"Refusing to reset unexpected output path: {OUTPUT}")
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()


def copy_file(relative: str) -> None:
    source = ROOT / relative
    if not source.is_file():
        raise FileNotFoundError(f"Public source missing: {relative}")
    destination = OUTPUT / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def build_public_articles() -> None:
    source = json.loads((ROOT / "assets" / "articles.json").read_text(encoding="utf-8"))
    public_fields = {
        "id",
        "title",
        "category",
        "publication_state",
        "season",
        "is_sample",
        "place",
        "author",
        "date",
        "description",
        "keywords",
        "ref",
        "href",
        "hero",
        "disclosure",
    }
    records = [
        {key: article.get(key) for key in public_fields}
        for article in source["articles"]
        if article["publication_state"] in {"sample", "published"}
    ]
    payload = {
        "schema_version": source["schema_version"],
        "scope": "Public available RICE work records.",
        "articles": records,
    }
    target = OUTPUT / "assets" / "articles.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def validate_links() -> None:
    for html_path in OUTPUT.glob("*.html"):
        html = html_path.read_text(encoding="utf-8")
        for target in re.findall(r"""(?:href|src)=["']([^"']+)["']""", html):
            if target.startswith(("http://", "https://", "#", "mailto:", "data:")):
                continue
            clean = target.split("#", 1)[0].split("?", 1)[0]
            if clean and not (html_path.parent / clean).is_file():
                raise RuntimeError(f"{html_path.name}: broken public reference {target}")


def validate_boundary() -> None:
    public_paths = {path.relative_to(OUTPUT).as_posix() for path in OUTPUT.rglob("*") if path.is_file()}
    for path in public_paths:
        if any(part in path for part in BANNED_PARTS):
            raise RuntimeError(f"Internal file leaked into public artifact: {path}")
    if any(path.startswith("assets/masters/") for path in public_paths):
        raise RuntimeError("Master image leaked into public artifact")


def build() -> None:
    safe_reset_output()
    referenced_assets: set[str] = set()
    for relative in sorted(PUBLIC_FILES):
        copy_file(relative)
        if relative.endswith((".html", ".css", ".js")):
            referenced_assets.update(ASSET_PATTERN.findall((ROOT / relative).read_text(encoding="utf-8")))

    for relative in sorted(referenced_assets):
        if relative == "assets/articles.json":
            continue
        copy_file(relative)

    build_public_articles()
    validate_links()
    validate_boundary()
    print(f"Built public site with {sum(1 for item in OUTPUT.rglob('*') if item.is_file())} files")


if __name__ == "__main__":
    build()
