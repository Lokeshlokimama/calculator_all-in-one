(() => {
  'use strict';
  const measurementId = 'G-MRCMVF9545';
  const preferenceKey = 'calculator-analytics-consent';
  let loaded = false;
  function readChoice() {
    try { return localStorage.getItem(preferenceKey); } catch { return null; }
  }
  function saveChoice(choice) {
    try { localStorage.setItem(preferenceKey, choice); } catch { /* Choice applies to this page only. */ }
  }
  function enable() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }
  const panel = document.createElement('section');
  panel.setAttribute('aria-label', 'Analytics privacy choice');
  panel.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;max-width:540px;margin:auto;padding:20px;background:#fff;color:#16233b;border:1px solid #ccd5e2;border-radius:16px;box-shadow:0 4px 24px #0002;z-index:10000;font:16px/1.5 system-ui';
  const text = document.createElement('p');
  text.textContent = 'Allow Google Analytics cookies to help us understand page visits? Calculator inputs and uploaded files are not sent as analytics events.';
  text.style.margin = '0 0 12px';
  panel.appendChild(text);
  const policy = document.createElement('a');
  policy.href = '/privacy.html';
  policy.textContent = 'Privacy policy';
  panel.appendChild(policy);
  for (const [label, choice] of [['Decline', 'denied'], ['Accept analytics', 'granted']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'margin:8px;padding:10px 14px;min-height:44px;border:1px solid #526581;border-radius:8px;background:#fff;color:#16233b;cursor:pointer';
    button.addEventListener('click', () => {
      saveChoice(choice);
      window['ga-disable-' + measurementId] = choice !== 'granted';
      if (choice === 'granted') enable();
      panel.remove();
      settings.focus();
    });
    panel.appendChild(button);
  }
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.textContent = 'Analytics preferences';
  settings.style.cssText = 'display:block;margin:16px auto;padding:10px 16px;min-height:44px;cursor:pointer';
  settings.addEventListener('click', () => {
    document.body.appendChild(panel);
    panel.querySelector('button').focus();
  });
  (document.querySelector('footer') || document.body).appendChild(settings);
  const choice = readChoice();
  window['ga-disable-' + measurementId] = choice !== 'granted';
  if (choice === 'granted') enable();
  else if (choice !== 'denied') document.body.appendChild(panel);
})();
