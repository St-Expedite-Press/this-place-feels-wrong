# Workflows

GitHub Actions workflows for this project.

Current workflows:

- `deploy-pages.yml` validates app output and tooling integrity, then publishes the Cloudflare Pages artifact using `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets.
- `api-health-monitor.yml` probes production API behavior on a schedule.
