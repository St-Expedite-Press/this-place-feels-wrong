/* Portal interactions: cursor glow + subtle portal warp */
/* Cursor glow follows pointer */
document.addEventListener('mousemove', e => {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  glow.style.left = (e.pageX - 60) + 'px';
  glow.style.top = (e.pageY - 60) + 'px';
});

/* Cursor proximity slightly warps portal */
document.addEventListener('mousemove', e => {
  const portal = document.querySelector('.portal-frame');
  if (!portal) return;

  const rect = portal.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;

  const dx = (e.pageX - cx) / rect.width;
  const dy = (e.pageY - cy) / rect.height;

  const warpX = dx * 1.8;
  const warpY = dy * 1.8;

  portal.style.transform =
    `translate(-50%, -50%) rotate(${warpX * 0.9}deg) skew(${warpX}deg, ${warpY}deg)`;
});
