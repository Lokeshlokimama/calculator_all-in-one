const calculatorPage = (() => {
    const core = window.CalculatorCore;
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

    const getCompactCurrencyLabel = (currency) => `${currency} ${getDisplayCurrencySymbol(currency)}`;

    const closeDisplayCurrencyPickers = (exceptPicker = null) => {
        document.querySelectorAll('[data-display-currency-picker].is-open').forEach((picker) => {
            if (picker === exceptPicker) return;
            picker.classList.remove('is-open');
            picker.querySelector('[data-currency-trigger]')?.setAttribute('aria-expanded', 'false');
        });
    };

    const syncDisplayCurrencyPickers = () => {
        const activeCurrency = getDisplayCurrency();
        document.querySelectorAll('[data-display-currency-picker]').forEach((picker) => {
            const select = picker.querySelector('select');
            const trigger = picker.querySelector('[data-currency-trigger]');
            const label = picker.querySelector('[data-currency-label]');

            if (select && select.value !== activeCurrency) {
                select.value = activeCurrency;
            }
            if (label) {
                label.textContent = getCompactCurrencyLabel(activeCurrency);
            }
            if (trigger) {
                trigger.title = `${activeCurrency} ${getDisplayCurrencySymbol(activeCurrency)} - ${getCurrencyName(activeCurrency)}`;
            }

            picker.querySelectorAll('[data-currency-option]').forEach((option) => {
                const isSelected = option.dataset.currencyOption === activeCurrency;
                option.classList.toggle('is-selected', isSelected);
                option.setAttribute('aria-selected', String(isSelected));
            });
        });
    };

    const buildDisplayCurrencyPicker = (select, currencies) => {
        const picker = select.closest('[data-display-currency-picker]');
        const trigger = picker?.querySelector('[data-currency-trigger]');
        const menu = picker?.querySelector('[data-currency-menu]');
        if (!picker || !trigger || !menu) return;

        picker.classList.add('is-enhanced');
        menu.id = menu.id || `${select.id}-menu`;
        trigger.setAttribute('aria-controls', menu.id);
        menu.innerHTML = '';

        currencies.forEach((currency) => {
            const option = document.createElement('button');
            const codeLabel = document.createElement('span');
            const nameLabel = document.createElement('span');

            option.type = 'button';
            option.className = 'currency-option';
            option.dataset.currencyOption = currency;
            option.setAttribute('role', 'option');
            option.title = `${currency} ${getDisplayCurrencySymbol(currency)} - ${getCurrencyName(currency)}`;

            codeLabel.className = 'currency-option-code';
            codeLabel.textContent = getCompactCurrencyLabel(currency);
            nameLabel.className = 'currency-option-name';
            nameLabel.textContent = getCurrencyName(currency);

            option.append(codeLabel, nameLabel);
            option.addEventListener('click', () => {
                changeDisplayCurrency(currency);
                closeDisplayCurrencyPickers();
                trigger.focus();
            });
            menu.appendChild(option);
        });

        if (!picker.dataset.currencyPickerReady) {
            trigger.addEventListener('click', () => {
                const shouldOpen = !picker.classList.contains('is-open');
                closeDisplayCurrencyPickers(picker);
                picker.classList.toggle('is-open', shouldOpen);
                trigger.setAttribute('aria-expanded', String(shouldOpen));
            });

            trigger.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeDisplayCurrencyPickers();
                    trigger.focus();
                }
            });

            select.addEventListener('change', () => changeDisplayCurrency(select.value));
            picker.dataset.currencyPickerReady = 'true';
        }
    };

    const changeDisplayCurrency = (currency) => {
        selectedDisplayCurrency = currency || 'USD';
        saveDisplayCurrency(selectedDisplayCurrency);
        document.querySelectorAll('#standalone-currency-select, #standalone-mobile-currency-select').forEach((select) => {
            if (select.value !== selectedDisplayCurrency) select.value = selectedDisplayCurrency;
        });
        syncDisplayCurrencyPickers();
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
            buildDisplayCurrencyPicker(select, currencies);
        });

        syncDisplayCurrencyPickers();
    };

    const insertDisplayCurrencySelector = () => {
        const nav = document.querySelector('.navbar nav');
        if (nav && !$('standalone-currency-select')) {
            const container = document.createElement('span');
            container.className = 'currency-selector-container standalone-currency-container currency-picker';
            container.dataset.displayCurrencyPicker = '';
            container.innerHTML = '<select class="lang-select currency-select currency-native-select" id="standalone-currency-select" aria-label="Select display currency"></select><button type="button" class="currency-trigger" data-currency-trigger aria-haspopup="listbox" aria-expanded="false"><span data-currency-label>USD $</span></button><div class="currency-menu" data-currency-menu role="listbox" aria-label="Select display currency"></div>';
            nav.appendChild(container);
        }

        const mobilePanel = document.querySelector('.mobile-menu-panel');
        if (mobilePanel && !$('standalone-mobile-currency-select')) {
            const container = document.createElement('div');
            container.className = 'mobile-currency-container';
            container.innerHTML = '<span class="currency-picker mobile-currency-picker" data-display-currency-picker><select class="lang-select currency-select currency-native-select mobile-currency-select" id="standalone-mobile-currency-select" aria-label="Select display currency"></select><button type="button" class="currency-trigger mobile-currency-trigger" data-currency-trigger aria-haspopup="listbox" aria-expanded="false"><span data-currency-label>USD $</span></button><div class="currency-menu" data-currency-menu role="listbox" aria-label="Select display currency"></div></span>';
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

        const result = core.amortizedLoan(principal, annualRate, months);
        setMoneyText('emi-result', result.payment, 2);
        setMoneyText('emi-interest', result.totalInterest, 2);
        setMoneyText('emi-total', result.totalPayment, 2);
    }

    function calculateBmi() {
        clearError();
        const heightCm = readNumber('bmi-height');
        const weightKg = readNumber('bmi-weight');

        if (heightCm <= 0 || weightKg <= 0) {
            showError('Enter valid height in centimeters and weight in kilograms.');
            return;
        }

        const result = core.bmi(weightKg, heightCm);
        setText('bmi-result', result.value.toFixed(1));
        setText('bmi-category', result.category);
        const progress = $('bmi-progress');
        if (progress) progress.style.width = `${Math.max(6, Math.min(100, ((result.value - 12) / 28) * 100))}%`;
    }

    function calculateAge() {
        clearError();
        const dobValue = $('age-dob')?.value;
        if (!dobValue) {
            showError('Select your date of birth.');
            return;
        }

        const now = new Date();
        const asOf = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        try {
            const result = core.ageBetween(dobValue, asOf);
            setText('age-result', `${result.years} years, ${result.months} months, ${result.days} days`);
            setText('age-days', `${result.totalDays.toLocaleString(undefined)} total days`);
        } catch (error) {
            showError(error.message);
        }
    }

    function calculatePercentage() {
        clearError();
        const percentage = parseFloat($('percentage-value')?.value);
        const base = parseFloat($('percentage-base')?.value);

        if (!Number.isFinite(percentage) || !Number.isFinite(base)) {
            showError('Enter a valid percentage and base value.');
            return;
        }

        const result = core.percentage(percentage, base);
        setText('percentage-result', formatNumber(result, 2));
        setText('percentage-equation', `${percentage}% of ${formatNumber(base, 2)} = ${formatNumber(result, 2)}`);
    }

    function calculateGst() {
        clearError();
        const amount = readNumber('gst-amount');
        const rate = readNumber('gst-rate');
        const mode = $('gst-mode')?.value || 'add';

        if (amount <= 0 || rate < 0) {
            showError('Enter a valid amount and GST rate.');
            return;
        }

        const result = core.gst(amount, rate, mode);
        setMoneyText('gst-base', result.base, 2);
        setMoneyText('gst-tax', result.tax, 2);
        setMoneyText('gst-total', result.total, 2);
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

        const result = core.amortizedLoan(principal, annualRate, years * 12);
        setMoneyText('loan-payment', result.payment, 2);
        setMoneyText('loan-interest', result.totalInterest, 2);
        setMoneyText('loan-total', result.totalPayment, 2);
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

        const result = core.sip(monthly, annualRate, years);
        setMoneyText('sip-invested', result.invested, 2);
        setMoneyText('sip-returns', result.returns, 2);
        setMoneyText('sip-total', result.maturity, 2);
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
            const converted = core.convertCurrency(amount, rate);
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

    function populateCurrencyConverterSelects() {
        const converterSelects = [
            { id: 'currency-from', fallback: 'INR' },
            { id: 'currency-to', fallback: 'USD' }
        ];
        const currencies = getSupportedCurrencyCodes();

        converterSelects.forEach(({ id, fallback }) => {
            const select = $(id);
            if (!select) return;

            const selectedCurrency = select.value || select.dataset.defaultCurrency || fallback;
            select.innerHTML = '';

            currencies.forEach((currency) => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = `${currency} - ${getCurrencyName(currency)}`;
                option.title = `${currency} ${getDisplayCurrencySymbol(currency)} - ${getCurrencyName(currency)}`;
                option.selected = currency === selectedCurrency;
                select.appendChild(option);
            });
        });
    }

    function swapCurrencyConverterCurrencies() {
        const fromSelect = $('currency-from');
        const toSelect = $('currency-to');
        if (!fromSelect || !toSelect) return;

        const currentFrom = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = currentFrom;
        convertCurrency();
    }

    function generatePassword() {
        clearError();
        const length = Math.max(8, Math.min(64, readNumber('password-length') || 16));
        const includeUpper = $('password-uppercase')?.checked;
        const includeNumbers = $('password-numbers')?.checked;
        const includeSymbols = $('password-symbols')?.checked;

        try {
            const password = core.generatePassword({
                length,
                uppercase: includeUpper,
                numbers: includeNumbers,
                symbols: includeSymbols
            });
            setText('password-result', password);
        } catch (error) {
            showError(error.message);
        }
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

        const url = core.buildQrUrl(text);
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
            ? `/?search=${encodeURIComponent(search)}#tools`
            : '/#tools';
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
        populateCurrencyConverterSelects();
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

        $('currency-swap')?.addEventListener('click', swapCurrencyConverterCurrencies);

        const lengthInput = $('password-length');
        if (lengthInput) {
            lengthInput.addEventListener('input', updatePasswordLength);
            updatePasswordLength();
        }
    }

    return { init };
})();

document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-display-currency-picker]')) {
        document.querySelectorAll('[data-display-currency-picker].is-open').forEach((picker) => {
            picker.classList.remove('is-open');
            picker.querySelector('[data-currency-trigger]')?.setAttribute('aria-expanded', 'false');
        });
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('[data-display-currency-picker].is-open').forEach((picker) => {
            picker.classList.remove('is-open');
            picker.querySelector('[data-currency-trigger]')?.setAttribute('aria-expanded', 'false');
        });
    }
});

document.addEventListener('DOMContentLoaded', calculatorPage.init);
