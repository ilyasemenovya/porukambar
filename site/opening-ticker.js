(() => {
  const viewport = document.querySelector('.opening-ticker');
  const track = viewport?.querySelector('.opening-ticker-track');
  if (!track) return;
  const groups = [...track.children];
  const phrase = 'ОТКРЫТИЕ БАРА · 20.11 \u00a0 / \u00a0 ';
  let previousWidth = 0;
  function fit() {
    const width = viewport.clientWidth;
    if (!width || width === previousWidth) return;
    previousWidth = width;
    groups[0].textContent = phrase;
    const unit = groups[0].getBoundingClientRect().width;
    if (!unit) return;
    const text = phrase.repeat(Math.ceil(width / unit) + 1);
    groups.forEach(group => { group.textContent = text; });
    track.style.animationDuration = `${groups[0].getBoundingClientRect().width / 45}s`;
  }
  document.fonts.ready.then(() => { fit(); new ResizeObserver(fit).observe(viewport); });
})();
