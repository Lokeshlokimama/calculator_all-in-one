const calculatorPage = (() => {
    const currencyCache = new Map();
    const currencyApiBase = 'https://open.er-api.com/v6/latest';
    const displayCurrencyStorageKey = 'calculator-display-currency';
    const currencySymbolCache = new Map();
    const fallbackCurrencyCodes = [
        'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY', 'CNY', 'AED', 'SAR', 'SGD', 'NZD',
        'CHF', 'SEK', 'NOK', 'DKK', 'ZAR', 'BRL', 'MXN', 'KRW', 'IDR', 'MYR', 'THB', 'PHP'
    ];
    const moneyInputIds = new Set(['emi-amount', 'gst-amount', 'loan-amount', 'sip-monthly']);
    let selectedDisplayCurrency = 'USD';

    const $ = (id) => document.getElementById(id);
    const readNumber = (id) => {
        const value = parseFloat($(id)?.value);
        return Number.isFinite(value) ? value : 0;
    };

    const formatNumber = (value, digits = 2) => Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });

    const getSupportedCurrencyCodes = () => {
        if (typeof Intl.supportedValuesOf === 'function') {
            try {
                return Intl.supportedValuesOf('currency');
            } catch {
                return fallbackCurrencyCodes;
            }
        }
        return fallbackCurrencyCodes;
    };

    const getStoredDisplayCurrency = () => {
        try {
            return localStorage.getItem(displayCurrencyStorageKey) || '';
        } catch {
            return '';
        }
    };

    const saveDisplayCurrency = (currency) => {
        try {
            localStorage.setItem(displayCurrencyStorageKey, currency);
        } catch {
            // Keep the selected currency for this tab even if storage is unavailable.
        }
    };

    const getDisplayCurrency = () => selectedDisplayCurrency || getStoredDisplayCurrency() || 'USD';

    const getCurrencyName = (currency) => {
        try {
            return new Intl.DisplayNames(undefined, { type: 'currency' }).of(currency) || currency;
        } catch {
            return currency;
        }
    };

    const getDisplayCurrencySymbol = (currency = getDisplayCurrency()) => {
        if (currencySymbolCache.has(currency)) return currencySymbolCache.get(currency);

        let symbol = currency;
        try {
            const parts = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency,
                currencyDisplay: 'narrowSymbol',
                maximumFractionDigits: 0
            }).formatToParts(0);
            symbol = parts.find((part) => part.type === 'currency')?.value || currency;
        } catch {
            symbol = currency;
        }

        currencySymbolCache.set(currency, symbol);
        return symbol;
    };

    const formatMoney = (value, digits = 0) => {
        const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
        const currency = getDisplayCurrency();
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency,
                currencyDisplay: 'narrowSymbol',
                minimumFractionDigits: digits,
                maximumFractionDigits: digits
            }).format(safeValue);
        } catch {
            return `${getDisplayCurrencySymbol(currency)} ${formatNumber(safeValue, digits)}`;
        }
    };

    const setText = (id, value) => {
        const element = $(id);
        if (element) element.textContent = value;
    };

    const setMoneyText = (id, value, digits = 2) => {
        const element = $(id);
        if (!element) return;

        element.dataset.moneyValue = String(Number.isFinite(Number(value)) ? Number(value) : 0);
        element.dataset.moneyDigits = String(digits);
        element.textContent = formatMoney(value, digits);
    };

    const refreshMoneyOutputs = () => {
        document.querySelectorAll('[data-money-value]').forEach((element) => {
            setMoneyText(element.id, Number(element.dataset.moneyValue || 0), Number(element.dataset.moneyDigits || 2));
        });
    };

    const updateCurrencyAffixes = () => {
        const symbol = getDisplayCurrencySymbol();
        document.querySelectorAll('.input-wrapper').forEach((wrapper) => {
            const suffix = wrapper.querySelector('.input-suffix');
            const input = wrapper.querySelector('.tool-input');
            if (!suffix) return;

            const text = suffix.textContent.trim();
            if (moneyInputIds.has(input?.id) || text === 'Rs' || text === 'Rs.' || text.includes('\u20b9')) {
                suffix.textContent = symbol;
            }
        });
    };

    const changeDisplayCurrency = (currency) => {
        selectedDisplayCurrency = currency || 'USD';
        saveDisplayCurrency(selectedDisplayCurrency);
        document.querySelectorAll('#standalone-currency-select, #standalone-mobile-currency-select').forEach((select) => {
            if (select.value !== selectedDisplayCurrency) select.value = selectedDisplayCurrency;
        });
        updateCurrencyAffixes();
        refreshMoneyOutputs();
    };

    const populateDisplayCurrencySelector = () => {
        const selects = document.querySelectorAll('#standalone-currency-select, #standalone-mobile-currency-select');
        if (!selects.length) return;

        const currencies = getSupportedCurrencyCodes();
        const stored = getStoredDisplayCurrency();
        selectedDisplayCurrency = currencies.includes(stored) ? stored : 'USD';

        selects.forEach((select) => {
            select.innerHTML = '';

            currencies.forEach((currency) => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = `${currency} ${getDisplayCurrencySymbol(currency)}`;
                option.title = `${currency} ${getDisplayCurrencySymbol(currency)} - ${getCurrencyName(currency)}`;
                option.selected = currency === selectedDisplayCurrency;
                select.appendChild(option);
            });

            select.addEventListener('change', () => {
                changeDisplayCurrency(select.value);
            });
        });
    };

    const insertDisplayCurrencySelector = () => {
        const nav = document.querySelector('.navbar nav');
        if (nav && !$('standalone-currency-select')) {
            const container = document.createElement('span');
            container.className = 'currency-selector-container standalone-currency-container';
            container.innerHTML = '<select class="lang-select currency-select" id="standalone-currency-select" aria-label="Select display currency"></select>';
            nav.appendChild(container);
        }

        const mobilePanel = document.querySelector('.mobile-menu-panel');
        if (mobilePanel && !$('standalone-mobile-currency-select')) {
            const container = document.createElement('div');
            container.className = 'mobile-currency-container';
            container.innerHTML = '<select class="lang-select currency-select mobile-currency-select" id="standalone-mobile-currency-select" aria-label="Select display currency"></select>';
            mobilePanel.appendChild(container);
        }
    };

    const initializeMoneyDefaults = () => {
        [
            'emi-result', 'emi-interest', 'emi-total',
            'gst-base', 'gst-tax', 'gst-total',
            'loan-payment', 'loan-interest', 'loan-total',
            'sip-invested', 'sip-returns', 'sip-total'
        ].forEach((id) => setMoneyText(id, 0, 2));
    };

    const setHtml = (id, value) => {
        const element = $(id);
        if (element) element.innerHTML = value;
    };

    const showError = (message) => {
        setText('calculator-error', message);
    };

    const clearError = () => showError('');

    function calculateEmi() {
        clearError();
        const principal = readNumber('emi-amount');
        const annualRate = readNumber('emi-rate');
        const months = readNumber('emi-tenure');

        if (principal <= 0 || annualRate < 0 || months <= 0) {
            showError('Enter a valid loan amount, annual interest rate, and tenure in months.');
            return;
        }

        const monthlyRate = annualRate / 100 / 12;
        const emi = monthlyRate === 0
            ? principal / months
            : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayable = emi * months;
        const totalInterest = Math.max(0, totalPayable - principal);

        setMoneyText('emi-result', emi, 2);
        setMoneyText('emi-interest', totalInterest, 2);
        setMoneyText('emi-total', totalPayable, 2);
    }

    function calculateBmi() {
        clearError();
        const heightCm = readNumber('bmi-height');
        const weightKg = readNumber('bmi-weight');

        if (heightCm <= 0 || weightKg <= 0) {
            showError('Enter valid height in centimeters and weight in kilograms.');
            return;
        }

        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        let category = 'Obese';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal';
        else if (bmi < 30) category = 'Overweight';

        setText('bmi-result', bmi.toFixed(1));
        setText('bmi-category', category);
        const progress = $('bmi-progress');
        if (progress) progress.style.width = `${Math.max(6, Math.min(100, ((bmi - 12) / 28) * 100))}%`;
    }

    function calculateAge() {
        clearError();
        const dobValue = $('age-dob')?.value;
        if (!dobValue) {
            showError('Select your date of birth.');
            return;
        }

        const dob = new Date(`${dobValue}T00:00:00`);
        const now = new Date();
        if (dob > now) {
            showError('Date of birth cannot be in the future.');
            return;
        }

        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();

        if (days < 0) {
            months -= 1;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }

        const totalDays = Math.floor((now - dob) / 86400000);
        setText('age-result', `${years} years, ${months} months, ${days} days`);
        setText('age-days', `${totalDays.toLocaleString(undefined)} total days`);
    }

    function calculatePercentage() {
        clearError();
        const percentage = readNumber('percentage-value');
        const base = readNumber('percentage-base');

        if (!Number.isFinite(percentage) || base <= 0) {
            showError('Enter a valid percentage and base value.');
            return;
        }

        const result = percentage / 100 * base;
        setText('percentage-result', formatNumber(result, 2));
        setText('percentage-equation', `${percentage}% of ${formatNumber(base, 2)} = ${formatNumber(result, 2)}`);
    }

    function calculateGst() {
        clearError();
        const amount = readNumber('gst-amount');
        const rate = readNumber('gst-rate') / 100;
        const mode = $('gst-mode')?.value || 'add';

        if (amount <= 0 || rate < 0) {
            showError('Enter a valid amount and GST rate.');
            return;
        }

        const base = mode === 'add' ? amount : amount / (1 + rate);
        const gst = mode === 'add' ? amount * rate : amount - base;
        const finalAmount = mode === 'add' ? amount + gst : amount;

        setMoneyText('gst-base', base, 2);
        setMoneyText('gst-tax', gst, 2);
        setMoneyText('gst-total', finalAmount, 2);
    }

    function calculateLoan() {
        clearError();
        const principal = readNumber('loan-amount');
        const annualRate = readNumber('loan-rate');
        const years = readNumber('loan-years');

        if (principal <= 0 || annualRate < 0 || years <= 0) {
            showError('Enter a valid principal amount, interest rate, and tenure in years.');
            return;
        }

        const months = years * 12;
        const monthlyRate = annualRate / 100 / 12;
        const monthlyPayment = monthlyRate === 0
            ? principal / months
            : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayment = monthlyPayment * months;
        const totalInterest = Math.max(0, totalPayment - principal);

        setMoneyText('loan-payment', monthlyPayment, 2);
        setMoneyText('loan-interest', totalInterest, 2);
        setMoneyText('loan-total', totalPayment, 2);
    }

    function calculateSip() {
        clearError();
        const monthly = readNumber('sip-monthly');
        const annualRate = readNumber('sip-rate');
        const years = readNumber('sip-years');

        if (monthly <= 0 || annualRate < 0 || years <= 0) {
            showError('Enter a valid monthly investment, expected return, and time period.');
            return;
        }

        const months = years * 12;
        const monthlyRate = annualRate / 100 / 12;
        const maturity = monthlyRate === 0
            ? monthly * months
            : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const invested = monthly * months;
        const returns = Math.max(0, maturity - invested);

        setMoneyText('sip-invested', invested, 2);
        setMoneyText('sip-returns', returns, 2);
        setMoneyText('sip-total', maturity, 2);
    }

    async function fetchCurrencyRates(base) {
        const cached = currencyCache.get(base);
        if (cached && cached.expiresAt > Date.now()) return cached;

        const response = await fetch(`${currencyApiBase}/${base}`);
        if (!response.ok) throw new Error('Currency service unavailable');
        const data = await response.json();
        if (data.result !== 'success' || !data.rates) throw new Error('Currency service returned no rates');

        const payload = {
            rates: data.rates,
            updatedAt: data.time_last_update_utc || new Date().toUTCString(),
            expiresAt: data.time_next_update_unix ? data.time_next_update_unix * 1000 : Date.now() + 43200000
        };
        currencyCache.set(base, payload);
        return payload;
    }

    async function convertCurrency() {
        clearError();
        const amount = readNumber('currency-amount');
        const from = $('currency-from')?.value || 'USD';
        const to = $('currency-to')?.value || 'INR';
        const button = $('currency-submit');

        if (amount <= 0) {
            showError('Enter a valid amount to convert.');
            return;
        }

        if (button) button.disabled = true;
        setText('currency-result', 'Fetching live rate...');

        try {
            const data = await fetchCurrencyRates(from);
            const rate = data.rates[to];
            if (!rate) throw new Error('Selected currency is not available.');
            const converted = amount * rate;
            const formatted = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: to,
                currencyDisplay: 'narrowSymbol',
                maximumFractionDigits: 2
            }).format(converted);
            setText('currency-result', formatted);
            setText('currency-meta', `Rate used: 1 ${from} = ${formatNumber(rate, 4)} ${to}. Updated ${data.updatedAt}.`);
        } catch (error) {
            setText('currency-result', 'Unable to fetch live rate');
            setText('currency-meta', 'Try again in a moment or confirm rates with your bank/payment provider.');
            showError(error.message);
        } finally {
            if (button) button.disabled = false;
        }
    }

    function generatePassword() {
        clearError();
        const length = Math.max(8, Math.min(64, readNumber('password-length') || 16));
        const includeUpper = $('password-uppercase')?.checked;
        const includeNumbers = $('password-numbers')?.checked;
        const includeSymbols = $('password-symbols')?.checked;

        let chars = 'abcdefghijklmnopqrstuvwxyz';
        if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers) chars += '0123456789';
        if (includeSymbols) chars += '!@#$%^&*()-_=+[]{};:,.?/|';

        const randomValues = new Uint32Array(length);
        if (window.crypto?.getRandomValues) {
            window.crypto.getRandomValues(randomValues);
        } else {
            for (let i = 0; i < length; i += 1) randomValues[i] = Math.floor(Math.random() * 4294967295);
        }

        let password = '';
        for (let i = 0; i < length; i += 1) {
            password += chars[randomValues[i] % chars.length];
        }

        setText('password-result', password);
    }

    function updatePasswordLength() {
        setText('password-length-label', String(readNumber('password-length') || 16));
    }

    function generateQrCode() {
        clearError();
        const text = $('qr-text')?.value.trim();
        const image = $('qr-image');
        const placeholder = $('qr-placeholder');

        if (!text) {
            showError('Enter a URL or text to encode.');
            return;
        }

        const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}`;
        if (placeholder) placeholder.textContent = 'Generating QR code...';
        if (image) {
            image.onload = () => {
                image.hidden = false;
                if (placeholder) placeholder.hidden = true;
            };
            image.onerror = () => {
                image.hidden = true;
                if (placeholder) {
                    placeholder.hidden = false;
                    placeholder.textContent = 'QR service unavailable. Please try again.';
                }
            };
            image.src = url;
        }
        setText('qr-data', text.length > 80 ? `${text.slice(0, 80)}...` : text);
    }

    function handleSiteSearch(event) {
        event.preventDefault();
        const query = new FormData(event.currentTarget).get('search');
        const search = String(query || '').trim();
        window.location.href = search
            ? `index.html?search=${encodeURIComponent(search)}#tools`
            : 'index.html#tools';
    }

    const handlers = {
        emi: calculateEmi,
        bmi: calculateBmi,
        age: calculateAge,
        percentage: calculatePercentage,
        gst: calculateGst,
        loan: calculateLoan,
        sip: calculateSip,
        currency: convertCurrency,
        password: generatePassword,
        qr: generateQrCode
    };

    function init() {
        insertDisplayCurrencySelector();
        populateDisplayCurrencySelector();
        initializeMoneyDefaults();
        updateCurrencyAffixes();

        document.querySelectorAll('[data-calculator-form]').forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                handlers[form.dataset.calculatorForm]?.();
            });
        });

        document.querySelectorAll('[data-site-search]').forEach((form) => {
            form.addEventListener('submit', handleSiteSearch);
        });

        const lengthInput = $('password-length');
        if (lengthInput) {
            lengthInput.addEventListener('input', updatePasswordLength);
            updatePasswordLength();
        }
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', calculatorPage.init);
