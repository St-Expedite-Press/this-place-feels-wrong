import { describe, expect, it } from 'vitest';
import worker from '../src/entry';

function profileRow() {
  return {
    id: 'profile-stexpedite',
    ownerAccountId: null,
    hermesProfileName: 'stexpedite-public',
    displayName: 'St. Expedite',
    description: 'Public assistant',
    instructions: '',
    primaryModel: 'provider/private-runtime-ref',
    delegationModel: 'provider/private-delegation-ref',
    visibility: 'public',
    status: 'ready',
    isDefault: 1,
  };
}

function dbForProfiles(existingConversationProfile?: string) {
  return {
    prepare(query: string) {
      const sql = query.replace(/\s+/g, ' ').trim();
      return {
        bind(..._values: unknown[]) {
          return {
            async first<T>() {
              if (sql.includes('SELECT id FROM assistant_profiles WHERE is_default = 1')) {
                return { id: 'profile-stexpedite' } as T;
              }
              if (sql.includes('SELECT profile_id AS profileId FROM chat_conversations')) {
                return existingConversationProfile === undefined
                  ? null
                  : ({ profileId: existingConversationProfile } as T);
              }
              return null;
            },
            async all<T>() {
              if (sql.includes('FROM assistant_profiles')) return { results: [profileRow() as T] };
              return { results: [] as T[] };
            },
            async run() { return {}; },
          };
        },
      };
    },
  };
}

describe('profile-native boundary integrity', () => {
  it('does not expose Hermes profile names or upstream model refs in profile listings', async () => {
    const response = await worker.fetch(new Request('https://stexpedite.press/api/profiles', {
      headers: { origin: 'https://chat.stexpedite.press' },
    }), { DB: dbForProfiles() });
    expect(response.status).toBe(200);
    const data = await response.json() as { profiles: Array<Record<string, unknown>> };
    expect(data.profiles).toHaveLength(1);
    expect(data.profiles[0].id).toBe('profile-stexpedite');
    expect(data.profiles[0]).not.toHaveProperty('hermesProfileName');
    expect(data.profiles[0]).not.toHaveProperty('primaryModel');
    expect(data.profiles[0]).not.toHaveProperty('delegationModel');
  });

  it('rejects reusing a conversation id with a different assistant', async () => {
    const response = await worker.fetch(new Request('https://stexpedite.press/api/chat', {
      method: 'POST',
      headers: {
        origin: 'https://chat.stexpedite.press',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        profileId: 'profile-stexpedite',
        conversationId: 'conversation-1234',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    }), { DB: dbForProfiles('profile-other') });
    expect(response.status).toBe(409);
    expect(await response.text()).toContain('different assistant');
  });
});
