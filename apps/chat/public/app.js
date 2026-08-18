const protocol = window.OsirisChat;
const endpoint = document.querySelector('meta[name="chat-endpoint"]')?.content || '/api/chat';
const historyEndpoint = document.querySelector('meta[name="chat-history-endpoint"]')?.content || '';
const submissionEndpoint = document.querySelector('meta[name="submission-endpoint"]')?.content || '/api/submit';
const updatesEndpoint = document.querySelector('meta[name="updates-endpoint"]')?.content || '';
const apiBase = document.querySelector('meta[name="api-base"]')?.content || '';
let selectedPresetId = '';
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

// Conversation persistence: an opaque id, not an account. Kept in
// sessionStorage (survives a refresh, not a browser restart) so a page
// reload doesn't lose the transcript; regenerated whenever the visitor
// explicitly starts over (new chat / surface switch).
const CONVERSATION_KEY = 'osirisConversationId';
function newConversationId() {
  const id = crypto.randomUUID();
  sessionStorage.setItem(CONVERSATION_KEY, id);
  return id;
}
const existingConversationId = sessionStorage.getItem(CONVERSATION_KEY);
let conversationId = existingConversationId || newConversationId();
const shouldRestoreHistory = Boolean(existingConversationId) && Boolean(historyEndpoint);
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
  conversationId = newConversationId();
  clearPendingImage();
  const nextGreeting = greeting.cloneNode(true);
  nextGreeting.querySelector('[data-greeting-text]').textContent = surfaceCopy[surface][1];
  transcript.replaceChildren(nextGreeting);
  status.textContent = message;
  input.focus();
}

async function hydrateHistory() {
  try {
    const response = await fetch(`${historyEndpoint}?conversationId=${encodeURIComponent(conversationId)}`);
    if (!response.ok) return;
    const data = await response.json();
    const stored = Array.isArray(data.messages) ? data.messages : [];
    if (!stored.length) return;
    transcript.replaceChildren();
    for (const entry of stored) {
      appendMessage(entry.role, entry.content);
      messages.push({ role: entry.role, content: entry.content });
    }
    protocol.trimHistory(messages);
  } catch {
    // A refresh should never fail loudly just because history couldn't be fetched — the
    // visitor can keep chatting, they just start from a blank transcript for this session.
  }
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

function downloadConversation() {
  if (!messages.length) {
    status.textContent = 'Nothing to download yet.';
    return;
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    surface,
    messages: messages.map(({ role, content }) => ({ role, content })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: `stexpedite-chat-${new Date().toISOString().slice(0, 10)}.json`,
  });
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  status.textContent = 'Conversation downloaded.';
}

function parseUploadedConversation(raw) {
  const data = JSON.parse(raw);
  const rawMessages = Array.isArray(data) ? data : data.messages;
  if (!Array.isArray(rawMessages)) throw new Error('No messages array found in that file.');
  const restored = [];
  for (const entry of rawMessages) {
    if (!entry || typeof entry !== 'object') continue;
    if (entry.role !== 'user' && entry.role !== 'assistant') continue;
    if (typeof entry.content !== 'string') continue;
    const text = entry.content.trim().slice(0, protocol.MAX_MESSAGE_LENGTH);
    if (!text) continue;
    restored.push({ role: entry.role, content: text });
  }
  const restoredSurface = surfaceCopy[data?.surface] ? data.surface : undefined;
  return { messages: restored, surface: restoredSurface };
}

async function uploadConversation(file) {
  try {
    const { messages: restored, surface: restoredSurface } = parseUploadedConversation(await file.text());
    if (!restored.length) throw new Error('That file had no readable messages.');

    controller?.abort();
    conversationId = newConversationId();
    if (restoredSurface) {
      surface = restoredSurface;
      document.querySelectorAll('[data-surface]').forEach(candidate => {
        const selected = candidate.dataset.surface === surface;
        candidate.classList.toggle('is-active', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });
      title.textContent = surfaceCopy[surface][0];
    }
    messages = restored;
    protocol.trimHistory(messages);
    transcript.replaceChildren();
    for (const entry of messages) appendMessage(entry.role, entry.content);
    status.textContent = `Restored ${messages.length} message(s) from file. Nothing was sent to the server.`;
  } catch (error) {
    status.textContent = `Could not read that file: ${error instanceof Error ? error.message : 'unknown error'}`;
  }
}

document.querySelector('[data-download-chat]').addEventListener('click', downloadConversation);
const uploadInput = document.querySelector('[data-upload-input]');
document.querySelector('[data-upload-chat]').addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', () => {
  const file = uploadInput.files[0];
  uploadInput.value = '';
  if (file) uploadConversation(file);
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
      body: JSON.stringify(protocol.requestBody(surface, requestMessages, token, conversationId, selectedPresetId)),
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
if (shouldRestoreHistory) hydrateHistory();

const updatesForm = document.querySelector('[data-updates-form]');
const updatesStatus = document.querySelector('[data-updates-status]');
updatesForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const email = updatesForm.elements.email;
  if (!email.checkValidity()) {
    email.reportValidity();
    return;
  }
  const button = updatesForm.querySelector('button');
  button.disabled = true;
  try {
    const response = await fetch(updatesEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), source: 'chat-inline', website: updatesForm.elements.website.value }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Signup failed.');
    updatesStatus.textContent = data.alreadySignedUp ? "You're already on the list." : "You're on the list.";
    updatesForm.reset();
  } catch {
    updatesStatus.textContent = navigator.onLine ? 'Could not sign up — try again later.' : 'You appear to be offline.';
  } finally {
    button.disabled = false;
  }
});

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

