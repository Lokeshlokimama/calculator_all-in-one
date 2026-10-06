const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {currencies}=require('../hero-locale.js');
const {resolve}=require('../local-currency.js');
test('Hero offers real currency formatting and no unavailable localized navigation',()=>{
  const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
  assert.doesNotMatch(html,/hero-language|data-hero-language-label/);
  assert.equal(currencies.length,8);
  for(const currency of currencies) assert.ok(new Intl.NumberFormat('en',{style:'currency',currency}).format(100));
  assert.equal(resolve({timeZone:'Asia/Kolkata',supported:currencies}).currency,'INR');
  assert.equal(resolve({saved:'CHF',timeZone:'Europe/Zurich',supported:currencies}).currency,'USD');
});
