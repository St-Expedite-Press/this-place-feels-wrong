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

# Profile-native chat cutover runbook

This is the production migration procedure for branch `profile-native-chat`. Follow it in order. Do not delete the legacy preset executor until the final cleanup gate passes.

## 1. Preflight on the repository branch

From any checkout with Node/npm available:

```bash
git switch profile-native-chat
git pull --ff-only
npm ci
npm run test:backend
npm run test:chat-client
npm run build:chat
npm run check:docs
python3 -m py_compile ops/hermes/profile-service.py
bash -n ops/hermes/setup-public-profile.sh ops/hermes/setup-profile-service.sh
```

All commands must exit zero. Also confirm the PR validation workflows are green before touching production infrastructure.

Do not deploy from a dirty checkout:

```bash
git status --short
```

Expected: no output.

## 2. Inspect the EC2 Hermes installation before changing it

On the EC2 host, use the canonical checkout:

```bash
cd /home/ec2-user/src/this-place-feels-wrong
git fetch origin
git switch profile-native-chat
git pull --ff-only
```

Record the installed Hermes version and current profiles:

```bash
hermes --version
hermes profile list
hermes profile show stexpedite
hermes profile show stexpedite-public || true
```

Confirm the CLI used by the provisioning service supports the commands used in `profile-service.py`:

```bash
hermes profile --help
hermes config --help
hermes tools --help
hermes gateway --help
```

If any command or option used by `ops/hermes/profile-service.py` is absent on the installed version, stop. Update and validate the runbook/service against the installed Hermes version before proceeding.

## 3. Back up current runtime configuration

Do not copy secrets into the repository. Make a host-local backup with restrictive permissions:

```bash
backup_dir="$HOME/stexpedite-hermes-backup-$(date -u +%Y%m%dT%H%M%SZ)"
umask 077
mkdir -p "$backup_dir"
cp -a "$HOME/.hermes/profiles" "$backup_dir/"
cp -a "$HOME/.config/stexpedite" "$backup_dir/" 2>/dev/null || true
printf 'Backup: %s\n' "$backup_dir"
```

Keep this path until the cutover has survived a full regression pass.

## 4. Validate the D1 migration locally first

The migration is append-only:

```text
apps/backend/migrations/0028_assistant_profiles.sql
```

Apply the full migration chain to Wrangler's local D1 database first:

```bash
cd /home/ec2-user/src/this-place-feels-wrong/apps/backend
npx wrangler d1 migrations apply stexpedite-updates --local
```

Then inspect the local database:

```bash
npx wrangler d1 execute stexpedite-updates --local --command \
  "SELECT id, hermes_profile_name, display_name, visibility, status, is_default FROM assistant_profiles;"
```

Expected: exactly one seeded default row named `stexpedite-public`, with `visibility='public'`, `status='ready'`, and `is_default=1`.

Do not apply the migration remotely until this local test succeeds.

## 5. Provision or verify the default public Hermes profile

From the repository root on EC2:

```bash
cd /home/ec2-user/src/this-place-feels-wrong
bash ops/hermes/setup-public-profile.sh
```

Verify the profile before continuing:

```bash
hermes profile show stexpedite-public
hermes -p stexpedite-public tools list --platform api_server
hermes -p stexpedite-public gateway status
curl --fail http://127.0.0.1:8643/health
ss -ltn | grep ':8643'
```

Required properties:

- listener is `127.0.0.1`, not `0.0.0.0`;
- long-term memory is disabled;
- API-server tools are disabled except `vision`;
- the private `stexpedite` owner profile remains separate and unchanged.

If the tool listing does not match that policy, stop the cutover.

## 6. Install the private profile service

Run:

```bash
bash ops/hermes/setup-profile-service.sh
```

Load its generated environment without printing the key:

```bash
set -a
source "$HOME/.config/stexpedite/profile-service.env"
set +a
```

Check the service:

```bash
systemctl --user status stexpedite-profile-service.service --no-pager
curl --fail \
  -H "Authorization: Bearer ${PROFILE_SERVICE_KEY}" \
  http://127.0.0.1:8765/health
ss -ltn | grep ':8765'
```

Expected:

- systemd unit is active;
- health returns success;
- port 8765 is loopback-only;
- no `8700-8799` profile port is externally exposed by the EC2 security group.

## 7. Create a disposable user profile directly through the service

Choose a real model reference that is already in the application's enabled model allow-list. Do not paste an API key into this request.

Example shape:

```bash
curl --fail \
  -H "Authorization: Bearer ${PROFILE_SERVICE_KEY}" \
  -H 'Content-Type: application/json' \
  http://127.0.0.1:8765/profiles \
  --data '{
    "profileName":"user-cutover-test-001",
    "instructions":"Answer concisely. This is a disposable cutover test profile.",
    "primaryModel":"PROVIDER/MODEL"
  }'
```

Replace `PROVIDER/MODEL` with an enabled real model reference before running it.

Verify isolation:

