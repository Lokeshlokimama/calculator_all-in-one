(() => {
  const background = document.createElement('div');
  background.className = 'theme-background';
  background.setAttribute('aria-hidden', 'true');
  document.body.prepend(background);
  const header = document.querySelector('header');
  if (header) {
    const ticker = document.createElement('div');
    ticker.className = 'theme-ticker';
    ticker.setAttribute('aria-hidden', 'true');
    ticker.innerHTML = '<span class="theme-ticker-window"><span class="theme-ticker-reel"><span>250 × 4 = 1,000</span><span>80 ÷ 5 = 16</span><span>15% of 200 = 30</span><span>250 × 4 = 1,000</span></span></span>';
    header.insertBefore(ticker, header.children[1] || null);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.createElement('button');
  button.className = 'theme-motion';
  button.type = 'button';
  let paused = false;
  function sync() {
    document.body.classList.toggle('theme-paused', paused || reduced.matches || document.hidden);
    button.hidden = reduced.matches;
    button.textContent = paused ? '▷ Resume effects' : 'Ⅱ Pause effects';
    button.setAttribute('aria-label', paused ? 'Resume background animation' : 'Pause background animation');
    button.setAttribute('aria-pressed', String(paused));
  }
  button.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.body.append(button);
  sync();
})();

// Close navigation with Escape or a click outside; return keyboard focus on Escape.
(() => {
  const menus = [...document.querySelectorAll('.mobile-menu, .ai-nav-mobile, .pdf-nav-tools')];
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = menus.find(menu => menu.open);
    if (open) { open.open = false; open.querySelector('summary')?.focus(); }
  });
  document.addEventListener('pointerdown', event => {
    menus.forEach(menu => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
  });
})();
