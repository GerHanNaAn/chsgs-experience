// Appended inside the generated product module by prepare-assets.mjs.
// Only host integration changes; the product's geometry, gates and operation stay intact.
const hostOrigin = location.origin;
let hostPrevious = '';
const hostObserver = new MutationObserver(() => {
  const data = { type: 'chsgs:state', state: section.dataset.state, progress: Number(section.dataset.progress || 0), locked: section.dataset.scrollLocked === 'true', fill: Number(section.dataset.waterVolume || 0), opening: Number(section.dataset.opening || 0) };
  const key = JSON.stringify(data);
  if (key !== hostPrevious) { hostPrevious = key; parent.postMessage(data, hostOrigin); }
});
hostObserver.observe(section, { attributes: true, attributeFilter: ['data-state', 'data-progress', 'data-scroll-locked', 'data-water-volume', 'data-opening'] });
window.addEventListener('message', event => {
  if (event.origin !== hostOrigin || event.source !== parent) return;
  if (event.data?.type === 'chsgs:goto') goTo(Number(event.data.progress));
  if (event.data?.type === 'chsgs:active') {
    visible = !!event.data.active && !document.hidden;
    lastTime = 0;
    if (visible) requestRender(); else { cancelAnimationFrame(frame); frame = 0; }
  }
});
window.addEventListener('keydown', event => { if (event.key === 'Escape') parent.postMessage({ type: 'chsgs:close' }, hostOrigin); });
