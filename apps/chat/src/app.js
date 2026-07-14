const protocol = window.OsirisChat;
const endpoint = document.querySelector('meta[name="chat-endpoint"]')?.content || '/api/chat';
const submissionEndpoint = document.querySelector('meta[name="submission-endpoint"]')?.content || '/api/submit';
const sitekey = document.querySelector('meta[name="turnstile-sitekey"]')?.content || '';
const transcript = document.querySelector('[data-transcript]');
const form = document.querySelector('[data-form]');
const input = document.querySelector('[data-input]');
const send = document.querySelector('[data-send]');
const stop = document.querySelector('[data-stop]');
const status = document.querySelector('[data-status]');
const title = document.querySelector('[data-title]');
const greeting = document.querySelector('[data-greeting]').cloneNode(true);
let surface = 'stex';
let messages = [];
let controller;
let turnstileId;
let turnstileLoader;
let submissionTurnstileId;
const submissionDialog = document.querySelector('[data-submission-dialog]');
const submissionForm = document.querySelector('[data-submission-form]');
const submissionStatus = document.querySelector('[data-submission-status]');
const submissionSend = document.querySelector('[data-submission-send]');

const surfaceCopy = {
  stex: ['Ask St. Expedite', 'I can help you navigate the press, its books, RICE, submissions, and public archive. What are you looking for?'],
  rice: ['Ask RICE', 'I can help you navigate RICE, its available work, and the shape of the project. What are you looking for?'],
};

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;
  turnstileLoader = new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement('script'), {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', async: true, defer: true,
    });
    script.addEventListener('load', () => resolve(window.turnstile), { once: true });
    script.addEventListener('error', () => reject(new Error('Human verification could not load.')), { once: true });
    document.head.append(script);
  });
  return turnstileLoader;
}

async function ensureTurnstile() {
  const turnstile = await loadTurnstile();
  if (turnstileId === undefined) {
    turnstileId = turnstile.render(document.querySelector('[data-turnstile]'), {
      sitekey, theme: 'dark', appearance: 'interaction-only',
    });
  }
  return turnstile;
}

async function ensureSubmissionTurnstile() {
  const turnstile = await loadTurnstile();
  if (submissionTurnstileId === undefined) {
    submissionTurnstileId = turnstile.render(document.querySelector('[data-submission-turnstile]'), {
      sitekey, theme: 'dark', appearance: 'interaction-only',
    });
  }
  return turnstile;
}

function appendMessage(role, content = '') {
  const article = document.createElement('article');
  article.className = `message message--${role}`;
  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'YOU' : surface === 'rice' ? 'R' : 'SE';
  const body = document.createElement('div');
  const label = document.createElement('strong');
  label.textContent = role === 'user' ? 'You' : surface === 'rice' ? 'RICE' : 'St. Expedite';
  const text = document.createElement('p');
  text.textContent = content;
  body.append(label, text);
  article.append(avatar, body);
  transcript.append(article);
  transcript.scrollTop = transcript.scrollHeight;
  return text;
}

function resetConversation(message = '') {
  controller?.abort();
  messages = [];
  const nextGreeting = greeting.cloneNode(true);
  nextGreeting.querySelector('[data-greeting-text]').textContent = surfaceCopy[surface][1];
  transcript.replaceChildren(nextGreeting);
  status.textContent = message;
  input.focus();
}

function setBusy(busy) {
  send.disabled = busy;
  input.readOnly = busy;
  stop.hidden = !busy;
  form.setAttribute('aria-busy', String(busy));
}

