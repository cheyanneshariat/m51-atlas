(() => {
  'use strict';
  const sources = Array.from(document.querySelectorAll('article[id^="source-"]'));
  const controls = document.querySelector('.viewer-controls');
  if (!sources.length || !controls) return;
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const select = document.getElementById('source-select');
  const counter = document.getElementById('source-counter');
  const mode = document.getElementById('browse-mode');
  let index = 0;
  let single = true;
  for (const [i, source] of sources.entries()) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = source.id.replace('source-', '');
    select.appendChild(option);
  }
  function render(value, updateHash = true) {
    index = Math.max(0, Math.min(sources.length - 1, value));
    sources.forEach((source, i) => { source.hidden = single && i !== index; });
    document.body.classList.toggle('single-source', single);
    select.value = String(index);
    counter.textContent = `${index + 1} / ${sources.length}`;
    previous.disabled = index === 0;
    next.disabled = index === sources.length - 1;
    mode.textContent = single ? 'Scroll view' : 'One at a time';
    if (updateHash) {
      // Hash links work on both file:// previews and GitHub Pages.
      try { history.replaceState(null, '', '#' + sources[index].id); }
      catch (_) { location.hash = sources[index].id; }
    }
    const image = sources[index].querySelector('img');
    if (image) image.loading = 'eager';
  }
  function fromHash() {
    const requested = sources.findIndex(source => '#' + source.id === location.hash);
    render(requested < 0 ? 0 : requested, false);
  }
  function revealCurrent() {
    sources[index].style.scrollMarginTop = `${controls.offsetHeight + 12}px`;
    sources[index].scrollIntoView({block: 'start', behavior: 'auto'});
  }
  function move(delta) {
    render(index + delta);
    revealCurrent();
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  select.addEventListener('change', () => {
    render(Number(select.value));
    revealCurrent();
  });
  mode.addEventListener('click', () => { single = !single; render(index); });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, select, textarea, [contenteditable="true"]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  window.addEventListener('hashchange', fromHash);
  controls.hidden = false;
  fromHash();
})();
