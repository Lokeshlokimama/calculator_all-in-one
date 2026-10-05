const test = require('node:test');
const assert = require('node:assert/strict');
const {analyze} = require('../loan-analysis.js');
test('monthly loan ledger reconciles principal, interest and final balance', () => {
 for (const p of [1,120000,500000]) for (const r of [0,0.000001,5,10,25]) for (const n of [1,12,60,360]) {
  const a=analyze(p,r,n);
  assert.equal(a.rows.length,n);
  assert.equal(a.rows.at(-1).balance,0);
  assert.ok(Math.abs(a.rows.reduce((s,x)=>s+x.principal,0)-p)<p*1e-9);
  assert.ok(Math.abs(a.rows.reduce((s,x)=>s+x.payment,0)-a.total)<a.total*1e-9);
  assert.ok(a.rows.every(x=>x.principal>=0&&x.interest>=0&&x.balance>=0));
 }
 const a=analyze(500000,10,60);
 assert.ok(Math.abs(a.payment-10623.52236)<0.00001);
 assert.ok(Math.abs(a.interest-137411.34134)<0.001);
 assert.equal(analyze(120000,0,12).interest,0);
 assert.ok(analyze(500000,10,72).interest>a.interest);
});
test('loan analysis rejects invalid and unbounded inputs', () => {
 for(const args of [[0,10,12],[1,-1,12],[1,10,1.5],[1,10,1201],[Infinity,10,12],['10',10,12],[1,NaN,12]]) assert.throws(()=>analyze(...args));
});
