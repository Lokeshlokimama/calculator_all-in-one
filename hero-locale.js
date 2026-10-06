(function(root) {
  'use strict';
  const currencies = ['INR','USD','EUR','GBP','AED','AUD','CAD','JPY'];
  if(typeof module !== 'undefined' && module.exports) module.exports = {currencies};
  if(!root.document) return;
  document.addEventListener('DOMContentLoaded',()=>{
    const currency = document.getElementById('hero-currency');
    if(!currency) return;
    for(const code of currencies){const option=document.createElement('option');option.value=code;option.textContent=code;currency.append(option);}
    currency.value=root.LocalCurrency.detect(currencies).currency;
    currency.addEventListener('change',()=>{
      try{root.localStorage.setItem('calculator-display-currency',currency.value);}catch{}
      root.LocalCurrency.announce(currency.value);
      document.dispatchEvent(new Event('hero-locale-change'));
    });
    root.LocalCurrency.announce(currency.value);
    document.dispatchEvent(new Event('hero-locale-change'));
  });
})(typeof window==='undefined'?{}:window);
