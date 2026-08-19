# Hermes chat runtime

The chat system uses real Hermes profiles as assistants. The Cloudflare Worker owns application authentication, authorization, rate limits, temporary transcript storage, and routing; Hermes owns assistant instructions, model configuration, and model execution.

The private owner profile `stexpedite` is never a public chat runtime.

## Default public assistant

- Hermes profile: `stexpedite-public`
- API: `127.0.0.1:8643` only
- Public ingress: Cloudflare Worker through an authenticated Cloudflare Tunnel origin
- Model credential: only `OPENROUTER_API_KEY`
- Hermes API credential: generated per profile as `API_SERVER_KEY`
- Long-term Hermes memory: disabled
- API-server tools: all disabled except `vision`

The default assistant is general-purpose and also receives verified public St. Expedite/RICE context from the trusted Worker when relevant. The profile never receives submissions, donor/subscriber data, private memory, environment values, or logs.

Provision it from the canonical EC2 checkout:

```bash
bash ops/hermes/setup-public-profile.sh
```

Verify:

```bash
hermes profile show stexpedite-public
hermes -p stexpedite-public tools list --platform api_server
hermes -p stexpedite-public gateway status
curl --fail http://127.0.0.1:8643/health
ss -ltn | grep ':8643'
```

Expected: health succeeds, every API-server toolset is disabled except `vision`, the gateway survives logout, and the listener is loopback-only.

## Visitor-created assistants

Authenticated visitors may create private assistants. Each assistant is a real isolated Hermes profile. D1 stores application ownership and sanitized display/configuration metadata; it does not store Hermes API keys.

The first implementation deliberately follows Hermes' documented one-gateway-per-profile multi-user pattern. Each generated `user-*` profile receives:

- its own `config.yaml`, `.env`, `SOUL.md`, API key, and loopback API port;
- one owner-allow-listed main model;
- optionally one owner-allow-listed delegation model;
- memory disabled;
- no skills installation;
- all API-server tools disabled except `vision`, plus `delegation` only when a delegation model is configured;
- no terminal, files, browser, code execution, cron, private Press data, or deployment access.

The profile text cannot grant itself tools. Tool policy is reapplied by the host service during provisioning.

### Profile service

`ops/hermes/profile-service.py` is the only host-side service allowed to create/delete visitor profiles and proxy chat to their profile-specific Hermes API servers. It does not expose arbitrary shell, file, environment, or Hermes CLI execution.

Install it:

```bash
bash ops/hermes/setup-profile-service.sh
```

The service binds only to `127.0.0.1:8765` and requires `PROFILE_SERVICE_KEY`. Its environment is stored at:

```text
~/.config/stexpedite/profile-service.env
```

Do not open port 8765 or the generated profile port range in the EC2 security group. If the Cloudflare Worker must reach the service remotely, expose only the service through the existing authenticated Tunnel/origin boundary and set Worker secrets/configuration:

```text
HERMES_PROFILE_SERVICE_URL
HERMES_PROFILE_SERVICE_KEY
```

Never send that service key or a per-profile `API_SERVER_KEY` to the browser.

### Profile service API

Internal only:

```text
GET    /health
POST   /profiles
DELETE /profiles/<generated-user-profile-name>
POST   /chat
```

Profile mutation accepts only generated `user-*` names. The public `stexpedite-public` profile can be routed through `/chat` but cannot be mutated by this service.

## Current migration boundary

The standalone `chat.stexpedite.press` client is migrating first:

```text
browser
  -> Cloudflare Worker
      -> default St. Expedite Hermes profile
      -> or authorized visitor-owned Hermes profile
```

Embedded St. Expedite/RICE chat clients keep their existing `surface` behavior during this migration. Old Worker-executed preset pipelines remain only as compatibility for unmigrated preset IDs; no new UI should create those pipelines. Remove that code after profile migration and regression tests pass.

## Hermes multiplexing

Current Hermes releases also support multi-profile routing on one shared listener via `/p/<profile>/...` when `gateway.multiplex_profiles` is enabled. Do not switch production to multiplexing solely from documentation. First verify the installed EC2 Hermes version and profile-key isolation on-host. The per-profile loopback-gateway implementation above is the conservative supported baseline and can be replaced later without changing the browser or D1 profile IDs.

## Production gate

Do not deploy the profile-native branch until all of the following pass:

- D1 migration `0028_assistant_profiles.sql` applied in a non-production environment;
- public default assistant regression tests;
- visitor login and profile ownership tests;
- profile creation/deletion against real disposable Hermes profiles;
- prohibited tool checks for public and visitor profiles;
- Turnstile and rate limiting;
- streaming and abort behavior;
- image behavior for supported models;
- 30-day transcript-retention disclosure in the UI;
- cost/model allow-list review;
- emergency disable path for visitor profile provisioning;
- log review confirming secrets and user instructions are not emitted.

The private `stexpedite` profile remains owner-only throughout.
