"""Canonical RICE taxonomies — the data-model source of truth.

Two distinct axes live here, both imported by the build scripts and the validator:

1. :data:`CATEGORIES` — the **image slot** taxonomy. Answers "where may this image
   be placed?" Every catalogued image carries one slug from this set.
2. :data:`ARTICLE_CATEGORIES` — the **work** taxonomy. Answers "what kind of work is
   this?" Every article in ``articles.json`` carries one slug from this set.

They share some labels (`article`, `photo`, `archive`) but are different concepts:
an image's category routes its placement; a work's category names its content type.

``place`` is the shared geographic field on both images (`place`/`place_slug`, was
`city`) and articles (`place`, was the informal "parish").
"""

from __future__ import annotations

# Image slot taxonomy. Ordered: the four content categories first, system last.
CATEGORIES = {
    "archive": "Reusable archival imagery for archive image slots anywhere on the site.",
    "article": "Imagery bound directly to a single article, essay, poem, or fiction piece.",
    "feature": "Imagery bound to a site element such as a section landing, shop, or submissions.",
    "photo": "Standalone photography or photo-submission carousels.",
    "system": "Site chrome and identity media: logo, textures, splash, and fallbacks.",
}

# Work taxonomy — the content type of an article/work.
ARTICLE_CATEGORIES = {
    "article": "Essay or non-fiction prose.",
    "fiction": "Short fiction or prose narrative.",
    "poetry": "Poems and poem sequences.",
    "photo": "Photo essays or standalone photographic work.",
    "archive": "Archival records, documents, and field evidence.",
}

# The categories that describe published editorial/content imagery.
CONTENT_CATEGORIES = ("archive", "article", "feature", "photo")

# File extensions the inventories treat as managed media. Companion files such
# as AGENTS.md, MEMORY.md, and README.md live alongside images but are not assets.
MEDIA_SUFFIXES = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".mp4", ".webm"}


def is_media(path) -> bool:
    """True if ``path`` is a managed media file (by extension)."""
    return path.is_file() and path.suffix.lower() in MEDIA_SUFFIXES


def category_block() -> list[dict]:
    """Return the serialisable image-category definitions for an inventory file."""
    return [{"id": slug, "description": description} for slug, description in CATEGORIES.items()]


def article_category_block() -> list[dict]:
    """Return the serialisable work-category definitions for articles.json."""
    return [{"id": slug, "description": description} for slug, description in ARTICLE_CATEGORIES.items()]


def validate_category(category: str, label: str) -> None:
    """Raise if ``category`` is not one of the canonical image-slot slugs."""
    if category not in CATEGORIES:
        raise ValueError(
            f"{label}: unknown image category {category!r}; "
            f"expected one of {', '.join(CATEGORIES)}"
        )


def validate_article_category(category: str, label: str) -> None:
    """Raise if ``category`` is not one of the canonical work slugs."""
    if category not in ARTICLE_CATEGORIES:
        raise ValueError(
            f"{label}: unknown article category {category!r}; "
            f"expected one of {', '.join(ARTICLE_CATEGORIES)}"
        )
