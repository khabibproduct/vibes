// Shared Liquid Glass behaviour for every page:
// the specular highlight follows the pointer, and the bottom tab bar marks the section in view.

(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    let frame = 0;
    document.addEventListener('pointermove', e => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = e.target.closest && e.target.closest('.glass');
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    }, { passive: true });
  }

  const tabs = [...document.querySelectorAll('.tabbar a[href^="#"]')];
  const targets = tabs.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (tabs.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tabs.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => io.observe(t));
  }
})();
