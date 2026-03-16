function getFocusable(container) {
  return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter((element) => element.getClientRects().length > 0);
}

export function createDialogController({ trigger, container, dialog, closeButtons = [], initialFocus, onOpen, onClose }) {
  if (!container || !dialog) {
    return { open() {}, close() {} };
  }

  let lastFocused = null;

  function trapFocus(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = getFocusable(dialog);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function open() {
    lastFocused = document.activeElement;
    container.hidden = false;
    document.body.classList.add("dialog-open");
    document.addEventListener("keydown", trapFocus);
    (initialFocus || getFocusable(dialog)[0] || dialog).focus();
    onOpen?.();
  }

  function close() {
    container.hidden = true;
    document.body.classList.remove("dialog-open");
    document.removeEventListener("keydown", trapFocus);
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
    onClose?.();
  }

  trigger?.addEventListener("click", open);
  closeButtons.forEach((button) => button?.addEventListener("click", close));
  container.addEventListener("click", (event) => {
    if (event.target === container) close();
  });

  return { open, close };
}
