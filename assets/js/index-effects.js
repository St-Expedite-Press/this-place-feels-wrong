/*
  index-effects.js

  Combines cursor glow + portal warp into a single rAF-throttled mousemove handler.
*/

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const glow = document.querySelector('.cursor-glow');
  const portal = document.querySelector('.portal-frame');
  if (!glow && !portal) return;

  let x = 0;
  let y = 0;
  let raf = 0;

  function render() {
    raf = 0;

    if (glow) {
      glow.style.transform = `translate(${x - 60}px, ${y - 60}px)`;
    }

    if (portal) {
      // If the portal is currently hidden (e.g. narrow viewport showing mobile layout),
      // skip expensive geometry work.
      if (portal.offsetParent === null) return;

      const rect = portal.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (x - cx) / rect.width;
      const dy = (y - cy) / rect.height;

      const warpX = dx * 1.8;
      const warpY = dy * 1.8;

      portal.style.transform =
        `translate(-50%, -50%) rotate(${warpX * 0.9}deg) skew(${warpX}deg, ${warpY}deg)`;
    }
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
