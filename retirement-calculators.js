(function (root) {
  'use strict';
  function number(value, label, min, max, integer = false) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && value.trim() === '')) throw new Error(label + ' is required.');
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw new Error(label + ' must be ' + (integer ? 'a whole number ' : '') + 'between ' + min + ' and ' + max + '.');
    return n;
  }
  function safe(n) { if (!Number.isFinite(n) || Math.abs(n) > 1e14) throw new Error('Projection exceeds the supported range. Reduce the amount, rate or duration.'); return n; }
  function epf(p) {
    const opening = number(p.opening, 'Opening EPF balance', 0, 1e10);
    const employee = number(p.employee, 'Monthly employee EPF', 0, 1e7);
    const employer = number(p.employer, 'Monthly employer EPF', 0, 1e7);
    const years = number(p.years, 'Projection years', 0, 50, true);
    const rate = number(p.rate, 'Annual interest assumption', 0, 20) / 100;
    const growth = number(p.growth, 'Annual contribution increase', 0, 30) / 100;
    let balance = opening, contributions = 0, interest = 0;
    const rows = [];
    for (let y = 1; y <= years; y++) {
      const start = balance, monthly = (employee + employer) * (1 + growth) ** (y - 1);
      let accrued = 0;
      for (let m = 0; m < 12; m++) { accrued += balance * rate / 12; balance += monthly; }
      balance = safe(balance + accrued); contributions += monthly * 12; interest += accrued;
      rows.push({year:y, opening:start, contribution:monthly * 12, gain:accrued, closing:balance});
    }
    return {balance, contributions, gain:interest, rows};
  }
  function eps(p) {
    const salary = number(p.salary, 'Pensionable salary', 1, 1000000);
    const service = number(p.service, 'Confirmed pensionable service', 0, 40, true);
    if (p.scope !== true) throw new Error('Confirm the supported EPS scope before calculating. Use EPFO for mixed-period or higher-pension cases.');
    if (service < 10) throw new Error('This model requires at least 10 confirmed years. It does not calculate withdrawal benefits or decide eligibility.');
    const usedSalary = Math.min(salary, 15000);
    return {salary:usedSalary, service, monthly:usedSalary * service / 70, capped:salary > 15000};
  }
  function nps(p) {
    const opening = number(p.opening, 'Current NPS corpus', 0, 1e10);
    const monthly = number(p.monthly, 'Monthly contribution', 0, 1e7);
    const years = number(p.years, 'Projection years', 0, 50, true);
    const rate = number(p.rate, 'Annual return assumption', -50, 30) / 100;
    const growth = number(p.growth, 'Annual contribution increase', 0, 30) / 100;
    const allocation = number(p.allocation, 'Annuity allocation', 0, 100) / 100;
    const annuityRate = number(p.annuityRate, 'Annuity payout assumption', 0, 20) / 100;
    const inflation = number(p.inflation, 'Annual inflation assumption', 0, 20) / 100;
    const monthlyRate = Math.expm1(Math.log1p(rate) / 12);
    let balance = opening, contributions = 0;
    const rows = [];
    for (let y = 1; y <= years; y++) {
      const start = balance, deposit = monthly * (1 + growth) ** (y - 1);
      for (let m = 0; m < 12; m++) balance = safe(balance * (1 + monthlyRate) + deposit);
      contributions += deposit * 12;
      rows.push({year:y, opening:start, contribution:deposit * 12, gain:balance - start - deposit * 12, closing:balance});
    }
    const annuity = balance * allocation;
    return {balance, contributions, gain:balance - opening - contributions, annuity, lump:balance - annuity, monthly:annuity * annuityRate / 12, real:balance / (1 + inflation) ** years, rows};
  }
  const api = {epf, eps, nps};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root.document) return;
  const form = document.querySelector('[data-retirement]');
  if (!form) return;
  const result = document.getElementById('retirement-result');
  const money = n => new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:2}).format(n);
  function clear() { result.replaceChildren(); }
  function line(label, value) { const p = document.createElement('p'); p.textContent = label + ': ' + value; result.appendChild(p); }
  form.addEventListener('input', clear);
  form.addEventListener('change', clear);
  form.addEventListener('reset', clear);
  form.addEventListener('submit', event => {
    event.preventDefault(); clear();
    try {
      const p = {};
      for (const input of form.querySelectorAll('[name]')) p[input.name] = input.type === 'checkbox' ? input.checked : input.value;
      const kind = form.dataset.retirement, r = api[kind](p);
      if (kind === 'eps') {
        line('Formula monthly pension estimate', money(r.monthly));
        line('Salary used', money(r.salary)); line('Confirmed service used', r.service + ' years');
        if (r.capped) line('Salary ceiling applied', '₹15,000 for this standard model.');
        line('Important', 'Not an EPFO pension award. Eligibility, service and benefits require EPFO confirmation.');
      } else {
        line('Projected corpus', money(r.balance)); line('New contributions', money(r.contributions)); line(kind === 'epf' ? 'Estimated interest' : 'Estimated gain or loss', money(r.gain));
        if (kind === 'nps') { line('Scenario annuity purchase', money(r.annuity)); line('Scenario non-annuity portion (not a withdrawal entitlement)', money(r.lump)); line('Illustrative monthly annuity before tax', money(r.monthly)); line('Corpus in today’s purchasing power', money(r.real)); }
        if (r.rows.length) {
          const wrap = document.createElement('div'); wrap.className = 'table-scroll';
          const table = document.createElement('table');
          const caption = table.createCaption(); caption.textContent = 'Year-by-year projection (rounded for display only)';
          const head = table.createTHead().insertRow();
          for (const title of ['Year','Opening','Contributions','Interest / gain','Closing']) { const th = document.createElement('th'); th.scope = 'col'; th.textContent = title; head.appendChild(th); }
          const body = table.createTBody();
          for (const row of r.rows) { const tr = body.insertRow(); for (const [key,value] of Object.entries(row)) tr.insertCell().textContent = key === 'year' ? value : money(value); }
          wrap.appendChild(table); result.appendChild(wrap);
        }
      }
    } catch (error) { line('Cannot calculate', error.message); }
  });
})(typeof window === 'undefined' ? {} : window);
