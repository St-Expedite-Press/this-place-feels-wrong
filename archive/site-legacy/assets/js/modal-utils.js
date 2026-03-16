/*
  modal-utils.js

  Tiny focus-trap helper for accessible dialogs.
  Exposes window.SEP.modal.trap(container, { initialFocusEl, onEscape }).
*/

(function () {
  function isVisible(el) {
    return !!(el && el.getClientRects && el.getClientRects().length);
  }

  function getFocusable(container) {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(container.querySelectorAll(selectors)).filter((el) => isVisible(el));
  }

  function trap(container, opts) {
    const initialFocusEl = opts?.initialFocusEl || null;
    const onEscape = opts?.onEscape || null;

    function onKeyDown(e) {
      if (e.key === 'Escape' && typeof onEscape === 'function') {
        onEscape(e);
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = getFocusable(container);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);

    // Initial focus
    const focusables = getFocusable(container);
    const target = initialFocusEl || focusables[0] || container;
    try {
      target.focus();
    } catch {
      // ignore
    }

    return function cleanup() {
      document.removeEventListener('keydown', onKeyDown);
    };
  }

  window.SEP = window.SEP || {};
  window.SEP.modal = window.SEP.modal || {};
  window.SEP.modal.trap = trap;
})();
