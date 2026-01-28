# Deployment (GitHub Pages) + Email Forms

## GitHub Pages (CI/CD)

This repo is a static site (no build step). Deployment is handled by GitHub Actions via `.github/workflows/deploy-pages.yml`.

1. Push to the `main` branch on GitHub.
2. In GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. The workflow will deploy on every push to `main`.

### Custom domain (`stexpedite.press`)

This repo includes a `CNAME` file set to `stexpedite.press`.

1. In GitHub: **Settings → Pages → Custom domain**, set it to `stexpedite.press`.
2. Configure DNS for `stexpedite.press` per GitHub Pages custom-domain instructions (apex + optional `www`).
3. Wait for HTTPS certificate provisioning (GitHub will show status in the Pages settings).

## Email service (Contact + Updates)

GitHub Pages cannot send email by itself (static hosting). For now this site uses `mailto:` for:

- `contact.html` (Contact form)
- `index.html` (Updates form)
- `submit.html` (Submission helper)

This reliably addresses messages to `editor@stexpedite.press`, but it depends on the visitor having a configured email client (it opens a compose window rather than sending server-side).

If/when you want server-side sending (no email client required), use a form backend (Formspree, Cloudflare Worker + email provider, Netlify, etc.) and swap the forms back to POST.
