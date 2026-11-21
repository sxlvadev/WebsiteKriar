(() => {
  const contacts = window.KRIAR_CONTACTS || {};
  const phone = String(contacts.whatsapp || '').replace(/\D/g, '');
  document.querySelectorAll('[data-contact]').forEach(link => {
    const destination = link.dataset.contact === 'whatsapp'
      ? (/^55\d{10,11}$/.test(phone) ? `https://wa.me/${phone}` : '')
      : contacts[link.dataset.contact];
    if (!destination || !destination.startsWith('https://')) return;
    link.href = destination;
    link.hidden = false;
  });
  document.querySelectorAll('[data-cnpj]').forEach(node => { node.textContent = `CNPJ: ${contacts.cnpj}`; });
  document.querySelectorAll('[data-year], #year').forEach(node => { node.textContent = new Date().getFullYear(); });
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    const updateBackToTop = () => { backToTop.hidden = window.scrollY < 320; };
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    backToTop.addEventListener('click', () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
    updateBackToTop();
  }
})();
