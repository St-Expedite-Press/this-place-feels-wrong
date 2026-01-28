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

GitHub Pages cannot send email by itself (static hosting). You need a form backend that forwards submissions to email.

### Recommended (for now): Formspree

1. Create a Formspree form and set its recipient/notifications to `editor@stexpedite.press`.
2. Copy the form endpoint URL (looks like `https://formspree.io/f/<id>`).
3. Replace `https://formspree.io/f/REPLACE_ME` in:
   - `contact.html`
   - `index.html` (updates form)
4. Test live on GitHub Pages:
   - Submit the Contact form and confirm delivery to `editor@stexpedite.press`.
   - Submit the Updates form and confirm delivery to `editor@stexpedite.press`.

### Notes

- Current choice: **Formspree** as the temporary form backend until a custom mail/API solution is in place.
- Make sure `editor@stexpedite.press` is a real inbox or a forwarding alias (Google Workspace / Proton / Fastmail / Cloudflare Email Routing, etc.).
- If you want submissions to send without opening an email client, convert `submit.html` from `mailto:` to a form backend as well (same approach as Contact).
