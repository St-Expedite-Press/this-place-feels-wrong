# Site Layouts

Top-level Astro layouts for generated pages.

## `Base.astro`

Interior and task-page shell. Used by all pages except the homepage portal and 404 page.

Props:
- `title`, `description`, `canonical` — SEO metadata
- `subtitle?`, `eyebrow?`, `introKicker?`, `introTitle?`, `introText?` — header card content (all optional; empty strings suppress the element)
- `currentNav?` — sets `aria-current="page"` on the matching nav pill
- `brandMode?` — `'ritual' | 'editorial' | 'utility'` (default: `'editorial'`)
- `styles` — array of stylesheet paths to inject (relative to `/assets/css/` root)
- `robots?` — overrides the default robots meta content

Renders: `<Head />`, `<HeroBar />`, `.texture--grain`, `<SiteHeader />`, `.page-intro` section, standardized `.page-content` flow around `<slot />`, and `<Footer />`.

## `BasePortal.astro`

Portal-page shell. Used by `index.astro` and `404.astro` — pages that use a full-viewport layout without the interior `<SiteHeader>` card.

Props: same as `Base.astro` minus the header/intro props (`subtitle`, `eyebrow`, `introKicker`, `introTitle`, `introText`, `currentNav`).

Additional props:
- `bodyClass?` — extra class on `<body>` (e.g. `"donate-portal-page"`)
- `ogTitle?`, `ogDescription?` — OG/Twitter title/description overrides (homepage uses custom values)
- `pageTitle?` — overrides the `<title>` element (homepage uses a longer custom title)

Named slots:
- `head-extra` — injected inside `<head>` before `<ClientRouter />` (used by homepage for crow image preload)
- `scripts` — injected before `</body>` for page-specific inline scripts

Renders: `<Head />`, `<HeroBar />`, `.texture--grain`, `.cursor-glow`, `<slot />`, `<slot name="scripts" />`.
