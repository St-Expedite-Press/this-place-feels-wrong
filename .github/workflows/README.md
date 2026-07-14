# Workflows

GitHub Actions workflows for this project.

Current workflows:

- `deploy-stex.yml` validates the monorepo and publishes the St. Expedite Pages artifact.
- `deploy-rice.yml` builds and publishes the allowlisted RICE artifact.
- `deploy-chat.yml` validates on pull requests and deploys chat only by manual dispatch.
- `deploy-backend.yml` tests on pull requests and deploys the Worker only by manual dispatch.
- `api-health-monitor.yml` probes production API behavior on a schedule.
