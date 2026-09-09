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
    showFieldError: (id, message) => messages.push([message, id]),
    setTimeout: callback => callback(), formatLoanPreview() {}, formatReadableAmount: String,
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

test('percentage accepts zero and signed values without treating them as missing', () => {
  for (const [a, b, expected] of [[0, 100, '0.00'], [20, 0, '0.00'], [-10, 200, '-20.00']]) {
    const { context, nodes } = homepageFunctions(['calcPct'], { 'pct-a': a, 'pct-b': b });
    context.calcPct();
    assert.equal(nodes['pct-result'].innerText, expected);
  }
});

test('health tools reject negative and non-finite measurements', () => {
  for (const [fn, values, result] of [
    ['calcBMR', { 'bmr-gender': 'm', 'bmr-age': -20, 'bmr-weight': 70, 'bmr-height': 175 }, 'bmr-result'],
    ['calcWater', { 'water-weight': -70, 'water-activity': 1 }, 'water-result'],
    ['calcProtein', { 'protein-weight': -70, 'protein-goal': 1.2 }, 'protein-result'],
    ['calcIdealWeight', { 'iw-gender': 'm', 'iw-height': 'Infinity', 'iw-height-unit': 'cm' }, 'iw-result']
  ]) {
    const { context, nodes, messages } = homepageFunctions([fn], values);
    context[fn]();
    assert.equal(nodes[result]?.innerText, undefined, fn + ' must not publish a result');
    assert.ok(messages.length, fn + ' explains invalid input');
  }
});

test('GST accepts a zero amount but rejects negative amounts', () => {
  const { context, nodes, results, messages } = homepageFunctions(['calcGST'], { 'gst-amount': 0, 'gst-rate': 18, 'gst-action': 'add' });
  context.calcGST();
  assert.equal(results['gst-total'], 0);
  nodes['gst-amount'].value = '-100';
  context.calcGST();
  assert.equal(results['gst-total'], 0);
  assert.match(messages.at(-1)[0], /valid|non-negative/i);
});

test('calendar age handles month ends, leap days, invalid and future dates', () => {
  const { context } = homepageFunctions(['calendarAgeParts']);
  const age = context.calendarAgeParts('2025-01-31', new Date(2025, 2, 1));
  assert.equal(age.years, 0); assert.equal(age.months, 1); assert.equal(age.days, 1);
  assert.equal(age.totalDays, 29);
  const leap = context.calendarAgeParts('2024-02-29', new Date(2025, 1, 28));
  assert.equal(leap.years, 1); assert.equal(leap.months, 0); assert.equal(leap.days, 0);
  for (const value of ['2099-01-01', '2025-02-30', '', 'not-a-date']) {
    assert.equal(context.calendarAgeParts(value, new Date(2025, 2, 1)), null);
  }
});

test('SIP and FD reject unbounded durations and calculation overflow', () => {
  for (const years of ['Infinity', 1000000, -1]) {
    for (const [name, inputs] of [
      ['calcSIP', { 'sip-monthly': 1000, 'sip-rate': 8, 'sip-years': years }],
      ['calcFD', { 'fd-principal': 1000, 'fd-rate': 8, 'fd-citizen': 0, 'fd-years': years }]
    ]) {
      const { context, results, messages } = homepageFunctions([name], inputs);
      context[name]();
      assert.equal(Object.keys(results).length, 0);
      assert.ok(messages.length);
    }
  }
  const { context, results } = homepageFunctions(['calcSIP'], { 'sip-monthly': 1000, 'sip-rate': 1e-12, 'sip-years': 1 });
  context.calcSIP();
  assert.ok(Math.abs(results['sip-total'] - 12000) < 0.000001);
});

test('attendance handles impossible targets without loops and computes exact class counts', () => {
  const { context, nodes, messages } = homepageFunctions(['calcAttendance'], { 'att-total': 100, 'att-present': 70, 'att-target': 75 });
  context.calcAttendance();
  assert.match(nodes['att-result'].innerHTML, /attend 20 more/);
  nodes['att-target'].value = '100';
  context.calcAttendance();
  assert.match(nodes['att-result'].innerText, /cannot be reached/);
  for (const target of ['0', '101', 'Infinity', '-1']) {
    nodes['att-target'].value = target;
    context.calcAttendance();
    assert.match(messages.at(-1)[0], /target/);
  }
  nodes['att-target'].value = '75'; nodes['att-present'].value = '80';
  context.calcAttendance();
  assert.match(nodes['att-result'].innerHTML, /bunk 6 more/);
});

