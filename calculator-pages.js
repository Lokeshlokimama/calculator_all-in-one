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

    const qrRequestTypes = {
        url: {
            label: 'Website URL',
            fields: [{ id: 'url', label: 'Website URL', type: 'text', inputmode: 'url', placeholder: 'https://example.com/menu', required: true }],
            build: (values) => normalizeQrUrl(values.url)
        },
        text: {
            label: 'Plain text',
            fields: [{ id: 'text', label: 'Text to encode', kind: 'textarea', placeholder: 'Type any public text, label, note, or instruction', required: true }],
            build: (values) => values.text
        },
        email: {
            label: 'Email',
            fields: [
                { id: 'email', label: 'Email address', type: 'email', placeholder: 'name@example.com', required: true },
                { id: 'subject', label: 'Subject', placeholder: 'Quick question' },
                { id: 'body', label: 'Body', kind: 'textarea', placeholder: 'Message body' }
            ],
            build: (values) => `mailto:${values.email}?${new URLSearchParams({ subject: values.subject, body: values.body }).toString()}`
        },
        phone: {
            label: 'Phone call',
            fields: [{ id: 'phone', label: 'Phone number', type: 'tel', placeholder: '+919876543210', required: true }],
            build: (values) => `tel:${normalizeQrPhone(values.phone)}`
        },
        sms: {
            label: 'SMS',
            fields: [
                { id: 'phone', label: 'Phone number', type: 'tel', placeholder: '+919876543210', required: true },
                { id: 'message', label: 'Message', kind: 'textarea', placeholder: 'Hi, I saw your poster.' }
            ],
            build: (values) => `SMSTO:${normalizeQrPhone(values.phone)}:${values.message || ''}`
        },
        whatsapp: {
            label: 'WhatsApp',
            fields: [
                { id: 'phone', label: 'WhatsApp number with country code', type: 'tel', placeholder: '919876543210', required: true },
                { id: 'message', label: 'Prefilled message', kind: 'textarea', placeholder: 'Hello, I want to know more.' }
            ],
            build: (values) => {
                const phone = normalizeQrPhone(values.phone).replace(/^\+/, '');
                const params = values.message ? `?text=${encodeURIComponent(values.message)}` : '';
                return `https://wa.me/${phone}${params}`;
            }
        },
        wifi: {
            label: 'Wi-Fi login',
            fields: [
                { id: 'ssid', label: 'Network name / SSID', placeholder: 'Cafe WiFi', required: true },
                { id: 'password', label: 'Password', placeholder: 'WiFi password' },
                { id: 'encryption', label: 'Security type', kind: 'select', options: [['WPA', 'WPA/WPA2'], ['WEP', 'WEP'], ['nopass', 'No password']] },
                { id: 'hidden', label: 'Hidden network', kind: 'checkbox' }
            ],
            build: (values) => `WIFI:T:${values.encryption || 'WPA'};S:${escapeWifi(values.ssid)};P:${escapeWifi(values.password)};H:${values.hidden ? 'true' : 'false'};;`
        },
        vcard: {
            label: 'Contact card',
            fields: [
                { id: 'name', label: 'Full name', placeholder: 'Asha Kumar', required: true },
                { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+919876543210' },
                { id: 'email', label: 'Email', type: 'email', placeholder: 'asha@example.com' },
                { id: 'organization', label: 'Organization', placeholder: 'Asha Studio' },
                { id: 'title', label: 'Job title', placeholder: 'Designer' },
                { id: 'url', label: 'Website', type: 'text', inputmode: 'url', placeholder: 'https://example.com' },
                { id: 'address', label: 'Address', kind: 'textarea', placeholder: 'Street, city, state, country' }
            ],
            build: (values) => [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `FN:${escapeVCard(values.name)}`,
                values.organization ? `ORG:${escapeVCard(values.organization)}` : '',
                values.title ? `TITLE:${escapeVCard(values.title)}` : '',
                values.phone ? `TEL:${escapeVCard(values.phone)}` : '',
                values.email ? `EMAIL:${escapeVCard(values.email)}` : '',
                values.url ? `URL:${escapeVCard(normalizeQrUrl(values.url))}` : '',
                values.address ? `ADR:;;${escapeVCard(values.address)};;;;` : '',
                'END:VCARD'
            ].filter(Boolean).join('\n')
        },
        upi: {
            label: 'UPI payment',
            fields: [
                { id: 'pa', label: 'UPI ID', placeholder: 'name@upi', required: true },
                { id: 'pn', label: 'Payee name', placeholder: 'Business or person name' },
                { id: 'am', label: 'Amount (optional)', type: 'number', min: '0', step: '0.01', placeholder: '500' },
                { id: 'tn', label: 'Payment note', placeholder: 'Invoice 1024' }
            ],
            build: (values) => {
                const params = new URLSearchParams();
                params.set('pa', values.pa);
                if (values.pn) params.set('pn', values.pn);
                if (values.am) params.set('am', values.am);
                params.set('cu', 'INR');
                if (values.tn) params.set('tn', values.tn);
                return `upi://pay?${params.toString()}`;
            }
        },
        geo: {
            label: 'Map location',
            fields: [
                { id: 'lat', label: 'Latitude', type: 'number', min: '-90', max: '90', step: 'any', placeholder: '17.3850', required: true },
                { id: 'lng', label: 'Longitude', type: 'number', min: '-180', max: '180', step: 'any', placeholder: '78.4867', required: true },
                { id: 'label', label: 'Place label', placeholder: 'Meet here' }
            ],
            build: (values) => {
                const base = `geo:${values.lat},${values.lng}`;
                return values.label ? `${base}?q=${values.lat},${values.lng}(${encodeURIComponent(values.label)})` : base;
            }
        },
        event: {
            label: 'Calendar event',
            fields: [
                { id: 'summary', label: 'Event title', placeholder: 'Team meeting', required: true },
                { id: 'start', label: 'Start date/time', type: 'datetime-local', required: true },
                { id: 'end', label: 'End date/time', type: 'datetime-local' },
                { id: 'location', label: 'Location', placeholder: 'Conference room or online link' },
                { id: 'description', label: 'Description', kind: 'textarea', placeholder: 'Agenda or notes' }
            ],
            build: (values) => [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                `SUMMARY:${escapeVCard(values.summary)}`,
                `DTSTART:${formatQrDateTime(values.start)}`,
                values.end ? `DTEND:${formatQrDateTime(values.end)}` : '',
                values.location ? `LOCATION:${escapeVCard(values.location)}` : '',
                values.description ? `DESCRIPTION:${escapeVCard(values.description)}` : '',
                'END:VEVENT',
                'END:VCALENDAR'
            ].filter(Boolean).join('\n')
        }
    };

    let currentQrPayload = '';
    let currentQrSvg = '';

    function normalizeQrUrl(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) return '';
        if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
        return trimmed.includes('.') ? `https://${trimmed}` : trimmed;
    }

    function normalizeQrPhone(value) {
        return String(value || '').replace(/[^\d+]/g, '');
    }

    function escapeWifi(value = '') {
        return String(value).replace(/([\\;,":])/g, '\\$1');
    }

    function escapeVCard(value = '') {
        return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
    }

    function formatQrDateTime(value = '') {
        return String(value).replace(/[-:]/g, '').replace(/\.\d+$/, '').replace(/\s/g, 'T').replace(/T?$/, '').padEnd(15, '0');
    }

    function truncateQrPayload(value) {
        return value.length > 140 ? `${value.slice(0, 140)}...` : value;
    }

    function renderQrFields() {
        const typeSelect = $('qr-type');
        const fieldsContainer = $('qr-fields');
        if (!typeSelect || !fieldsContainer) return;

        const config = qrRequestTypes[typeSelect.value] || qrRequestTypes.url;
        fieldsContainer.innerHTML = config.fields.map((field) => {
            const id = `qr-${field.id}`;
            const required = field.required ? ' required' : '';
            if (field.kind === 'textarea') {
                return `<label class="input-group"><span>${field.label}</span><textarea class="tool-input" id="${id}" rows="3" placeholder="${field.placeholder || ''}"${required}></textarea></label>`;
            }
            if (field.kind === 'select') {
                const options = field.options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
                return `<label class="input-group"><span>${field.label}</span><select class="tool-input" id="${id}">${options}</select></label>`;
            }
            if (field.kind === 'checkbox') {
                return `<label class="qr-checkbox"><input id="${id}" type="checkbox"> <span>${field.label}</span></label>`;
            }
            const inputmode = field.inputmode ? ` inputmode="${field.inputmode}"` : '';
            const min = field.min !== undefined ? ` min="${field.min}"` : '';
            const max = field.max !== undefined ? ` max="${field.max}"` : '';
            const step = field.step !== undefined ? ` step="${field.step}"` : '';
            return `<label class="input-group"><span>${field.label}</span><input class="tool-input" id="${id}" type="${field.type || 'text'}"${inputmode}${min}${max}${step} placeholder="${field.placeholder || ''}"${required}></label>`;
        }).join('');

        const firstInput = fieldsContainer.querySelector('input:not([type="checkbox"]), textarea, select');
        firstInput?.focus();
    }

    function getQrFieldValues(config) {
        const values = {};
        config.fields.forEach((field) => {
            const element = $(`qr-${field.id}`);
            values[field.id] = field.kind === 'checkbox' ? Boolean(element?.checked) : String(element?.value || '').trim();
            if (field.required && !values[field.id]) {
                throw new Error(`Enter ${field.label.toLowerCase()}.`);
            }
            if (values[field.id] && element?.checkValidity && !element.checkValidity()) {
                throw new Error(`Enter a valid ${field.label.toLowerCase()}.`);
            }
        });
        return values;
    }

    function buildQrPayload() {
        const typeSelect = $('qr-type');
        if (!typeSelect) {
            const text = $('qr-text')?.value.trim();
            if (!text) throw new Error('Enter a URL or text to encode.');
            return { payload: text, label: 'Text / URL' };
        }

        const config = qrRequestTypes[typeSelect.value] || qrRequestTypes.url;
        const payload = String(config.build(getQrFieldValues(config)) || '').trim();
        if (!payload) throw new Error('Enter details to create this QR code.');
        return { payload, label: config.label };
    }

    function getQrRenderOptions() {
        return {
            size: Number($('qr-size')?.value || 320),
            color: $('qr-foreground')?.value || '#000000',
            background: $('qr-background')?.value || '#ffffff'
        };
    }

    function setQrButtonsEnabled(enabled) {
        ['qr-download-png', 'qr-download-svg', 'qr-copy-payload'].forEach((id) => {
            const button = $(id);
            if (button) button.disabled = !enabled;
        });
    }

    function generateQrCode() {
        clearError();
        const image = $('qr-image');
        const placeholder = $('qr-placeholder');
        const preview = image?.closest('.qr-page-preview');

        if (!globalThis.CalculatorQRCode) {
            showError('QR generator could not load. Refresh the page and try again.');
            return;
        }

        try {
            const { payload, label } = buildQrPayload();
            const options = getQrRenderOptions();
            const rendered = globalThis.CalculatorQRCode.renderToImage(payload, image, options);
            const svgResult = globalThis.CalculatorQRCode.toSvg(payload, options);
            currentQrPayload = payload;
            currentQrSvg = svgResult.svg;

            if (placeholder) placeholder.hidden = true;
            preview?.classList.add('generated');
            setText('qr-data', truncateQrPayload(payload));
            setText('qr-type-used', label);
            setText('qr-technical', `QR version ${rendered.meta.version} · ${rendered.meta.size}×${rendered.meta.size} modules · ${rendered.meta.bytes} bytes · ECC M`);
            setText('qr-copy-status', '');
            setQrButtonsEnabled(true);
        } catch (error) {
            if (image) {
                image.hidden = true;
                image.removeAttribute('src');
            }
            if (placeholder) {
                placeholder.hidden = false;
                placeholder.textContent = 'QR preview';
            }
            preview?.classList.remove('generated');
            currentQrPayload = '';
            currentQrSvg = '';
            setText('qr-copy-status', '');
            setQrButtonsEnabled(false);
            showError(error.message);
        }
    }

    function downloadBlob(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function downloadQrPng() {
        const image = $('qr-image');
        if (!image?.src) {
            showError('Generate a QR code first.');
            return;
        }
        const link = document.createElement('a');
        link.href = image.src;
        link.download = 'calculator-all-in-one-qr.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function downloadQrSvg() {
        if (!currentQrSvg) {
            showError('Generate a QR code first.');
            return;
        }
        downloadBlob(currentQrSvg, 'calculator-all-in-one-qr.svg', 'image/svg+xml;charset=utf-8');
    }

    async function copyQrPayload() {
        if (!currentQrPayload) {
            showError('Generate a QR code first.');
            return;
        }
        try {
            await navigator.clipboard.writeText(currentQrPayload);
            clearError();
            setText('qr-copy-status', 'Copied payload to clipboard.');
        } catch {
            setText('qr-copy-status', 'Copy failed. Select the encoded data and copy it manually.');
        }
    }

    function initQrBuilder() {
        const typeSelect = $('qr-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                renderQrFields();
                setText('qr-copy-status', '');
            });
            renderQrFields();
        }
        $('qr-download-png')?.addEventListener('click', downloadQrPng);
        $('qr-download-svg')?.addEventListener('click', downloadQrSvg);
        $('qr-copy-payload')?.addEventListener('click', copyQrPayload);
        setQrButtonsEnabled(false);
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

        initQrBuilder();
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
