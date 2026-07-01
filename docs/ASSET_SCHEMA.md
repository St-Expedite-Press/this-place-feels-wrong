# RICE Asset Category Schema

This is the canonical definition of how every RICE image is categorized. The
category is a **coarse routing layer that sits above** the existing per-inventory
`role`/`family` taxonomy — it answers "where on the site may this image be used?",
not "what does it depict?".

The single source of truth is [`../scripts/asset_categories.py`](../scripts/asset_categories.py).
Both build scripts and the validator import it, and each inventory file emits a
`categories` block so the schema is defined in exactly one place.

## Categories

Every catalogued asset — editorial or standalone — carries exactly one `category`.

| Category | Binding | Used for |
|---|---|---|
| `archive` | Unbound, reusable | Imagery droppable into archive image slots **anywhere** on the site. Not tied to one piece or page. |
| `article` | Bound to one piece | Imagery tied directly to a single article, essay, poem, or fiction piece. |
| `feature` | Bound to a site element | Imagery tied to a site element such as a section landing, the shop, or submissions. |
| `photo` | Standalone submission | Standalone photography or photo-submission carousels. *(Reserved — no assets yet.)* |
| `system` | Site chrome | Identity and UI media: logo, surface textures, splash video/poster, fallbacks. Not editorial content. |

`archive`, `article`, `feature`, and `photo` are the four **content** categories.
`system` is the non-content bucket for chrome that does not fit any of them.

The category is also the **on-disk layout**: fallback images live in
`assets/images/<category>/`, responsive WebP variants in
`assets/responsive/<category>/`, and masters in `assets/masters/<category>/`.

> **Two `category` axes.** This image-slot taxonomy is distinct from the *work*
> taxonomy that classifies articles (see [Works](#works--assetsarticlesjson)).
> They share some labels but answer different questions — an image's category
> routes its placement; a work's category names its content type.

**`place`** is the shared geographic field. Images carry `place`/`place_slug`
(renamed from `city`/`city_slug`); articles carry `place` (was the informal
"parish"). Same field name, one concept, both sides.

## Current mapping

### Editorial collection — `assets/catalog.json`

Driven by `ROLE_META` in [`../scripts/build_asset_library.py`](../scripts/build_asset_library.py):

| Role (code) | Family | Category |
|---|---|---|
| Street field note (`SFN`) | section-feature | `archive` |
| Archival evidence (`ARC`) | archive-object | `archive` |
| Working interior (`WIN`) | article-figure | `article` |
| Maker portrait (`POR`) | author-portrait | `article` |
| Nocturnal aftermath (`NOC`) | fiction-feature | `article` |

Street field notes are categorized `archive` because they are a reusable Southern-city
pool rather than imagery bound to one published piece.

### Standalone site media — `assets/site-assets.json`

Driven by the `ASSETS` map in [`../scripts/build_site_asset_inventory.py`](../scripts/build_site_asset_inventory.py):

| Asset | Role | Category |
|---|---|---|
| `archive-ledger.jpg` | archive-document | `archive` |
| `feature-archive.png`, `feature-essays.jpg`, `feature-fiction.jpg`, `feature-poetry.jpg` | section-feature | `feature` |
| `feature.png` | general-feature | `feature` |
| `issue-specimen.jpg` | publication-specimen | `feature` |
| `logo.png` | site-identity | `system` |
| `noise.png` | surface-texture | `system` |
| `rice-field-loop.mp4` | splash-background-video | `system` |
| `rice_field.png` | splash-poster-and-feature | `system` |
| `archive-placeholder.png` | fallback-texture | `system` |

## Adding or recategorizing an asset

1. Editorial: set the role's `category` in `ROLE_META` (this also routes its
   master/web folders). Standalone: set the `category` key in the `ASSETS` map and
   place the file in `assets/images/<category>/`.
2. Use only a slug from `CATEGORIES`; the build scripts and `check_assets.py` reject
   anything else.
3. Rebuild and validate:
   ```powershell
   python scripts/build_asset_library.py
   python scripts/build_site_asset_inventory.py
   python scripts/build_image_pools.py
   python scripts/check_assets.py
   ```
4. The asset-library browser (`asset-library.html`) reads the catalog `categories`
   block and exposes a Category filter automatically — no JS change needed.

## Public determinism

`build_image_pools.py` still emits internal editorial selection pools, but the
public archive does not randomize records. Every displayed archive object has a
stable `RICE-VR-*` identity, matching detail route, and visible reconstruction
disclosure. See [`PHOTO_SLOTS.md`](PHOTO_SLOTS.md).

## Works — `assets/articles.json`

Articles (works) have their own data model and **work taxonomy** (`ARTICLE_CATEGORIES`
in `asset_categories.py`), separate from the image-slot taxonomy above:

| Work category | Meaning |
|---|---|
| `article` | Essay or non-fiction prose. |
| `fiction` | Short fiction or prose narrative. |
| `poetry` | Poems and poem sequences. |
| `photo` | Photo essays or standalone photographic work. *(Reserved — no works yet.)* |
| `archive` | Archival records, documents, and field evidence. |

Each work record carries: `id`, `title`, `category`, `publication_state`,
`season`, `is_sample`, `place`, `author`, `date`, `description`, `keywords`,
`ref`, nullable `href`, `hero`, and `disclosure`. `sample` and `published`
records require a matching stable route; `planned` and `withdrawn` records
require `href: null`. `site.js` indexes only available work, and
`check_assets.py` verifies destination-title and archive-disclosure integrity.

## Notes

- Adding a new image category means editing `CATEGORIES`, and a new work category
  means editing `ARTICLE_CATEGORIES` — both once, in `asset_categories.py`.
- Media files are recognized by extension (`MEDIA_SUFFIXES`); companion files such
  as `AGENTS.md` / `MEMORY.md` under `assets/images/` are ignored by the inventory.
- `check_assets.py` rejects any orphan served file (one not covered by an inventory).
- The `photo` category is defined ahead of the first photo submissions so the
  pipeline and browser are ready when they arrive.
