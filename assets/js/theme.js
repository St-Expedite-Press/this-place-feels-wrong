// Theme toggle: switches neon slate day/night and persists preference
(() => {
  const body = document.body;
  const toggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
  const applyTheme = (theme) => {
    const next = theme === 'day' ? 'theme-day' : 'theme-night';
    body.classList.remove('theme-night', 'theme-day');
    body.classList.add(next);
    toggles.forEach((toggle) => {
      const isNight = next === 'theme-night';
      toggle.textContent = isNight ? 'Day Mode' : 'Night Mode';
      toggle.setAttribute('aria-pressed', isNight ? 'true' : 'false');
    });
    try {
      localStorage.setItem('sep-theme', theme);
    } catch (_) { /* ignore storage errors */ }
  };

  const stored = (() => {
    try {
      return localStorage.getItem('sep-theme');
    } catch (_) {
      return null;
    }
  })();

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'night' : 'night');
  applyTheme(initial);

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const next = body.classList.contains('theme-night') ? 'day' : 'night';
      applyTheme(next);
    });
  });
})();
