const test=require('node:test');
const assert=require('node:assert/strict');
const {resolveLanguage}=require('../hero-locale.js');
test('Hero language respects saved preference and supported browser languages',()=>{
  assert.equal(resolveLanguage({saved:'te',languages:['en-US']}),'te');
  for(const [locale,expected] of [['hi-IN','hi'],['te_IN','te'],['es-MX','es'],['fr-CA','fr'],['de-DE','de'],['ja-JP','ja']])assert.equal(resolveLanguage({languages:[locale]}),expected);
  assert.equal(resolveLanguage({saved:'invalid',languages:['zh-CN','fr-FR']}),'fr');
  assert.equal(resolveLanguage({languages:['ar-AE']}),'en');
  assert.equal(resolveLanguage(),'en');
});
