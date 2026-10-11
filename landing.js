(() => {
  const amount = document.getElementById('hero-amount');
  const payment = document.getElementById('hero-payment');
  const amountValue = document.getElementById('hero-amount-value');
  if (!amount || !payment || !amountValue) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const money = value => new Intl.NumberFormat('en', {style:'currency',currency:document.getElementById('hero-currency')?.value || window.LocalCurrency?.detect().currency || 'USD',maximumFractionDigits:2}).format(value);
  const rate = 10 / 1200;
  const factor = rate / (1 - Math.pow(1 + rate, -60));
  let displayed = Number(amount.value) * factor;
  let frame;
  function update() {
    amountValue.textContent = money(Number(amount.value));
    amount.setAttribute('aria-valuetext', money(Number(amount.value)));
    const target = Number(amount.value) * factor;
    cancelAnimationFrame(frame);
    if (reduced.matches) { displayed = target; payment.textContent = money(target); return; }
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
  reduced.addEventListener('change', update);
  update();
})();
