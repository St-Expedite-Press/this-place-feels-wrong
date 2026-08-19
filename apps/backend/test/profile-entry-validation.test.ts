import { describe, expect, it } from 'vitest';
import worker from '../src/entry';

function request(messages: unknown[], extra: Record<string, unknown> = {}) {
  return new Request('https://stexpedite.press/api/chat', {
    method: 'POST',
    headers: {
      origin: 'https://chat.stexpedite.press',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ messages, ...extra }),
  });
}

describe('standalone profile chat request validation', () => {
  it('rejects remote image URLs before profile routing', async () => {
    const response = await worker.fetch(request([
      {
        role: 'user',
        content: [{ type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }],
      },
    ]), {});
    expect(response.status).toBe(400);
  });

  it('rejects images embedded in earlier conversation history', async () => {
    const tiny = 'data:image/png;base64,aGVsbG8=';
    const response = await worker.fetch(request([
      { role: 'user', content: [{ type: 'image_url', image_url: { url: tiny } }] },
      { role: 'assistant', content: 'I saw it.' },
      { role: 'user', content: 'What about it?' },
    ]), {});
    expect(response.status).toBe(400);
  });

  it('rejects simultaneous new profileId and legacy presetId selectors', async () => {
    const response = await worker.fetch(request(
      [{ role: 'user', content: 'hello' }],
      { profileId: 'profile-one', presetId: 'preset-old' },
    ), {});
    expect(response.status).toBe(400);
  });

  it('rejects oversized inline image data before reaching the profile service', async () => {
    const oversized = `data:image/png;base64,${'A'.repeat(5_592_408)}`;
    const response = await worker.fetch(request([
      { role: 'user', content: [{ type: 'image_url', image_url: { url: oversized } }] },
    ]), {});
    expect(response.status).toBe(400);
  });
});
