import legacyWorker from './index';
import profileWorker from './profile-entry';

// The standalone chat is migrating to Hermes-profile identity first. Embedded
// St. Expedite and RICE chat surfaces keep their existing server-owned surface
// behavior until they are migrated deliberately, rather than changing semantics
// as a side effect of this work.
export default {
  async fetch(request: Request, env: unknown, ctx?: unknown) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') ?? '';
    if (url.pathname === '/api/chat' && request.method === 'POST' && origin !== 'https://chat.stexpedite.press' && !origin.startsWith('http://localhost') && !origin.startsWith('http://127.0.0.1')) {
      return legacyWorker.fetch(request, env as never, ctx as never);
    }
    return profileWorker.fetch(request, env as never, ctx as never);
  },

  async scheduled(event: unknown, env: unknown, ctx: unknown) {
    if (typeof (profileWorker as { scheduled?: (event: unknown, env: unknown, ctx: unknown) => Promise<void> }).scheduled === 'function') {
      return (profileWorker as { scheduled: (event: unknown, env: unknown, ctx: unknown) => Promise<void> }).scheduled(event, env, ctx);
    }
  },
};
