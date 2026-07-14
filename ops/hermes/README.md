# Public Hermes runtime

This runbook creates a separate, least-privileged Hermes profile for the public Press and RICE chat interface. It must never reuse the private `stexpedite` profile as the public API process.

## Boundary

- Profile: `stexpedite-public`
- API: `127.0.0.1:8643` only
- Public ingress: Cloudflare Worker through an authenticated Cloudflare Tunnel origin
- Model credential: only `OPENROUTER_API_KEY`
- Hermes API credential: generated per profile as `API_SERVER_KEY`
- Tools, skills, memory, delegation, terminal, files, browser, code execution, and cron: disabled for the `api_server` platform

The Worker stores the matching upstream bearer value as `HERMES_API_KEY`; the browser never receives it. `HERMES_API_URL` must point to the tunnel hostname and `/v1/chat/completions` path. Do not open port 8643 in the EC2 security group.

## Provision

Run from the canonical repository on the EC2 host:

```bash
bash ops/hermes/setup-public-profile.sh
```

The prototype deliberately uses OpenRouter's free router while the interface is being validated. Before production, select a paid model with an explicit cost budget and provider data-retention policy.

## Verify

```bash
hermes profile show stexpedite-public
hermes -p stexpedite-public tools list --platform api_server
hermes -p stexpedite-public gateway status
curl --fail http://127.0.0.1:8643/health
ss -ltn | grep ':8643'
```

Expected: health succeeds, every API-server toolset is disabled, the gateway survives logout, and the listener is `127.0.0.1:8643` rather than `0.0.0.0:8643`.

## Production gate

Do not configure the public tunnel or deploy `/api/chat` until Worker validation, Turnstile, rate limiting, origin authentication, cost limits, log redaction, abort behavior, and an emergency kill switch have passed. The private `stexpedite` profile remains owner-only and outside this route.