// ── Visitor sign-in + preset selection/authoring ────────────────────────
(() => {
  if (!apiBase) return;
  const presetSelect = document.querySelector('[data-preset-select]');
  const authBlock = document.querySelector('[data-visitor-auth]');
  const authedBlock = document.querySelector('[data-visitor-authed]');
  const loginForm = document.querySelector('[data-visitor-login-form]');
  const visitorStatus = document.querySelector('[data-visitor-status]');
  const visitorEmail = document.querySelector('[data-visitor-email]');
  const logoutBtn = document.querySelector('[data-visitor-logout]');
  const openBuilder = document.querySelector('[data-open-preset-builder]');
  const dialog = document.querySelector('[data-preset-dialog]');
  const presetForm = document.querySelector('[data-preset-form]');
  const stepsHost = document.querySelector('[data-preset-steps]');
  const presetStatus = document.querySelector('[data-preset-status]');
  const importInput = document.querySelector('[data-preset-import-input]');
  let models = [];
  let signedIn = false;

  presetSelect?.addEventListener('change', () => { selectedPresetId = presetSelect.value; });

  async function loadPresets() {
    try {
      const res = await fetch(`${apiBase}/api/presets`, { credentials: 'include' });
      const data = await res.json();
      const current = presetSelect.value;
      presetSelect.innerHTML = '<option value="">Default (no preset)</option>' +
        (data.presets || []).map(p => `<option value="${p.id}">${p.name}${p.official ? '' : ' (yours)'}${p.status !== 'approved' ? ' — ' + p.status : ''}</option>`).join('');
      presetSelect.value = current;
      selectedPresetId = presetSelect.value;
    } catch { /* leave default option */ }
  }

  async function loadModels() {
    try {
      const res = await fetch(`${apiBase}/api/preset-models`, { credentials: 'include' });
      if (!res.ok) return;
      models = (await res.json()).models || [];
    } catch { models = []; }
  }

  async function refreshAuth() {
    try {
      const res = await fetch(`${apiBase}/api/visitor/me`, { credentials: 'include' });
      const data = await res.json();
      signedIn = Boolean(data.authenticated);
      authBlock.hidden = signedIn;
      authedBlock.hidden = !signedIn;
      if (signedIn) { visitorEmail.textContent = `Signed in as ${data.email}`; await loadModels(); }
    } catch { signedIn = false; }
    await loadPresets();
  }

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = loginForm.elements.email;
    if (!email.checkValidity()) { email.reportValidity(); return; }
    try {
      await fetch(`${apiBase}/api/visitor/login`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: email.value.trim() }) });
      visitorStatus.textContent = 'Check your email for a sign-in link.';
      loginForm.reset();
    } catch { visitorStatus.textContent = 'Could not send the link — try again later.'; }
  });

  logoutBtn?.addEventListener('click', async () => {
    await fetch(`${apiBase}/api/visitor/logout`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: '{}' }).catch(() => {});
    await refreshAuth();
  });

  function addStepRow(step = {}) {
    const idx = stepsHost.children.length;
    const row = document.createElement('div');
    row.className = 'preset-step';
    row.innerHTML = `
      <p class="rail__label">Step ${idx + 1}</p>
      <select data-step-model>${models.map(m => `<option value="${m.id}">${m.label}</option>`).join('')}</select>
      <input type="text" data-step-role maxlength="60" placeholder="role (e.g. draft)">
      <textarea data-step-instruction rows="2" maxlength="2000" placeholder="instruction for this step"></textarea>
      ${idx > 0 ? '<label><input type="checkbox" data-step-prev> use previous step’s output as input</label>' : ''}
      <button type="button" class="new-chat" data-step-remove>Remove step</button>`;
    if (step.model_id) row.querySelector('[data-step-model]').value = step.model_id;
    if (step.role_label) row.querySelector('[data-step-role]').value = step.role_label;
    if (step.instruction) row.querySelector('[data-step-instruction]').value = step.instruction;
    row.querySelector('[data-step-remove]').addEventListener('click', () => { row.remove(); });
    stepsHost.append(row);
  }

  function collectSteps() {
    return [...stepsHost.querySelectorAll('.preset-step')].map((row, i) => ({
      model_id: row.querySelector('[data-step-model]')?.value,
      role_label: row.querySelector('[data-step-role]')?.value || 'answer',
      instruction: row.querySelector('[data-step-instruction]')?.value || '',
      input_source: i > 0 && row.querySelector('[data-step-prev]')?.checked ? 'previous' : 'user',
    }));
  }

  openBuilder?.addEventListener('click', async () => {
    if (!models.length) await loadModels();
    presetStatus.textContent = '';
    stepsHost.replaceChildren();
    presetForm.reset();
    addStepRow();
    dialog.showModal();
  });
  document.querySelector('[data-preset-close]')?.addEventListener('click', () => dialog.close());
  document.querySelector('[data-add-step]')?.addEventListener('click', () => { if (stepsHost.children.length < 4) addStepRow(); });

  presetForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const steps = collectSteps();
    if (!steps.length || !steps.every(s => s.model_id)) { presetStatus.textContent = 'Each step needs a model.'; return; }
    try {
      const res = await fetch(`${apiBase}/api/presets/create`, {
        method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: presetForm.elements.name.value.trim(), persona_prompt: presetForm.elements.persona_prompt.value, steps }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'failed');
      presetStatus.textContent = 'Saved as a private draft. Submit it for review from the assistant preset list later.';
      await loadPresets();
      setTimeout(() => dialog.close(), 1200);
    } catch (err) { presetStatus.textContent = `Could not save: ${err.message}`; }
  });

  document.querySelector('[data-preset-import]')?.addEventListener('click', () => importInput.click());
  importInput?.addEventListener('change', async () => {
    const file = importInput.files[0];
    importInput.value = '';
    if (!file) return;
    try {
      const packet = JSON.parse(await file.text());
      const res = await fetch(`${apiBase}/api/presets/import`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(packet) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'failed');
      presetStatus.textContent = 'Imported as a private draft.';
      await loadPresets();
    } catch (err) { presetStatus.textContent = `Import failed: ${err.message}`; }
  });

  refreshAuth();
})();
