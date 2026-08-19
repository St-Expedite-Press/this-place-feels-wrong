import legacyWorker from './index';
import profileWorker from './profile-entry';

type JsonRecord = Record<string, unknown>;

const CHAT_MAX_BODY_BYTES = 6 * 1024 * 1024;
const CHAT_MAX_MESSAGES = 12;
const CHAT_MAX_MESSAGE_CHARS = 4_000;
const CHAT_MAX_TOTAL_CHARS = 12_000;
const CHAT_MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const CHAT_IMAGE_DATA_URL_RE = /^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/]+=*)$/;

function decodedBase64Bytes(base64: string): number | null {
  try {
    return atob(base64).length;
  } catch {
    return null;
  }
}

function validFinalUserContent(value: unknown): { chars: number } | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 2) return null;
  let chars = 0;
  let textParts = 0;
  let imageParts = 0;
  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
    const part = candidate as JsonRecord;
    if (part.type === 'text') {
      if (Object.keys(part).length !== 2 || typeof part.text !== 'string') return null;
      const text = part.text.trim();
      if (!text || text.length > CHAT_MAX_MESSAGE_CHARS || ++textParts > 1) return null;
      chars += text.length;
      continue;
    }
    if (part.type === 'image_url') {
      if (Object.keys(part).length !== 2 || !part.image_url || typeof part.image_url !== 'object' || Array.isArray(part.image_url)) return null;
      const image = part.image_url as JsonRecord;
      if (Object.keys(image).length !== 1 || typeof image.url !== 'string' || ++imageParts > 1) return null;
      const match = CHAT_IMAGE_DATA_URL_RE.exec(image.url);
      if (!match) return null;
      const bytes = decodedBase64Bytes(match[2]);
      if (bytes === null || bytes < 1 || bytes > CHAT_MAX_IMAGE_BYTES) return null;
      continue;
    }
    return null;
  }
  return imageParts === 1 ? { chars } : null;
}

function validStandaloneChatBody(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  const record = body as JsonRecord;
  const allowed = new Set(['surface', 'messages', 'turnstileToken', 'cf-turnstile-response', 'conversationId', 'profileId', 'presetId']);
  if (Object.keys(record).some((key) => !allowed.has(key))) return false;
  if (record.profileId !== undefined && typeof record.profileId !== 'string') return false;
  if (record.presetId !== undefined && typeof record.presetId !== 'string') return false;
  if (record.conversationId !== undefined && typeof record.conversationId !== 'string') return false;
  if (record.profileId && record.presetId) return false;
  const messages = record.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > CHAT_MAX_MESSAGES) return false;

  let totalChars = 0;
  for (let i = 0; i < messages.length; i += 1) {
    const candidate = messages[i];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return false;
    const message = candidate as JsonRecord;
    if (Object.keys(message).length !== 2 || (message.role !== 'user' && message.role !== 'assistant')) return false;
    if (i % 2 === 0 ? message.role !== 'user' : message.role !== 'assistant') return false;

    if (typeof message.content === 'string') {
      const text = message.content.trim();
      if (!text || text.length > CHAT_MAX_MESSAGE_CHARS) return false;
      totalChars += text.length;
    } else {
      // Images are accepted only on the current/final user message so their bytes
      // are not retransmitted as historical content on every later turn.
      if (i !== messages.length - 1 || message.role !== 'user') return false;
      const result = validFinalUserContent(message.content);
      if (!result) return false;
      totalChars += result.chars;
    }
    if (totalChars > CHAT_MAX_TOTAL_CHARS) return false;
  }
  return (messages.at(-1) as JsonRecord | undefined)?.role === 'user';
}

async function validateStandaloneChatRequest(request: Request): Promise<Response | null> {
  const declared = Number.parseInt(request.headers.get('content-length') ?? '', 10);
  if (Number.isFinite(declared) && declared > CHAT_MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ ok: false, error: 'Request body too large' }), {
      status: 413,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
  try {
    const body = await request.clone().json();
    if (validStandaloneChatBody(body)) return null;
  } catch { /* fall through */ }
  return new Response(JSON.stringify({ ok: false, error: 'Invalid chat request' }), {
    status: 400,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

// The standalone chat is migrating to Hermes-profile identity first. Embedded
// St. Expedite and RICE chat surfaces keep their existing server-owned surface
// behavior until they are migrated deliberately, rather than changing semantics
// as a side effect of this work.
export default {
  async fetch(request: Request, env: unknown, ctx?: unknown) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') ?? '';
    const standalone = origin === 'https://chat.stexpedite.press' || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      if (!standalone) return legacyWorker.fetch(request, env as never, ctx as never);
      const invalid = await validateStandaloneChatRequest(request);
      if (invalid) return invalid;
    }
    return profileWorker.fetch(request, env as never, ctx as never);
  },

  async scheduled(event: unknown, env: unknown, ctx: unknown) {
    if (typeof (profileWorker as { scheduled?: (event: unknown, env: unknown, ctx: unknown) => Promise<void> }).scheduled === 'function') {
      return (profileWorker as { scheduled: (event: unknown, env: unknown, ctx: unknown) => Promise<void> }).scheduled(event, env, ctx);
    }
  },
};
