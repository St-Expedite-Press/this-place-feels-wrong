const {
  MAX_MESSAGES,
  MAX_MESSAGE_LENGTH,
  trimHistory,
  requestBody,
  readStream,
} = window.OsirisChat;
let turnstileLoader;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;
  turnstileLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    const script = existing || Object.assign(document.createElement('script'), {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', async: true, defer: true,
    });
    script.addEventListener('load', () => resolve(window.turnstile), { once: true });
    script.addEventListener('error', () => reject(new Error('Human verification could not load.')), { once: true });
    if (!existing) document.head.append(script);
  });
  return turnstileLoader;
}

function initializeChat(widget) {
  if (widget.dataset.chatEnhanced) return;
  widget.dataset.chatEnhanced = 'true';
  const launcher = widget.querySelector('[data-chat-open]');
  const panel = widget.querySelector('[data-chat-panel]');
  const close = widget.querySelector('[data-chat-close]');
  const form = widget.querySelector('[data-chat-form]');
  const input = widget.querySelector('[data-chat-input]');
  const transcript = widget.querySelector('[data-chat-transcript]');
  const status = widget.querySelector('[data-chat-status]');
  const send = widget.querySelector('[data-chat-send]');
  const stop = widget.querySelector('[data-chat-stop]');
  const clear = widget.querySelector('[data-chat-clear]');
  const turnstileMount = widget.querySelector('[data-chat-turnstile]');
  const endpoint = widget.dataset.endpoint || '/api/chat';
  const greeting = transcript.firstElementChild.cloneNode(true);
  let messages = [];
  let controller = null;
  let turnstileId;

  const ensureTurnstile = async () => {
    const turnstile = await loadTurnstile();
    if (turnstileId === undefined) {
      turnstileId = turnstile.render(turnstileMount, {
        sitekey: turnstileMount.dataset.sitekey, theme: 'dark', appearance: 'interaction-only',
      });
    }
    return turnstile;
  };

  const setOpen = open => {
    panel.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) {
      ensureTurnstile().catch(() => { status.textContent = 'Human verification could not load.'; });
      input.focus();
    } else launcher.focus();
  };
  const appendMessage = (role, content = '') => {
    const article = document.createElement('article');
    article.className = 'public-chat__message';
    article.dataset.role = role;
    const label = document.createElement('span');
    label.textContent = role === 'user' ? 'You' : 'St. Expedite';
    const text = document.createElement('p');
    text.textContent = content;
    article.append(label, text);
    transcript.append(article);
    while (transcript.children.length > MAX_MESSAGES + 1) transcript.children[1].remove();
    transcript.scrollTop = transcript.scrollHeight;
    return text;
  };
  const setBusy = busy => {
    send.disabled = busy;
    clear.disabled = busy;
    stop.hidden = !busy;
    input.readOnly = busy;
    form.setAttribute('aria-busy', String(busy));
    transcript.setAttribute('aria-busy', String(busy));
  };

  launcher.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => { controller?.abort(); setOpen(false); });
  stop.addEventListener('click', () => controller?.abort());
  clear.addEventListener('click', () => {
    messages = [];
    transcript.replaceChildren(greeting.cloneNode(true));
    status.textContent = 'Conversation cleared.';
    input.focus();
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  widget.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      controller?.abort();
      setOpen(false);
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const content = input.value.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!content || controller) return;
    trimHistory(messages);
    messages.push({ role: 'user', content });
    appendMessage('user', content);
    input.value = '';
    const reply = appendMessage('assistant');
    status.textContent = 'St. Expedite is answering.';
    controller = new AbortController();
    setBusy(true);
    try {
      const turnstile = await ensureTurnstile();
      const turnstileToken = turnstile.getResponse(turnstileId);
      if (!turnstileToken) throw new Error('Complete human verification before sending.');
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
        body: JSON.stringify(requestBody('stex', messages, turnstileToken)), signal: controller.signal,
      });
      await readStream(response, delta => { reply.textContent += delta; transcript.scrollTop = transcript.scrollHeight; });
      if (!reply.textContent.trim()) throw new Error('The chat service returned an empty reply.');
      messages.push({ role: 'assistant', content: reply.textContent });
      messages = messages.slice(-MAX_MESSAGES);
      status.textContent = 'Reply received.';
    } catch (error) {
      if (error.name === 'AbortError') {
        status.textContent = 'Response stopped.';
        if (reply.textContent) messages.push({ role: 'assistant', content: reply.textContent });
        else { reply.closest('article').remove(); messages.pop(); }
      } else {
        messages.pop();
        reply.textContent = 'I could not answer just now. Please try again later or use the Connect page.';
        status.textContent = error.message === 'Complete human verification before sending.'
          ? error.message
          : navigator.onLine ? 'The chat service could not be reached.' : 'You appear to be offline.';
      }
    } finally {
      if (turnstileId !== undefined) window.turnstile?.reset(turnstileId);
      controller = null;
      setBusy(false);
      if (!panel.hidden) input.focus();
    }
  });
}

function initializeChats() { document.querySelectorAll('[data-chat-widget]').forEach(initializeChat); }
initializeChats();
document.addEventListener('astro:page-load', initializeChats);
