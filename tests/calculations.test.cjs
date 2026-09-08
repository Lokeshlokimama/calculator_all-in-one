const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const root = require('node:path').resolve(__dirname, '..');
const read = file => fs.readFileSync(require('node:path').join(root, file), 'utf8');

function homepageFunctions(names, values = {}, crypto = webcrypto) {
  const nodes = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'object' ? value : { value: String(value) }]));
  const messages = [], results = {};
  const context = vm.createContext({
    window: { crypto }, document: { getElementById: id => nodes[id] ||= {} },
    showToast: (...args) => messages.push(args),
    setMoneyText: (id, value) => { results[id] = value; }
  });
  const source = read('script.js');
  for (const name of names) {
    const start = source.indexOf('function ' + name + '(');
    assert.ok(start >= 0, 'Function exists: ' + name);
    const nextFunction = source.indexOf('\nfunction ', start + 1);
    const assignment = source.indexOf('\nwindow.' + name, start + 1);
    const end = assignment >= 0 && (nextFunction < 0 || assignment < nextFunction) ? assignment : nextFunction;
    vm.runInContext(source.slice(start, end), context);
  }
  return { context, nodes, messages, results };
}

function traffic() {
  const context = vm.createContext({ window: {}, document: { addEventListener() {} } });
  const source = read('traffic-calculators.js').replace(/\}\)\(\);\s*$/, 'globalThis.testApi = { payment, remainingBalance, repaymentSchedule, validCalculatorInputs };})();');
  vm.runInContext(source, context);
  return context.testApi;
}
test('loan payments include zero rate and tiny positive rates without cancellation', () => {
  const api = traffic();
  assert.equal(api.payment(120000, 0, 12), 10000);
  assert.ok(Math.abs(api.payment(100000, 10, 12) - 8791.588723) < 0.00001);
  assert.ok(Math.abs(api.payment(120000, 1e-10, 12) - 10000) < 0.000001);
  assert.ok(Number.isFinite(api.payment(100000, 100, 1200)));
});
test('prepayment includes a smaller final installment and caps an extinguished balance', () => {
  const api = traffic();
  const schedule = api.repaymentSchedule(250, 0, 100);
  assert.equal(schedule.months, 3);
  assert.equal(schedule.total, 250);
  assert.equal(api.remainingBalance(1000, 0, 15, 100), 0);
  assert.equal(api.repaymentSchedule(0, 10, 100).total, 0);
});
test('calculation validation rejects missing, non-finite and negative inputs, allows zero usage', () => {
  const api = traffic();
  const good = { units: '0', unitRate: '7.5', fixed: '100', tax: '0' };
  assert.equal(api.validCalculatorInputs('electricity-bill', good), true);
  for (const units of ['', 'Infinity', 'NaN', '-1']) {
    assert.equal(api.validCalculatorInputs('electricity-bill', { ...good, units }), false);
  }
  assert.equal(api.validCalculatorInputs('electricity-bill', { ...good, tax: '101' }), false);
});
test('RD projection compounds an entered quarterly nominal rate and handles zero rate', () => {
  const { context } = homepageFunctions(['recurringDepositMaturity']);
  assert.equal(context.recurringDepositMaturity(5000, 0, 24), 120000);
  let expected = 0;
  for (let month = 1; month <= 24; month++) expected += 5000 * Math.pow(1 + 0.065 / 4, month / 3);
  assert.ok(Math.abs(context.recurringDepositMaturity(5000, 6.5, 24) - expected) < 1e-7);
});
test('salary uses the entered tax and deductions, without invented tax slabs', () => {
  const { context, results, messages, nodes } = homepageFunctions(['calcSalary'], {
    'sal-ctc': 1200000, 'sal-basic-pct': 50, 'sal-monthly-tax': 8000, 'sal-other-deductions': 1000
  });
  context.calcSalary();
  assert.equal(results['sal-pf'], 6000);
  assert.equal(results['sal-result'], 85000);
  nodes['sal-monthly-tax'].value = '200000';
  context.calcSalary();
  assert.match(messages.at(-1)[0], /deductions exceed/i);
});
test('passwords contain the requested groups at each supported length', () => {
  const { context, nodes } = homepageFunctions(['generatePassword'], {
    'pwd-length': 8, 'pwd-upper': { checked: true }, 'pwd-numbers': { checked: true }, 'pwd-symbols': { checked: true }
  });
  for (const length of [8, 12, 32, 64]) {
    nodes['pwd-length'].value = String(length);
    for (let n = 0; n < 20; n++) {
      context.generatePassword();
      const value = nodes['pwd-result'].innerText;
      assert.equal(value.length, length);
      for (const pattern of [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/]) assert.match(value, pattern);
    }
  }
});
test('password generation fails clearly if secure random support is unavailable', () => {
  const { context, nodes, messages } = homepageFunctions(['generatePassword'], {
    'pwd-length': 12, 'pwd-upper': { checked: true }, 'pwd-numbers': { checked: true }, 'pwd-symbols': { checked: false }
  }, {});
  context.generatePassword();
  assert.equal(nodes['pwd-result'].innerText, '');
  assert.match(messages.at(-1)[0], /secure random/);
});
test('UUID output has version 4 and RFC variant bits; unsupported versions fail', () => {
  const { context, nodes, messages } = homepageFunctions(['generateUUIDs'], { 'uuid-version': 4, 'uuid-count': 100 });
  context.generateUUIDs();
  const values = nodes['uuid-output'].value.split('\n');
  assert.equal(values.length, 100);
  assert.equal(new Set(values).size, 100);
  values.forEach(value => assert.match(value, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  nodes['uuid-version'].value = '1';
  context.generateUUIDs();
  assert.equal(nodes['uuid-output'].value, '');
  assert.match(messages.at(-1)[0], /UUID v4/);
});
