(function attachCalculatorCore(root) {
    'use strict';

    const DAY_MS = 86400000;

    function finiteNumber(value, label) {
        const number = Number(value);
        if (!Number.isFinite(number)) throw new RangeError(`${label} must be a finite number.`);
        return number;
    }

    function positiveNumber(value, label, allowZero = false) {
        const number = finiteNumber(value, label);
        if (allowZero ? number < 0 : number <= 0) {
            throw new RangeError(`${label} must be ${allowZero ? 'zero or greater' : 'greater than zero'}.`);
        }
        return number;
    }

    function amortizedLoan(principalValue, annualRateValue, periodsValue) {
        const principal = positiveNumber(principalValue, 'Principal');
        const annualRate = positiveNumber(annualRateValue, 'Annual rate', true);
        const periods = positiveNumber(periodsValue, 'Payment periods');
        const periodicRate = annualRate / 100 / 12;
        const payment = periodicRate === 0
            ? principal / periods
            : principal * periodicRate * Math.pow(1 + periodicRate, periods)
                / (Math.pow(1 + periodicRate, periods) - 1);
        const totalPayment = payment * periods;

        return {
            payment,
            totalInterest: Math.max(0, totalPayment - principal),
            totalPayment
        };
    }

    function bmi(weightKgValue, heightCmValue) {
        const weightKg = positiveNumber(weightKgValue, 'Weight');
        const heightCm = positiveNumber(heightCmValue, 'Height');
        const heightM = heightCm / 100;
        const value = weightKg / (heightM * heightM);
        let category = 'Obesity';
        if (value < 18.5) category = 'Underweight';
        else if (value < 25) category = 'Healthy weight';
        else if (value < 30) category = 'Overweight';
        return { value, category };
    }

    function parseDateOnly(value, label) {
        if (value instanceof Date && !Number.isNaN(value.valueOf())) {
            return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
        }
        const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) throw new RangeError(`${label} must use YYYY-MM-DD format.`);
        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);
        const date = new Date(Date.UTC(year, month, day));
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
            throw new RangeError(`${label} is not a valid calendar date.`);
        }
        return date;
    }

    function daysInUtcMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function addClampedUtc(date, years, months) {
        const targetMonthIndex = date.getUTCMonth() + months;
        const targetYear = date.getUTCFullYear() + years + Math.floor(targetMonthIndex / 12);
        const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
        const targetDay = Math.min(date.getUTCDate(), daysInUtcMonth(targetYear, targetMonth));
        return new Date(Date.UTC(targetYear, targetMonth, targetDay));
    }

    function ageBetween(dateOfBirthValue, asOfValue) {
        const dateOfBirth = parseDateOnly(dateOfBirthValue, 'Date of birth');
        const asOf = parseDateOnly(asOfValue, 'As-of date');
        if (dateOfBirth > asOf) throw new RangeError('Date of birth cannot be in the future.');

        let years = asOf.getUTCFullYear() - dateOfBirth.getUTCFullYear();
        if (addClampedUtc(dateOfBirth, years, 0) > asOf) years -= 1;
        const yearCursor = addClampedUtc(dateOfBirth, years, 0);
        let months = 0;
        while (months < 11 && addClampedUtc(yearCursor, 0, months + 1) <= asOf) months += 1;
        const monthCursor = addClampedUtc(yearCursor, 0, months);
        const days = Math.round((asOf - monthCursor) / DAY_MS);
        const totalDays = Math.round((asOf - dateOfBirth) / DAY_MS);

        return { years, months, days, totalDays };
    }

    function percentage(percentValue, baseValue) {
        const percent = finiteNumber(percentValue, 'Percentage');
        const base = finiteNumber(baseValue, 'Base value');
        return percent / 100 * base;
    }

    function gst(amountValue, rateValue, mode = 'add') {
        const amount = positiveNumber(amountValue, 'Amount', true);
        const ratePercent = positiveNumber(rateValue, 'GST rate', true);
        if (!['add', 'remove'].includes(mode)) throw new RangeError('GST mode must be add or remove.');
        const rate = ratePercent / 100;
        const base = mode === 'add' ? amount : amount / (1 + rate);
        const tax = mode === 'add' ? amount * rate : amount - base;
        const total = mode === 'add' ? amount + tax : amount;
        return { base, tax, total };
    }

    function sip(monthlyValue, annualRateValue, yearsValue) {
        const monthly = positiveNumber(monthlyValue, 'Monthly contribution');
        const annualRate = positiveNumber(annualRateValue, 'Annual return', true);
        const years = positiveNumber(yearsValue, 'Investment period');
        const periods = years * 12;
        const monthlyRate = annualRate / 100 / 12;
        const maturity = monthlyRate === 0
            ? monthly * periods
            : monthly * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate) * (1 + monthlyRate);
        const invested = monthly * periods;
        return { invested, returns: maturity - invested, maturity };
    }

    function convertCurrency(amountValue, rateValue) {
        const amount = positiveNumber(amountValue, 'Amount', true);
        const rate = positiveNumber(rateValue, 'Exchange rate');
        return amount * rate;
    }

    function secureRandomInt(maxExclusive) {
        if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) throw new RangeError('Random range must be positive.');
        const cryptoApi = root.crypto;
        if (!cryptoApi?.getRandomValues) throw new Error('Secure random generation is not available in this browser.');
        const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
        const values = new Uint32Array(1);
        do cryptoApi.getRandomValues(values); while (values[0] >= limit);
        return values[0] % maxExclusive;
    }

    function generatePassword(options = {}, randomInt = secureRandomInt) {
        const length = Math.max(8, Math.min(64, Math.trunc(finiteNumber(options.length ?? 16, 'Password length'))));
        const groups = ['abcdefghijklmnopqrstuvwxyz'];
        if (options.uppercase) groups.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        if (options.numbers) groups.push('0123456789');
        if (options.symbols) groups.push('!@#$%^&*()-_=+[]{};:,.?/|');
        const pool = groups.join('');
        const chars = groups.map((group) => group[randomInt(group.length)]);
        while (chars.length < length) chars.push(pool[randomInt(pool.length)]);
        for (let index = chars.length - 1; index > 0; index -= 1) {
            const swapIndex = randomInt(index + 1);
            [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
        }
        return chars.join('');
    }

    function buildQrUrl(textValue) {
        const text = String(textValue || '').trim();
        if (!text) throw new RangeError('QR content cannot be empty.');
        return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}`;
    }

    const api = {
        ageBetween,
        amortizedLoan,
        bmi,
        buildQrUrl,
        convertCurrency,
        generatePassword,
        gst,
        percentage,
        sip
    };

    root.CalculatorCore = api;
    if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