```bash
hermes profile show user-cutover-test-001
hermes -p user-cutover-test-001 tools list --platform api_server
hermes -p user-cutover-test-001 gateway status
```

Required result: only `vision` is enabled unless a delegation model was explicitly configured. Terminal, file, browser, code execution, memory, skills, cron, and deployment capabilities must remain disabled.

Test chat through the profile service:

```bash
curl --fail -N \
  -H "Authorization: Bearer ${PROFILE_SERVICE_KEY}" \
  -H 'Content-Type: application/json' \
  http://127.0.0.1:8765/chat \
  --data '{
    "profileName":"user-cutover-test-001",
    "messages":[{"role":"user","content":"Reply with exactly: profile isolation works"}],
    "stream":true
  }'
```

Then delete it:

```bash
curl --fail -X DELETE \
  -H "Authorization: Bearer ${PROFILE_SERVICE_KEY}" \
  http://127.0.0.1:8765/profiles/user-cutover-test-001

hermes profile show user-cutover-test-001 && exit 1 || true
```

Do not continue if creation, chat, isolation, or deletion fails.

## 8. Expose only the profile service through the authenticated origin boundary

The Worker cannot call `127.0.0.1:8765` directly from Cloudflare. Route the profile service through the existing authenticated Cloudflare Tunnel/origin mechanism already used for Hermes. Do not create a public listener and do not open EC2 ports 8765 or 8700-8799.

The resulting Worker-facing URL must terminate at the profile service and must not expose arbitrary EC2 paths. Record it as:

```text
HERMES_PROFILE_SERVICE_URL=https://<authenticated-internal-origin>
```

Before configuring the Worker, test that unauthenticated requests fail and the bearer-authenticated `/health` request succeeds through that origin.

Do not put the service bearer token in repository files, Pages variables, browser JavaScript, or D1.

## 9. Apply the D1 migration remotely

Only after steps 1-8 pass:

```bash
cd /home/ec2-user/src/this-place-feels-wrong/apps/backend
npx wrangler d1 migrations apply stexpedite-updates --remote
```

Verify the seeded row remotely:

```bash
npx wrangler d1 execute stexpedite-updates --remote --command \
  "SELECT id, hermes_profile_name, display_name, visibility, status, is_default FROM assistant_profiles;"
```

Do not manually edit the migration after it has been applied remotely. Any later schema correction must be a new migration.

## 10. Configure Worker profile-service secrets

Set the service key as a Worker secret from a shell that has `PROFILE_SERVICE_KEY` loaded:

```bash
cd /home/ec2-user/src/this-place-feels-wrong/apps/backend
printf '%s' "$PROFILE_SERVICE_KEY" | npx wrangler secret put HERMES_PROFILE_SERVICE_KEY
```

Set `HERMES_PROFILE_SERVICE_URL` using the same deployment configuration mechanism currently used for non-secret Worker variables. Do not hard-code it into browser code.

Confirm the legacy `HERMES_API_URL` and `HERMES_API_KEY` remain available during the compatibility window; the default assistant fallback and embedded St. Expedite/RICE chat still depend on the existing path until the migration is fully complete.

## 11. Deploy the Worker only

From a clean branch checkout:

```bash
cd /home/ec2-user/src/this-place-feels-wrong
npm run test:backend
npm run deploy:worker
```

Do not deploy the standalone chat UI yet.

Immediately smoke-test existing production behavior:

- `GET /api/health`;
- embedded St. Expedite chat;
- embedded RICE chat;
- visitor magic-link login;
- manuscript submission route;
- updates signup;
- donations if currently enabled.

If any unrelated route regresses, roll back the Worker before continuing.

## 12. Test profile APIs against the deployed Worker

Using a real authenticated visitor session in a browser or a deliberately obtained test session, verify:

1. `GET /api/profiles` returns St. Expedite and no raw Hermes profile name or provider credential.
2. `GET /api/profile-models` returns only enabled application model IDs/labels.
3. Creating an assistant produces a real `user-*` Hermes profile on EC2.
4. Another account cannot select or delete that private assistant.
5. Anonymous users cannot select it.
6. Switching assistants starts a new conversation.
7. Reusing a conversation ID with a different assistant is rejected.
8. Deleting a private assistant removes the Hermes profile but does not destroy its existing transcript rows before normal retention expiry.
9. Failed profile provisioning leaves no orphan Hermes gateway/profile.
10. The default assistant cannot be deleted.

Also test a profile with an optional delegation model and confirm the child remains inside the same restricted tool policy.

## 13. Exercise chat safety and transport behavior

Before UI release, test the deployed profile-native `/api/chat` path for:

- text streaming;
- browser abort/Stop;
- Turnstile failure and success;
- anonymous and authenticated rate limits;
- malformed message order;
- more than 12 messages;
- more than 4,000 characters in one message;
- more than 12,000 combined text characters;
- one supported inline image on the final user message;
- image larger than 4 MiB decoded;
- remote image URL rejection;
- image placed in historical chat content;
- attempted client-supplied system message;
- attempted selection of another account's private profile.

