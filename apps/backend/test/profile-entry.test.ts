import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/profile-entry';

type Profile = {
  id: string;
  owner_account_id: string | null;
  hermes_profile_name: string;
  display_name: string;
  description: string | null;
  instructions: string;
  primary_model: string;
  delegation_model: string | null;
  visibility: 'public' | 'private';
  status: 'pending' | 'ready' | 'error';
  is_default: number;
};

const originalFetch = globalThis.fetch;
const fetchMock = vi.fn<typeof fetch>();

function sse(text = 'hello') {
  return new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`, {
    status: 200,
    headers: { 'content-type': 'text/event-stream' },
  });
}

function makeDb() {
  const profiles = new Map<string, Profile>();
  profiles.set('profile-stexpedite', {
    id: 'profile-stexpedite', owner_account_id: null, hermes_profile_name: 'stexpedite-public',
    display_name: 'St. Expedite', description: null, instructions: '', primary_model: '', delegation_model: null,
    visibility: 'public', status: 'ready', is_default: 1,
  });
  profiles.set('profile-private', {
    id: 'profile-private', owner_account_id: 'va-1', hermes_profile_name: 'user-va1-private',
    display_name: 'Private', description: null, instructions: 'Be terse.', primary_model: 'openai/gpt-5.4', delegation_model: null,
    visibility: 'private', status: 'ready', is_default: 0,
  });
  const models = new Map([
    ['model-main', { upstream_ref: 'openai/gpt-5.4' }],
    ['model-delegate', { upstream_ref: 'google/gemini-3-flash-preview' }],
  ]);

  function rowShape(p: Profile) {
    return {
      id: p.id,
      ownerAccountId: p.owner_account_id,
      hermesProfileName: p.hermes_profile_name,
      displayName: p.display_name,
      description: p.description,
      instructions: p.instructions,
      primaryModel: p.primary_model,
      delegationModel: p.delegation_model,
      visibility: p.visibility,
      status: p.status,
      isDefault: p.is_default,
    };
  }

  return {
    profiles,
    prepare(query: string) {
      const sql = query.replace(/\s+/g, ' ').trim();
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>() {
              if (sql.includes('FROM visitor_sessions s') && sql.includes('JOIN visitor_accounts')) {
                return { accountId: 'va-1', expiresAt: Date.now() + 60_000, email: 'reader@example.com', status: 'active' } as T;
              }
              if (sql.includes('COUNT(*) AS n FROM assistant_profiles')) {
                const owner = String(values[0] ?? '');
                return { n: [...profiles.values()].filter((p) => p.owner_account_id === owner).length } as T;
              }
              if (sql.includes('FROM preset_models WHERE id')) {
                return (models.get(String(values[0] ?? '')) ?? null) as T | null;
              }
              if (sql.includes('FROM assistant_profiles WHERE id = ?')) {
                const p = profiles.get(String(values[0] ?? ''));
                return (p ? rowShape(p) : null) as T | null;
              }
              if (sql.includes('FROM assistant_profiles WHERE is_default = 1')) {
                const p = [...profiles.values()].find((candidate) => candidate.is_default === 1);
                return (p ? rowShape(p) : null) as T | null;
              }
              if (sql.includes('FROM api_rate_limits')) return null;
              return null;
            },
            async all<T>() {
              if (sql.includes('FROM assistant_profiles')) {
                const owner = String(values[0] ?? '');
                const rows = [...profiles.values()]
                  .filter((p) => (p.visibility === 'public' && p.status === 'ready') || (owner && p.owner_account_id === owner))
                  .map(rowShape);
                return { results: rows as T[] };
              }
              if (sql.includes('FROM preset_models')) {
                return { results: [...models.entries()].map(([id]) => ({ id, label: id, upstreamRef: models.get(id)!.upstream_ref })) as T[] };
              }
              if (sql.includes('FROM kb_entities') || sql.includes('FROM kb_relations')) return { results: [] as T[] };
              return { results: [] as T[] };
            },
            async run() {
              if (sql.includes("INSERT INTO assistant_profiles")) {
                const [id, owner, hermesName, displayName, instructions, primary, delegation] = values.map(String);
                profiles.set(id, {
                  id, owner_account_id: owner, hermes_profile_name: hermesName, display_name: displayName,
                  description: null, instructions, primary_model: primary,
                  delegation_model: delegation === 'null' || delegation === '' ? null : delegation,
                  visibility: 'private', status: 'pending', is_default: 0,
                });
              }
              if (sql.includes("UPDATE assistant_profiles SET status = 'ready'")) {
                const id = String(values[0] ?? '');
                const p = profiles.get(id); if (p) p.status = 'ready';
              }
              if (sql.includes("UPDATE assistant_profiles SET status = 'error'")) {
                const id = String(values[0] ?? '');
                const p = profiles.get(id); if (p) p.status = 'error';
              }
              if (sql.includes('DELETE FROM assistant_profiles')) profiles.delete(String(values[0] ?? ''));
              return {};
            },
          };
        },
      };
    },
  };
}

function chatRequest(body: Record<string, unknown>, cookie?: string) {
  const headers: Record<string, string> = {
    origin: 'https://chat.stexpedite.press',
    'content-type': 'application/json',
  };
  if (cookie) headers.cookie = cookie;
  return new Request('https://stexpedite.press/api/chat', { method: 'POST', headers, body: JSON.stringify(body) });
}

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('profile-native chat', () => {
  it('routes anonymous standalone chat through the seeded default Hermes profile', async () => {
    const db = makeDb();
    fetchMock.mockResolvedValueOnce(sse('default'));
    const response = await worker.fetch(chatRequest({ messages: [{ role: 'user', content: 'hello' }], turnstileToken: '' }), {
      DB: db,
      HERMES_API_URL: 'https://hermes.example/v1/chat/completions',
      HERMES_API_KEY: 'public-key',
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('default');
    const [, init] = fetchMock.mock.calls[0];
    const upstream = JSON.parse(String(init?.body));
    expect(upstream.model).toBe('stexpedite-public');
  });

  it('does not allow anonymous visitors to select a private profile', async () => {
    const db = makeDb();
    const response = await worker.fetch(chatRequest({ profileId: 'profile-private', messages: [{ role: 'user', content: 'hello' }], turnstileToken: '' }), {
      DB: db,
      HERMES_API_URL: 'https://hermes.example/v1/chat/completions',
      HERMES_API_KEY: 'public-key',
    });
    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows an authenticated owner to provision a real private Hermes profile', async () => {
    const db = makeDb();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'content-type': 'application/json' } }));
    const request = new Request('https://stexpedite.press/api/profiles/create', {
      method: 'POST',
      headers: {
        origin: 'https://chat.stexpedite.press',
        'content-type': 'application/json',
        cookie: 'stex_visitor_session=test-session',
      },
      body: JSON.stringify({
        displayName: 'Research',
        instructions: 'Research before answering.',
        primaryModelId: 'model-main',
        delegationModelId: 'model-delegate',
      }),
    });
    const response = await worker.fetch(request, {
      DB: db,
      HERMES_PROFILE_SERVICE_URL: 'https://profiles.internal',
      HERMES_PROFILE_SERVICE_KEY: 'service-key',
    });
    expect(response.status).toBe(201);
    const created = [...db.profiles.values()].find((p) => p.display_name === 'Research');
    expect(created?.owner_account_id).toBe('va-1');
    expect(created?.status).toBe('ready');
    expect(created?.hermes_profile_name.startsWith('user-')).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://profiles.internal/profiles');
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer service-key');
  });

  it('routes an authenticated owner to their Hermes profile through the private service', async () => {
    const db = makeDb();
    fetchMock.mockResolvedValueOnce(sse('private'));
    const response = await worker.fetch(chatRequest({
      profileId: 'profile-private',
      messages: [{ role: 'user', content: 'hello' }],
      turnstileToken: '',
    }, 'stex_visitor_session=test-session'), {
      DB: db,
      HERMES_PROFILE_SERVICE_URL: 'https://profiles.internal',
      HERMES_PROFILE_SERVICE_KEY: 'service-key',
    });
    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://profiles.internal/chat');
    const payload = JSON.parse(String(init?.body));
    expect(payload.profileName).toBe('user-va1-private');
  });
});
