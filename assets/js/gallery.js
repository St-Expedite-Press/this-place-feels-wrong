// Modal viewer for gallery plates (clones inline SVG into overlay)
const modal = document.querySelector('[data-modal]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalNotes = document.querySelector('[data-modal-notes]');
const modalMeta = document.querySelector('[data-modal-meta]');
const modalImage = document.querySelector('[data-modal-image]');
const modalClose = document.querySelector('[data-modal-close]');

if (modal) {
  const closeModal = () => {
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  modal.setAttribute('aria-hidden', 'true');

  document.querySelectorAll('.plate').forEach((plate) => {
    plate.addEventListener('click', () => {
      const title = plate.getAttribute('data-title') || '';
      const notes = plate.getAttribute('data-notes') || '';
      const meta = plate.getAttribute('data-meta') || '';
      const source = plate.querySelector('svg');

      if (modalTitle) modalTitle.textContent = title;
      if (modalNotes) modalNotes.textContent = notes;
      if (modalMeta) modalMeta.textContent = meta;

      if (modalImage) {
        modalImage.innerHTML = '';
        if (source) {
          modalImage.appendChild(source.cloneNode(true));
        }
      }

      modal.classList.add('is-visible');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      modalClose?.focus();
    });
  });

  modalClose?.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-visible')) {
      closeModal();
    }
  });
}
