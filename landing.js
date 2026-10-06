(() => {
  const toolSearch = document.createElement('form');
  toolSearch.className = 'global-tool-search';
  toolSearch.action = '/#tools';
  toolSearch.setAttribute('role', 'search');
  toolSearch.innerHTML = '<label for="global-tool-query">Find a tool</label><input id="global-tool-query" name="search" type="search" placeholder="Search PDF, Word, EMI…"><button type="submit">Search tools</button><a href="/convert-to-pdf/">Convert to PDF</a>';
  document.querySelector('main')?.before(toolSearch);
  const amount = document.getElementById('hero-amount');
  const payment = document.getElementById('hero-payment');
  const amountValue = document.getElementById('hero-amount-value');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const money = value => new Intl.NumberFormat('en', {style:'currency', currency:document.getElementById('hero-currency')?.value || window.LocalCurrency?.detect().currency || 'USD', maximumFractionDigits:2}).format(value);
  const factor = (10 / 1200) / (1 - Math.pow(1 + 10 / 1200, -60));
  let displayed = Number(amount.value) * factor;
  let frame;
  function update() {
    amountValue.textContent = money(Number(amount.value));
    amount.style.setProperty('--progress', `${(amount.value - amount.min) / (amount.max - amount.min) * 100}%`);
    const target = Number(amount.value) * factor;
    cancelAnimationFrame(frame);
    if (reducedMotion.matches) {
      displayed = target;
      payment.textContent = money(target);
      return;
    }
    const initial = displayed;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / 220);
      displayed = initial + (target - initial) * (1 - Math.pow(1 - progress, 3));
      payment.textContent = money(displayed);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }
  amount.addEventListener('input', update);
  document.addEventListener('hero-locale-change', update);
  update();
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.08});
    document.querySelectorAll('.feature-card, .confidence, .finder').forEach(element => {
      element.classList.add('reveal');
      observer.observe(element);
    });
  }
})();

(() => {
  const toggle = document.querySelector('.motion-toggle');
  const glow = document.querySelector('.pointer-glow');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  let frame = 0;
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  function sync() {
    const stopped = paused || reduced.matches;
    document.body.classList.toggle('effects-paused', stopped);
    toggle.hidden = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume background animation' : 'Pause background animation');
    toggle.innerHTML = paused ? '<span aria-hidden="true">▷</span> Resume effects' : '<span aria-hidden="true">Ⅱ</span> Pause effects';
  }
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('pointermove', event => {
    if (paused || reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
    x = event.clientX;
    y = event.clientY;
    document.body.classList.add('pointer-active');
    if (!frame) frame = requestAnimationFrame(() => {
      glow.style.transform = `translate(${x}px, ${y}px)`;
      frame = 0;
    });
  }, {passive:true});
  document.documentElement.addEventListener('pointerleave', () => document.body.classList.remove('pointer-active'));
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('effects-paused', document.hidden || paused || reduced.matches);
  });
  sync();
})();
