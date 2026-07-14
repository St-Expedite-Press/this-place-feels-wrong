import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('./browser.js');
const chat = globalThis.OsirisChat;

assert.equal(chat.eventData('event: message\ndata: first\ndata: second'), 'first\nsecond');
assert.equal(chat.normalizeSurface('rice'), 'rice');
assert.equal(chat.normalizeSurface('private'), 'stex');

const history = Array.from({ length: 13 }, (_, index) => ({
  role: index % 2 === 0 ? 'user' : 'assistant',
  content: String(index),
}));
chat.trimHistory(history);
assert.ok(history.length <= 11);
assert.equal(history[0].role, 'user');

const request = chat.requestBody('openui', [{ role: 'user', content: 'hello' }], 'token');
assert.deepEqual(request, {
  surface: 'openui',
  messages: [{ role: 'user', content: 'hello' }],
  turnstileToken: 'token',
});

const encoder = new TextEncoder();
const chunks = [
  'data: {"choices":[{"delta":{"content":"Os"}}]}\n',
  '\ndata: {"choices":[{"delta":{"content":"iris"}}]}\n\n',
  'data: [DONE]\n\n',
];
const stream = new ReadableStream({
  start(controller) {
    for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
    controller.close();
  },
});
let output = '';
await chat.readStream(new Response(stream, { headers: { 'content-type': 'text/event-stream' } }), delta => {
  output += delta;
});
assert.equal(output, 'Osiris');

await assert.rejects(
  () => chat.readStream(new Response('{"error":"down"}', { status: 503 }), () => {}),
  /down/,
);

console.log('Shared chat client tests passed');
