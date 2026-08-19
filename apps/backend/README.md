# St. Expedite backend

Cloudflare Worker for the St. Expedite Press API surface.

## Routes

Core public/application routes include:

- `GET /api/health`
- `GET /api/storefront`
- `GET /api/projects`
- `GET /api/works`
- `POST /api/chat`
- `GET /api/chat/history`
- `GET /api/profiles`
- `GET /api/profile-models`
- `POST /api/profiles/create`
- `DELETE /api/profiles/{id}`
- `POST /api/contact`
- `POST /api/submit`
- `POST /api/donate/session`
- `POST /api/stripe/webhook`
- `POST /api/updates`
- `POST /api/updates/import`
- `POST /api/updates/unsubscribe`

Visitor/admin authentication and management routes remain in the legacy Worker implementation while the chat profile migration is in progress.

## Entry points

`src/entry.ts` is the Worker entry point on the profile-native branch. It deliberately migrates only the standalone `chat.stexpedite.press` chat origin first. Embedded St. Expedite and RICE chat requests continue through `src/index.ts` until they are migrated explicitly.

`src/profile-entry.ts` implements Hermes-profile authorization/routing and delegates unrelated API routes to `src/index.ts`.

## Chat architecture

The standalone chat treats a Hermes profile as the assistant runtime:

```text
browser
  -> Worker
      -> default public Hermes profile
      -> or an authenticated visitor-owned Hermes profile
```

The Worker owns application authentication, authorization, D1 rate limits, temporary transcript persistence, model allow-list resolution for profile creation, and verified public context injection for the default St. Expedite assistant. It never returns a Hermes API credential to the browser.

Anonymous requests use the D1 profile where `is_default = 1`. A logged-in visitor may select only a public profile or a private profile whose `owner_account_id` matches the authenticated visitor account.

Visitor profile creation is forwarded to the private host-side service documented in `ops/hermes/README.md`. Required Worker configuration:

```text
HERMES_PROFILE_SERVICE_URL
HERMES_PROFILE_SERVICE_KEY
PROFILE_LIMIT_PER_ACCOUNT
```

`HERMES_API_URL` and `HERMES_API_KEY` remain as a temporary default-profile fallback until the profile service cutover is verified.

The old `presetId` Worker/OpenRouter pipeline remains only for preset IDs that have not yet migrated. New `profile-*` identifiers route to Hermes profiles. Do not add features to the legacy preset executor.

## Runtime dependencies

- Resend for contact and submission email delivery
- Stripe Checkout for donations
- D1 for updates, works/projects data, chat transcript storage, visitor accounts, assistant ownership, and rate limiting
- Turnstile validation on public POST routes when configured
- Fourthwall storefront API for merchandise data
- isolated Hermes API servers for assistant execution
- private host-side Hermes profile service for visitor profile creation/deletion and chat proxying

`POST /api/submit` accepts the existing JSON inquiry or a multipart manuscript submission. Multipart delivery requires author metadata, consent, Turnstile, and one allowlisted file up to 10 MiB. The editor email receives the attachment; the submitter receives a reference receipt. D1 stores metadata only, never manuscript contents.

## Database

Apply migrations in order. Profile-native chat adds:

```text
0028_assistant_profiles.sql
```

That migration creates the application profile index, seeds the public `stexpedite-public` profile as the default assistant, and adds a nullable `profile_id` binding to chat conversations for compatibility with existing transcripts.

## Local commands

From repo root:

```bash
npm run dev:worker
npm run test:worker
npm run deploy:worker
```

Direct worker commands:

```bash
cd apps/backend
npm run test
npm run deploy
```

## First-party browser origins

Browser CORS permits St. Expedite first-party origins and localhost/loopback development origins. Cookies are used only on allow-listed first-party origins. Profile ownership is always checked server-side; the browser never supplies a Hermes filesystem/profile name as authority.

## Contract files

- Worker entry: `apps/backend/src/entry.ts`
- profile-native routing: `apps/backend/src/profile-entry.ts`
- legacy route implementation: `apps/backend/src/index.ts`
- config: `apps/backend/wrangler.toml`
- public contract: `apps/backend/openapi.yaml`
- migrations: `apps/backend/migrations/`
- tests: `apps/backend/test/`
