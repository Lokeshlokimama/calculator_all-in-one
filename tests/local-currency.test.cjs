const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {resolve} = require('../local-currency.js');
test('Regional currency uses local time zone before mismatched browser language', () => {
 for(const timeZone of ['Asia/Kolkata','Asia/Calcutta']) assert.equal(resolve({timeZone,languages:['en-US']}).currency,'INR');
 for(const [timeZone,currency] of [['Asia/Dubai','AED'],['Europe/London','GBP'],['America/Toronto','CAD'],['Australia/Sydney','AUD'],['Europe/Paris','EUR']]) assert.equal(resolve({timeZone,languages:['en-US']}).currency,currency);
});
test('Explicit locale region fallback, scripts, unknown zones and no language-only inference', () => {
 for(const language of ['en-IN','hi-IN','en_IN']) assert.equal(resolve({timeZone:'UTC',languages:[language]}).currency,'INR');
 assert.equal(resolve({languages:['zh-Hant-HK']}).currency,'HKD');
 assert.equal(resolve({languages:['en-GB-u-ca-gregory']}).currency,'GBP');
 assert.equal(resolve({languages:['en','hi']}).source,'fallback; choose your currency if needed');
 assert.equal(resolve({languages:['xx-XX','en-CA']}).currency,'CAD');
 assert.equal(resolve().currency,'USD');
});
test('Saved supported choice wins and invalid/unsupported saved currencies fall back', () => {
 assert.equal(resolve({saved:'GBP',timeZone:'Asia/Kolkata'}).currency,'GBP');
 assert.equal(resolve({saved:'invalid',timeZone:'Asia/Kolkata'}).currency,'INR');
 assert.equal(resolve({saved:'ZZZ',timeZone:'Asia/Kolkata'}).currency,'INR');
 assert.equal(resolve({saved:'GBP',timeZone:'Asia/Kolkata',supported:['USD','INR']}).currency,'INR');
 assert.equal(resolve({timeZone:'Asia/Kolkata',languages:['en-GB'],supported:['USD','GBP']}).currency,'GBP');
});
test('Release loads resolver before calculator bundles, without changing INR retirement pages', () => {
 const root=path.resolve(__dirname,'..');
 for(const name of ['index.html','tools.html','emi-calculator.html']) assert.ok(fs.readFileSync(path.join(root,name),'utf8').includes('/local-currency.js'));
 for(const name of ['epf-calculator.html','eps-pension-calculator.html','nps-calculator.html']) assert.ok(!fs.readFileSync(path.join(root,name),'utf8').includes('/local-currency.js'));
 const source=fs.readFileSync(path.join(root,'local-currency.js'),'utf8');
 assert.ok(!/fetch\s*\(|geolocation|XMLHttpRequest/.test(source));
});
