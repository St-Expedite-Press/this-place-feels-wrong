# Deployment (GitHub Pages) + Email Forms

## GitHub Pages (CI/CD)

This repo is a static site (no build step). Deployment is handled by GitHub Actions via `.github/workflows/deploy-pages.yml`.

The workflow publishes the contents of `site/` (copied into the Pages artifact), so everything that should be public must live under `site/`.

1. Push to the `main` branch on GitHub.
2. In GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. The workflow deploys on every push to `main`.

### Custom domain (`stexpedite.press`)

The deployed site includes `site/CNAME` set to `stexpedite.press`.

1. In GitHub: **Settings → Pages → Custom domain**, set it to `stexpedite.press`.
2. Configure DNS for `stexpedite.press` per GitHub Pages custom-domain instructions (apex + optional `www`).
3. Wait for HTTPS certificate provisioning (GitHub will show status in Pages settings).

## Email (Contact + Submissions)

GitHub Pages cannot send email by itself (static hosting). This site sends email via a Cloudflare Worker (with a `mailto:` fallback so the site still works if the Worker is down/misconfigured):

- `site/contact.html` → `POST /api/contact`
- `site/submit.html` → `POST /api/submit`

The Worker lives at `workers/communications/` and is intended to be routed on Cloudflare for:

`stexpedite.press/api/*`

If the route is not configured or the request fails, the frontend falls back to opening the user’s email client addressed to `editor@stexpedite.press`.

## Updates (Newsletter)

Newsletter signup is handled by Substack (no Worker). The “Get updates” UI opens a Substack subscribe URL (and offers a copy fallback).
