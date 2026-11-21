document.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('service').value=button.dataset.service;document.getElementById('orcamento').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}));
const form=document.getElementById('quote-form'),summary=document.getElementById('summary');form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);summary.value=`PEDIDO DE ORÇAMENTO — GRÁFICA KRIAR\n\nNome: ${data.get('nome').trim()}\nServiço: ${data.get('servico')}\nQuantidade: ${data.get('quantidade')}\n\nDetalhes do projeto:\n${data.get('detalhes').trim()}`;document.getElementById('result').hidden=false;document.getElementById('copy-status').textContent='Pedido gerado. Copie ou baixe o resumo para compartilhar com a gráfica.';summary.focus();});
document.getElementById('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary.value);document.getElementById('copy-status').textContent='Pedido copiado!'}catch{summary.focus();summary.select();document.getElementById('copy-status').textContent='Selecione o texto e use a opção copiar do seu dispositivo.'}});
document.getElementById('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([summary.value],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='pedido-orcamento-kriar.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});document.getElementById('year').textContent=new Date().getFullYear();

form.addEventListener('submit',()=>{if(!form.checkValidity())return;const submitButton=form.querySelector('[type="submit"]');submitButton.classList.remove('is-generated');void submitButton.offsetWidth;submitButton.classList.add('is-generated');});


(() => {
  const carousel = document.querySelector('.product-carousel');
  if (!carousel) return;
  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const group = carousel.querySelector('.carousel-group');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, offset = 0, pointer = null, startX = 0, dragOffset = 0;
  let previousTime = null, frame = null;
  const paint = () => {
    if (width <= 0) return;
    offset = ((offset % width) + width) % width;
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  };
  const measure = () => { width = group.getBoundingClientRect().width; paint(); };
  const advance = time => {
    if (previousTime !== null && pointer === null && !document.hidden) {
      offset += Math.min(time - previousTime, 50) * .04;
      paint();
    }
    previousTime = time;
    frame = reducedMotion.matches ? null : requestAnimationFrame(advance);
  };
  const syncMotion = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
    if (!reducedMotion.matches) frame = requestAnimationFrame(advance);
  };
  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
    pointer = event.pointerId;
    startX = event.clientX;
    dragOffset = offset;
    carousel.classList.add('is-dragging');
    viewport.setPointerCapture(pointer);
    if (event.pointerType === 'mouse') event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    if (pointer !== event.pointerId) return;
    offset = dragOffset - (event.clientX - startX);
    paint();
  });
  const finish = event => {
    if (pointer === null || event.pointerId !== pointer) return;
    const releasedPointer = pointer;
    pointer = null;
    previousTime = null;
    carousel.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(releasedPointer)) viewport.releasePointerCapture(releasedPointer);
  };
  viewport.addEventListener('pointerup', finish);
  viewport.addEventListener('pointercancel', finish);
  viewport.addEventListener('lostpointercapture', finish);
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    offset += event.key === 'ArrowRight' ? 160 : -160;
    paint();
    previousTime = null;
  });
  document.addEventListener('visibilitychange', () => { previousTime = null; });
  reducedMotion.addEventListener('change', syncMotion);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measure).observe(group);
  else window.addEventListener('resize', measure);
  measure();
  syncMotion();
})();
