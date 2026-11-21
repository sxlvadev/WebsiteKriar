(() => {
  const records = Array.from(document.querySelectorAll('.faq-item'), item => ({
    item,
    summary: item.querySelector('summary'),
    expanded: item.open,
    animation: null
  }));
  const setExpanded = (record, expanded) => {
    const { item, summary } = record;
    const startHeight = item.getBoundingClientRect().height;
    record.animation?.cancel();
    record.expanded = expanded;
    if (expanded) item.open = true;
    const endHeight = expanded ? item.scrollHeight : summary.getBoundingClientRect().height;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof item.animate !== 'function') {
      item.open = expanded;
      record.animation = null;
      return;
    }
    const animation = item.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: 320, easing: 'cubic-bezier(.2, .8, .2, 1)' }
    );
    record.animation = animation;
    animation.onfinish = () => {
      if (record.animation !== animation) return;
      item.open = record.expanded;
      record.animation = null;
    };
  };
  records.forEach(record => {
    record.summary.addEventListener('click', event => {
      event.preventDefault();
      const expanded = !record.expanded;
      if (expanded) records.forEach(other => {
        if (other !== record && other.expanded) setExpanded(other, false);
      });
      setExpanded(record, expanded);
    });
  });
})();
