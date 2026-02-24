# Cloudflare Stability Thresholds

## Severity targets

- `P1`: all API endpoints unavailable
  - acknowledge within 15 minutes
  - mitigate within 60 minutes
- `P2`: single endpoint degraded
  - acknowledge within 60 minutes
  - mitigate within 1 business day

## Trigger defaults

- Page-worthy:
  - `5xx >= 5%` over 5 minutes for any API endpoint
- Ticket-worthy:
  - `5xx >= 1%` over 15 minutes
  - or `p95 latency > 1500ms` over 15 minutes
- Investigate:
  - intermittent failures below thresholds
