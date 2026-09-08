(function () {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const money = (value, currency = '₹') => `${currency}${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const number = (value, digits = 2) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: digits });

    function track(name, params = {}) {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, { event_category: 'traffic_pages', ...params });
        }
    }

    function setResult(form, rows) {
        const result = $('[data-traffic-result]', form.closest('.traffic-tool-card') || document);
        if (!result) return;
        result.innerHTML = rows.map((row) => `<div><span>${row.label}</span><strong>${row.value}</strong></div>`).join('');
        result.hidden = false;
    }

    function showCalculatorError(form, message) {
        const card = form.closest('.traffic-tool-card') || form;
        let error = $('[data-traffic-error]', card);
        if (!error) {
            error = document.createElement('p');
            error.dataset.trafficError = '';
            error.className = 'calculator-error';
            error.setAttribute('role', 'alert');
            form.appendChild(error);
        }
        error.textContent = message;
        if (message) {
            const result = $('[data-traffic-result]', card);
            if (result) result.hidden = true;
        }
    }

    function validCalculatorInputs(type, data) {
        const schemas = {
            'home-emi': { principal: [0.01, 1e15], rate: [0, 100], years: [1 / 12, 100] },
            'emi-prepayment': { principal: [0.01, 1e15], rate: [0, 100], years: [1 / 12, 100], paidMonths: [0, 1200], prepay: [0, 1e15] },
            'sip-step-up': { monthly: [0.01, 1e15], rate: [0, 100], step: [0, 100], years: [1 / 12, 100] },
            'gst-india': { amount: [0, 1e15], gstRate: [0, 100] },
            'electricity-bill': { units: [0, 1e12], unitRate: [0, 1e9], fixed: [0, 1e12], tax: [0, 100] }
        };
        const schema = schemas[type];
        if (!schema) return false;
        return Object.entries(schema).every(([name, [min, max]]) => {
            const raw = data[name];
            const value = Number(raw);
            return raw !== undefined && String(raw).trim() !== '' && Number.isFinite(value) && value >= min && value <= max;
        });
    }

    function payment(principal, annualRate, months) {
        const r = annualRate / 12 / 100;
        if (!r) return principal / months;
        return principal * r / -Math.expm1(-months * Math.log1p(r));
    }

    function remainingBalance(principal, annualRate, monthsPaid, emi) {
        const r = annualRate / 12 / 100;
        if (!r) return Math.max(0, principal - emi * monthsPaid);
        // Iterate paid installments to avoid cancellation of very large powers.
        let balance = principal;
        for (let month = 0; month < monthsPaid; month += 1) balance = Math.max(0, balance * (1 + r) - emi);
        return balance;
    }

    function monthsToClose(balance, annualRate, emi) {
        const r = annualRate / 12 / 100;
        if (balance <= 0) return 0;
        if (!r) return Math.ceil(balance / emi);
        if (emi <= balance * r) return Infinity;
        return Math.ceil(-Math.log(1 - (r * balance / emi)) / Math.log(1 + r));
    }

    function repaymentSchedule(balance, annualRate, emi) {
        let total = 0;
        let months = 0;
        const r = annualRate / 12 / 100;
        const tolerance = Math.max(1e-8, balance * Number.EPSILON * 100);
        while (balance > tolerance && months < 1201) {
            const due = balance * (1 + r);
            const installment = Math.min(emi, due);
            total += installment;
            balance = Math.max(0, due - installment);
            months += 1;
        }
        return balance <= tolerance ? { months, total } : { months: Infinity, total: Infinity };
    }

    function initFinanceCalculators() {
        $$('[data-traffic-calc]').forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const data = Object.fromEntries(new FormData(form).entries());
                const type = form.dataset.trafficCalc;
                showCalculatorError(form, '');
                if (!validCalculatorInputs(type, data)) {
                    showCalculatorError(form, 'Enter valid values in every field. Amounts and rates must be non-negative; loan or investment amounts and tenure must be positive. Rates cannot exceed 100%.');
                    return;
                }
                const principal = Number(data.principal || 0);
                const rate = Number(data.rate || 0);
                const years = Number(data.years || 0);
                const months = Math.round(years * 12);
                if (['home-emi', 'emi-prepayment', 'sip-step-up'].includes(type) && Math.abs(years * 12 - months) > 1e-8) {
                    showCalculatorError(form, 'Enter a tenure corresponding to a whole number of monthly payments.');
                    return;
                }

                if (type === 'home-emi') {
                    const emi = payment(principal, rate, months);
                    const total = emi * months;
                    setResult(form, [
                        { label: 'Monthly EMI', value: money(emi) },
                        { label: 'Total interest', value: money(total - principal) },
                        { label: 'Total payment', value: money(total) },
                        { label: 'Tenure', value: `${months} months` }
                    ]);
                }

                if (type === 'emi-prepayment') {
                    const paidMonths = Number(data.paidMonths || 0);
                    const prepay = Number(data.prepay || 0);
                    if (!Number.isInteger(paidMonths) || paidMonths > months) {
                        showCalculatorError(form, 'Months already paid must be a whole number between zero and the original loan tenure.');
                        return;
                    }
                    const emi = payment(principal, rate, months);
                    const balance = Math.max(0, remainingBalance(principal, rate, paidMonths, emi));
                    const appliedPrepay = Math.min(balance, prepay);
                    const afterPrepay = balance - appliedPrepay;
                    const remainingOriginal = Math.max(0, months - paidMonths);
                    const original = repaymentSchedule(balance, rate, emi);
                    const revised = repaymentSchedule(afterPrepay, rate, emi);
                    const revisedMonths = revised.months;
                    const originalFuture = original.total;
                    const revisedFuture = revised.total;
                    setResult(form, [
                        { label: 'Current EMI', value: money(emi) },
                        { label: 'Estimated balance', value: money(balance) },
                        { label: 'Prepayment applied', value: money(appliedPrepay) },
                        { label: 'Balance after prepayment', value: money(afterPrepay) },
                        { label: 'Months saved', value: Number.isFinite(revisedMonths) ? `${Math.max(0, remainingOriginal - revisedMonths)} months` : 'EMI too low' },
                        { label: 'Estimated interest saved', value: Number.isFinite(revisedFuture) ? money(Math.max(0, originalFuture - revisedFuture - appliedPrepay)) : 'Increase EMI' }
                    ]);
                }

                if (type === 'sip-step-up') {
                    const monthly = Number(data.monthly || 0);
                    const annualReturn = Number(data.rate || 0) / 100;
                    const step = Number(data.step || 0) / 100;
                    const totalMonths = Math.max(1, Math.round(Number(data.years || 0) * 12));
                    const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1;
                    let invested = 0;
                    let value = 0;
                    for (let m = 0; m < totalMonths; m += 1) {
                        const year = Math.floor(m / 12);
                        const installment = monthly * Math.pow(1 + step, year);
                        invested += installment;
                        value = (value + installment) * (1 + monthlyRate);
                    }
                    setResult(form, [
                        { label: 'Total invested', value: money(invested) },
                        { label: 'Estimated value', value: money(value) },
                        { label: 'Estimated gain', value: money(value - invested) },
                        { label: 'Final monthly SIP', value: money(monthly * Math.pow(1 + step, Math.floor((totalMonths - 1) / 12))) }
                    ]);
                }

                if (type === 'gst-india') {
                    const amount = Number(data.amount || 0);
                    const gstRate = Number(data.gstRate || 0);
                    const mode = data.mode || 'add';
                    if (mode === 'remove') {
                        const base = amount / (1 + gstRate / 100);
                        const gst = amount - base;
                        setResult(form, [
                            { label: 'Base amount', value: money(base) },
                            { label: 'GST amount', value: money(gst) },
                            { label: 'Inclusive total', value: money(amount) },
                            { label: 'CGST + SGST', value: `${number(gstRate / 2)}% + ${number(gstRate / 2)}%` }
                        ]);
                    } else {
                        const gst = amount * gstRate / 100;
                        setResult(form, [
                            { label: 'Base amount', value: money(amount) },
                            { label: 'GST amount', value: money(gst) },
                            { label: 'Inclusive total', value: money(amount + gst) },
                            { label: 'CGST + SGST', value: `${number(gstRate / 2)}% + ${number(gstRate / 2)}%` }
                        ]);
                    }
                }

                if (type === 'electricity-bill') {
                    const units = Number(data.units || 0);
                    const rate = Number(data.unitRate || 0);
                    const fixed = Number(data.fixed || 0);
                    const tax = Number(data.tax || 0);
                    const energyCharge = units * rate;
                    const subtotal = energyCharge + fixed;
                    const taxAmount = subtotal * tax / 100;
                    setResult(form, [
                        { label: 'Energy charge', value: money(energyCharge) },
                        { label: 'Fixed charge', value: money(fixed) },
                        { label: 'Tax / duty estimate', value: money(taxAmount) },
                        { label: 'Estimated bill', value: money(subtotal + taxAmount) }
                    ]);
                }

                track('traffic_calculator_submit', { calculator_type: type });
            });
        });
    }

    function qrPayload(kind, values) {
        if (kind === 'upi') {
            const params = new URLSearchParams();
            params.set('pa', values.pa || '');
            if (values.pn) params.set('pn', values.pn);
            if (values.am) params.set('am', values.am);
            params.set('cu', 'INR');
            if (values.tn) params.set('tn', values.tn);
            return `upi://pay?${params.toString()}`;
        }
        if (kind === 'wifi') {
            const escape = (value = '') => String(value).replace(/([\\;,":])/g, '\\$1');
            return `WIFI:T:${values.encryption || 'WPA'};S:${escape(values.ssid)};P:${escape(values.password)};H:${values.hidden ? 'true' : 'false'};;`;
        }
        if (kind === 'whatsapp') {
            const phone = String(values.phone || '').replace(/[^\d]/g, '');
            const text = values.message ? `?text=${encodeURIComponent(values.message)}` : '';
            return `https://wa.me/${phone}${text}`;
        }
        if (kind === 'vcard') {
            const esc = (value = '') => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
            return [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `FN:${esc(values.name)}`,
                values.phone ? `TEL:${esc(values.phone)}` : '',
                values.email ? `EMAIL:${esc(values.email)}` : '',
                values.organization ? `ORG:${esc(values.organization)}` : '',
                values.url ? `URL:${esc(values.url)}` : '',
                'END:VCARD'
            ].filter(Boolean).join('\n');
        }
        return values.text || '';
    }

    function initQrLandingPages() {
        $$('[data-traffic-qr]').forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const card = form.closest('.traffic-tool-card');
                const image = $('[data-traffic-qr-image]', card);
                const output = $('[data-traffic-qr-output]', card);
                const values = Object.fromEntries(new FormData(form).entries());
                const kind = form.dataset.trafficQr;
                const payload = qrPayload(kind, values);
                if (!payload || !window.CalculatorQRCode) return;
                const rendered = window.CalculatorQRCode.renderToImage(payload, image, { size: 260 });
                if (output) output.textContent = payload.length > 180 ? `${payload.slice(0, 180)}...` : payload;
                setResult(form, [
                    { label: 'QR type', value: kind.toUpperCase() },
                    { label: 'QR version', value: `v${rendered.meta.version}` },
                    { label: 'Encoded bytes', value: rendered.meta.bytes }
                ]);
                track('traffic_qr_generate', { qr_type: kind });
            });
        });

        const bulkForm = $('[data-traffic-bulk-qr]');
        if (bulkForm) {
            bulkForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const text = new FormData(bulkForm).get('items') || '';
                const items = String(text).split(/\n+/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
                const grid = $('[data-bulk-qr-grid]');
                if (!grid || !window.CalculatorQRCode) return;
                grid.innerHTML = '';
                items.forEach((item, index) => {
                    const figure = document.createElement('figure');
                    figure.className = 'bulk-qr-item';
                    figure.innerHTML = `<img alt="Generated bulk QR ${index + 1}"><figcaption></figcaption>`;
                    window.CalculatorQRCode.renderToImage(item, figure.querySelector('img'), { size: 180 });
                    figure.querySelector('figcaption').textContent = item.length > 64 ? `${item.slice(0, 64)}...` : item;
                    grid.appendChild(figure);
                });
                track('traffic_bulk_qr_generate', { qr_count: items.length });
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initFinanceCalculators();
        initQrLandingPages();
    });
})();
