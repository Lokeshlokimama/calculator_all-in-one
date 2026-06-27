import assert from 'node:assert/strict';
import test from 'node:test';

await import('../calculator-core.js');
const core = globalThis.CalculatorCore;

function closeTo(actual, expected, tolerance = 0.01) {
    assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`);
}

test('amortized loan covers standard, zero-rate, and invalid inputs', () => {
    const standard = core.amortizedLoan(100000, 12, 12);
    closeTo(standard.payment, 8884.88);
    closeTo(standard.totalPayment, 106618.55);
    closeTo(standard.totalInterest, 6618.55);
    closeTo(core.amortizedLoan(12000, 0, 12).payment, 1000);
    assert.throws(() => core.amortizedLoan(0, 10, 12), /Principal/);
    assert.throws(() => core.amortizedLoan(1000, -1, 12), /Annual rate/);
});

test('BMI uses adult CDC category boundaries and rejects non-positive values', () => {
    closeTo(core.bmi(65, 170).value, 22.4913, 0.0001);
    assert.equal(core.bmi(45, 170).category, 'Underweight');
    assert.equal(core.bmi(53.465, 170).category, 'Healthy weight');
    assert.equal(core.bmi(72.25, 170).category, 'Overweight');
    assert.equal(core.bmi(86.7, 170).category, 'Obesity');
    assert.throws(() => core.bmi(0, 170), /Weight/);
});

test('age calculation handles ordinary dates, month ends, leap days, and future dates', () => {
    assert.deepEqual(core.ageBetween('2000-03-15', '2026-06-13'), {
        years: 26, months: 2, days: 29, totalDays: 9586
    });
    assert.deepEqual(core.ageBetween('2024-01-31', '2024-03-01'), {
        years: 0, months: 1, days: 1, totalDays: 30
    });
    assert.deepEqual(core.ageBetween('2000-02-29', '2021-02-28'), {
        years: 21, months: 0, days: 0, totalDays: 7670
    });
    assert.throws(() => core.ageBetween('2026-01-02', '2026-01-01'), /future/);
    assert.throws(() => core.ageBetween('2026-02-30', '2026-03-01'), /valid calendar/);
});

test('percentage supports zero and negative values', () => {
    assert.equal(core.percentage(18, 1200), 216);
    assert.equal(core.percentage(50, 0), 0);
    assert.equal(core.percentage(10, -50), -5);
    assert.throws(() => core.percentage('not-a-number', 10), /Percentage/);
});

test('GST covers add, remove, zero rate, and invalid mode', () => {
    assert.deepEqual(core.gst(1000, 18, 'add'), { base: 1000, tax: 180, total: 1180 });
    const removed = core.gst(1180, 18, 'remove');
    closeTo(removed.base, 1000);
    closeTo(removed.tax, 180);
    assert.deepEqual(core.gst(1000, 0, 'add'), { base: 1000, tax: 0, total: 1000 });
    assert.throws(() => core.gst(100, 18, 'other'), /mode/);
});

test('SIP covers beginning-of-month compounding and zero return', () => {
    const result = core.sip(5000, 12, 10);
    closeTo(result.invested, 600000);
    closeTo(result.maturity, 1161695.38);
    closeTo(result.returns, 561695.38);
    assert.deepEqual(core.sip(1000, 0, 1), { invested: 12000, returns: 0, maturity: 12000 });
});

test('currency conversion validates both amount and rate', () => {
    assert.equal(core.convertCurrency(100, 83.25), 8325);
    assert.equal(core.convertCurrency(0, 83.25), 0);
    assert.throws(() => core.convertCurrency(1, 0), /Exchange rate/);
});

test('password generation respects length and guarantees selected character groups', () => {
    let seed = 0;
    const deterministicRandom = (max) => (seed++ * 7 + 3) % max;
    const password = core.generatePassword({ length: 16, uppercase: true, numbers: true, symbols: true }, deterministicRandom);
    assert.equal(password.length, 16);
    assert.match(password, /[a-z]/);
    assert.match(password, /[A-Z]/);
    assert.match(password, /[0-9]/);
    assert.match(password, /[^A-Za-z0-9]/);
    assert.equal(core.generatePassword({ length: 2 }, () => 0).length, 8);
    assert.equal(core.generatePassword({ length: 100 }, () => 0).length, 64);
});

test('QR URL encoding preserves arbitrary user text', () => {
    const url = core.buildQrUrl('https://example.com/a path?q=one&x=✓');
    assert.match(url, /size=220x220/);
    assert.equal(new URL(url).searchParams.get('data'), 'https://example.com/a path?q=one&x=✓');
    assert.throws(() => core.buildQrUrl('   '), /empty/);
});
