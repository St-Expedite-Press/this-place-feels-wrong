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
let surface = 'openui';
let messages = [];
let controller;
let turnstileId;
let turnstileLoader;
let submissionTurnstileId;
const submissionDialog = document.querySelector('[data-submission-dialog]');
const submissionForm = document.querySelector('[data-submission-form]');
const submissionStatus = document.querySelector('[data-submission-status]');
const submissionSend = document.querySelector('[data-submission-send]');

const imageInput = document.querySelector('[data-image-input]');
const attachButton = document.querySelector('[data-attach-image]');
const attachmentPreview = document.querySelector('[data-attachment-preview]');
const attachmentThumb = document.querySelector('[data-attachment-thumb]');
const attachmentRemove = document.querySelector('[data-attachment-remove]');
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
let pendingImage = null;

const surfaceCopy = {
  openui: ['Start a conversation', 'Ask a question, work through an idea, or start with a blank page.'],
  stex: ['Ask about the press', 'I can help you navigate St. Expedite Press — its books, RICE, submissions, and public archive. What are you looking for?'],
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
  avatar.textContent = role === 'user' ? 'YOU' : surface === 'stex' ? 'SE' : 'AI';
  const body = document.createElement('div');
  const label = document.createElement('strong');
  label.textContent = role === 'user' ? 'You' : surface === 'stex' ? 'St. Expedite' : 'Public assistant';
  body.append(label);

  let text;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.type === 'image_url') {
        const img = document.createElement('img');
        img.className = 'message__image';
        img.alt = 'Attached image';
        img.src = part.image_url.url;
        body.append(img);
      } else if (part.type === 'text') {
        text = document.createElement('p');
        text.textContent = part.text;
        body.append(text);
      }
    }
    if (!text) { text = document.createElement('p'); body.append(text); }
  } else {
    text = document.createElement('p');
    text.textContent = content;
    body.append(text);
  }

  article.append(avatar, body);
  transcript.append(article);
  transcript.scrollTop = transcript.scrollHeight;
  return text;
}

function clearPendingImage() {
  pendingImage = null;
  attachmentPreview.hidden = true;
  attachmentThumb.removeAttribute('src');
  imageInput.value = '';
}

function resetConversation(message = '') {
  controller?.abort();
  messages = [];
  clearPendingImage();
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

function openSubmissionDialog() {
  submissionStatus.textContent = '';
  submissionDialog.showModal();
  ensureSubmissionTurnstile().catch(() => { submissionStatus.textContent = 'Human verification could not load.'; });
}

attachButton.addEventListener('click', () => imageInput.click());
attachmentRemove.addEventListener('click', clearPendingImage);
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    status.textContent = 'Choose a JPEG, PNG, WEBP, or GIF image.';
    imageInput.value = '';
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    status.textContent = 'Choose an image no larger than 4 MiB.';
    imageInput.value = '';
    return;
  }
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    pendingImage = { dataUrl: reader.result };
    attachmentThumb.src = pendingImage.dataUrl;
    attachmentPreview.hidden = false;
  });
  reader.addEventListener('error', () => { status.textContent = 'Could not read that image.'; });
  reader.readAsDataURL(file);
});

document.querySelector('[data-new-chat]').addEventListener('click', () => resetConversation('Conversation cleared.'));
document.querySelector('[data-open-submission]').addEventListener('click', openSubmissionDialog);
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
  resetConversation(`Switched to ${surface === 'stex' ? 'Ask about the press' : 'general chat'}.`);
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
  const text = input.value.trim().slice(0, protocol.MAX_MESSAGE_LENGTH);
  if ((!text && !pendingImage) || controller) return;
  protocol.trimHistory(messages);

  const image = pendingImage;
  let content;
  if (image) {
    content = [];
    if (text) content.push({ type: 'text', text });
    content.push({ type: 'image_url', image_url: { url: image.dataUrl } });
  } else {
    content = text;
  }
  appendMessage('user', content);
  input.value = '';
  clearPendingImage();
  // History only ever stores text: an attached image is sent live as the last
  // message of this one request, never resent from history on a later turn.
  messages.push({ role: 'user', content: image ? (text || '[image attached]') : text });
  const requestMessages = image ? [...messages.slice(0, -1), { role: 'user', content }] : messages;

  const reply = appendMessage('assistant');
  controller = new AbortController();
  setBusy(true);
  status.textContent = 'The assistant is answering.';
  try {
    const turnstile = await ensureTurnstile();
    const token = turnstile.getResponse(turnstileId);
    if (!token) throw new Error('Complete human verification before sending.');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify(protocol.requestBody(surface, requestMessages, token)),
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

if (new URLSearchParams(window.location.search).get('open') === 'submit') openSubmissionDialog();
