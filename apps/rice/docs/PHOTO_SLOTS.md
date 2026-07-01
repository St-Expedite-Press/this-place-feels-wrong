# RICE Public Image Slot Map

The machine-readable source is `assets/photo-slots.json`. The current public
site has 12 deterministic slots and no runtime-randomized archive cards.

| Category | Slots |
|---|---:|
| `feature` | 5 |
| `archive` | 5 |
| `article` | 1 |
| `system` | 1 |
| `photo` | 0 |

## Public slots

| Slot | Page | Image | Destination / status |
|---|---|---|---|
| `splash-cover` | `splash.html` | `rice_field.png` | Decorative monochrome cover |
| `index-lead` | `index.html` | `feature-essays.jpg` | `crowley-modernism.html` |
| `essays-lead` | `essays.html` | `feature-essays.jpg` | `crowley-modernism.html` |
| `fiction-lead` | `fiction.html` | `feature-fiction.jpg` | `the-pump-house.html` |
| `poetry-lead` | `poetry.html` | `feature-poetry.jpg` | `crawfish-pond-with-saints.html` |
| `shop-specimen` | `shop.html` | `issue-specimen.jpg` | Early specimen; no checkout |
| `archive-field-card` | `archive.html` | `new-orleans-street-field-note.jpg` | `field-at-1942.html` / disclosed reconstruction |
| `archive-document-card` | `archive.html` | `athens-archival-evidence.jpg` | `damp-heat-index.html` / disclosed reconstruction |
| `archive-field-detail` | `field-at-1942.html` | same | Stable `RICE-VR-FLD-001` record |
| `archive-document-detail` | `damp-heat-index.html` | same | Stable `RICE-VR-ARC-002` record |
| `essay-document-insert` | `crowley-modernism.html` | `new-orleans-archival-evidence.jpg` | Visible reconstruction caption |
| `fiction-full-bleed` | `the-pump-house.html` | `new-orleans-nocturnal-aftermath.jpg` | Article-bound figure |

## Update workflow

1. Edit the owning HTML.
2. Mirror image, link, caption, category, and disclosure changes in
   `assets/photo-slots.json`.
3. Generate responsive variants.
4. Run `scripts/check_assets.py` and `scripts/build_public_site.py`.
5. Confirm `_site/` contains the referenced responsive/fallback files and no
   internal master or catalog.
