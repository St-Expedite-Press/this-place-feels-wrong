export function setPendingState(button, pending, pendingLabel = "Sending...") {
  if (!button) return;
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent || "";
  }
  button.disabled = pending;
  button.setAttribute("aria-busy", pending ? "true" : "false");
  button.textContent = pending ? pendingLabel : button.dataset.defaultLabel;
}

export function setStatus(panel, text, tone = "info") {
  if (!panel) return;
  panel.hidden = false;
  panel.dataset.tone = tone;
  const target = panel.querySelector("[data-status-text]") || panel;
  target.textContent = text;
}

export function clearStatus(panel) {
  if (!panel) return;
  panel.hidden = true;
  panel.dataset.tone = "info";
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      window.prompt("Copy this text:", text);
    } catch {
      // ignore
    }
    return false;
  }
}

export function buildMailto(to, subject, body) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
