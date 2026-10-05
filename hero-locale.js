(function(root) {
  'use strict';
  const copy = {
    en:['Work it out.','Move forward.','A useful answer is closer than you think. Explore calculators for your money, your plans and your everyday tasks.','Find your calculator','What could your monthly payment be?','Estimated monthly payment','Loan amount','Currency','Hero language'],
    hi:['हिसाब करें।','आगे बढ़ें।','पैसे, योजनाओं और रोज़मर्रा के कामों के लिए उपयोगी कैलकुलेटर खोजें।','अपना कैलकुलेटर खोजें','आपकी मासिक किस्त कितनी होगी?','अनुमानित मासिक किस्त','ऋण राशि','मुद्रा','हीरो की भाषा'],
    te:['లెక్కించండి.','ముందుకు సాగండి.','మీ డబ్బు, ప్రణాళికలు మరియు రోజువారీ పనుల కోసం ఉపయోగకరమైన కాలిక్యులేటర్లను కనుగొనండి.','మీ కాలిక్యులేటర్‌ను కనుగొనండి','మీ నెలవారీ చెల్లింపు ఎంత?','అంచనా నెలవారీ చెల్లింపు','రుణ మొత్తం','కరెన్సీ','హీరో భాష'],
    es:['Haz tus cálculos.','Sigue adelante.','Encuentra calculadoras útiles para tu dinero, tus planes y tus tareas diarias.','Encuentra tu calculadora','¿Cuánto pagarías al mes?','Pago mensual estimado','Importe del préstamo','Moneda','Idioma de la portada'],
    fr:['Faites le calcul.','Avancez.','Découvrez des calculatrices pour votre argent, vos projets et vos tâches quotidiennes.','Trouver une calculatrice','Quel serait votre paiement mensuel ?','Paiement mensuel estimé','Montant du prêt','Devise','Langue de la présentation'],
    de:['Rechne es aus.','Komm voran.','Entdecke Rechner für dein Geld, deine Pläne und deine täglichen Aufgaben.','Rechner finden','Wie hoch wäre deine Monatsrate?','Geschätzte Monatsrate','Darlehensbetrag','Währung','Sprache im Startbereich'],
    ja:['計算しましょう。','前へ進もう。','お金、計画、日常の作業に役立つ計算ツールを探しましょう。','計算ツールを探す','毎月の返済額はいくら？','毎月の返済額の目安','借入金額','通貨','ヒーローの言語']
  };
  function resolveLanguage({saved='',languages=[]}={}) {
    if(Object.hasOwn(copy,saved)) return saved;
    for(const language of languages) {
      const code=String(language).toLowerCase().split(/[-_]/)[0];
      if(Object.hasOwn(copy,code))return code;
    }
    return 'en';
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={resolveLanguage};
  if(!root.document)return;
  document.addEventListener('DOMContentLoaded',()=>{
    const currency=document.getElementById('hero-currency');
    const language=document.getElementById('hero-language');
    if(!currency||!language)return;
    let codes;
    try{codes=Intl.supportedValuesOf('currency');}catch{codes=['INR','USD','EUR','GBP','AED','AUD','CAD','JPY'];}
    for(const code of codes){const option=document.createElement('option');option.value=code;option.textContent=code;currency.append(option);}
    currency.value=root.LocalCurrency.detect(codes).currency;
    let saved='';try{saved=root.localStorage.getItem('calculator-hero-language')||'';}catch{}
    language.value=resolveLanguage({saved,languages:root.navigator.languages||[root.navigator.language]});
    function update(initial=false){
      const words=copy[language.value];
      const hero=document.querySelector('.hero');hero.lang=language.value;
      const title=document.getElementById('hero-title');
      title.replaceChildren(document.createTextNode(words[0]),document.createElement('br'));
      const emphasis=document.createElement('em');emphasis.textContent=words[1];title.append(emphasis);
      hero.querySelector('.hero-intro').textContent=words[2];
      hero.querySelector('.primary').firstChild.textContent=words[3]+' ';
      hero.querySelector('.live-demo h2').textContent=words[4];
      hero.querySelector('.live-result>span').textContent=words[5];
      hero.querySelector('label[for="hero-amount"]').firstChild.textContent=words[6]+' ';
      document.querySelector('[data-hero-currency-label]').textContent=words[7];
      document.querySelector('[data-hero-language-label]').textContent=words[8];
      root.LocalCurrency.announce(initial ? undefined : currency.value);
      document.dispatchEvent(new Event('hero-locale-change'));
    }
    currency.addEventListener('change',()=>{try{root.localStorage.setItem('calculator-display-currency',currency.value);}catch{}update();});
    language.addEventListener('change',()=>{try{root.localStorage.setItem('calculator-hero-language',language.value);}catch{}update();});
    update(true);
  });
})(typeof window==='undefined'?{}:window);
