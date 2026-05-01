# SEO/AIO Notes

Planning notes for SEO and AI-discoverability work against the generated public artifact.

Current path assumptions:

- generated HTML: `apps/web/dist/**/*.html`
- generated robots: `apps/web/dist/robots.txt`
- sitemap reference: `apps/web/public/robots.txt` currently points at `https://stexpedite.press/sitemap.xml`; verify a generated sitemap exists before treating this as complete.

Use this document as a planning aid only. Do not treat it as a live implementation checklist without re-validating the generated output with `npm run build` and `npm run check:seo`.