test('tip splitting rejects fractional people and permits a zero bill', () => {
  const { context, nodes, messages, results } = homepageFunctions(['calcTip'], { 'tip-bill': 100, 'tip-rate': 10, 'tip-people': 1.5 });
  context.calcTip();
  assert.equal(Object.keys(results).length, 0);
  assert.match(messages.at(-1)[0], /whole number/);
  nodes['tip-people'].value = '2'; context.calcTip();
  assert.equal(results['tip-person'], 55);
  nodes['tip-bill'].value = '0'; context.calcTip();
  assert.equal(results['tip-person'], 0);
});

test('CGPA includes zero grades and rejects partial or out-of-range rows', () => {
  const { context, nodes, messages } = homepageFunctions(['calcCGPA']);
  const credits = [{ value: '3' }, { value: '3' }];
  const grades = [{ value: '0' }, { value: '10' }];
  context.document.querySelectorAll = selector => selector === '.cgpa-credit' ? credits : grades;
  context.calcCGPA();
  assert.equal(nodes['cgpa-result'].innerText, '5.00 GPA');
  for (const grade of ['', '-1', '11', 'Infinity']) {
    grades[0].value = grade; context.calcCGPA();
    assert.match(messages.at(-1)[0], /Subject 1/);
  }
});

test('homepage EMI rejects fractional terms and remains stable near zero interest', () => {
  const { context, nodes, results, messages } = homepageFunctions(['calcEMI'], {
    'emi-amount': 120000, 'emi-rate': 1e-12, 'emi-tenure': 12,
    'emi-principal': { style: {} }, 'emi-interest': { style: {} }
  });
  context.calcEMI();
  assert.ok(Math.abs(results['emi-monthly-result'] - 10000) < 0.000001);
  nodes['emi-tenure'].value = '1.5'; context.calcEMI();
  assert.match(messages.at(-1)[0], /whole months/);
});

test('time arithmetic validates minutes and preserves subtraction sign', () => {
  const { context, nodes, messages } = homepageFunctions(['calcTime'], { 'time-h1': 0, 'time-m1': 10, 'time-h2': 1, 'time-m2': 15, 'time-op': '-' });
  context.calcTime(); assert.equal(nodes['time-result'].innerText, '-1h 5m');
  for (const value of ['60', '-1', '1.5', 'Infinity']) {
    nodes['time-m1'].value = value; context.calcTime();
    assert.match(messages.at(-1)[0], /minutes from 0 to 59/);
  }
});

test('geometry rejects non-finite or overflowing inputs', () => {
  for (const [fn, values] of [
    ['calcCircle', { 'circle-radius': '1e308' }],
    ['calcTriangle', { 'tri-base': '1e308', 'tri-height': '1e308' }],
    ['calcPythagorean', { 'pyth-a': 'Infinity', 'pyth-b': '4' }],
    ['calcVolume', { 'volume-shape': 'cube', 'volume-a': 'Infinity' }]
  ]) {
    const { context, messages } = homepageFunctions([fn], values);
    context[fn](); assert.ok(messages.length, fn + ' must show an error');
  }
});

test('standalone age agrees with month-end calendar convention', () => {
  class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [2025, 2, 1])); } }
  const nodes = { 'age-dob': { value: '2025-01-31' } };
  const context = vm.createContext({ Date: FixedDate, window: {}, document: { addEventListener() {}, getElementById: id => nodes[id] ||= {} } });
  vm.runInContext(read('calculator-pages.js').replace('return { init };', 'return { init, calculateAge };') + '\ncalculatorPage.calculateAge();', context);
  assert.equal(nodes['age-result'].textContent, '0 years, 1 months, 1 days');
  assert.equal(nodes['age-days'].textContent, '29 total days');
});