Review Worker and profile-service logs afterward. They must not contain API keys, bearer tokens, full profile instructions, manuscript contents, or upstream model response bodies.

## 14. Deploy the standalone chat UI

Only after steps 11-13 pass:

```bash
cd /home/ec2-user/src/this-place-feels-wrong
npm run build:chat
node --check apps/chat/dist/app.js
npm run deploy:chat
```

Verify on `https://chat.stexpedite.press`:

- no General/Press mode toggle is presented;
- default assistant is St. Expedite;
- anonymous conversation works;
- visitor sign-in works;
- private assistant creation works;
- main model selection works;
- optional delegation model works;
- selecting a private assistant starts a new conversation;
- deleting a private assistant works;
- submission dialog still bypasses Hermes;
- transcript download/upload still works;
- the 30-day D1 transcript disclosure is visible;
- a photographed manuscript is redirected to the submission flow rather than treated as an ordinary chat manuscript submission.

## 15. Observe before removing compatibility code

Keep the legacy Worker preset executor in place through an observation window long enough to establish that:

- default profile traffic is stable;
- visitor profile provisioning is not leaking gateways/processes;
- the profile port range is not being exhausted;
- OpenRouter spend is within the intended budget;
- no profile-ownership violations appear in logs/tests;
- existing old preset IDs have been inventoried.

Inventory legacy presets before deletion:

```bash
cd /home/ec2-user/src/this-place-feels-wrong/apps/backend
npx wrangler d1 execute stexpedite-updates --remote --command \
  "SELECT id, name, status, creator_account_id FROM presets ORDER BY created_at;"
```

Classify each existing preset as one of:

- discard;
- convert to one main model profile;
- convert to main + delegation model profile;
- retain outside the public assistant product because its old arbitrary pipeline semantics do not map cleanly to Hermes profiles.

Do not silently translate a multi-step pipeline into a profile if doing so changes its behavior materially.

## 16. Final cleanup gate

Only after all legacy presets are classified/migrated and profile-native production behavior is proven should a separate cleanup change:

- remove Worker-direct OpenRouter execution for public presets;
- remove `presetId` handling from the standalone chat client/Worker path;
- retire old preset creation/import/export/moderation UI that is no longer part of the product;
- remove obsolete preset pipeline tables only if no retained admin/history use requires them;
- fold `apps/backend/openapi-profile-native.yaml` into canonical `apps/backend/openapi.yaml`;
- remove the temporary compatibility entry routing;
- update `AGENTS.md`, `ONTOLOGY.md`, root `README.md`, backend/chat docs, and `MEMORY.md` together;
- rerun the complete validation suite;
- release cleanup as its own reviewable change rather than bundling it into the runtime cutover.

## Rollback

### Worker/UI rollback

If profile-native production behavior fails before compatibility code is removed, revert the Worker and/or chat deployment to the last known-good `main` commit. Do not delete D1 rows simply to roll back application code; the new table/nullable column are additive and can remain unused.

Keep the old Hermes public profile and legacy Worker secrets intact during this period so embedded/default chat can return to the old path immediately.

### Profile-service rollback

Stop the profile service:

```bash
systemctl --user disable --now stexpedite-profile-service.service
```

Do not remove `~/.hermes/profiles/stexpedite` or `~/.hermes/profiles/stexpedite-public`.

Disposable/visitor `user-*` profiles may be removed individually after confirming they are not referenced by active production assistant rows. Prefer deletion through the profile service while it is healthy so Hermes gateway cleanup is performed consistently.

### D1 rollback

There is intentionally no destructive down migration. Application rollback should stop reading/writing `assistant_profiles` and `chat_conversations.profile_id`; leave the additive schema in place. If a later corrective schema change is required, add a new numbered migration.

### Restore host configuration

If host configuration itself must be restored, use the backup created in step 3. Stop affected Hermes gateways/services first, restore only the required profile/configuration files, then restart and re-run the verification commands. Never restore blindly over a live profile that has changed since the backup.

## Production gate checklist

Do not declare the migration complete until all of the following are true:

- [ ] repository CI is green on the exact release commit;
- [ ] D1 migration `0028_assistant_profiles.sql` passed locally and remotely;
- [ ] `stexpedite-public` is healthy and tool-restricted;
- [ ] profile service is loopback-only and authenticated;
- [ ] disposable user profile create/chat/delete passed on the actual EC2 Hermes install;
- [ ] visitor ownership/isolation tests passed through the deployed Worker;
- [ ] delegated child model cannot widen tool access;
- [ ] Turnstile and rate limiting passed;
- [ ] streaming, abort, and image constraints passed;
- [ ] transcript/profile binding passed;
- [ ] 30-day transcript disclosure is visible;
- [ ] log review found no secrets/instructions/manuscripts/upstream response bodies;
- [ ] cost/model allow-list reviewed;
- [ ] emergency provisioning disable/rollback path tested;
- [ ] all old preset IDs inventoried and classified;
- [ ] legacy executor remains until that classification/migration is complete.

The private `stexpedite` profile remains owner-only throughout.
