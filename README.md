# St. Expedite Press Portal

_St. Expedite Press Website_ (`this-place-feels-wrong`)

Static neon portal for St. Expedite Press: a cursor-responsive portal, a circular “portal” frame, and interior pages (Books / Store / Services / Mission / Lab / Contact / Submission).

## Current State
- **Entry point:** `site/index.html` (published at `/`)
- **Interior pages:** `site/books.html`, `site/gallery.html`, `site/services.html`, `site/mission.html`, `site/lab.html`, `site/contact.html`, `site/submit.html`
- **Assets:** `site/assets/` (CSS/JS/images)

## Repository Layout
- **Deployable site:** `site/`  
  GitHub Pages publishes the contents of this directory.
- **Infrastructure/docs:** `workers/`, `docs/`, `DEPLOYMENT.md`, `CHANGELOG.md`

## Local Development
This is a static site; there is no build step.

```bash
cd site
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Deployment
See `DEPLOYMENT.md` for GitHub Pages (CI/CD) and the Cloudflare Worker + Resend email setup.
