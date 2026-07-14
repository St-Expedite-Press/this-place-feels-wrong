(function attachOsirisChat(global) {
  const MAX_MESSAGES = 12;
  const MAX_MESSAGE_LENGTH = 1000;
  const SURFACES = new Set(['stex', 'rice', 'openui']);

  function normalizeSurface(surface) {
    return SURFACES.has(surface) ? surface : 'stex';
  }

  function trimHistory(messages, reserve = 1) {
    const limit = Math.max(1, MAX_MESSAGES - reserve);
    while (messages.length > limit) messages.splice(0, 2);
    return messages;
  }

  function requestBody(surface, messages, turnstileToken) {
    return {
      surface: normalizeSurface(surface),
      messages: messages.slice(-MAX_MESSAGES),
      turnstileToken: String(turnstileToken || ''),
    };
  }

  function eventData(block) {
    return block
      .split(/\r?\n/)
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart())
      .join('\n');
  }

  function emitEvent(block, onDelta) {
    const data = eventData(block);
    if (!data || data === '[DONE]') return;
    const payload = JSON.parse(data);
    if (payload.error) throw new Error(payload.error.message || payload.error);
    const delta = payload.choices?.[0]?.delta?.content;
    if (typeof delta === 'string') onDelta(delta);
  }

  async function readStream(response, onDelta) {
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `The chat service returned ${response.status}.`);
    }
    if (!response.body) throw new Error('The chat service returned no response stream.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || '';
      for (const block of blocks) emitEvent(block, onDelta);
      if (done) {
        if (buffer) emitEvent(buffer, onDelta);
        break;
      }
    }
  }

  global.OsirisChat = Object.freeze({
    MAX_MESSAGES,
    MAX_MESSAGE_LENGTH,
    normalizeSurface,
    trimHistory,
    requestBody,
    eventData,
    readStream,
  });
})(window);
