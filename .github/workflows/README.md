# Workflows

GitHub Actions workflows for this project.

Current workflows:

- `deploy-pages.yml` validates the repo, builds `apps/web/dist/`, and publishes the Cloudflare Pages artifact.
- `api-health-monitor.yml` probes production API behavior on a schedule.
