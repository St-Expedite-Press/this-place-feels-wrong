/*
  cursor-glow.js

  Shared cursor glow behavior (throttled with requestAnimationFrame).
  Uses transform instead of left/top to reduce layout work.
*/

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  let x = 0;
  let y = 0;
  let raf = 0;

  function render() {
    raf = 0;
    glow.style.transform = `translate(${x - 60}px, ${y - 60}px)`;
  }

  document.addEventListener(
    'mousemove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = window.requestAnimationFrame(render);
    },
    { passive: true },
  );
})();
