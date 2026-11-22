(() => {
  document.querySelectorAll('[data-catalog-details]').forEach(item => {
    const summary = item.querySelector(':scope > summary');
    let expanded = item.open;
    let animation = null;
    summary.setAttribute('aria-expanded', String(expanded));
    summary.addEventListener('click', event => {
      event.preventDefault();
      const start = item.getBoundingClientRect().height;
      animation?.cancel();
      expanded = !expanded;
      summary.setAttribute('aria-expanded', String(expanded));
      if (expanded) item.open = true;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || typeof item.animate !== 'function') {
        item.open = expanded;
        animation = null;
        return;
      }
      const end = expanded ? item.scrollHeight : summary.getBoundingClientRect().height;
      const next = item.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
      animation = next;
      next.onfinish = () => {
        if (animation !== next) return;
        item.open = expanded;
        animation = null;
      };
    });
  });
})();