test('category deep links include Math and Geometry and reject unknown categories', () => {
  // This helper precedes startup event registration; evaluate only its declaration.
  const source = read('script.js').match(/function isToolCategory\(category\) \{[\s\S]*?\n\}/)[0];
  const context = vm.createContext({});
  vm.runInContext(source, context);
  for (const category of ['all', 'basic', 'finance', 'electricity', 'health', 'math', 'geometry', 'education', 'web']) {
    assert.equal(context.isToolCategory(category), true);
  }
  assert.equal(context.isToolCategory('unknown'), false);
  assert.equal(context.isToolCategory(null), false);
});

test('password matrix: all 57 lengths and all 8 option combinations', () => {
  const { context, nodes } = homepageFunctions(['generatePassword'], {
    'pwd-length': 8, 'pwd-upper': { checked: false }, 'pwd-numbers': { checked: false }, 'pwd-symbols': { checked: false }
  });
  for (let length = 8; length <= 64; length++) for (let mask = 0; mask < 8; mask++) {
    nodes['pwd-length'].value = String(length);
    nodes['pwd-upper'].checked = Boolean(mask & 1);
    nodes['pwd-numbers'].checked = Boolean(mask & 2);
    nodes['pwd-symbols'].checked = Boolean(mask & 4);
    context.generatePassword();
    const value = nodes['pwd-result'].innerText;
    assert.equal(value.length, length);
    assert.match(value, /[a-z]/);
    assert.equal(/[A-Z]/.test(value), Boolean(mask & 1));
    assert.equal(/[0-9]/.test(value), Boolean(mask & 2));
    assert.equal(/[^a-zA-Z0-9]/.test(value), Boolean(mask & 4));
  }
});

test('attendance matrix: 6,625 combinations agree with bounded brute-force arithmetic', () => {
  const { context, nodes } = homepageFunctions(['calcAttendance'], { 'att-total': 1, 'att-present': 0, 'att-target': 75 });
  for (let total = 1; total <= 50; total++) for (let present = 0; present <= total; present++) for (const target of [25, 50, 75, 90, 100]) {
    nodes['att-total'].value = String(total); nodes['att-present'].value = String(present); nodes['att-target'].value = String(target);
    context.calcAttendance();
    if (target === 100 && present < total) { assert.match(nodes['att-result'].innerText, /cannot be reached/); continue; }
    if (present / total * 100 >= target) {
      let allowed = 0;
      while (present / (total + allowed + 1) * 100 >= target) allowed++;
      assert.match(nodes['att-result'].innerHTML, new RegExp(`bunk ${allowed} more`));
    } else {
      let needed = 0;
      while ((present + needed) / (total + needed) * 100 < target) needed++;
      assert.match(nodes['att-result'].innerHTML, new RegExp(`attend ${needed} more`));
    }
  }
});

test('loan matrix: 60 combinations reproduce principal from discounted payments', () => {
  const api = traffic();
  for (const principal of [1, 1000, 1000000]) for (const rate of [0, 1e-10, 5, 20, 100]) for (const months of [1, 12, 120, 1200]) {
    const payment = api.payment(principal, rate, months);
    assert.ok(Number.isFinite(payment) && payment > 0);
    let presentValue = 0;
    for (let month = 1; month <= months; month++) presentValue += payment / Math.pow(1 + rate / 1200, month);
    assert.ok(Math.abs(presentValue - principal) <= principal * 1e-8, `${principal}/${rate}/${months}`);
  }
});

test('calendar matrix: valid birth dates always yield non-negative calendar components', () => {
  const { context } = homepageFunctions(['calendarAgeParts']);
  let checked = 0;
  for (let year = 1900; year <= 2025; year += 5) for (let month = 1; month <= 12; month++) for (const day of [1, 28, 29, 30, 31]) {
    const value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const birth = new Date(`${value}T00:00:00Z`);
    const age = context.calendarAgeParts(value, new Date(2026, 8, 9));
    if (birth.toISOString().slice(0, 10) !== value) { assert.equal(age, null); continue; }
    assert.ok(age.years >= 0 && age.months >= 0 && age.months < 12 && age.days >= 0 && age.days <= 31);
    assert.equal(age.totalDays, Math.round((Date.UTC(2026, 8, 9) - birth.getTime()) / 86400000));
    checked++;
  }
  // 1,560 candidate dates minus 176 impossible month/day combinations.
  assert.equal(checked, 1384);
});
