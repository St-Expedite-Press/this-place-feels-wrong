(() => {
  const select = document.querySelector('[data-preset-select]');
  const openBuilder = document.querySelector('[data-open-preset-builder]');
  const dialog = document.querySelector('[data-preset-dialog]');
  const stepsHost = document.querySelector('[data-preset-steps]');
  const addStep = document.querySelector('[data-add-step]');
  const presetStatus = document.querySelector('[data-preset-status]');
  const transcript = document.querySelector('[data-transcript]');
  const newChat = document.querySelector('[data-new-chat]');
  const authedBlock = document.querySelector('[data-visitor-authed]');
  const visitorStatus = document.querySelector('[data-visitor-status]');
  const apiBase = document.querySelector('meta[name="api-base"]')?.content || '';

  // The standalone chat has one default assistant. Site/RICE embedded clients may
  // retain their surface values, but visitors no longer choose a surface here.
  document.querySelectorAll('[data-surface]').forEach(button => {
    const nav = button.closest('nav');
    if (nav) nav.hidden = true;
  });

  const presetBlock = select?.closest('[data-presets-block]');
  const blockLabel = presetBlock?.querySelector('.rail__label');
  if (blockLabel) blockLabel.textContent = 'Assistant';
  if (openBuilder) openBuilder.textContent = 'Build an assistant';

  const deleteAssistant = document.createElement('button');
  deleteAssistant.type = 'button';
  deleteAssistant.className = 'new-chat';
  deleteAssistant.textContent = 'Delete assistant';
  deleteAssistant.hidden = true;
  openBuilder?.insertAdjacentElement('afterend', deleteAssistant);

  const privacyNote = document.createElement('p');
  privacyNote.className = 'rail__note';
  privacyNote.textContent = 'Chat transcripts are stored temporarily for up to 30 days so a refresh can restore this session. Hermes long-term memory remains disabled for the public assistant.';
  presetBlock?.insertAdjacentElement('afterend', privacyNote);

  function selectedAssistantName() {
    const text = select?.selectedOptions?.[0]?.textContent?.trim();
    return text || 'St. Expedite';
  }

  function canDeleteSelection() {
    const id = select?.value || '';
    return Boolean(apiBase && authedBlock && !authedBlock.hidden && id.startsWith('profile-') && id !== 'profile-stexpedite');
  }

  function syncDeleteButton() {
    deleteAssistant.hidden = !canDeleteSelection();
  }

  function normalizeOptions() {
    if (!select) return;
    const defaultOption = select.querySelector('option[value=""]');
    if (defaultOption) defaultOption.textContent = 'St. Expedite';
    // The compatibility endpoint may also return the seeded default profile.
    // The empty value already represents that profile, so suppress the duplicate.
    select.querySelector('option[value="profile-stexpedite"]')?.remove();
    for (const option of select.options) {
      option.textContent = option.textContent
        .replace(/\s*—\s*ready\s*$/i, '')
        .replace(/\s*\(yours\)\s*$/i, '');
    }
    syncDeleteButton();
  }

  if (select) {
    normalizeOptions();
    new MutationObserver(normalizeOptions).observe(select, { childList: true, subtree: true, characterData: true });
    let previous = select.value;
    select.addEventListener('change', () => {
      const next = select.value;
      if (next !== previous) {
        previous = next;
        newChat?.click();
      }
      syncDeleteButton();
    });
  }
  if (authedBlock) new MutationObserver(syncDeleteButton).observe(authedBlock, { attributes: true, attributeFilter: ['hidden'] });

  deleteAssistant.addEventListener('click', async () => {
    const id = select?.value || '';
    if (!canDeleteSelection() || !id) return;
    const name = selectedAssistantName().replace(/\s+—\s+(?:pending|error|rejected)$/i, '');
    if (!window.confirm(`Delete ${name}? Existing transcript history will remain until normal retention expiry, but this assistant will no longer run.`)) return;
    deleteAssistant.disabled = true;
    try {
      const response = await fetch(`${apiBase}/api/profiles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Delete failed.');
      select.querySelector(`option[value="${CSS.escape(id)}"]`)?.remove();
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      if (visitorStatus) visitorStatus.textContent = `${name} deleted.`;
    } catch (error) {
      if (visitorStatus) visitorStatus.textContent = `Could not delete assistant: ${error instanceof Error ? error.message : 'unknown error'}`;
    } finally {
      deleteAssistant.disabled = false;
      syncDeleteButton();
    }
  });

  function relabelAssistantMessages() {
    const name = selectedAssistantName();
    transcript?.querySelectorAll('.message--assistant strong').forEach(label => {
      if (label.textContent === 'Public assistant' || label.dataset.assistantLabel === 'true') {
        label.textContent = name;
        label.dataset.assistantLabel = 'true';
      }
    });
  }
  transcript && new MutationObserver(relabelAssistantMessages).observe(transcript, { childList: true, subtree: true });
  select?.addEventListener('change', relabelAssistantMessages);
  relabelAssistantMessages();

  if (dialog) {
    const title = dialog.querySelector('h2');
    if (title) title.textContent = 'Build an assistant';
    const intro = dialog.querySelector('p.rail__note');
    if (intro) intro.textContent = 'Create a private Hermes profile. Choose its main model and, optionally, a separate model Hermes may use for delegated subtasks. Your instructions cannot grant tools or private Press access.';
    const nameLabel = dialog.querySelector('label[for="preset-name"]');
    if (nameLabel) nameLabel.textContent = 'Assistant name';
    const personaLabel = dialog.querySelector('label[for="preset-persona"]');
    if (personaLabel) personaLabel.textContent = 'Instructions';
    const persona = dialog.querySelector('#preset-persona');
    if (persona) persona.setAttribute('placeholder', 'How should this assistant behave?');

    // Portable preset packets describe the old Worker pipeline, not Hermes profiles.
    // Keep the legacy backend readable during migration but stop creating new ones.
    dialog.querySelector('[data-preset-import]')?.setAttribute('hidden', '');
    dialog.querySelector('[data-preset-import-input]')?.setAttribute('hidden', '');
  }

  function normalizeSteps() {
    if (!stepsHost) return;
    const rows = [...stepsHost.querySelectorAll('.preset-step')];
    rows.forEach((row, index) => {
      const label = row.querySelector('.rail__label');
      if (label) label.textContent = index === 0 ? 'Main model' : 'Delegation model';
      row.querySelector('[data-step-role]')?.setAttribute('hidden', '');
      row.querySelector('[data-step-instruction]')?.setAttribute('hidden', '');
      row.querySelector('[data-step-prev]')?.closest('label')?.setAttribute('hidden', '');
      if (index === 0) row.querySelector('[data-step-remove]')?.setAttribute('hidden', '');
    });
    if (addStep) {
      addStep.textContent = '+ Add delegation model';
      addStep.hidden = rows.length >= 2;
    }
  }
  if (stepsHost) new MutationObserver(normalizeSteps).observe(stepsHost, { childList: true, subtree: true });
  normalizeSteps();

  if (presetStatus) {
    new MutationObserver(() => {
      if (presetStatus.textContent?.startsWith('Saved as a private draft')) {
        presetStatus.textContent = 'Assistant created.';
      }
    }).observe(presetStatus, { childList: true, characterData: true, subtree: true });
  }
})();