document.querySelector('[data-new-chat]').addEventListener('click', () => resetConversation('Conversation cleared.'));
document.querySelector('[data-open-submission]').addEventListener('click', async () => {
  submissionStatus.textContent = '';
  submissionDialog.showModal();
  try { await ensureSubmissionTurnstile(); }
  catch { submissionStatus.textContent = 'Human verification could not load.'; }
});
document.querySelector('[data-close-submission]').addEventListener('click', () => submissionDialog.close());
submissionDialog.addEventListener('click', event => {
  if (event.target === submissionDialog) submissionDialog.close();
});
document.querySelectorAll('[data-surface]').forEach(button => button.addEventListener('click', () => {
  surface = button.dataset.surface;
  document.querySelectorAll('[data-surface]').forEach(candidate => {
    const selected = candidate === button;
    candidate.classList.toggle('is-active', selected);
    candidate.setAttribute('aria-pressed', String(selected));
  });
  title.textContent = surfaceCopy[surface][0];
  resetConversation(`Switched to ${surface === 'rice' ? 'RICE' : 'St. Expedite Press'}.`);
}));
stop.addEventListener('click', () => controller?.abort());
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const content = input.value.trim().slice(0, protocol.MAX_MESSAGE_LENGTH);
  if (!content || controller) return;
  protocol.trimHistory(messages);
  messages.push({ role: 'user', content });
  appendMessage('user', content);
  input.value = '';
  const reply = appendMessage('assistant');
  controller = new AbortController();
  setBusy(true);
  status.textContent = 'The guide is answering.';
  try {
    const turnstile = await ensureTurnstile();
    const token = turnstile.getResponse(turnstileId);
    if (!token) throw new Error('Complete human verification before sending.');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify(protocol.requestBody('openui', messages, token)),
      signal: controller.signal,
    });
    await protocol.readStream(response, delta => {
      reply.textContent += delta;
      transcript.scrollTop = transcript.scrollHeight;
    });
    if (!reply.textContent.trim()) throw new Error('The chat service returned an empty reply.');
    messages.push({ role: 'assistant', content: reply.textContent });
    status.textContent = 'Reply received.';
  } catch (error) {
    if (error.name === 'AbortError') {
      status.textContent = 'Response stopped.';
      if (reply.textContent) messages.push({ role: 'assistant', content: reply.textContent });
      else { reply.closest('article').remove(); messages.pop(); }
    } else {
      messages.pop();
      reply.textContent = 'The public desk could not answer just now. Please try again later.';
      status.textContent = error.message === 'Complete human verification before sending.'
        ? error.message
        : navigator.onLine ? 'The chat service could not be reached.' : 'You appear to be offline.';
    }
  } finally {
    if (turnstileId !== undefined) window.turnstile?.reset(turnstileId);
    controller = undefined;
    setBusy(false);
    input.focus();
  }
});

ensureTurnstile().catch(() => { status.textContent = 'Human verification could not load.'; });

submissionForm.addEventListener('submit', async event => {
  event.preventDefault();
  const file = submissionForm.elements.file.files[0];
  if (!file || file.size > 10 * 1024 * 1024) {
    submissionStatus.textContent = 'Choose one supported manuscript file no larger than 10 MiB.';
    return;
  }
  submissionSend.disabled = true;
  submissionStatus.textContent = 'Forwarding the submission securely…';
  try {
    const turnstile = await ensureSubmissionTurnstile();
    const token = turnstile.getResponse(submissionTurnstileId);
    if (!token) throw new Error('Complete human verification before submitting.');
    const body = new FormData(submissionForm);
    body.set('turnstileToken', token);
    const response = await fetch(submissionEndpoint, { method: 'POST', body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Submission failed (${response.status}).`);
    submissionStatus.textContent = `Submission received. Reference: ${data.id}`;
    appendMessage('assistant', `Your manuscript has been forwarded to the editor. Keep this reference: ${data.id}`);
    submissionForm.reset();
  } catch (error) {
    submissionStatus.textContent = error instanceof Error ? error.message : 'The submission could not be sent.';
  } finally {
    if (submissionTurnstileId !== undefined) window.turnstile?.reset(submissionTurnstileId);
    submissionSend.disabled = false;
  }
});
