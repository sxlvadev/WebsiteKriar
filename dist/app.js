document.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('service').value=button.dataset.service;document.getElementById('service').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('orcamento').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}));
const contacts = window.KRIAR_CONTACTS || {};
const whatsappNumber = String(contacts.whatsapp || '').replace(/\D/g, '');
const whatsappReady = /^55\d{10,11}$/.test(whatsappNumber);
const form = document.getElementById('quote-form');
const summary = document.getElementById('summary');
const result = document.getElementById('result');
const whatsappOrder = document.getElementById('whatsapp-order');
form.addEventListener('input', () => {
  result.hidden = true;
  whatsappOrder.removeAttribute('href');
  form.elements.nome.setCustomValidity('');
});
form.addEventListener('submit', event => {
  event.preventDefault();
  form.elements.nome.setCustomValidity(form.elements.nome.value.trim() ? '' : 'Preencha este campo.');
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const lines = [
    'PEDIDO DE ORÇAMENTO — GRÁFICA KRIAR', '',
    `Nome: ${data.get('nome').trim()}`,
    `Serviço: ${data.get('servico')}`,
    `Quantidade: ${data.get('quantidade')}`
  ];
  const deadline = String(data.get('prazo') || '');
  if (deadline) lines.push(`Prazo desejado: ${deadline.split('-').reverse().join('/')}`);
  for (const [field, label] of [['medidas', 'Medidas'], ['arte', 'Arte'], ['recebimento', 'Recebimento']]) {
    const value = String(data.get(field) || '').trim();
    if (value) lines.push(`${label}: ${value}`);
  }
  const details = String(data.get('detalhes') || '').trim();
  if (details) lines.push('', 'Detalhes do projeto:', details);
  summary.value = lines.join('\n');
  result.hidden = false;
  if (!whatsappReady) {
    whatsappOrder.hidden = true;
    document.getElementById('copy-status').textContent = 'Pedido pronto. Copie ou baixe o resumo para compartilhar com a gráfica.';
    return;
  }
  const destination = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(summary.value)}`;
  whatsappOrder.href = destination;
  whatsappOrder.hidden = false;
  document.getElementById('copy-status').textContent = 'Pedido pronto! Confirme o envio no WhatsApp. Se ele não abrir, toque em “Abrir pedido no WhatsApp”.';
  window.open(destination, '_blank', 'noopener,noreferrer');
});
document.getElementById('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary.value);document.getElementById('copy-status').textContent='Pedido copiado!'}catch{summary.focus();summary.select();document.getElementById('copy-status').textContent='Selecione o texto e use a opção copiar do seu dispositivo.'}});
document.getElementById('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([summary.value],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='pedido-orcamento-kriar.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});



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

(() => {
  const products = {"Canecas": {"service": "Brindes personalizados", "detail": "Informe a quantidade e a arte desejada."}, "Panfletos": {"service": "Impressos e xerox", "detail": "Informe formato, quantidade e impressão frente ou frente e verso."}, "Livros": {"service": "Livros e revistas", "detail": "Informe formato, páginas, quantidade e acabamento."}, "Brindes personalizados": {"service": "Brindes personalizados", "detail": "Conte qual produto deseja e a quantidade."}, "Agendas": {"service": "Brindes personalizados", "detail": "Informe a quantidade e os detalhes da personalização."}, "Impressão 3D": {"service": "Impressão 3D", "detail": "Envie seu modelo em 3MF ou STL para conferência."}, "Camisas": {"service": "Brindes personalizados", "detail": "Informe quantidade, tamanhos e a arte desejada."}, "Revistas": {"service": "Livros e revistas", "detail": "Informe formato, páginas, quantidade e acabamento."}, "Crachás": {"service": "Brindes personalizados", "detail": "Informe quantidade, medidas e dados da personalização."}, "Livretos": {"service": "Livros e revistas", "detail": "Informe formato, número de páginas e quantidade."}, "Encadernação": {"service": "Impressos e xerox", "detail": "Informe formato e quantidade de folhas e exemplares."}, "Informativos": {"service": "Impressos e xerox", "detail": "Informe formato, quantidade e número de páginas."}, "Impressão em Papel Comum": {"service": "Impressos e xerox", "detail": "Informe formato, quantidade e impressão colorida ou em preto e branco."}, "Impressão em Papéis Especiais": {"service": "Impressos e xerox", "detail": "Informe o tipo de papel desejado, formato e quantidade."}, "Impressão de Fotos": {"service": "Impressos e xerox", "detail": "Informe o tamanho das fotos e a quantidade."}, "Encadernação Espiral": {"service": "Impressos e xerox", "detail": "Informe formato, quantidade de folhas e número de exemplares."}, "Plastificação": {"service": "Impressos e xerox", "detail": "Informe o tamanho do material e a quantidade."}, "Cartões de Visita": {"service": "Impressos e xerox", "detail": ""}, "Tags Personalizadas": {"service": "Impressos e xerox", "detail": ""}, "Panfletos / Flyers": {"service": "Impressos e xerox", "detail": ""}, "Pastas com Orelha": {"service": "Impressos e xerox", "detail": ""}, "Receituários Personalizados": {"service": "Impressos e xerox", "detail": ""}, "Livretos e Cartilhas": {"service": "Livros e revistas", "detail": ""}, "Carteiras de Vacinação": {"service": "Impressos e xerox", "detail": ""}, "Cartões de Agradecimento": {"service": "Impressos e xerox", "detail": ""}, "Blocos e Talões": {"service": "Impressos e xerox", "detail": ""}, "Blocos de Rifas": {"service": "Impressos e xerox", "detail": ""}, "Crachás Personalizados": {"service": "Impressos e xerox", "detail": ""}, "Credenciais": {"service": "Impressos e xerox", "detail": ""}, "Bottons / Broches": {"service": "Brindes personalizados", "detail": ""}, "Canecas Personalizadas": {"service": "Brindes personalizados", "detail": ""}, "Marca-páginas": {"service": "Brindes personalizados", "detail": ""}, "Ímãs de Geladeira": {"service": "Brindes personalizados", "detail": ""}, "Cardápios Plastificados": {"service": "Impressos e xerox", "detail": ""}, "Cardápios em PVC": {"service": "Impressos e xerox", "detail": ""}, "Cadernos Capa Dura": {"service": "Brindes personalizados", "detail": ""}, "Agendas Personalizadas": {"service": "Brindes personalizados", "detail": ""}, "Blocos e Cadernetas": {"service": "Brindes personalizados", "detail": ""}, "Etiquetas Escolares": {"service": "Brindes personalizados", "detail": ""}, "Calendários de Parede": {"service": "Impressos e xerox", "detail": ""}, "Calendários de Parede Grandes": {"service": "Impressos e xerox", "detail": ""}, "Calendários de Destaque": {"service": "Impressos e xerox", "detail": ""}, "Calendários de Mesa Triangulares": {"service": "Impressos e xerox", "detail": ""}, "Calendários de Mesa Wire-O": {"service": "Impressos e xerox", "detail": ""}, "Ímãs com Calendário": {"service": "Impressos e xerox", "detail": ""}};
  const name = new URLSearchParams(window.location.search).get("produto");
  if (!Object.prototype.hasOwnProperty.call(products, name)) return;
  form.elements.servico.value = products[name].service;
  form.elements.detalhes.value = "Produto: " + name + "\n";
})();
