const test = require('node:test');
const assert = require('node:assert/strict');
const {epf, eps, nps} = require('../retirement-calculators.js');
const E = {opening:0,employee:1800,employer:550,years:1,rate:8,growth:0};
const N = {opening:0,monthly:5000,years:10,rate:0,growth:0,allocation:40,annuityRate:6,inflation:0};
const P = {salary:15000,service:10,scope:true};
const close = (a,b) => assert.ok(Math.abs(a-b) <= Math.max(1,Math.abs(b))*1e-10, `${a} != ${b}`);
test('EPF published April–March example and no interest on current-month deposit', () => {
 const r=epf(E); close(r.balance,29234); close(r.contributions,28200); close(r.gain,1034);
 close(epf({...E,employee:1,employer:0,rate:12}).gain,0.66);
});
test('EPF annual credit, zero rate, growth, opening balance and zero horizon', () => {
 close(epf({...E,opening:100000,employee:0,employer:0,years:2}).balance,116640);
 close(epf({...E,rate:0,growth:10,years:2}).balance,59220);
 close(epf({...E,opening:123,years:0}).balance,123);
 assert.equal(epf({...E,years:0}).rows.length,0);
});
test('EPF independent annual formula matrix and reconciliation', () => {
 for(const opening of [0,1000,100000]) for(const rate of [0,0.01,8,20]) for(const growth of [0,10,30]) for(const years of [0,1,2,10,50]) {
   let b=opening; for(let y=0;y<years;y++){ const c=2350*(1+growth/100)**y; b=b*(1+rate/100)+12*c+66*c*rate/1200; }
   const r=epf({...E,opening,rate,growth,years}); close(r.balance,b); close(r.balance,opening+r.contributions+r.gain);
 }
});
test('NPS published zero-return example, split and annuity', () => {
 const r=nps(N); close(r.balance,600000); close(r.annuity,240000); close(r.lump,360000); close(r.monthly,1200); close(r.real,600000);
});
test('NPS independent annuity-due-free geometric series matrix including losses', () => {
 for(const rate of [-50,-5,0,0.001,8,30]) for(const years of [0,1,5,30]) for(const opening of [0,100000]) {
  const m=Math.expm1(Math.log1p(rate/100)/12), months=years*12;
  const expected=opening*(1+rate/100)**years + (m===0?5000*months:5000*Math.expm1(months*Math.log1p(m))/m);
  const r=nps({...N,rate,years,opening}); close(r.balance,expected); close(r.balance,opening+r.contributions+r.gain);
  close(r.annuity+r.lump,r.balance);
 }
});
test('NPS annual step-up, inflation and allocation extremes', () => {
 close(nps({...N,years:2,growth:10}).balance,126000);
 close(nps({...N,inflation:5}).real,600000/1.05**10);
 close(nps({...N,allocation:0}).monthly,0); close(nps({...N,allocation:100}).lump,0);
 close(nps({...N,years:0,opening:100000}).balance,100000);
 assert.ok(nps({...N,rate:-50}).gain<0);
});
test('EPS standard formula, cap and scope guard', () => {
 close(eps(P).monthly,150000/70); close(eps({...P,salary:10000}).monthly,100000/70);
 assert.equal(eps({...P,salary:30000}).salary,15000); assert.equal(eps({...P,salary:30000}).capped,true);
 for(const service of [0,1,9]) assert.throws(()=>eps({...P,service}),/10 confirmed/);
 for(const scope of [false,undefined,'true']) assert.throws(()=>eps({...P,scope}),/scope/);
});
test('All numeric fields reject blanks, missing, non-finite, booleans and invalid values', () => {
 for(const [fn,base] of [[epf,E],[nps,N],[eps,P]]) {
  for(const key of Object.keys(base).filter(k=>k!=='scope')) for(const value of ['', ' ', [], {}, null,undefined,NaN,Infinity,-Infinity,true,'garbage']) assert.throws(()=>fn({...base,[key]:value}), `${key}: ${value}`);
 }
 for(const years of [-1,0.5,61]) {assert.throws(()=>epf({...E,years}));assert.throws(()=>nps({...N,years}));}
 for(const service of [-1,9.5,41]) assert.throws(()=>eps({...P,service}));
 for(const key of ['opening','employee','employer','rate','growth']) assert.throws(()=>epf({...E,[key]:-1}));
 for(const allocation of [-1,101]) assert.throws(()=>nps({...N,allocation}));
 assert.throws(()=>nps({...N,rate:-100})); assert.throws(()=>eps({...P,salary:0}));
});
test('Extreme projections fail safely rather than emitting Infinity', () => {
 assert.throws(()=>nps({...N,opening:1e10,monthly:1e7,years:50,rate:30,growth:30}),/supported range/);
 assert.throws(()=>epf({...E,opening:1e10,employee:1e7,employer:1e7,years:50,rate:20,growth:30}),/supported range/);
});
