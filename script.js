// Ensure animations respect reduced motion settings
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;

// Typing Effect for Hero Subtitle
const typingTextElement = document.querySelector('.typing-text');
const words = ["smooth scroll.", "interactive cards.", "glowing buttons.", "premium aesthetics."];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;

function typeEffect() {
    if (!typingTextElement) return;

    if (prefersReducedMotion || isMobileViewport) {
        typingTextElement.textContent = isMobileViewport ? "instant answers." : "fluid animations.";
        document.querySelector('.cursor')?.style.setProperty('display', 'none');
        return;
    }

    const currentWord = words[wordIndex];

    if (isDeleting) {
        typingTextElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingDelay = 50; // Faster deleting
    } else {
        typingTextElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingDelay = 150; // Normal typing
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typingDelay = 2000; // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingDelay = 500; // Pause before next word
    }

    setTimeout(typeEffect, typingDelay);
}

// Start typing effect on load
if (typingTextElement) {
    if (isMobileViewport) {
        typeEffect();
    } else {
        setTimeout(typeEffect, 1000);
    }
}

// Advanced Scroll Reveal Observer
const revealElements = document.querySelectorAll('.scroll-reveal, .reveal-text');

let currentStaggerDelay = 0;
let lastIntersectTime = 0;

const revealCallback = (entries, observer) => {
    const now = Date.now();
    // If elements intersect more than 50ms apart, treat them as a new scrolling batch
    if (now - lastIntersectTime > 50) {
        currentStaggerDelay = 0;
    }
    lastIntersectTime = now;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Apply dynamic stagger delay for items appearing at the exact same time
            if (entry.target.classList.contains('stagger-item')) {
                entry.target.style.transitionDelay = `${currentStaggerDelay}s`;
                currentStaggerDelay += 0.12; // 120ms gap between each card appearing
            }

            // Trigger the CSS animation
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Only animate once
        }
    });
};

const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
if (!prefersReducedMotion && !isMobileViewport) {
    revealElements.forEach(el => revealObserver.observe(el));
} else {
    revealElements.forEach(el => el.classList.add('active')); // Show all immediately
}

// Animated Counters Observer
const counters = document.querySelectorAll('.counter');
let countersAnimated = false;

const animateCounters = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        if (target === 0) return; // Skip if target is 0 (e.g., "0ms" instant result might not need counting, but let's just allow fast count)

        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16);

        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };

        updateCounter();
    });
};

const statsSection = document.querySelector('.stats-section');
const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersAnimated && !prefersReducedMotion) {
        animateCounters();
        countersAnimated = true;
    } else if (entries[0].isIntersecting && prefersReducedMotion) {
        counters.forEach(c => c.innerText = c.getAttribute('data-target'));
    }
}, { threshold: 0.5 });

if (statsSection) statsObserver.observe(statsSection);


// Button Ripple Effect
const rippleButtons = document.querySelectorAll('.ripple-btn');
rippleButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
        const x = e.clientX - e.target.getBoundingClientRect().left;
        const y = e.clientY - e.target.getBoundingClientRect().top;

        const ripples = document.createElement('span');
        ripples.style.left = x + 'px';
        ripples.style.top = y + 'px';
        ripples.classList.add('ripple');

        this.appendChild(ripples);

        setTimeout(() => {
            ripples.remove();
        }, 600);
    });
});

// Mock Tool Interactions & Toasts
function triggerTool(toolId, message) {
    showToast(message);

    if (toolId === 'bmi') {
        if (typeof calcBMI === 'function') {
            calcBMI();
        }
    }
    else if (toolId === 'emi') {
        const principal = document.getElementById('emi-principal');
        const interest = document.getElementById('emi-interest');
        principal.style.height = '0%';
        interest.style.height = '0%';
        setTimeout(() => {
            principal.style.height = '70%';
            interest.style.height = '30%';
        }, 100);
    }
    else if (toolId === 'qr') {
        const qrUI = document.querySelector('.qr-ui');
        qrUI.classList.remove('generated');
        setTimeout(() => { qrUI.classList.add('generated'); }, 100);
    }
}

// Global triggerTool for inline onclick handlers
window.triggerTool = triggerTool;

// --- Money Display Preferences ---
const DISPLAY_CURRENCY_STORAGE_KEY = 'calculator-display-currency';
const CURRENCY_SYMBOL_CACHE = new Map();
const MONEY_INPUT_IDS = new Set([
    'emi-amount',
    'sip-monthly',
    'fd-principal',
    'rd-monthly',
    'gst-amount',
    'sal-ctc',
    'leave-basic',
    'dt-price',
    'bill-rate',
    'ev-rate'
]);
let selectedDisplayCurrency = 'USD';

function getStoredDisplayCurrency() {
    try {
        return localStorage.getItem(DISPLAY_CURRENCY_STORAGE_KEY) || '';
    } catch {
        return '';
    }
}

function saveStoredDisplayCurrency(currency) {
    try {
        localStorage.setItem(DISPLAY_CURRENCY_STORAGE_KEY, currency);
    } catch {
        // Currency selection still works for this session if localStorage is blocked.
    }
}

function getDisplayCurrency() {
    return selectedDisplayCurrency || getStoredDisplayCurrency() || 'USD';
}

function getDisplayCurrencySymbol(currency = getDisplayCurrency()) {
    if (CURRENCY_SYMBOL_CACHE.has(currency)) return CURRENCY_SYMBOL_CACHE.get(currency);

    let symbol = currency;
    try {
        const parts = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            currencyDisplay: 'narrowSymbol',
            maximumFractionDigits: 0
        }).formatToParts(0);
        symbol = parts.find(part => part.type === 'currency')?.value || currency;
    } catch {
        symbol = currency;
    }

    CURRENCY_SYMBOL_CACHE.set(currency, symbol);
    return symbol;
}

function formatReadableAmount(value, fractionDigits = 0) {
    const numberValue = Number(value);
    const safeValue = Number.isFinite(numberValue) ? numberValue : 0;
    const currency = getDisplayCurrency();

    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            currencyDisplay: 'narrowSymbol',
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        }).format(safeValue);
    } catch {
        return `${getDisplayCurrencySymbol(currency)} ${safeValue.toLocaleString(undefined, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        })}`;
    }
}

function setMoneyText(id, value, options = {}) {
    const el = document.getElementById(id);
    if (!el) return;

    const digits = Number.isFinite(options.digits) ? options.digits : 0;
    el.dataset.moneyValue = String(Number.isFinite(Number(value)) ? Number(value) : 0);
    el.dataset.moneyDigits = String(digits);
    el.dataset.moneyPrefix = options.prefix || '';
    el.dataset.moneySuffix = options.suffix || '';
    el.innerText = `${el.dataset.moneyPrefix}${formatReadableAmount(Number(el.dataset.moneyValue), digits)}${el.dataset.moneySuffix}`;
}

function refreshMoneyOutputs() {
    document.querySelectorAll('[data-money-value]').forEach(el => {
        const value = Number(el.dataset.moneyValue || 0);
        const digits = Number(el.dataset.moneyDigits || 0);
        el.innerText = `${el.dataset.moneyPrefix || ''}${formatReadableAmount(value, digits)}${el.dataset.moneySuffix || ''}`;
    });
}

function updateCurrencyAffixes() {
    const symbol = getDisplayCurrencySymbol();
    document.querySelectorAll('.input-suffix').forEach(suffix => {
        const text = suffix.textContent.trim();
        const inputId = suffix.parentElement?.querySelector('.tool-input')?.id;
        if (MONEY_INPUT_IDS.has(inputId)) {
            suffix.textContent = symbol;
            return;
        }
        if (['Rs', 'Rs.', '\u20b9', 'â‚¹'].includes(text)) {
            suffix.textContent = symbol;
        }
    });

    const preview = document.getElementById('global-currency-preview');
    if (preview) preview.textContent = `${getDisplayCurrency()} ${formatReadableAmount(0, 2)}`;
}

function changeDisplayCurrency(currency) {
    selectedDisplayCurrency = currency || 'USD';
    saveStoredDisplayCurrency(selectedDisplayCurrency);
    document.querySelectorAll('#global-currency-select, #mobile-currency-select').forEach(select => {
        if (select.value !== selectedDisplayCurrency) select.value = selectedDisplayCurrency;
    });
    syncDisplayCurrencyPickers();
    refreshMoneyOutputs();
    updateCurrencyAffixes();
    formatLoanPreview();
    if (typeof calculateInvoice === 'function') calculateInvoice();
    showToast(`Currency changed to ${selectedDisplayCurrency}`);
}
window.changeDisplayCurrency = changeDisplayCurrency;

// --- EMI Calculator ---
function formatLoanPreview() {
    const amount = parseFloat(document.getElementById('emi-amount')?.value);
    const preview = document.getElementById('emi-amount-preview');
    if (!preview) return;

    preview.innerText = amount > 0 ? `Loan amount: ${formatReadableAmount(amount)}` : 'Enter loan amount';
}
window.formatLoanPreview = formatLoanPreview;

function calcEMI() {
    const amount = parseFloat(document.getElementById('emi-amount').value);
    const annualRate = parseFloat(document.getElementById('emi-rate').value);
    const months = parseFloat(document.getElementById('emi-tenure').value);

    if (!amount || amount <= 0) {
        showFieldError('emi-amount', 'Enter loan amount');
        return;
    }
    if (annualRate === null || Number.isNaN(annualRate) || annualRate < 0) {
        showFieldError('emi-rate', 'Enter interest rate');
        return;
    }
    if (!months || months <= 0) {
        showFieldError('emi-tenure', 'Enter tenure in months');
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const emi = monthlyRate === 0
        ? amount / months
        : amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayable = emi * months;
    const totalInterest = Math.max(0, totalPayable - amount);
    const principalPercent = totalPayable > 0 ? (amount / totalPayable) * 100 : 0;
    const interestPercent = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

    setMoneyText('emi-monthly-result', emi);
    setMoneyText('emi-interest-result', totalInterest);
    setMoneyText('emi-total-result', totalPayable);
    formatLoanPreview();

    const principal = document.getElementById('emi-principal');
    const interest = document.getElementById('emi-interest');
    principal.style.height = '0%';
    interest.style.height = '0%';

    setTimeout(() => {
        principal.style.height = `${Math.max(8, principalPercent)}%`;
        interest.style.height = `${Math.max(totalInterest > 0 ? 8 : 0, interestPercent)}%`;
    }, 80);

    showToast(`Monthly EMI: ${formatReadableAmount(emi)}`);
}
window.calcEMI = calcEMI;

// --- BMI Calculator ---
function getBmiCategory(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', color: '#38bdf8' };
    if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
    if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
    return { label: 'Obese', color: '#ef4444' };
}

function calcBMI() {
    const height = parseFloat(document.getElementById('bmi-height').value);
    const weight = parseFloat(document.getElementById('bmi-weight').value);
    const result = document.getElementById('bmi-result');
    const categoryEl = document.getElementById('bmi-category');
    const bar = document.getElementById('bmi-progress');

    if (!height || height <= 0 || !weight || weight <= 0) {
        showFieldError(!height || height <= 0 ? 'bmi-height' : 'bmi-weight', 'Enter valid height and weight');
        return;
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const category = getBmiCategory(bmi);
    const barPercent = Math.max(4, Math.min(100, ((bmi - 12) / 28) * 100));

    result.innerText = `BMI ${bmi.toFixed(1)}`;
    categoryEl.innerHTML = `<strong style="color:${category.color};">${category.label}</strong> range result`;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = `${barPercent}%`; }, 80);

    showToast(`BMI ${bmi.toFixed(1)} - ${category.label}`);
}
window.calcBMI = calcBMI;

// --- Calorie & Macro Calculator Logic ---
const foodDatabase = {
    // 🇮🇳 Indian Diet
    roti: { name: 'Roti (Whole Wheat)', category: '🇮🇳 India', carbs: 45, protein: 9, fat: 1.5 },
    dal: { name: 'Dal (Cooked)', category: '🇮🇳 India', carbs: 11, protein: 5, fat: 0.5 },
    paneer: { name: 'Paneer (Raw)', category: '🇮🇳 India', carbs: 1.2, protein: 18, fat: 20 },
    rice: { name: 'White Rice (Cooked)', category: '🇮🇳 India', carbs: 28, protein: 2.7, fat: 0.3 },
    idli: { name: 'Idli', category: '🇮🇳 India', carbs: 22, protein: 4, fat: 0 },
    dosa: { name: 'Dosa (Plain)', category: '🇮🇳 India', carbs: 29, protein: 4, fat: 3 },
    samosa: { name: 'Samosa (1 pc)', category: '🇮🇳 India', carbs: 24, protein: 3.5, fat: 17 },

    // 🇺🇸 American Diet
    burger: { name: 'Cheeseburger', category: '🇺🇸 USA', carbs: 30, protein: 15, fat: 14 },
    hotdog: { name: 'Hot Dog', category: '🇺🇸 USA', carbs: 18, protein: 10, fat: 26 },
    fries: { name: 'French Fries', category: '🇺🇸 USA', carbs: 41, protein: 4, fat: 15 },
    steak: { name: 'Beef Steak', category: '🇺🇸 USA', carbs: 0, protein: 25, fat: 19 },
    pancake: { name: 'Pancakes (Plain)', category: '🇺🇸 USA', carbs: 28, protein: 6, fat: 10 },

    // 🇮🇹 Italian Diet
    pasta: { name: 'Pasta (Cooked)', category: '🇮🇹 Italy', carbs: 31, protein: 5.8, fat: 0.9 },
    pizza: { name: 'Pizza (Margherita)', category: '🇮🇹 Italy', carbs: 33, protein: 11, fat: 10 },
    lasagna: { name: 'Lasagna', category: '🇮🇹 Italy', carbs: 15, protein: 8, fat: 7 },
    gelato: { name: 'Gelato (Ice Cream)', category: '🇮🇹 Italy', carbs: 25, protein: 4, fat: 10 },

    // 🇯🇵 Japanese Diet
    sushi: { name: 'Sushi (Salmon Roll)', category: '🇯🇵 Japan', carbs: 29, protein: 9, fat: 2 },
    ramen: { name: 'Ramen (Noodles)', category: '🇯🇵 Japan', carbs: 55, protein: 10, fat: 15 },
    tofu: { name: 'Tofu (Silken)', category: '🇯🇵 Japan', carbs: 1.9, protein: 8, fat: 4.8 },
    miso: { name: 'Miso Soup', category: '🇯🇵 Japan', carbs: 4, protein: 3, fat: 1.5 },

    // 🇲🇽 Mexican Diet
    taco: { name: 'Beef Taco', category: '🇲🇽 Mexico', carbs: 20, protein: 12, fat: 10 },
    burrito: { name: 'Bean Burrito', category: '🇲🇽 Mexico', carbs: 34, protein: 10, fat: 6 },
    guacamole: { name: 'Guacamole', category: '🇲🇽 Mexico', carbs: 8, protein: 2, fat: 14 },

    // 🌐 Global / Basics
    apple: { name: 'Apple', category: '🌐 Global Basics', carbs: 14, protein: 0.3, fat: 0.2 },
    banana: { name: 'Banana', category: '🌐 Global Basics', carbs: 23, protein: 1.1, fat: 0.3 },
    chicken: { name: 'Chicken Breast', category: '🌐 Global Basics', carbs: 0, protein: 31, fat: 3.6 },
    egg: { name: 'Egg (Whole)', category: '🌐 Global Basics', carbs: 1.1, protein: 13, fat: 11 },
    milk: { name: 'Whole Milk', category: '🌐 Global Basics', carbs: 4.8, protein: 3.2, fat: 3.3 },
    broccoli: { name: 'Broccoli', category: '🌐 Global Basics', carbs: 7, protein: 2.8, fat: 0.4 }
};

const foodAliases = {
    roti: ['chapati', 'phulka', 'wheat roti'],
    dal: ['lentils', 'lentil curry', 'daal'],
    rice: ['white rice', 'cooked rice', 'chawal'],
    paneer: ['cottage cheese'],
    dosa: ['plain dosa'],
    idli: ['idly'],
    fries: ['french fries'],
    chicken: ['chicken breast', 'grilled chicken'],
    egg: ['whole egg', 'boiled egg'],
    milk: ['whole milk'],
    broccoli: ['brocolli']
};

function normalizeFoodQuery(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\([^)]*\)/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildFoodSearchEntries() {
    const entries = [];

    for (const [id, food] of Object.entries(foodDatabase)) {
        entries.push({ id, label: food.name, key: normalizeFoodQuery(food.name) });
        entries.push({ id, label: id, key: normalizeFoodQuery(id) });

        (foodAliases[id] || []).forEach(alias => {
            entries.push({ id, label: alias, key: normalizeFoodQuery(alias) });
        });
    }

    return entries;
}

const foodSearchEntries = buildFoodSearchEntries();
const USDA_FOOD_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const USDA_API_KEY = 'DEMO_KEY';
const nutritionApiCache = new Map();
const usdaDataTypeScore = {
    'Survey (FNDDS)': 60,
    Foundation: 45,
    'SR Legacy': 40,
    Branded: 0
};

function initFoodSearch() {
    const dataList = document.getElementById('food-options');
    if (!dataList) return;

    dataList.innerHTML = '';

    Object.values(foodDatabase)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(food => {
            const option = document.createElement('option');
            option.value = food.name;
            option.label = food.category;
            dataList.appendChild(option);
        });
}
// Init immediately since script is loaded at the end of the body
initFoodSearch();

function findFoodByQuery(query) {
    const normalizedQuery = normalizeFoodQuery(query);
    if (!normalizedQuery) return null;

    const exactMatch = foodSearchEntries.find(entry => entry.key === normalizedQuery);
    if (exactMatch) return foodDatabase[exactMatch.id];

    const startsWithMatch = foodSearchEntries.find(entry => entry.key.startsWith(normalizedQuery));
    if (startsWithMatch) return foodDatabase[startsWithMatch.id];

    const includesMatch = foodSearchEntries.find(entry => (
        entry.key.includes(normalizedQuery) || normalizedQuery.includes(entry.key)
    ));

    return includesMatch ? foodDatabase[includesMatch.id] : null;
}

function findExactLocalFoodByQuery(query) {
    const normalizedQuery = normalizeFoodQuery(query);
    if (!normalizedQuery) return null;

    const exactMatch = foodSearchEntries.find(entry => entry.key === normalizedQuery);
    return exactMatch ? foodDatabase[exactMatch.id] : null;
}

function scaleNutrition(per100, grams) {
    const multiplier = grams / 100;
    return {
        name: per100.name,
        source: per100.source,
        calories: per100.calories * multiplier,
        carbs: per100.carbs * multiplier,
        protein: per100.protein * multiplier,
        fat: per100.fat * multiplier
    };
}

function getLocalNutritionEstimate(foodName, grams, exactOnly = false) {
    const food = exactOnly ? findExactLocalFoodByQuery(foodName) : findFoodByQuery(foodName);
    if (!food) return null;

    const per100 = {
        name: food.name,
        source: 'Saved estimate',
        calories: (food.carbs * 4) + (food.protein * 4) + (food.fat * 9),
        carbs: food.carbs,
        protein: food.protein,
        fat: food.fat
    };

    return scaleNutrition(per100, grams);
}

function getUsdaNutrient(food, nutrientId, nameIncludes) {
    const nutrients = food.foodNutrients || [];
    const nutrient = nutrients.find(item => Number(item.nutrientId) === nutrientId)
        || nutrients.find(item => normalizeFoodQuery(item.nutrientName).includes(nameIncludes));

    if (!nutrient || Number.isNaN(Number(nutrient.value))) return 0;
    return Number(nutrient.value);
}

function getUsdaCalories(food) {
    const nutrients = food.foodNutrients || [];
    const nutrient = nutrients.find(item => Number(item.nutrientId) === 1008)
        || nutrients.find(item => normalizeFoodQuery(item.nutrientName) === 'energy');

    if (!nutrient || Number.isNaN(Number(nutrient.value))) return 0;

    const value = Number(nutrient.value);
    return String(nutrient.unitName).toUpperCase() === 'KJ' ? value / 4.184 : value;
}

function scoreUsdaFood(food, query) {
    const queryText = normalizeFoodQuery(query);
    const description = normalizeFoodQuery(food.description);
    const category = normalizeFoodQuery(food.foodCategory);
    const queryWords = queryText.split(' ').filter(Boolean);

    let score = usdaDataTypeScore[food.dataType] || 0;
    if (description === queryText) score += 70;
    else if (description.startsWith(queryText)) score += 35;
    else if (description.includes(queryText)) score += 15;

    queryWords.forEach(word => {
        score += description.includes(word) ? 8 : -5;
    });

    if (queryWords.length === 1 && !description.startsWith(queryText)) score -= 20;
    if (food.dataType === 'Branded') score -= 15;
    if (/(seasoning|spice|masala|sauce|mix|powder)/.test(`${description} ${category}`)
        && !/(seasoning|spice|masala|sauce|mix|powder)/.test(queryText)) {
        score -= 35;
    }

    return score;
}

function chooseBestUsdaFood(foods, query) {
    return (foods || [])
        .filter(food => food.foodNutrients && food.foodNutrients.length)
        .sort((a, b) => scoreUsdaFood(b, query) - scoreUsdaFood(a, query))[0] || null;
}

function buildUsdaNutrition(food) {
    const protein = getUsdaNutrient(food, 1003, 'protein');
    const fat = getUsdaNutrient(food, 1004, 'total lipid');
    const carbs = getUsdaNutrient(food, 1005, 'carbohydrate');
    const calories = getUsdaCalories(food) || ((carbs * 4) + (protein * 4) + (fat * 9));

    if (!calories && !carbs && !protein && !fat) return null;

    return {
        name: food.description,
        source: `USDA ${food.dataType || 'FoodData Central'}`,
        calories,
        carbs,
        protein,
        fat
    };
}

async function fetchUsdaNutrition(foodName, grams) {
    const cacheKey = normalizeFoodQuery(foodName);
    if (nutritionApiCache.has(cacheKey)) {
        return scaleNutrition(nutritionApiCache.get(cacheKey), grams);
    }

    const params = new URLSearchParams({
        api_key: USDA_API_KEY,
        query: foodName,
        pageSize: '25'
    });

    const response = await fetch(`${USDA_FOOD_API_URL}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`USDA request failed: ${response.status}`);
    }

    const data = await response.json();
    const bestFood = chooseBestUsdaFood(data.foods, foodName);
    if (!bestFood) throw new Error('No USDA food match');

    const per100 = buildUsdaNutrition(bestFood);
    if (!per100) throw new Error('No usable USDA nutrients');

    nutritionApiCache.set(cacheKey, per100);
    return scaleNutrition(per100, grams);
}

async function resolveFoodNutrition(foodName, grams) {
    const exactLocalNutrition = getLocalNutritionEstimate(foodName, grams, true);
    if (exactLocalNutrition) return exactLocalNutrition;

    try {
        return await fetchUsdaNutrition(foodName, grams);
    } catch (error) {
        console.warn(error);
        return getLocalNutritionEstimate(foodName, grams);
    }
}

let totalMacros = { carbs: 0, protein: 0, fat: 0 };

async function addFood() {
    const foodInput = document.getElementById('food-search');
    const gramsInput = document.getElementById('food-grams');
    const foodName = foodInput.value.trim();
    const grams = parseFloat(gramsInput.value);

    if (!foodName || !grams || grams <= 0) {
        showToast('Please enter a dish name and valid weight.');
        return;
    }

    showToast('Checking nutrition data...');
    const nutrition = await resolveFoodNutrition(foodName, grams);
    if (!nutrition) {
        showToast('Dish not found. Try a common dish name or ingredient.');
        return;
    }

    totalMacros.carbs += nutrition.carbs;
    totalMacros.protein += nutrition.protein;
    totalMacros.fat += nutrition.fat;

    // Add to UI list
    const foodList = document.getElementById('food-list');
    const item = document.createElement('div');
    item.className = 'food-item reveal-text';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'food-name';
    nameSpan.textContent = `${nutrition.name} (${grams}g)`;

    const sourceSpan = document.createElement('small');
    sourceSpan.textContent = nutrition.source;
    nameSpan.appendChild(sourceSpan);

    const macroSpan = document.createElement('span');
    macroSpan.className = 'food-macros';
    macroSpan.textContent = `${Math.round(nutrition.calories)} kcal | ${Math.round(nutrition.carbs)}C | ${Math.round(nutrition.protein)}P | ${Math.round(nutrition.fat)}F`;

    item.append(nameSpan, macroSpan);
    foodList.appendChild(item);

    // Trigger reveal animation
    setTimeout(() => item.classList.add('active'), 50);

    updateMacroBars();
    showToast(`${Math.round(nutrition.calories)} kcal calculated from ${nutrition.source}.`);

    // Reset inputs
    foodInput.value = '';
    gramsInput.value = '';
}

function updateMacroBars() {
    const total = totalMacros.carbs + totalMacros.protein + totalMacros.fat;
    if (total === 0) return;

    const pCarbs = (totalMacros.carbs / total) * 100;
    const pProtein = (totalMacros.protein / total) * 100;
    const pFat = (totalMacros.fat / total) * 100;

    const barCarbs = document.querySelector('.meal-bar.carbs');
    const barProtein = document.querySelector('.meal-bar.protein');
    const barFat = document.querySelector('.meal-bar.fat');

    barCarbs.style.width = pCarbs + '%';
    barCarbs.querySelector('span').innerText = Math.round(pCarbs) + '%';
    barCarbs.classList.add('calculated');

    barProtein.style.width = pProtein + '%';
    barProtein.querySelector('span').innerText = Math.round(pProtein) + '%';
    barProtein.classList.add('calculated');

    barFat.style.width = pFat + '%';
    barFat.querySelector('span').innerText = Math.round(pFat) + '%';
    barFat.classList.add('calculated');
}

window.addFood = addFood;

// --- Standard Calculator Logic ---
let calcExpression = '';

function appendCalc(value) {
    const display = document.getElementById('calc-display');
    if (calcExpression === '' && ['+', '*', '/'].includes(value)) return; // Prevent leading operators
    calcExpression += value;
    display.innerText = calcExpression;
}

function clearCalc() {
    calcExpression = '';
    document.getElementById('calc-display').innerText = '0';
}

function calculateResult() {
    const display = document.getElementById('calc-display');
    try {
        const result = new Function('return ' + calcExpression)();
        if (!isFinite(result)) throw new Error('Math Error');

        const rounded = Math.round(result * 10000) / 10000;
        calcExpression = rounded.toString();
        display.innerText = calcExpression;
        showToast('Calculation Complete');
    } catch (e) {
        display.innerText = 'Error';
        calcExpression = '';
        showToast('Invalid mathematical expression');
    }
}

// Global functions for standard calculator
window.appendCalc = appendCalc;
window.clearCalc = clearCalc;
window.calculateResult = calculateResult;

// --- WhatsApp Link Logic ---
function generateWALink() {
    const country = document.getElementById('wa-country').value;
    const phone = document.getElementById('wa-phone').value.replace(/[^0-9]/g, '');
    const msg = document.getElementById('wa-msg').value;
    const resultEl = document.getElementById('wa-result');

    if (!phone) {
        showToast('Please enter a valid phone number');
        return;
    }

    let url = `https://wa.me/${country}${phone}`;
    if (msg) {
        url += `?text=${encodeURIComponent(msg)}`;
    }

    resultEl.href = url;
    resultEl.innerText = url;
    resultEl.style.display = 'block';
    showToast('WhatsApp Link Generated!');
}
window.generateWALink = generateWALink;

// --- Real QR Generator ---
function generateRealQR() {
    const textInput = document.getElementById('qr-text');
    const qrImage = document.getElementById('qr-image');
    const qrPrompt = document.getElementById('qr-prompt');
    const qrContainer = document.getElementById('qr-result-container');

    if (!textInput.value.trim()) {
        showToast('Please enter text or a URL');
        return;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(textInput.value)}`;

    // UI Loading state
    qrPrompt.innerText = 'Generating...';
    qrImage.style.display = 'none';
    qrPrompt.style.display = 'block';
    qrContainer.style.background = 'var(--glass-bg)';
    qrContainer.style.border = '2px dashed #444';
    qrContainer.classList.remove('generated');

    qrImage.onload = () => {
        qrPrompt.style.display = 'none';
        qrImage.style.display = 'block';
        qrContainer.style.background = '#fff';
        qrContainer.style.border = 'none';
        qrContainer.classList.add('generated');
        showToast('QR Code Generated!');
    };

    qrImage.onerror = () => {
        qrPrompt.innerText = 'Error';
        qrImage.style.display = 'none';
        qrPrompt.style.display = 'block';
        qrContainer.classList.remove('generated');
        showToast('Failed to generate QR. Check connection.');
    };

    qrImage.src = qrUrl;
}
window.generateRealQR = generateRealQR;

function downloadQR() {
    const qrImage = document.getElementById('qr-image');
    if (!qrImage?.src) {
        showToast('Generate a QR code first');
        return;
    }

    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = 'calculator-all-in-one-qr.png';
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('QR download started');
}
window.downloadQR = downloadQR;

// --- Category Filtering ---
let currentCategory = 'all';
let currentSearchTerm = '';
let searchScrollTimer = null;

function getNavbarOffset() {
    return (document.querySelector('.navbar')?.offsetHeight || 0) + 16;
}

function getPreferredScrollBehavior() {
    const compactViewport = window.matchMedia('(max-width: 768px)').matches;
    return (prefersReducedMotion || compactViewport) ? 'auto' : 'smooth';
}

function getToolSearchText(card) {
    if (!card.dataset.searchText) {
        const title = card.querySelector('h3')?.textContent || '';
        const desc = card.querySelector('p')?.textContent || '';
        card.dataset.searchText = `${title} ${desc} ${card.dataset.category || ''}`.toLowerCase();
    }

    return card.dataset.searchText;
}

function scrollToVisibleCalculator(category) {
    const selector = category === 'all'
        ? '.tool-demo-card:not(.hidden)'
        : `.tool-demo-card[data-category="${category}"]:not(.hidden)`;
    const target = document.querySelector(selector) || document.getElementById('tools');

    if (!target) return;

    window.requestAnimationFrame(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - getNavbarOffset();

        window.scrollTo({
            top: Math.max(0, top),
            behavior: getPreferredScrollBehavior()
        });
    });
}

function scheduleSearchResultScroll(visibleCount) {
    if (searchScrollTimer) window.clearTimeout(searchScrollTimer);

    const hasSearch = currentSearchTerm.trim().length > 0;
    if (!hasSearch) return;

    searchScrollTimer = window.setTimeout(() => {
        if (visibleCount > 0) {
            scrollToVisibleCalculator(currentCategory);
        } else {
            scrollToTools();
        }
    }, prefersReducedMotion ? 0 : 120);
}

function updateSearchStatus(visibleCount) {
    const status = document.getElementById('search-status');
    if (!status) return;

    if (currentSearchTerm) {
        status.innerText = `${visibleCount} matching tool${visibleCount === 1 ? '' : 's'} for "${currentSearchTerm}".`;
    } else if (currentCategory !== 'all') {
        status.innerText = `Showing ${visibleCount} ${currentCategory} tool${visibleCount === 1 ? '' : 's'}.`;
    } else {
        status.innerText = 'Search all calculators instantly.';
    }
}

function applyToolFilters(options = {}) {
    const grid = document.querySelector('.tools-grid');
    const isAll = currentCategory === 'all';
    const search = currentSearchTerm.trim().toLowerCase();
    let visibleCount = 0;

    document.querySelectorAll('[data-category-link]').forEach(link => {
        link.classList.toggle('active', link.dataset.categoryLink === currentCategory);
    });

    grid?.classList.toggle('is-filtered', !isAll || Boolean(search));

    document.querySelectorAll('.tool-demo-card').forEach((card, index) => {
        const categoryMatches = isAll || card.dataset.category === currentCategory;
        const searchMatches = !search || getToolSearchText(card).includes(search);
        const shouldShow = categoryMatches && searchMatches;
        card.classList.toggle('hidden', !shouldShow);
        card.setAttribute('aria-hidden', String(!shouldShow));

        if (shouldShow) {
            visibleCount++;
            card.style.transitionDelay = prefersReducedMotion ? '0s' : `${Math.min(index, 8) * 0.04}s`;
            setTimeout(() => card.classList.add('active'), 10);
        } else {
            card.style.transitionDelay = '0s';
            card.classList.remove('active');
        }
    });

    const emptyState = document.getElementById('empty-tools-state');
    if (emptyState) emptyState.hidden = visibleCount !== 0;
    updateSearchStatus(visibleCount);

    if (options.scroll) {
        scrollToVisibleCalculator(currentCategory);
    }

    return visibleCount;
}

function filterCategory(category, sourceEvent) {
    if (sourceEvent) sourceEvent.preventDefault();
    currentCategory = category;
    if (sourceEvent) {
        currentSearchTerm = '';
        const searchInput = document.getElementById('tool-search');
        if (searchInput) searchInput.value = '';
    }
    applyToolFilters({ scroll: Boolean(sourceEvent) });
}
window.filterCategory = filterCategory;

function searchTools(value) {
    currentSearchTerm = value || '';
    currentCategory = 'all';
    const visibleCount = applyToolFilters();
    scheduleSearchResultScroll(visibleCount);
}
window.searchTools = searchTools;

function clearToolSearch() {
    currentSearchTerm = '';
    const searchInput = document.getElementById('tool-search');
    if (searchInput) searchInput.value = '';
    applyToolFilters({ scroll: true });
}
window.clearToolSearch = clearToolSearch;

function jumpToTool(id, category = 'all') {
    currentSearchTerm = '';
    const searchInput = document.getElementById('tool-search');
    if (searchInput) searchInput.value = '';
    currentCategory = category;
    applyToolFilters();
    scrollToCalc(id, category);
}
window.jumpToTool = jumpToTool;

// --- Phase 1: Web Tools ---

function generatePassword() {
    const len = document.getElementById('pwd-length').value;
    const upper = document.getElementById('pwd-upper').checked;
    const nums = document.getElementById('pwd-numbers').checked;
    const syms = document.getElementById('pwd-symbols').checked;

    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numChars = '0123456789';
    const symChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let validChars = chars;
    if (upper) validChars += upperChars;
    if (nums) validChars += numChars;
    if (syms) validChars += symChars;

    if (validChars.length === 0) validChars = chars; // fallback

    let password = '';
    for (let i = 0; i < len; i++) {
        password += validChars.charAt(Math.floor(Math.random() * validChars.length));
    }

    document.getElementById('pwd-result').innerText = password;
    showToast('Password Generated!');
}
window.generatePassword = generatePassword;

const units = {
    length: { m: 1, km: 0.001, ft: 3.28084, mi: 0.000621371 },
    weight: { kg: 1, g: 1000, lbs: 2.20462, oz: 35.274 }
};
const unitLabels = {
    length: { m: 'Meters (m)', km: 'Kilometers (km)', ft: 'Feet (ft)', mi: 'Miles (mi)' },
    weight: { kg: 'Kilograms (kg)', g: 'Grams (g)', lbs: 'Pounds (lbs)', oz: 'Ounces (oz)' }
};

function updateUnitOptions() {
    const type = document.getElementById('unit-type').value;
    const s1 = document.getElementById('unit-sel-1');
    const s2 = document.getElementById('unit-sel-2');

    s1.innerHTML = ''; s2.innerHTML = '';
    for (const [val, label] of Object.entries(unitLabels[type])) {
        s1.innerHTML += `<option value="${val}">${label}</option>`;
        s2.innerHTML += `<option value="${val}">${label}</option>`;
    }
    if (s2.options.length > 1) s2.selectedIndex = 1;
    convertUnit(1);
}
window.updateUnitOptions = updateUnitOptions;

function convertUnit(source) {
    const type = document.getElementById('unit-type').value;
    const v1 = document.getElementById('unit-val-1').value;
    const s1 = document.getElementById('unit-sel-1').value;
    const v2 = document.getElementById('unit-val-2');
    const s2 = document.getElementById('unit-sel-2').value;

    if (!v1) { v2.value = ''; return; }

    const baseVal = parseFloat(v1) / units[type][s1];
    const targetVal = baseVal * units[type][s2];
    v2.value = (Math.round(targetVal * 100000) / 100000).toString();
}
window.convertUnit = convertUnit;

// --- Phase 1: Health Tools ---

function calcBMR() {
    const g = document.getElementById('bmr-gender').value;
    const a = parseFloat(document.getElementById('bmr-age').value);
    const w = parseFloat(document.getElementById('bmr-weight').value);
    const h = parseFloat(document.getElementById('bmr-height').value);

    if (!a || !w || !h) { showToast('Please enter all values'); return; }

    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += (g === 'm') ? 5 : -161;

    document.getElementById('bmr-result').innerText = Math.round(bmr) + ' kcal/day';
    showToast('BMR Calculated!');
}
window.calcBMR = calcBMR;

function calcWater() {
    const w = parseFloat(document.getElementById('water-weight').value);
    const act = parseFloat(document.getElementById('water-activity').value);
    if (!w) { showToast('Please enter weight'); return; }

    const liters = (w * 0.035 * act).toFixed(1);
    document.getElementById('water-result').innerText = liters + ' Liters';
    showToast('Water Intake Calculated!');
}
window.calcWater = calcWater;

function updateIdealHeightUnit() {
    const unit = document.getElementById('iw-height-unit')?.value || 'cm';
    const suffix = document.getElementById('iw-height-suffix');
    const input = document.getElementById('iw-height');

    if (suffix) suffix.textContent = unit === 'in' ? 'in' : 'cm';
    if (input) input.placeholder = unit === 'in' ? 'Height in inches' : 'Height in cm';
}
window.updateIdealHeightUnit = updateIdealHeightUnit;

function calcIdealWeight() {
    const g = document.getElementById('iw-gender').value;
    const h = parseFloat(document.getElementById('iw-height').value);
    const unit = document.getElementById('iw-height-unit')?.value || 'cm';
    if (!h || h <= 0) { showToast('Please enter height'); return; }

    const baseWeight = g === 'm' ? 50 : 45.5;
    const heightInches = unit === 'in' ? h : h / 2.54;
    const extraInches = heightInches - 60;

    if (extraInches <= 0) {
        document.getElementById('iw-result').innerText = baseWeight + ' kg';
    } else {
        const result = baseWeight + (2.3 * extraInches);
        document.getElementById('iw-result').innerText = result.toFixed(1) + ' kg';
    }
    showToast('Ideal Weight Calculated!');
}
window.calcIdealWeight = calcIdealWeight;

function calcProtein() {
    const w = parseFloat(document.getElementById('protein-weight').value);
    const goal = parseFloat(document.getElementById('protein-goal').value);
    if (!w) { showToast('Please enter weight'); return; }

    const grams = (w * goal).toFixed(1);
    document.getElementById('protein-result').innerText = grams + ' g/day';
    showToast('Protein Intake Calculated!');
}
window.calcProtein = calcProtein;

function calcBodyFat() {
    const g = document.getElementById('bf-gender').value;
    const h = parseFloat(document.getElementById('bf-height').value);
    const n = parseFloat(document.getElementById('bf-neck').value);
    const w = parseFloat(document.getElementById('bf-waist').value);
    const hip = parseFloat(document.getElementById('bf-hip').value);

    if (!h || !n || !w || (g === 'f' && !hip)) { showToast('Please enter all values'); return; }

    let bf = 0;
    if (g === 'm') {
        bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
        bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hip - n) + 0.22100 * Math.log10(h)) - 450;
    }

    if (isNaN(bf) || bf < 0 || bf > 100) {
        document.getElementById('bf-result').innerText = 'Error';
        showToast('Invalid measurements for estimation');
    } else {
        document.getElementById('bf-result').innerText = bf.toFixed(1) + ' %';
        showToast('Body Fat % Calculated!');
    }
}
window.calcBodyFat = calcBodyFat;

// --- Phase 2: Finance Tools ---

function calcSIP() {
    const P = parseFloat(document.getElementById('sip-monthly').value);
    const annualRate = parseFloat(document.getElementById('sip-rate').value);
    const r = annualRate / 100 / 12;
    const n = parseFloat(document.getElementById('sip-years').value) * 12;
    if (!P || P <= 0 || Number.isNaN(annualRate) || annualRate < 0 || !n || n <= 0) { showToast('Please enter all values'); return; }

    const M = r === 0 ? P * n : P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    const returns = Math.max(0, M - invested);

    setMoneyText('sip-result', M, { prefix: 'Maturity: ' });
    setMoneyText('sip-invested', invested);
    setMoneyText('sip-returns', returns);
    setMoneyText('sip-total', M);
    showToast('SIP Calculated!');
}
window.calcSIP = calcSIP;

function calcFD() {
    const P = parseFloat(document.getElementById('fd-principal').value);
    let r = parseFloat(document.getElementById('fd-rate').value);
    const citizenBump = parseFloat(document.getElementById('fd-citizen').value);
    const t = parseFloat(document.getElementById('fd-years').value);

    if (!P || P <= 0 || Number.isNaN(r) || r < 0 || !t || t <= 0) { showToast('Please enter all values'); return; }

    r = (r + citizenBump) / 100;
    const n = 4; // Quarterly compounding
    const A = P * Math.pow((1 + r / n), n * t);

    const interest = Math.max(0, A - P);

    setMoneyText('fd-result', A, { prefix: 'Maturity: ' });
    setMoneyText('fd-invested', P);
    setMoneyText('fd-interest', interest);
    setMoneyText('fd-total', A);
    showToast('FD/SB Calculated!');
}
window.calcFD = calcFD;

function calcRD() {
    const P = parseFloat(document.getElementById('rd-monthly').value);
    const annualRate = parseFloat(document.getElementById('rd-rate').value);
    const r = annualRate / 100;
    const n = parseFloat(document.getElementById('rd-months').value);

    if (!P || P <= 0 || Number.isNaN(annualRate) || annualRate < 0 || !n || n <= 0) { showToast('Please enter all values'); return; }

    const deposits = P * n;
    const interest = P * (n * (n + 1) / 2) * (r / 12);
    const maturity = deposits + interest;

    setMoneyText('rd-result', maturity, { prefix: 'Maturity: ' });
    setMoneyText('rd-deposits', deposits);
    setMoneyText('rd-interest', interest);
    setMoneyText('rd-total', maturity);
    showToast('RD Calculated!');
}
window.calcRD = calcRD;

function calcGST() {
    const amt = parseFloat(document.getElementById('gst-amount').value);
    const rate = parseFloat(document.getElementById('gst-rate').value) / 100;
    const action = document.getElementById('gst-action').value;

    if (!amt) { showToast('Please enter amount'); return; }

    let result = 0;
    if (action === 'add') {
        result = amt + (amt * rate);
    } else {
        result = amt / (1 + rate);
    }

    const baseAmount = action === 'add' ? amt : result;
    const gstAmount = action === 'add' ? amt * rate : amt - result;
    const finalAmount = action === 'add' ? result : amt;

    setMoneyText('gst-result', finalAmount, { prefix: 'Final: ', digits: 2 });
    setMoneyText('gst-base', baseAmount, { digits: 2 });
    setMoneyText('gst-tax', gstAmount, { digits: 2 });
    setMoneyText('gst-total', finalAmount, { digits: 2 });
    showToast('GST Calculated!');
}
window.calcGST = calcGST;

function calcSalary() {
    const ctc = parseFloat(document.getElementById('sal-ctc').value);
    const basicPct = parseFloat(document.getElementById('sal-basic-pct').value) / 100;
    if (!ctc || !basicPct) { showToast('Please enter all values'); return; }

    const monthlyCTC = ctc / 12;
    const basic = monthlyCTC * basicPct;
    const pf = basic * 0.12;
    const taxable = monthlyCTC - pf;

    let tax = 0;
    if (ctc > 500000 && ctc <= 1000000) tax = (taxable * 0.1);
    if (ctc > 1000000) tax = (taxable * 0.2);

    const inHand = monthlyCTC - pf - tax;

    setMoneyText('sal-result', inHand, { prefix: 'In-hand: ', suffix: ' / month' });
    setMoneyText('sal-monthly', monthlyCTC);
    setMoneyText('sal-pf', pf);
    setMoneyText('sal-tax', tax);
    showToast('Salary Estimated!');
}
window.calcSalary = calcSalary;

function calcLeave() {
    const basic = parseFloat(document.getElementById('leave-basic').value);
    const days = parseFloat(document.getElementById('leave-days').value);
    if (!basic || !days) { showToast('Please enter all values'); return; }

    const dailyWage = basic / 30;
    const result = dailyWage * days;
    setMoneyText('leave-result', result, { prefix: 'Payable: ' });
    setMoneyText('leave-daily', dailyWage);
    document.getElementById('leave-days-out').innerText = `${days} days`;
    showToast('Leave Encashment Calculated!');
}
window.calcLeave = calcLeave;

const CURRENCY_API_BASE = 'https://open.er-api.com/v6/latest';
const CURRENCY_CACHE_PREFIX = 'daily-needs-currency-rates-';
const CURRENCY_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const currencyRateMemoryCache = new Map();
const CURRENCY_OPTIONS = Object.freeze([
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'AFN', name: 'Afghan Afghani' },
    { code: 'ALL', name: 'Albanian Lek' },
    { code: 'AMD', name: 'Armenian Dram' },
    { code: 'ANG', name: 'Netherlands Antillean Guilder' },
    { code: 'AOA', name: 'Angolan Kwanza' },
    { code: 'ARS', name: 'Argentine Peso' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'AWG', name: 'Aruban Florin' },
    { code: 'AZN', name: 'Azerbaijani Manat' },
    { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark' },
    { code: 'BBD', name: 'Barbadian Dollar' },
    { code: 'BDT', name: 'Bangladeshi Taka' },
    { code: 'BGN', name: 'Bulgarian Lev' },
    { code: 'BHD', name: 'Bahraini Dinar' },
    { code: 'BIF', name: 'Burundian Franc' },
    { code: 'BMD', name: 'Bermudian Dollar' },
    { code: 'BND', name: 'Brunei Dollar' },
    { code: 'BOB', name: 'Bolivian Boliviano' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'BSD', name: 'Bahamian Dollar' },
    { code: 'BTN', name: 'Bhutanese Ngultrum' },
    { code: 'BWP', name: 'Botswana Pula' },
    { code: 'BYN', name: 'Belarusian Ruble' },
    { code: 'BZD', name: 'Belize Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CDF', name: 'Congolese Franc' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CLP', name: 'Chilean Peso' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'COP', name: 'Colombian Peso' },
    { code: 'CRC', name: 'Costa Rican Colon' },
    { code: 'CUP', name: 'Cuban Peso' },
    { code: 'CVE', name: 'Cape Verdean Escudo' },
    { code: 'CZK', name: 'Czech Koruna' },
    { code: 'DJF', name: 'Djiboutian Franc' },
    { code: 'DKK', name: 'Danish Krone' },
    { code: 'DOP', name: 'Dominican Peso' },
    { code: 'DZD', name: 'Algerian Dinar' },
    { code: 'EGP', name: 'Egyptian Pound' },
    { code: 'ERN', name: 'Eritrean Nakfa' },
    { code: 'ETB', name: 'Ethiopian Birr' },
    { code: 'EUR', name: 'Euro' },
    { code: 'FJD', name: 'Fijian Dollar' },
    { code: 'FKP', name: 'Falkland Islands Pound' },
    { code: 'FOK', name: 'Faroese Krona' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'GEL', name: 'Georgian Lari' },
    { code: 'GGP', name: 'Guernsey Pound' },
    { code: 'GHS', name: 'Ghanaian Cedi' },
    { code: 'GIP', name: 'Gibraltar Pound' },
    { code: 'GMD', name: 'Gambian Dalasi' },
    { code: 'GNF', name: 'Guinean Franc' },
    { code: 'GTQ', name: 'Guatemalan Quetzal' },
    { code: 'GYD', name: 'Guyanese Dollar' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'HNL', name: 'Honduran Lempira' },
    { code: 'HRK', name: 'Croatian Kuna' },
    { code: 'HTG', name: 'Haitian Gourde' },
    { code: 'HUF', name: 'Hungarian Forint' },
    { code: 'IDR', name: 'Indonesian Rupiah' },
    { code: 'ILS', name: 'Israeli New Shekel' },
    { code: 'IMP', name: 'Isle of Man Pound' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'IQD', name: 'Iraqi Dinar' },
    { code: 'IRR', name: 'Iranian Rial' },
    { code: 'ISK', name: 'Icelandic Krona' },
    { code: 'JEP', name: 'Jersey Pound' },
    { code: 'JMD', name: 'Jamaican Dollar' },
    { code: 'JOD', name: 'Jordanian Dinar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'KGS', name: 'Kyrgyzstani Som' },
    { code: 'KHR', name: 'Cambodian Riel' },
    { code: 'KID', name: 'Kiribati Dollar' },
    { code: 'KMF', name: 'Comorian Franc' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'KWD', name: 'Kuwaiti Dinar' },
    { code: 'KYD', name: 'Cayman Islands Dollar' },
    { code: 'KZT', name: 'Kazakhstani Tenge' },
    { code: 'LAK', name: 'Lao Kip' },
    { code: 'LBP', name: 'Lebanese Pound' },
    { code: 'LKR', name: 'Sri Lankan Rupee' },
    { code: 'LRD', name: 'Liberian Dollar' },
    { code: 'LSL', name: 'Lesotho Loti' },
    { code: 'LYD', name: 'Libyan Dinar' },
    { code: 'MAD', name: 'Moroccan Dirham' },
    { code: 'MDL', name: 'Moldovan Leu' },
    { code: 'MGA', name: 'Malagasy Ariary' },
    { code: 'MKD', name: 'Macedonian Denar' },
    { code: 'MMK', name: 'Myanmar Kyat' },
    { code: 'MNT', name: 'Mongolian Tugrik' },
    { code: 'MOP', name: 'Macanese Pataca' },
    { code: 'MRU', name: 'Mauritanian Ouguiya' },
    { code: 'MUR', name: 'Mauritian Rupee' },
    { code: 'MVR', name: 'Maldivian Rufiyaa' },
    { code: 'MWK', name: 'Malawian Kwacha' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'MYR', name: 'Malaysian Ringgit' },
    { code: 'MZN', name: 'Mozambican Metical' },
    { code: 'NAD', name: 'Namibian Dollar' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'NIO', name: 'Nicaraguan Cordoba' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'NPR', name: 'Nepalese Rupee' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'OMR', name: 'Omani Rial' },
    { code: 'PAB', name: 'Panamanian Balboa' },
    { code: 'PEN', name: 'Peruvian Sol' },
    { code: 'PGK', name: 'Papua New Guinean Kina' },
    { code: 'PHP', name: 'Philippine Peso' },
    { code: 'PKR', name: 'Pakistani Rupee' },
    { code: 'PLN', name: 'Polish Zloty' },
    { code: 'PYG', name: 'Paraguayan Guarani' },
    { code: 'QAR', name: 'Qatari Riyal' },
    { code: 'RON', name: 'Romanian Leu' },
    { code: 'RSD', name: 'Serbian Dinar' },
    { code: 'RUB', name: 'Russian Ruble' },
    { code: 'RWF', name: 'Rwandan Franc' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'SBD', name: 'Solomon Islands Dollar' },
    { code: 'SCR', name: 'Seychellois Rupee' },
    { code: 'SDG', name: 'Sudanese Pound' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'SHP', name: 'Saint Helena Pound' },
    { code: 'SLE', name: 'Sierra Leonean Leone' },
    { code: 'SLL', name: 'Old Sierra Leonean Leone' },
    { code: 'SOS', name: 'Somali Shilling' },
    { code: 'SRD', name: 'Surinamese Dollar' },
    { code: 'SSP', name: 'South Sudanese Pound' },
    { code: 'STN', name: 'Sao Tome and Principe Dobra' },
    { code: 'SYP', name: 'Syrian Pound' },
    { code: 'SZL', name: 'Swazi Lilangeni' },
    { code: 'THB', name: 'Thai Baht' },
    { code: 'TJS', name: 'Tajikistani Somoni' },
    { code: 'TMT', name: 'Turkmenistani Manat' },
    { code: 'TND', name: 'Tunisian Dinar' },
    { code: 'TOP', name: 'Tongan Paanga' },
    { code: 'TRY', name: 'Turkish Lira' },
    { code: 'TTD', name: 'Trinidad and Tobago Dollar' },
    { code: 'TVD', name: 'Tuvaluan Dollar' },
    { code: 'TWD', name: 'New Taiwan Dollar' },
    { code: 'TZS', name: 'Tanzanian Shilling' },
    { code: 'UAH', name: 'Ukrainian Hryvnia' },
    { code: 'UGX', name: 'Ugandan Shilling' },
    { code: 'USD', name: 'United States Dollar' },
    { code: 'UYU', name: 'Uruguayan Peso' },
    { code: 'UZS', name: 'Uzbekistani Som' },
    { code: 'VES', name: 'Venezuelan Bolivar' },
    { code: 'VND', name: 'Vietnamese Dong' },
    { code: 'VUV', name: 'Vanuatu Vatu' },
    { code: 'WST', name: 'Samoan Tala' },
    { code: 'XAF', name: 'Central African CFA Franc' },
    { code: 'XCD', name: 'East Caribbean Dollar' },
    { code: 'XDR', name: 'Special Drawing Rights' },
    { code: 'XOF', name: 'West African CFA Franc' },
    { code: 'XPF', name: 'CFP Franc' },
    { code: 'YER', name: 'Yemeni Rial' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'ZMW', name: 'Zambian Kwacha' },
    { code: 'ZWL', name: 'Zimbabwean Dollar' }
]);

function getCurrencyOptionLabel(code, name, includeSymbol = false) {
    const symbol = includeSymbol ? ` ${getDisplayCurrencySymbol(code)}` : '';
    if (includeSymbol === 'compact') return `${code}${symbol}`;
    return `${code}${symbol} - ${name}`;
}

function closeDisplayCurrencyPickers(exceptPicker = null) {
    document.querySelectorAll('[data-display-currency-picker].is-open').forEach(picker => {
        if (picker === exceptPicker) return;
        picker.classList.remove('is-open');
        picker.querySelector('[data-currency-trigger]')?.setAttribute('aria-expanded', 'false');
    });
}

function syncDisplayCurrencyPickers() {
    const activeCurrency = getDisplayCurrency();
    document.querySelectorAll('[data-display-currency-picker]').forEach(picker => {
        const select = picker.querySelector('select');
        const trigger = picker.querySelector('[data-currency-trigger]');
        const label = picker.querySelector('[data-currency-label]');

        if (select && select.value !== activeCurrency) {
            select.value = activeCurrency;
        }

        if (label) {
            label.textContent = getCurrencyOptionLabel(activeCurrency, activeCurrency, 'compact');
        }

        const optionMeta = CURRENCY_OPTIONS.find(({ code }) => code === activeCurrency);
        if (trigger) {
            trigger.title = optionMeta
                ? getCurrencyOptionLabel(optionMeta.code, optionMeta.name, true)
                : getCurrencyOptionLabel(activeCurrency, activeCurrency, 'compact');
        }

        picker.querySelectorAll('[data-currency-option]').forEach(option => {
            const isSelected = option.dataset.currencyOption === activeCurrency;
            option.classList.toggle('is-selected', isSelected);
            option.setAttribute('aria-selected', String(isSelected));
        });
    });
}

function initializeDisplayCurrencyPickers() {
    document.querySelectorAll('#global-currency-select, #mobile-currency-select').forEach(select => {
        const picker = select.closest('[data-display-currency-picker]');
        const trigger = picker?.querySelector('[data-currency-trigger]');
        const menu = picker?.querySelector('[data-currency-menu]');
        if (!picker || !trigger || !menu) return;

        picker.classList.add('is-enhanced');
        menu.id = menu.id || `${select.id}-menu`;
        trigger.setAttribute('aria-controls', menu.id);
        menu.innerHTML = '';

        CURRENCY_OPTIONS.forEach(({ code, name }) => {
            const option = document.createElement('button');
            const codeLabel = document.createElement('span');
            const nameLabel = document.createElement('span');

            option.type = 'button';
            option.className = 'currency-option';
            option.dataset.currencyOption = code;
            option.setAttribute('role', 'option');
            option.title = getCurrencyOptionLabel(code, name, true);

            codeLabel.className = 'currency-option-code';
            codeLabel.textContent = getCurrencyOptionLabel(code, name, 'compact');
            nameLabel.className = 'currency-option-name';
            nameLabel.textContent = name;

            option.append(codeLabel, nameLabel);
            option.addEventListener('click', () => {
                changeDisplayCurrency(code);
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

            trigger.addEventListener('keydown', event => {
                if (event.key === 'Escape') {
                    closeDisplayCurrencyPickers();
                    trigger.focus();
                }
            });

            select.addEventListener('change', () => changeDisplayCurrency(select.value));
            picker.dataset.currencyPickerReady = 'true';
        }
    });

    syncDisplayCurrencyPickers();
}

document.addEventListener('click', event => {
    if (!event.target.closest('[data-display-currency-picker]')) {
        closeDisplayCurrencyPickers();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeDisplayCurrencyPickers();
    }
});

function populateCurrencySelects() {
    selectedDisplayCurrency = getStoredDisplayCurrency() || document.getElementById('global-currency-select')?.dataset.defaultCurrency || 'USD';
    if (!CURRENCY_OPTIONS.some(({ code }) => code === selectedDisplayCurrency)) {
        selectedDisplayCurrency = 'USD';
    }

    document.querySelectorAll('#curr-from, #curr-to, #global-currency-select, #mobile-currency-select').forEach(select => {
        const isDisplayCurrencySelect = select.id === 'global-currency-select' || select.id === 'mobile-currency-select';
        const selectedCurrency = isDisplayCurrencySelect
            ? selectedDisplayCurrency
            : select.dataset.defaultCurrency || select.value || (select.id === 'curr-from' ? 'INR' : 'USD');
        select.innerHTML = '';

        CURRENCY_OPTIONS.forEach(({ code, name }) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = getCurrencyOptionLabel(code, name, isDisplayCurrencySelect ? 'compact' : false);
            option.title = `${code} ${getDisplayCurrencySymbol(code)} - ${name}`;
            option.selected = code === selectedCurrency;
            select.appendChild(option);
        });
    });

    updateCurrencyAffixes();
    initializeDisplayCurrencyPickers();
}

function initializeMoneyDefaults() {
    [
        ['emi-monthly-result', 0],
        ['emi-interest-result', 0],
        ['emi-total-result', 0],
        ['sip-result', 0, { prefix: 'Maturity: ' }],
        ['sip-invested', 0],
        ['sip-returns', 0],
        ['sip-total', 0],
        ['fd-result', 0, { prefix: 'Maturity: ' }],
        ['fd-invested', 0],
        ['fd-interest', 0],
        ['fd-total', 0],
        ['rd-result', 0, { prefix: 'Maturity: ' }],
        ['rd-deposits', 0],
        ['rd-interest', 0],
        ['rd-total', 0],
        ['gst-result', 0, { prefix: 'Final: ', digits: 2 }],
        ['gst-base', 0, { digits: 2 }],
        ['gst-tax', 0, { digits: 2 }],
        ['gst-total', 0, { digits: 2 }],
        ['sal-result', 0, { prefix: 'In-hand: ', suffix: ' / month' }],
        ['sal-monthly', 0],
        ['sal-pf', 0],
        ['sal-tax', 0],
        ['leave-result', 0, { prefix: 'Payable: ' }],
        ['leave-daily', 0],
        ['dt-result', 0, { prefix: 'Final: ', digits: 2 }],
        ['dt-savings', 0, { digits: 2 }],
        ['dt-tax-out', 0, { digits: 2 }],
        ['dt-total', 0, { digits: 2 }],
        ['bill-result', 0, { digits: 2 }],
        ['ev-result', 0, { digits: 2 }]
    ].forEach(([id, value, options]) => setMoneyText(id, value, options || {}));
}

function getCurrencyCache(base) {
    const memoryCache = currencyRateMemoryCache.get(base);
    if (memoryCache && memoryCache.expiresAt > Date.now()) return memoryCache;

    try {
        const saved = localStorage.getItem(CURRENCY_CACHE_PREFIX + base);
        if (!saved) return null;

        const parsed = JSON.parse(saved);
        if (!parsed?.rates || parsed.expiresAt <= Date.now()) return null;

        currencyRateMemoryCache.set(base, parsed);
        return parsed;
    } catch {
        return null;
    }
}

function saveCurrencyCache(base, payload) {
    currencyRateMemoryCache.set(base, payload);

    try {
        localStorage.setItem(CURRENCY_CACHE_PREFIX + base, JSON.stringify(payload));
    } catch {
        // localStorage can be unavailable in strict privacy modes; memory cache still helps this session.
    }
}

async function fetchCurrencyRates(base) {
    const cached = getCurrencyCache(base);
    if (cached) return { ...cached, fromCache: true };

    const res = await fetch(`${CURRENCY_API_BASE}/${base}`);
    if (!res.ok) throw new Error(`Currency API returned ${res.status}`);

    const data = await res.json();
    if (data.result !== 'success' || !data.rates) {
        throw new Error(data['error-type'] || 'Currency API response failed');
    }

    const expiresAt = data.time_next_update_unix
        ? data.time_next_update_unix * 1000
        : Date.now() + CURRENCY_CACHE_TTL_MS;

    const payload = {
        base,
        rates: data.rates,
        updatedAt: data.time_last_update_utc || new Date().toUTCString(),
        expiresAt,
        provider: data.provider || 'https://www.exchangerate-api.com'
    };

    saveCurrencyCache(base, payload);
    return { ...payload, fromCache: false };
}

function formatCurrencyValue(value, currency) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            currencyDisplay: 'narrowSymbol',
            maximumFractionDigits: 2
        }).format(value);
    } catch {
        return `${value.toFixed(2)} ${currency}`;
    }
}

function updateCurrencyMeta(message) {
    const meta = document.getElementById('curr-meta');
    if (meta) meta.innerHTML = message;
}

async function calcCurrency() {
    const amt = parseFloat(document.getElementById('curr-amount').value);
    const from = document.getElementById('curr-from').value;
    const to = document.getElementById('curr-to').value;
    const btn = document.getElementById('curr-btn');
    const resultEl = document.getElementById('curr-result');

    if (!amt) { showToast('Please enter amount'); return; }

    btn.innerText = "Fetching...";
    btn.disabled = true;
    updateCurrencyMeta('Fetching live exchange rate...');

    try {
        const data = await fetchCurrencyRates(from);
        const rate = data.rates[to];

        if (!rate) throw new Error(`Currency ${to} is not supported`);

        const result = amt * rate;
        resultEl.innerText = formatCurrencyValue(result, to);

        const sourceLabel = data.fromCache ? 'cached live rate' : 'live rate';
        updateCurrencyMeta(`${sourceLabel} updated: ${data.updatedAt}<br><a href="https://www.exchangerate-api.com" target="_blank" rel="noopener">Rates by Exchange Rate API</a>`);
        showToast(data.fromCache ? 'Converted using cached live rate' : 'Converted with live rate');
    } catch (e) {
        resultEl.innerText = 'Unable to fetch live rate';
        updateCurrencyMeta('Live currency API is unavailable. Please try again in a moment.');
        showToast('Currency API fetch failed');
    } finally {
        btn.innerText = "Convert";
        btn.disabled = false;
    }
}
window.calcCurrency = calcCurrency;

function swapCurrencies() {
    const fromSelect = document.getElementById('curr-from');
    const toSelect = document.getElementById('curr-to');
    if (!fromSelect || !toSelect) return;

    const currentFrom = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = currentFrom;
    calcCurrency();
}
window.swapCurrencies = swapCurrencies;

// --- Phase 2: Basic Daily Tools ---

function calcAge() {
    const dobInput = document.getElementById('age-dob').value;
    if (!dobInput) { showToast('Please select DOB'); return; }

    const dob = new Date(dobInput);
    const now = new Date();

    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    document.getElementById('age-result').innerText = `${years} Yrs, ${months} Mos, ${days} Days`;
    showToast('Age Calculated!');
}
window.calcAge = calcAge;

function calcDateDiff() {
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;
    if (!start || !end) { showToast('Please select dates'); return; }

    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    document.getElementById('date-result').innerText = diffDays + ' Days';
    showToast('Difference Calculated!');
}
window.calcDateDiff = calcDateDiff;

function calcTime() {
    let h1 = parseFloat(document.getElementById('time-h1').value) || 0;
    let m1 = parseFloat(document.getElementById('time-m1').value) || 0;
    const op = document.getElementById('time-op').value;
    let h2 = parseFloat(document.getElementById('time-h2').value) || 0;
    let m2 = parseFloat(document.getElementById('time-m2').value) || 0;

    let totalM1 = (h1 * 60) + m1;
    let totalM2 = (h2 * 60) + m2;

    let resultM = 0;
    if (op === '+') {
        resultM = totalM1 + totalM2;
    } else {
        resultM = totalM1 - totalM2;
    }

    const isNeg = resultM < 0;
    resultM = Math.abs(resultM);

    const outH = Math.floor(resultM / 60);
    const outM = resultM % 60;

    document.getElementById('time-result').innerText = (isNeg ? '-' : '') + `${outH}h ${outM}m`;
    showToast('Time Calculated!');
}
window.calcTime = calcTime;

function calcPct() {
    const a = parseFloat(document.getElementById('pct-a').value);
    const b = parseFloat(document.getElementById('pct-b').value);
    if (!a || !b) { showToast('Please enter values'); return; }

    const result = (a / 100) * b;
    document.getElementById('pct-result').innerText = result.toFixed(2);
    showToast('Percentage Calculated!');
}
window.calcPct = calcPct;

// --- Phase 3: Education & Tech Tools ---

// CGPA Calculator
function addCgpaRow() {
    const container = document.getElementById('cgpa-inputs');
    const div = document.createElement('div');
    div.className = 'input-group';
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.innerHTML = `
        <input type="number" class="tool-input cgpa-credit" placeholder="Credits" style="flex:1;">
        <input type="number" class="tool-input cgpa-grade" placeholder="Grade (1-10)" style="flex:1;">
    `;
    container.appendChild(div);
}
window.addCgpaRow = addCgpaRow;

function calcCGPA() {
    const credits = document.querySelectorAll('.cgpa-credit');
    const grades = document.querySelectorAll('.cgpa-grade');
    let totalCredits = 0;
    let totalPoints = 0;

    for (let i = 0; i < credits.length; i++) {
        const c = parseFloat(credits[i].value);
        const g = parseFloat(grades[i].value);
        if (c && g) {
            totalCredits += c;
            totalPoints += (c * g);
        }
    }

    if (totalCredits === 0) {
        showToast('Please enter at least one subject');
        return;
    }

    const cgpa = totalPoints / totalCredits;
    document.getElementById('cgpa-result').innerText = cgpa.toFixed(2) + ' GPA';
    showToast('CGPA Calculated!');
}
window.calcCGPA = calcCGPA;

// Attendance Calculator
function calcAttendance() {
    const total = parseFloat(document.getElementById('att-total').value);
    const present = parseFloat(document.getElementById('att-present').value);
    const target = parseFloat(document.getElementById('att-target').value);

    if (isNaN(total) || isNaN(present) || isNaN(target)) { showToast('Please enter all values'); return; }
    if (present > total) { showToast('Attended cannot be > Total'); return; }

    const currentPct = (present / total) * 100;

    if (currentPct >= target) {
        let bunks = 0;
        let p = present;
        let t = total;
        while ((p / (t + 1)) * 100 >= target) {
            t++;
            bunks++;
        }
        document.getElementById('att-result').innerHTML = `Current: ${currentPct.toFixed(1)}%<br><span style="color:#22c55e;">You can bunk ${bunks} more classes.</span>`;
    } else {
        let attend = 0;
        let p = present;
        let t = total;
        while ((p / t) * 100 < target) {
            p++;
            t++;
            attend++;
        }
        document.getElementById('att-result').innerHTML = `Current: ${currentPct.toFixed(1)}%<br><span style="color:#ef4444;">You must attend ${attend} more classes.</span>`;
    }
    showToast('Attendance Calculated!');
}
window.calcAttendance = calcAttendance;

// Word & Character Counter
function updateCounts() {
    const text = document.getElementById('text-counter-input').value;
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    document.getElementById('count-chars').innerText = charCount;
    document.getElementById('count-words').innerText = wordCount;
}
window.updateCounts = updateCounts;

// Text Case Converter
function convertCase(type) {
    const input = document.getElementById('case-input');
    const output = document.getElementById('case-output');
    const text = input.value;
    if (!text) { showToast('Enter some text first'); return; }

    let result = '';
    switch (type) {
        case 'upper': result = text.toUpperCase(); break;
        case 'lower': result = text.toLowerCase(); break;
        case 'title': result = text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); break;
        case 'camel': result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); break;
    }
    output.value = result;
    showToast('Case converted!');
}
window.convertCase = convertCase;

async function copyCaseResult() {
    const output = document.getElementById('case-output');
    if (!output.value) {
        showToast('Convert text first');
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
    } catch {
        output.select();
        document.execCommand('copy');
        output.setSelectionRange(0, 0);
    }

    showToast('Converted text copied!');
}
window.copyCaseResult = copyCaseResult;

// Base64 Encode/Decode
function processBase64(action) {
    const input = document.getElementById('b64-input').value;
    if (!input) { showToast('Enter some text first'); return; }

    try {
        let result = action === 'encode' ? btoa(input) : atob(input);
        document.getElementById('b64-output').value = result;
        showToast(action === 'encode' ? 'Encoded!' : 'Decoded!');
    } catch (e) {
        document.getElementById('b64-output').value = 'Error: Invalid Input';
        showToast('Operation failed');
    }
}
window.processBase64 = processBase64;

// Color Format Converter
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}
function updateColors(hex) {
    const rgbObj = hexToRgb(hex);
    if (rgbObj) {
        const rgbStr = `rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`;
        const hslStr = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
        document.getElementById('color-rgb').innerText = rgbStr;
        document.getElementById('color-hsl').innerText = hslStr;
    }
}
function updateColorsFromPicker() {
    const hex = document.getElementById('color-picker').value;
    document.getElementById('color-hex').value = hex.toUpperCase();
    updateColors(hex);
}
window.updateColorsFromPicker = updateColorsFromPicker;

function updateColorsFromHex() {
    let hex = document.getElementById('color-hex').value;
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (hex.length === 7) {
        document.getElementById('color-picker').value = hex;
        updateColors(hex);
    }
}
window.updateColorsFromHex = updateColorsFromHex;

// Stopwatch
let swInterval;
let swTime = 0; // Tracks 10ms intervals (centiseconds)
let swRunning = false;

function updateStopwatchDisplay() {
    const h = Math.floor(swTime / 360000);
    const m = Math.floor((swTime % 360000) / 6000);
    const s = Math.floor((swTime % 6000) / 100);
    const ms = swTime % 100;

    document.getElementById('stopwatch-display').innerText =
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function startStopwatch() {
    if (swRunning) {
        clearInterval(swInterval);
        document.getElementById('sw-start').innerText = 'Start';
        swRunning = false;
    } else {
        swInterval = setInterval(() => {
            swTime++;
            updateStopwatchDisplay();
        }, 10);
        document.getElementById('sw-start').innerText = 'Pause';
        swRunning = true;
    }
}
window.startStopwatch = startStopwatch;

function resetStopwatch() {
    clearInterval(swInterval);
    swTime = 0;
    swRunning = false;
    document.getElementById('sw-start').innerText = 'Start';
    updateStopwatchDisplay();
}
window.resetStopwatch = resetStopwatch;

// Discount & Tax Calculator
function calcDiscountTax() {
    const price = parseFloat(document.getElementById('dt-price').value);
    const discount = parseFloat(document.getElementById('dt-discount').value) || 0;
    const tax = parseFloat(document.getElementById('dt-tax').value) || 0;

    if (!price) { showToast('Please enter a price'); return; }

    const afterDiscount = price - (price * (discount / 100));
    const finalPrice = afterDiscount + (afterDiscount * (tax / 100));
    const savings = price - afterDiscount;
    const taxAdded = finalPrice - afterDiscount;

    setMoneyText('dt-result', finalPrice, { prefix: 'Final: ', digits: 2 });
    setMoneyText('dt-savings', savings, { digits: 2 });
    setMoneyText('dt-tax-out', taxAdded, { digits: 2 });
    setMoneyText('dt-total', finalPrice, { digits: 2 });
    showToast('Final Price Calculated!');
}
window.calcDiscountTax = calcDiscountTax;

// --- Electricity & Power Tools ---
function readCalcNumber(id) {
    const value = parseFloat(document.getElementById(id)?.value);
    return Number.isFinite(value) ? value : null;
}

function formatCalcNumber(value, digits = 2) {
    if (!Number.isFinite(value)) return '0';
    return Number(value.toFixed(digits)).toLocaleString(undefined, {
        maximumFractionDigits: digits
    });
}

function requirePositiveInputs(fields) {
    const values = {};

    for (const field of fields) {
        const value = readCalcNumber(field.id);
        if (value === null || value <= 0) {
            showFieldError(field.id, `Enter valid ${field.label}`);
            return null;
        }
        values[field.id] = value;
    }

    return values;
}

function setResultText(id, text, toastMessage) {
    document.getElementById(id).innerText = text;
    showToast(toastMessage);
}

function calcPower() {
    const values = requirePositiveInputs([
        { id: 'power-voltage', label: 'voltage' },
        { id: 'power-current', label: 'current' }
    ]);
    if (!values) return;

    const watts = values['power-voltage'] * values['power-current'];
    setResultText('power-result', `${formatCalcNumber(watts)} W`, 'Power calculated');
}
window.calcPower = calcPower;

async function calcElectricityBill() {
    const values = requirePositiveInputs([
        { id: 'bill-units', label: 'units/kWh' },
        { id: 'bill-rate', label: 'rate' }
    ]);
    if (!values) return;

    const bill = values['bill-units'] * values['bill-rate'];
    setMoneyText('bill-result', bill, { digits: 2 });
    showToast('Electricity bill calculated');

    // --- Electricity Pie Chart ---
    const chartContainer = document.getElementById('electricity-pie-container');
    if (chartContainer) {
        chartContainer.style.display = 'block';
        const ctx = document.getElementById('electricity-pie-chart').getContext('2d');
        if (window.elecChartInstance) window.elecChartInstance.destroy();
        
        const usageCost = bill;
        const taxEst = bill * 0.18; // Mock 18% tax
        const fixedCharge = 50; // Mock fixed charge
        
        try {
            await ensureChartLibrary();
        } catch (err) {
            console.error(err);
            showToast('Chart tools could not be loaded.', 'error');
            return;
        }

        window.elecChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Usage', 'Tax/Duty', 'Fixed'],
                datasets: [{
                    data: [usageCost, taxEst, fixedCharge],
                    backgroundColor: ['#facc15', '#ef4444', '#3b82f6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 1500, animateScale: true },
                plugins: { legend: { position: 'right', labels: { color: '#fff', font: { size: 10 } } } }
            }
        });
    }

}
window.calcElectricityBill = calcElectricityBill;

function calcKwh() {
    const values = requirePositiveInputs([
        { id: 'kwh-watts', label: 'appliance watts' },
        { id: 'kwh-hours', label: 'hours used' }
    ]);
    if (!values) return;

    const units = (values['kwh-watts'] * values['kwh-hours']) / 1000;
    setResultText('kwh-result', `${formatCalcNumber(units, 3)} kWh`, 'kWh calculated');
}
window.calcKwh = calcKwh;

function calcWattToUnit() {
    const values = requirePositiveInputs([
        { id: 'wattunit-watts', label: 'watts' },
        { id: 'wattunit-hours', label: 'hours per day' },
        { id: 'wattunit-days', label: 'days' }
    ]);
    if (!values) return;

    const units = (values['wattunit-watts'] * values['wattunit-hours'] * values['wattunit-days']) / 1000;
    setResultText('wattunit-result', `${formatCalcNumber(units, 2)} units`, 'Electricity units calculated');
}
window.calcWattToUnit = calcWattToUnit;

function calcSolarPanel() {
    const values = requirePositiveInputs([
        { id: 'solar-kwh', label: 'daily usage' },
        { id: 'solar-sun', label: 'sun hours' },
        { id: 'solar-efficiency', label: 'efficiency' }
    ]);
    if (!values) return;

    const efficiency = values['solar-efficiency'] / 100;
    const panelWatts = (values['solar-kwh'] * 1000) / (values['solar-sun'] * efficiency);
    const panelKw = panelWatts / 1000;
    setResultText('solar-result', `${formatCalcNumber(panelKw, 2)} kW (${formatCalcNumber(panelWatts, 0)} W)`, 'Solar panel size calculated');
}
window.calcSolarPanel = calcSolarPanel;

function calcBackupHours(ah, voltage, load, efficiencyPercent) {
    return (ah * voltage * (efficiencyPercent / 100)) / load;
}

function calcInverterBackup() {
    const values = requirePositiveInputs([
        { id: 'inv-ah', label: 'battery Ah' },
        { id: 'inv-voltage', label: 'battery voltage' },
        { id: 'inv-load', label: 'load watts' },
        { id: 'inv-efficiency', label: 'efficiency' }
    ]);
    if (!values) return;

    const hours = calcBackupHours(values['inv-ah'], values['inv-voltage'], values['inv-load'], values['inv-efficiency']);
    setResultText('inv-result', `${formatCalcNumber(hours, 2)} hours (${formatCalcNumber(hours * 60, 0)} min)`, 'Inverter backup calculated');
}
window.calcInverterBackup = calcInverterBackup;

function calcUpsBackup() {
    const values = requirePositiveInputs([
        { id: 'ups-ah', label: 'battery Ah' },
        { id: 'ups-voltage', label: 'battery voltage' },
        { id: 'ups-load', label: 'PC/server load' },
        { id: 'ups-efficiency', label: 'efficiency' }
    ]);
    if (!values) return;

    const hours = calcBackupHours(values['ups-ah'], values['ups-voltage'], values['ups-load'], values['ups-efficiency']);
    setResultText('ups-result', `${formatCalcNumber(hours * 60, 0)} minutes (${formatCalcNumber(hours, 2)} hr)`, 'UPS backup calculated');
}
window.calcUpsBackup = calcUpsBackup;

function calcOhmsLaw() {
    let voltage = readCalcNumber('ohm-voltage');
    let current = readCalcNumber('ohm-current');
    let resistance = readCalcNumber('ohm-resistance');
    let power = readCalcNumber('ohm-power');

    const provided = [voltage, current, resistance, power].filter(value => value !== null && value > 0).length;
    if (provided < 2) {
        showToast('Enter any two positive Ohm law values');
        return;
    }

    if (voltage > 0 && current > 0) {
        resistance = voltage / current;
        power = voltage * current;
    } else if (voltage > 0 && resistance > 0) {
        current = voltage / resistance;
        power = voltage * current;
    } else if (current > 0 && resistance > 0) {
        voltage = current * resistance;
        power = voltage * current;
    } else if (power > 0 && voltage > 0) {
        current = power / voltage;
        resistance = voltage / current;
    } else if (power > 0 && current > 0) {
        voltage = power / current;
        resistance = voltage / current;
    } else if (power > 0 && resistance > 0) {
        current = Math.sqrt(power / resistance);
        voltage = current * resistance;
    }

    if (![voltage, current, resistance, power].every(value => Number.isFinite(value) && value > 0)) {
        showToast('Please check the entered Ohm law values');
        return;
    }

    document.getElementById('ohm-result').innerHTML = `
        <span>V: ${formatCalcNumber(voltage, 2)} V</span>
        <span>I: ${formatCalcNumber(current, 3)} A</span>
        <span>R: ${formatCalcNumber(resistance, 2)} Ohm</span>
        <span>P: ${formatCalcNumber(power, 2)} W</span>
    `;
    showToast('Ohm law calculated');
}
window.calcOhmsLaw = calcOhmsLaw;

function calcGeneratorSize() {
    const values = requirePositiveInputs([
        { id: 'gen-load', label: 'total load watts' },
        { id: 'gen-pf', label: 'power factor' }
    ]);
    if (!values) return;

    const margin = readCalcNumber('gen-margin') ?? 0;
    if (margin < 0) {
        showToast('Please enter valid safety margin');
        return;
    }

    const kva = (values['gen-load'] / (values['gen-pf'] * 1000)) * (1 + margin / 100);
    setResultText('gen-result', `${formatCalcNumber(kva, 2)} kVA`, 'Generator size calculated');
}
window.calcGeneratorSize = calcGeneratorSize;

function calcEvChargingCost() {
    const values = requirePositiveInputs([
        { id: 'ev-capacity', label: 'battery capacity' },
        { id: 'ev-rate', label: 'electricity rate' }
    ]);
    if (!values) return;

    const chargePercent = readCalcNumber('ev-percent') ?? 100;
    if (chargePercent < 0 || chargePercent > 100) {
        showToast('Charge needed must be between 0 and 100');
        return;
    }

    const cost = values['ev-capacity'] * (chargePercent / 100) * values['ev-rate'];
    setMoneyText('ev-result', cost, { digits: 2 });
    showToast('EV charging cost calculated');
}
window.calcEvChargingCost = calcEvChargingCost;

// Global triggerTool for inline onclick handlers
window.triggerTool = triggerTool;

function scrollToTools() {
    const tools = document.getElementById('tools');
    if (!tools) return;

    const top = tools.getBoundingClientRect().top + window.scrollY - getNavbarOffset();
    window.scrollTo({
        top: Math.max(0, top),
        behavior: getPreferredScrollBehavior()
    });
}
window.scrollToTools = scrollToTools;

let scrollHelperTicking = false;

function updateScrollHelpers() {
    const progress = document.getElementById('scroll-progress');
    const backButton = document.getElementById('back-to-tools');
    const scroller = document.scrollingElement || document.documentElement;
    const currentScroll = scroller.scrollTop || window.scrollY || 0;
    const scrollable = Math.max(1, scroller.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.max(0, (currentScroll / scrollable) * 100));

    progress?.style.setProperty('--scroll-progress', `${percent}%`);

    if (backButton) {
        const shouldShow = currentScroll > Math.max(420, window.innerHeight * 0.65);
        backButton.hidden = false;
        backButton.classList.toggle('is-visible', shouldShow);
        backButton.setAttribute('aria-hidden', String(!shouldShow));
        backButton.tabIndex = shouldShow ? 0 : -1;
    }

    scrollHelperTicking = false;
}

function initScrollHelpers() {
    updateScrollHelpers();
    window.addEventListener('scroll', () => {
        if (scrollHelperTicking) return;
        scrollHelperTicking = true;
        window.requestAnimationFrame(updateScrollHelpers);
    }, { passive: true });
}

// Scroll to specific calculator from hero
function scrollToCalc(id, category) {
    // 1. Filter to the correct category first so it's visible
    filterCategory(category);

    // 2. Wait a tiny bit for the DOM filter to apply, then scroll
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - getNavbarOffset();

            window.scrollTo({
                top: Math.max(0, top),
                behavior: getPreferredScrollBehavior()
            });

            // Add a temporary highlight effect
            const originalBorder = el.style.borderColor;
            const originalShadow = el.style.boxShadow;

            el.style.borderColor = 'var(--primary)';
            el.style.boxShadow = '0 0 40px rgba(99, 102, 241, 0.6)';

            setTimeout(() => {
                el.style.borderColor = originalBorder;
                el.style.boxShadow = originalShadow;
            }, 2000);
        }
    }, 100);
}
window.scrollToCalc = scrollToCalc;
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 500); // Wait for fade out animation
    }, 3000);
}

// --- Friendly Tool UX ---
const RECENT_TOOLS_KEY = 'daily-needs-recent-tools';
const SAVED_TOOLS_KEY = 'daily-needs-saved-tools';
const SUPPORT_DISMISSED_KEY = 'daily-needs-support-dismissed';
const TOOL_USE_COUNT_KEY = 'daily-needs-tool-use-count';
const MAX_RECENT_TOOLS = 6;

function slugifyToolTitle(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function readStoredList(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveStoredList(key, list) {
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch {
        // Storage may be blocked in private browsing; the site still works without persistence.
    }
}

function getToolMeta(card) {
    if (!card) return null;

    if (!card.id) {
        const title = card.querySelector('h3')?.innerText || 'tool';
        card.id = `calc-${slugifyToolTitle(title)}`;
    }

    return {
        id: card.id,
        title: card.querySelector('h3')?.innerText?.trim() || 'Tool',
        category: card.dataset.category || 'all'
    };
}

function getCardByToolId(id) {
    return id ? document.getElementById(id) : null;
}

function renderToolCollection(containerId, sectionId, storageKey) {
    const container = document.getElementById(containerId);
    const section = document.getElementById(sectionId);
    if (!container || !section) return;

    const tools = readStoredList(storageKey)
        .map(item => ({ ...item, card: getCardByToolId(item.id) }))
        .filter(item => item.card);

    section.hidden = tools.length === 0;
    container.innerHTML = tools.map(item => {
        const meta = getToolMeta(item.card);
        return `<button class="discovery-chip" onclick="jumpToTool('${meta.id}', '${meta.category}')">${meta.title}</button>`;
    }).join('');
}

function renderStoredTools() {
    renderToolCollection('recent-tools', 'recent-tools-section', RECENT_TOOLS_KEY);
    renderToolCollection('saved-tools', 'saved-tools-section', SAVED_TOOLS_KEY);
    updateSavedButtons();
}

function recordToolUse(card) {
    const meta = getToolMeta(card);
    if (!meta) return;

    const recent = readStoredList(RECENT_TOOLS_KEY).filter(item => item.id !== meta.id);
    recent.unshift(meta);
    saveStoredList(RECENT_TOOLS_KEY, recent.slice(0, MAX_RECENT_TOOLS));
    renderStoredTools();

    const count = Number(sessionStorage.getItem(TOOL_USE_COUNT_KEY) || '0') + 1;
    sessionStorage.setItem(TOOL_USE_COUNT_KEY, String(count));
    if (count >= 3) showSupportNudge();
}

function clearRecentTools() {
    saveStoredList(RECENT_TOOLS_KEY, []);
    renderStoredTools();
    showToast('Recent tools cleared');
}
window.clearRecentTools = clearRecentTools;

function clearSavedTools() {
    saveStoredList(SAVED_TOOLS_KEY, []);
    renderStoredTools();
    showToast('Saved tools cleared');
}
window.clearSavedTools = clearSavedTools;

function isToolSaved(id) {
    return readStoredList(SAVED_TOOLS_KEY).some(item => item.id === id);
}

function updateSavedButtons() {
    document.querySelectorAll('.tool-action-btn[data-action="save"]').forEach(button => {
        const card = button.closest('.tool-demo-card');
        const meta = getToolMeta(card);
        const saved = meta && isToolSaved(meta.id);
        button.classList.toggle('is-saved', Boolean(saved));
        button.innerText = saved ? 'Saved' : 'Save';
    });
}

function toggleSaveTool(card) {
    const meta = getToolMeta(card);
    if (!meta) return;

    let saved = readStoredList(SAVED_TOOLS_KEY);
    if (saved.some(item => item.id === meta.id)) {
        saved = saved.filter(item => item.id !== meta.id);
        showToast('Removed from saved tools');
    } else {
        saved.unshift(meta);
        showToast('Tool saved');
    }
    saveStoredList(SAVED_TOOLS_KEY, saved.slice(0, 12));
    renderStoredTools();
}

async function copyText(text) {
    if (!text) return false;

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        return copied;
    }
}

function getToolResultText(card) {
    const title = card.querySelector('h3')?.innerText?.trim() || 'Tool';
    const resultParts = [];
    const prioritySelectors = [
        '#wa-result',
        '#case-output',
        '#b64-output',
        '#unit-val-2',
        '.food-list',
        '.calc-display'
    ];

    prioritySelectors.forEach(selector => {
        card.querySelectorAll(selector).forEach(el => {
            if (selector === '#wa-result' && getComputedStyle(el).display === 'none') return;
            const value = ('value' in el ? el.value : el.innerText || el.textContent || '').trim();
            if (value && value !== 'Click Generate' && !resultParts.includes(value)) {
                resultParts.push(value);
            }
        });
    });

    const summary = [...card.querySelectorAll('.emi-summary div')]
        .map(row => row.innerText.trim().replace(/\s+/g, ' '))
        .filter(Boolean)
        .join('\n');
    if (summary) resultParts.push(summary);

    const qrImage = card.querySelector('#qr-image');
    if (qrImage?.src) resultParts.push(`QR image: ${qrImage.src}`);

    return resultParts.length ? `${title}\n${resultParts.join('\n')}` : '';
}

async function copyToolResult(card) {
    const text = getToolResultText(card);
    if (!text) {
        showToast('No result to copy yet');
        return;
    }

    const copied = await copyText(text);
    showToast(copied ? 'Result copied' : 'Copy failed');
}

async function shareToolResult(card) {
    const text = getToolResultText(card);
    if (!text) {
        showToast('No result to share yet');
        return;
    }

    const title = card.querySelector('h3')?.innerText?.trim() || 'Calculator result';
    if (navigator.share) {
        try {
            await navigator.share({ title, text });
            showToast('Share sheet opened');
            return;
        } catch {
            // User may cancel share. Fall through to copy.
        }
    }

    await copyToolResult(card);
}

function resetToolCard(card) {
    if (!card) return;

    card.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.type === 'checkbox') {
            el.checked = el.dataset.defaultChecked === 'true';
        } else {
            el.value = el.dataset.defaultValue || '';
        }
        clearFieldError(el);
    });

    card.querySelectorAll('.calc-display, .input-hint, .emi-summary strong, .rate-source').forEach(el => {
        if (el.dataset.defaultHtml !== undefined) el.innerHTML = el.dataset.defaultHtml;
    });

    card.querySelectorAll('.progress-bar, .meal-bar').forEach(el => {
        el.style.width = '0%';
        el.classList.remove('calculated');
    });
    card.querySelectorAll('.chart-bar').forEach(el => {
        el.style.height = '0%';
    });

    const foodList = card.querySelector('#food-list');
    if (foodList) {
        foodList.innerHTML = '';
        totalMacros = { carbs: 0, protein: 0, fat: 0 };
    }

    const qrImage = card.querySelector('#qr-image');
    const qrPrompt = card.querySelector('#qr-prompt');
    const qrContainer = card.querySelector('#qr-result-container');
    if (qrImage && qrPrompt && qrContainer) {
        qrImage.removeAttribute('src');
        qrImage.style.display = 'none';
        qrPrompt.style.display = 'block';
        qrPrompt.innerText = 'QR preview';
        qrContainer.classList.remove('generated');
        qrContainer.removeAttribute('style');
    }

    const waResult = card.querySelector('#wa-result');
    if (waResult) {
        waResult.innerText = '';
        waResult.href = '#';
        waResult.style.display = 'none';
    }

    if (card.id === 'calc-standard') clearCalc();
    if (card.id === 'calc-sw') resetStopwatch();
    if (card.querySelector('#unit-type')) updateUnitOptions();

    showToast('Tool reset');
}

function initToolDefaults() {
    document.querySelectorAll('.tool-demo-card').forEach(card => {
        getToolMeta(card);
        card.querySelectorAll('input, textarea, select').forEach(el => {
            el.dataset.defaultValue = el.value || '';
            if (el.type === 'checkbox') el.dataset.defaultChecked = String(el.checked);
        });
        card.querySelectorAll('.calc-display, .input-hint, .emi-summary strong, .rate-source').forEach(el => {
            el.dataset.defaultHtml = el.innerHTML;
        });
    });
}

function initToolActions() {
    document.querySelectorAll('.tool-demo-card').forEach(card => {
        const ui = card.querySelector('.tool-ui');
        if (!ui || ui.querySelector('.tool-actions')) return;

        const actions = document.createElement('div');
        actions.className = 'tool-actions';
        actions.innerHTML = `
            <button type="button" class="tool-action-btn" data-action="copy">Copy</button>
            <button type="button" class="tool-action-btn" data-action="share">Share</button>
            <button type="button" class="tool-action-btn" data-action="save">Save</button>
            <button type="button" class="tool-action-btn" data-action="reset">Reset</button>
        `;
        ui.appendChild(actions);
    });

    document.addEventListener('click', event => {
        const actionButton = event.target.closest('.tool-action-btn');
        if (actionButton) {
            const card = actionButton.closest('.tool-demo-card');
            const action = actionButton.dataset.action;
            if (action === 'copy') copyToolResult(card);
            if (action === 'share') shareToolResult(card);
            if (action === 'save') toggleSaveTool(card);
            if (action === 'reset') resetToolCard(card);
            return;
        }

        const toolButton = event.target.closest('.tool-ui button');
        if (!toolButton) return;
        if (toolButton.classList.contains('calc-btn') && !toolButton.classList.contains('equals')) return;

        const handler = toolButton.getAttribute('onclick') || '';
        const isPrimaryToolAction = /(calc|generate|processBase64|convertCase|addFood|calculateResult)/i.test(handler)
            && !/(download|copy|reset|clear|appendCalc|startStopwatch)/i.test(handler);

        if (isPrimaryToolAction) {
            recordToolUse(toolButton.closest('.tool-demo-card'));
        }
    });
}

function clearFieldError(input) {
    if (!input) return;
    input.classList.remove('has-error');
    const wrapper = input.closest('.input-wrapper') || input.parentElement;
    const error = wrapper?.querySelector(`.field-error[data-for="${input.id}"]`);
    error?.remove();
}

function showFieldError(id, message) {
    const input = document.getElementById(id);
    if (!input) {
        showToast(message);
        return;
    }

    clearFieldError(input);
    input.classList.add('has-error');

    const wrapper = input.closest('.input-wrapper') || input.parentElement;
    const error = document.createElement('div');
    error.className = 'field-error';
    error.dataset.for = id;
    error.innerText = message;
    wrapper?.appendChild(error);
    showToast(message);
}

function initInlineValidationClearing() {
    document.querySelectorAll('.tool-input').forEach(input => {
        input.addEventListener('input', () => clearFieldError(input));
        input.addEventListener('change', () => clearFieldError(input));
    });
}

function showSupportNudge() {
    if (localStorage.getItem(SUPPORT_DISMISSED_KEY) === 'true') return;

    const nudge = document.getElementById('support-nudge');
    if (!nudge || nudge.classList.contains('is-visible')) return;

    nudge.hidden = false;
    requestAnimationFrame(() => nudge.classList.add('is-visible'));
}

function dismissSupportNudge() {
    const nudge = document.getElementById('support-nudge');
    localStorage.setItem(SUPPORT_DISMISSED_KEY, 'true');
    if (!nudge) return;

    nudge.classList.remove('is-visible');
    setTimeout(() => { nudge.hidden = true; }, 350);
}
window.dismissSupportNudge = dismissSupportNudge;

// Database of calculators to show in hero floating cards
const heroToolsDatabase = [
    { id: 'calc-sip', category: 'finance', icon: '📈', title: 'SIP', desc: 'Wealth Planner' },
    { id: 'calc-sw', category: 'web', icon: '⏱️', title: 'Stopwatch', desc: 'Track Tasks' },
    { id: 'calc-cgpa', category: 'education', icon: '🎓', title: 'CGPA / SGPA', desc: 'Grade Tracker' },
    { id: 'calc-curr', category: 'finance', icon: '💱', title: 'Currency', desc: 'Live Rates' },
    { id: 'calc-word', category: 'web', icon: '📝', title: 'Word Count', desc: 'Text Analysis' },
    { id: 'calc-bmi', category: 'health', icon: '🥗', title: 'BMI', desc: 'Health Stats' },
    { id: 'calc-body-fat', category: 'health', icon: '📏', title: 'Body Fat', desc: 'Body Estimate' },
    { id: 'calc-qr', category: 'web', icon: '▦', title: 'QR Code', desc: 'Quick Share' },
    { id: 'calc-fd', category: 'finance', icon: '🏦', title: 'FD / SB', desc: 'Interest Calc' },
    { id: 'calc-age', category: 'basic', icon: '📅', title: 'Age Calc', desc: 'Exact Age' },
    { id: 'calc-att', category: 'education', icon: '📝', title: 'Attendance', desc: 'Class Planner' },
    { id: 'calc-water', category: 'health', icon: '💧', title: 'Water Intake', desc: 'Stay Hydrated' },
    { id: 'calc-salary', category: 'finance', icon: '💸', title: 'Salary', desc: 'Tax Estimator' },
    { id: 'calc-pass', category: 'web', icon: '🔒', title: 'Password', desc: 'Generator' },
    { id: 'calc-power', category: 'electricity', icon: '⚡', title: 'Power', desc: 'Watts Calculator' },
    { id: 'calc-solar', category: 'electricity', icon: '☀️', title: 'Solar', desc: 'Panel Sizing' },
    { id: 'calc-ups', category: 'electricity', icon: '🔋', title: 'UPS Backup', desc: 'Runtime Planner' }
];

function initHeroFloatingCards() {
    const wrapper = document.getElementById('hero-floating-cards');
    if (!wrapper) return;

    // Get unused tools from localStorage or initialize
    let unusedIndices = JSON.parse(localStorage.getItem('unusedHeroTools'));
    if (!unusedIndices || !Array.isArray(unusedIndices) || unusedIndices.length === 0) {
        unusedIndices = heroToolsDatabase.map((_, i) => i);
    }

    // We need exactly 11 cards. 
    let selectedIndices = [];

    while (selectedIndices.length < 11) {
        if (unusedIndices.length === 0) {
            // Refill pool if we run out
            let newPool = heroToolsDatabase.map((_, i) => i);
            // Prevent picking duplicates in the current set of 11
            unusedIndices = newPool.filter(i => !selectedIndices.includes(i));
        }

        // Pick random from unused
        const randomIdx = Math.floor(Math.random() * unusedIndices.length);
        const picked = unusedIndices.splice(randomIdx, 1)[0];
        selectedIndices.push(picked);
    }

    // Save updated unused pool back to localStorage
    localStorage.setItem('unusedHeroTools', JSON.stringify(unusedIndices));

    // We will split the 11 selected cards into two rows: 6 on top, 5 on bottom
    const topRowIndices = selectedIndices.slice(0, 6);
    const bottomRowIndices = selectedIndices.slice(6, 11);

    const createCardHTML = (toolIdx) => {
        const tool = heroToolsDatabase[toolIdx];
        return `
        <div class="tool-card" onclick="scrollToCalc('${tool.id}', '${tool.category}')" style="cursor:pointer;">
            <div class="icon">${tool.icon}</div>
            <div class="details">
                <h4>${tool.title}</h4>
                <p>${tool.desc}</p>
            </div>
        </div>
        `;
    };

    // Render original items + duplicated items for infinite seamless scroll
    const topHTML = topRowIndices.map(createCardHTML).join('');
    const bottomHTML = bottomRowIndices.map(createCardHTML).join('');

    wrapper.innerHTML = `
        <div class="marquee-track left">
            ${topHTML}
            ${topHTML}
        </div>
        <div class="marquee-track right">
            ${bottomHTML}
            ${bottomHTML}
        </div>
    `;
}

// --- Footer Modals & Popups ---
const razorpayPaymentLink = "https://rzp.io/rzp/tpqo4et";

const modalContent = {
    upi: {
        title: "Support via UPI",
        body: `<div style="text-align:center;">
                 <div style="width: 180px; height: 180px; background: #fff; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow:hidden;">
                    <img src="assets/upi-qr.jpeg" alt="UPI QR code for platform support" width="180" height="180" style="width:100%; height:100%; object-fit:cover;">
                 </div>
                 <p style="font-size: 1.2rem; color: #fff; font-family: monospace;">klokeshcalculator@ybl</p>
               </div>`
    },
    razorpay: {
        title: "Razorpay Payment",
        body: `<div style="text-align:center;">
                 <p style="margin-bottom: 1.5rem;">Securely pay via Razorpay using Cards, Netbanking, or Wallets.</p>
                 <a href="${razorpayPaymentLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:var(--primary); color:#fff; padding:0.8rem 2rem; border-radius:30px; text-decoration:none; font-weight:bold;">Pay with Razorpay</a>
               </div>`
    },
    privacy: {
        title: "Privacy Policy",
        body: `<p>Calculator All-in-One is a free online utility platform. Most calculations run in your browser and do not require account registration.</p>
               <p style="margin-top:1rem;"><a href="privacy.html" style="color:var(--primary);">Read the full Privacy Policy</a></p>`
    },
    terms: {
        title: "Terms & Conditions",
        body: `<p>These educational/productivity tools are for informational estimates and convenience. They are not professional financial, medical, legal, or tax advice.</p>
               <p style="margin-top:1rem;"><a href="terms.html" style="color:var(--primary);">Read the full Terms & Conditions</a></p>`
    },
    refund: {
        title: "Refund Policy",
        body: "<p>As this is a free digital tool platform, any voluntary funding contributions made to support the site are final and non-refundable.</p>"
    },
    shipping: {
        title: "Shipping Policy",
        body: "<p>Shipping is not applicable. All services and tools on Calculator All-in-One are purely digital and delivered instantly via your web browser.</p>"
    },
    contact: {
        title: "Contact Us",
        body: `<p>If you have any suggestions, bug reports, or feature requests, please reach out to us at:</p>
               <p style="margin-top:1rem; font-size:1.2rem; color:var(--primary);">support.aiagents@gmail.com</p>`
    },
    donate: {
        title: "Support The Platform",
        body: `<div style="text-align:center;">
                 <p style="margin-bottom: 0.75rem;">Calculator All-in-One is a free online utility platform for educational/productivity tools.</p>
                 <p style="margin-bottom: 1.5rem; color:#fff;">Optional support. Tools remain free. Support helps maintain hosting/API costs and future improvements.</p>
                 <a href="${razorpayPaymentLink}" target="_blank" rel="noopener noreferrer" class="glowing-btn demo-btn ripple-btn" style="padding: 0.8rem 1.5rem; width: auto; margin: 0.5rem; text-decoration: none; display: inline-block;">Fund Me</a>
               </div>`
    }
};

function openRazorpay() {
    const razorpayWindow = window.open(razorpayPaymentLink, '_blank', 'noopener,noreferrer');
    if (razorpayWindow) razorpayWindow.opener = null;
}

function openFooterModal(type) {
    if (window.event) window.event.preventDefault(); // Prevent jump to top for anchor tags

    if (type === 'razorpay') {
        openRazorpay();
        return;
    }

    const overlay = document.getElementById('footer-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (modalContent[type]) {
        titleEl.innerHTML = modalContent[type].title;
        bodyEl.innerHTML = modalContent[type].body;

        overlay.style.display = 'flex';
        // Force reflow
        void overlay.offsetWidth;
        overlay.classList.add('active');
    }
}

function closeFooterModal() {
    const overlay = document.getElementById('footer-modal');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300); // Matches CSS transition duration
}

window.openFooterModal = openFooterModal;
window.closeFooterModal = closeFooterModal;
window.openRazorpay = openRazorpay;

function initAccessibleControlNames() {
    const makeLabel = (element) => {
        const fromPlaceholder = element.getAttribute('placeholder');
        if (fromPlaceholder) return fromPlaceholder;

        const fromId = element.id || element.name || '';
        return fromId
            .replace(/^(calc|tool|input|select)-/i, '')
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())
            .trim();
    };

    document.querySelectorAll('input, select, textarea').forEach(element => {
        const hasName = element.labels?.length
            || element.hasAttribute('aria-label')
            || element.hasAttribute('aria-labelledby')
            || element.hasAttribute('title');

        if (!hasName) {
            const label = makeLabel(element);
            if (label) element.setAttribute('aria-label', label);
        }
    });

    document.querySelectorAll('canvas:not([aria-label]):not([aria-hidden])').forEach(canvas => {
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', makeLabel(canvas) || 'Calculator chart');
    });
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initAccessibleControlNames();
    initLiveCounters();
    initHeroChart();
    initHeroFloatingCards();
    populateCurrencySelects();
    initializeMoneyDefaults();
    initToolDefaults();
    initToolActions();
    initInlineValidationClearing();
    initScrollHelpers();
    renderStoredTools();

    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get('category');
    const initialSearch = params.get('search');
    if (['all', 'basic', 'finance', 'electricity', 'health', 'education', 'web'].includes(initialCategory)) {
        filterCategory(initialCategory);
    } else if (initialSearch) {
        const searchInput = document.getElementById('tool-search');
        if (searchInput) searchInput.value = initialSearch;
        searchTools(initialSearch);
    } else {
        applyToolFilters();
    }

    if (new URLSearchParams(window.location.search).get('preview') === 'support') {
        setTimeout(() => {
            document.getElementById('support-ad')?.scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 50);
    }
});

// --- LIVE COUNTERS ---
function initLiveCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; 

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };
    
    // Intersection Observer to trigger when visible
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.getElementById('stats');
    if (statsSection) observer.observe(statsSection);
}

// --- HERO CANVAS CHART ---
function initHeroChart() {
    if (isMobileViewport) return;

    const canvas = document.getElementById('hero-live-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const values = [10, 25, 40, 55, 90, 120, 150];
    const maxValue = Math.max(...values);
    let frameId = 0;

    const draw = (progress = 1) => {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 1;
        const height = rect.height || 1;
        const padding = Math.max(24, width * 0.07);
        const usableWidth = width - padding * 2;
        const usableHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, 'rgba(14, 165, 233, 0.18)');
        bg.addColorStop(0.55, 'rgba(139, 92, 246, 0.12)');
        bg.addColorStop(1, 'rgba(244, 63, 94, 0.08)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i += 1) {
            const y = padding + (usableHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        const points = values.map((value, index) => ({
            x: padding + (usableWidth / (values.length - 1)) * index,
            y: padding + usableHeight - (value / maxValue) * usableHeight
        }));

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width * progress, height);
        ctx.clip();

        const areaGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        areaGradient.addColorStop(0, 'rgba(14, 165, 233, 0.34)');
        areaGradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.lineTo(points[0].x, height - padding);
        ctx.closePath();
        ctx.fillStyle = areaGradient;
        ctx.fill();

        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(14, 165, 233, 0.55)';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
    };

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor((rect.width || 1) * ratio));
        canvas.height = Math.max(1, Math.floor((rect.height || 1) * ratio));
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw(prefersReducedMotion ? 1 : 0);
    };

    resize();

    if (prefersReducedMotion) {
        draw(1);
    } else {
        const startTime = performance.now();
        const animate = (now) => {
            const progress = Math.min(1, (now - startTime) / 1200);
            draw(progress);
            if (progress < 1) frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
    }

    if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
            cancelAnimationFrame(frameId);
            resize();
            draw(1);
        }).observe(canvas);
    } else {
        window.addEventListener('resize', () => {
            cancelAnimationFrame(frameId);
            resize();
            draw(1);
        }, { passive: true });
    }
}


// --- GEOMETRY TOOLS ---
function calcCircle() {
    const r = parseFloat(document.getElementById('circle-radius').value);
    if (!r || r < 0) return showFieldError('circle-radius', 'Enter valid radius');
    const area = Math.PI * r * r;
    const circ = 2 * Math.PI * r;
    setResultText('circle-result', `Area: ${formatCalcNumber(area, 2)}`, `Circumference: ${formatCalcNumber(circ, 2)}`);
}
window.calcCircle = calcCircle;

function calcTriangle() {
    const b = parseFloat(document.getElementById('tri-base').value);
    const h = parseFloat(document.getElementById('tri-height').value);
    if (!b || b < 0) return showFieldError('tri-base', 'Enter base');
    if (!h || h < 0) return showFieldError('tri-height', 'Enter height');
    const area = 0.5 * b * h;
    setResultText('triangle-result', `Area: ${formatCalcNumber(area, 2)}`, 'Triangle area calculated');
}
window.calcTriangle = calcTriangle;

function calcPythagorean() {
    const a = parseFloat(document.getElementById('pyth-a').value);
    const b = parseFloat(document.getElementById('pyth-b').value);
    if (!a || a < 0) return showFieldError('pyth-a', 'Enter Side A');
    if (!b || b < 0) return showFieldError('pyth-b', 'Enter Side B');
    const c = Math.sqrt(a*a + b*b);
    setResultText('pythagorean-result', `Hypotenuse: ${formatCalcNumber(c, 2)}`, 'Calculated via a² + b² = c²');
}
window.calcPythagorean = calcPythagorean;


// --- TECH TOOLS ---
function explainFormula() {
    const formula = document.getElementById('formula-select').value;
    const el = document.getElementById('formula-explanation');
    if (formula === 'einstein') {
        el.innerHTML = "<strong>E = mc²</strong><br><br><span style='color:#0ea5e9'>E</span> = Energy (Joules)<br><span style='color:#facc15'>m</span> = Mass (kg)<br><span style='color:#ef4444'>c</span> = Speed of light (3×10^8 m/s)<br><em>Shows mass and energy are interchangeable.</em>";
    } else if (formula === 'compound') {
        el.innerHTML = "<strong>A = P(1 + r/n)^(nt)</strong><br><br><span style='color:#10b981'>P</span> = Principal amount<br><span style='color:#0ea5e9'>r</span> = Annual interest rate<br><span style='color:#facc15'>n</span> = Compounds per year<br><span style='color:#ef4444'>t</span> = Time (years)";
    } else if (formula === 'newton') {
        el.innerHTML = "<strong>F = G(m1*m2/r²)</strong><br><br><span style='color:#0ea5e9'>F</span> = Gravitational Force<br><span style='color:#10b981'>G</span> = Gravitational Constant<br><span style='color:#facc15'>m1, m2</span> = Masses<br><span style='color:#ef4444'>r</span> = Distance between centers";
    }
}
window.explainFormula = explainFormula;

async function plotGraph() {
    const m = parseFloat(document.getElementById('plot-m').value) || 0;
    const b = parseFloat(document.getElementById('plot-b').value) || 0;
    const canvas = document.getElementById('plotter-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (window.plotChartInstance) window.plotChartInstance.destroy();
    
    let xs = [-10, -5, 0, 5, 10];
    let ys = xs.map(x => (m * x) + b);
    
    try {
        await ensureChartLibrary();
    } catch (err) {
        console.error(err);
        showToast('Chart tools could not be loaded.', 'error');
        return;
    }
    
    window.plotChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xs,
            datasets: [{
                label: `y = ${m}x + ${b}`,
                data: ys,
                borderColor: '#a855f7',
                borderWidth: 3,
                tension: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 500 },
            scales: { x: { display: true, grid: { color: '#333' } }, y: { display: true, grid: { color: '#333' } } }
        }
    });
}
window.plotGraph = plotGraph;

function convertImage() {
    const fileInput = document.getElementById('img-upload');
    const formatSelect = document.getElementById('img-format').value;
    if (!fileInput.files || !fileInput.files[0]) {
        return showToast('Please select an image file first.', 'error');
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById('img-canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const dataUrl = canvas.toDataURL(formatSelect, 0.9);
            const link = document.createElement('a');
            link.download = `converted-image.${formatSelect.split('/')[1]}`;
            link.href = dataUrl;
            link.click();
            showToast('Image converted and downloading!');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
window.convertImage = convertImage;



// ==========================================
// --- PREMIUM FEATURE UPGRADES & CALCULATORS ---
// ==========================================

// Global Chart Instances
let sipChartInstance = null;
let fdChartInstance = null;
let rdChartInstance = null;
let calorieChartInstance = null;
let chartLibraryPromise = null;

function ensureChartLibrary() {
    if (typeof window.Chart === 'function') return Promise.resolve();
    if (chartLibraryPromise) return chartLibraryPromise;

    chartLibraryPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => {
            chartLibraryPromise = null;
            reject(new Error('Failed to load Chart.js'));
        };
        document.head.appendChild(script);
    });

    return chartLibraryPromise;
}

// --- CHART.JS FINANCE & HEALTH GRAPH UPGRADES ---

// Upgrade SIP Calculator calculation to render wealth growth chart
const originalCalcSIP = window.calcSIP;
window.calcSIP = async function() {
    // Call original calculation first
    const P = parseFloat(document.getElementById('sip-monthly').value);
    const annualRate = parseFloat(document.getElementById('sip-rate').value);
    const years = parseFloat(document.getElementById('sip-years').value);
    
    if (!P || P <= 0 || Number.isNaN(annualRate) || annualRate < 0 || !years || years <= 0) {
        showToast('Please enter all values', 'error');
        return;
    }
    
    const r = annualRate / 100 / 12;
    const n = years * 12;
    
    const M = r === 0 ? P * n : P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    const estReturns = Math.max(0, M - invested);
    
    setMoneyText('sip-result', M, { prefix: 'Maturity: ' });
    setMoneyText('sip-invested', invested);
    setMoneyText('sip-returns', estReturns);
    setMoneyText('sip-total', M);
    
    showToast('SIP Wealth Growth Computed!');

    // Show Chart container
    const chartContainer = document.getElementById('sip-chart-container');
    if (chartContainer) chartContainer.style.display = 'block';
    
    // Generate data for line chart
    const labels = [];
    const investedData = [];
    const totalData = [];
    
    for (let y = 1; y <= years; y++) {
        labels.push(`Yr ${y}`);
        const months = y * 12;
        const totalVal = r === 0 ? P * months : P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
        investedData.push(P * months);
        totalData.push(Math.round(totalVal));
    }
    
    const ctx = document.getElementById('sip-chart');
    if (ctx) {
        try {
            await ensureChartLibrary();
        } catch (err) {
            console.error(err);
            showToast('Chart tools could not be loaded.', 'error');
            return;
        }

        if (sipChartInstance) sipChartInstance.destroy();
        sipChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Value (Maturity)',
                        data: totalData,
                        borderColor: '#0ea5e9',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Invested Capital',
                        data: investedData,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.3,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { color: '#cbd5e1', font: { size: 10 } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
};

// Upgrade FD/SB Calculator calculation to render wealth growth chart
const originalCalcFD = window.calcFD;
window.calcFD = async function() {
    const P = parseFloat(document.getElementById('fd-principal').value);
    let r = parseFloat(document.getElementById('fd-rate').value);
    const citizenBump = parseFloat(document.getElementById('fd-citizen').value);
    const years = parseFloat(document.getElementById('fd-years').value);
    
    if (!P || P <= 0 || Number.isNaN(r) || r < 0 || !years || years <= 0) {
        showToast('Please enter all values', 'error');
        return;
    }
    
    const totalRate = (r + citizenBump) / 100;
    const compoundFrequency = 4; // quarterly
    const A = P * Math.pow((1 + totalRate / compoundFrequency), compoundFrequency * years);
    const interest = Math.max(0, A - P);
    
    setMoneyText('fd-result', A, { prefix: 'Maturity: ' });
    setMoneyText('fd-invested', P);
    setMoneyText('fd-interest', interest);
    setMoneyText('fd-total', A);
    
    showToast('FD Wealth Compound Computed!');

    // Show Chart container
    const chartContainer = document.getElementById('fd-chart-container');
    if (chartContainer) chartContainer.style.display = 'block';
    
    // Generate labels and data
    const labels = [];
    const maturityData = [];
    const principalData = [];
    
    for (let y = 1; y <= years; y++) {
        labels.push(`Yr ${y}`);
        const maturityVal = P * Math.pow((1 + totalRate / compoundFrequency), compoundFrequency * y);
        maturityData.push(Math.round(maturityVal));
        principalData.push(P);
    }
    
    const ctx = document.getElementById('fd-chart');
    if (ctx) {
        try {
            await ensureChartLibrary();
        } catch (err) {
            console.error(err);
            showToast('Chart tools could not be loaded.', 'error');
            return;
        }

        if (fdChartInstance) fdChartInstance.destroy();
        fdChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Maturity Wealth',
                        data: maturityData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Principal Deposit',
                        data: principalData,
                        borderColor: '#64748b',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { color: '#cbd5e1', font: { size: 10 } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
};

// Upgrade RD Calculator calculation to render wealth growth chart
const originalCalcRD = window.calcRD;
window.calcRD = async function() {
    const P = parseFloat(document.getElementById('rd-monthly').value);
    const annualRate = parseFloat(document.getElementById('rd-rate').value);
    const months = parseFloat(document.getElementById('rd-months').value);
    
    if (!P || P <= 0 || Number.isNaN(annualRate) || annualRate < 0 || !months || months <= 0) {
        showToast('Please enter all values', 'error');
        return;
    }
    
    const r = annualRate / 100;
    const deposits = P * months;
    const interest = P * (months * (months + 1) / 2) * (r / 12);
    const maturity = deposits + interest;
    
    setMoneyText('rd-result', maturity, { prefix: 'Maturity: ' });
    setMoneyText('rd-deposits', deposits);
    setMoneyText('rd-interest', interest);
    setMoneyText('rd-total', maturity);
    
    showToast('RD Maturity Interest Computed!');

    // Show Chart container
    const chartContainer = document.getElementById('rd-chart-container');
    if (chartContainer) chartContainer.style.display = 'block';
    
    // Generate data for line chart
    const labels = [];
    const depositsData = [];
    const totalData = [];
    
    // Divide months into reasonable intervals
    const steps = Math.min(months, 12);
    const stepSize = Math.max(1, Math.floor(months / steps));
    
    for (let m = stepSize; m <= months; m += stepSize) {
        labels.push(`${m} Mo`);
        const deps = P * m;
        const intr = P * (m * (m + 1) / 2) * (r / 12);
        depositsData.push(deps);
        totalData.push(Math.round(deps + intr));
    }
    
    // Add final point if not present
    if (totalData.length < steps || (months % stepSize !== 0)) {
        labels.push(`${months} Mo`);
        depositsData.push(deposits);
        totalData.push(Math.round(maturity));
    }
    
    const ctx = document.getElementById('rd-chart');
    if (ctx) {
        try {
            await ensureChartLibrary();
        } catch (err) {
            console.error(err);
            showToast('Chart tools could not be loaded.', 'error');
            return;
        }

        if (rdChartInstance) rdChartInstance.destroy();
        rdChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Value',
                        data: totalData,
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Accumulated Deposits',
                        data: depositsData,
                        borderColor: '#cbd5e1',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { color: '#cbd5e1', font: { size: 10 } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
};

// Upgrade Calories & Macronutrients calculation to render Doughnut Chart
const originalUpdateMacroBars = window.updateMacroBars;
window.updateMacroBars = async function() {
    const total = totalMacros.carbs + totalMacros.protein + totalMacros.fat;
    if (total === 0) return;
    
    const pCarbs = (totalMacros.carbs / total) * 100;
    const pProtein = (totalMacros.protein / total) * 100;
    const pFat = (totalMacros.fat / total) * 100;
    
    // Display Chart container
    const chartContainer = document.getElementById('calorie-chart-container');
    if (chartContainer) chartContainer.style.display = 'block';
    
    const ctx = document.getElementById('calorie-chart');
    if (ctx) {
        try {
            await ensureChartLibrary();
        } catch (err) {
            console.error(err);
            showToast('Chart tools could not be loaded.', 'error');
            return;
        }

        if (calorieChartInstance) calorieChartInstance.destroy();
        calorieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Carbs', 'Protein', 'Fat'],
                datasets: [{
                    data: [Math.round(totalMacros.carbs), Math.round(totalMacros.protein), Math.round(totalMacros.fat)],
                    backgroundColor: ['#0ea5e9', '#10b981', '#8b5cf6'],
                    borderWidth: 1,
                    borderColor: 'rgba(15, 23, 42, 0.95)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#cbd5e1', font: { size: 11 } }
                    }
                }
            }
        });
    }
};


// --- PREMIUM DATA EXPORT UTILITIES (PDF, PNG, CSV) ---

const EXPORT_SCRIPT_URLS = {
    html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
};
const exportScriptPromises = new Map();

function loadExportScript(name, isReady) {
    if (isReady()) return Promise.resolve();
    if (exportScriptPromises.has(name)) return exportScriptPromises.get(name);

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = EXPORT_SCRIPT_URLS[name];
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => {
            exportScriptPromises.delete(name);
            reject(new Error(`Failed to load ${name}`));
        };
        document.head.appendChild(script);
    });

    exportScriptPromises.set(name, promise);
    return promise;
}

function ensureHtml2Canvas() {
    return loadExportScript('html2canvas', () => typeof window.html2canvas === 'function');
}

function ensureJsPDF() {
    return loadExportScript('jspdf', () => Boolean(window.jspdf?.jsPDF));
}

// Generic PNG downloader
async function triggerPNGDownload(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        showToast('Element to export not found!', 'error');
        return;
    }
    
    showToast('Generating Image... Please wait.');

    try {
        await ensureHtml2Canvas();
    } catch (err) {
        console.error(err);
        showToast('Unable to load image export tools.', 'error');
        return;
    }
    
    window.html2canvas(element, {
        backgroundColor: '#0f172a',
        scale: 2, // high quality
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Image exported successfully!');
    }).catch(err => {
        console.error(err);
        showToast('Failed to export Image.', 'error');
    });
}

// Generic PDF downloader
async function triggerPDFDownload(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        showToast('Element to export not found!', 'error');
        return;
    }
    
    showToast('Generating PDF... Please wait.');

    try {
        await Promise.all([ensureHtml2Canvas(), ensureJsPDF()]);
    } catch (err) {
        console.error(err);
        showToast('Unable to load PDF export tools.', 'error');
        return;
    }
    
    window.html2canvas(element, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 size width in mm
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        pdf.save(filename);
        showToast('PDF exported successfully!');
    }).catch(err => {
        console.error(err);
        showToast('Failed to export PDF.', 'error');
    });
}

// BMI Export Callbacks
function exportBMI(format) {
    const bmiVal = document.getElementById('bmi-result').innerText;
    if (bmiVal === '0.00' || bmiVal.includes('Result')) {
        showToast('Please calculate BMI first.', 'error');
        return;
    }
    
    if (format === 'png') {
        triggerPNGDownload('calc-bmi', 'bmi-report.png');
    } else if (format === 'pdf') {
        triggerPDFDownload('calc-bmi', 'bmi-report.pdf');
    } else if (format === 'csv') {
        // Simple CSV construction
        const weight = document.getElementById('bmi-weight').value;
        const height = document.getElementById('bmi-height').value;
        const csvContent = "Parameter,Value\nHeight (cm)," + height + "\nWeight (kg)," + weight + "\nBMI Score," + bmiVal + "\nDate," + new Date().toLocaleDateString();
        downloadCSV(csvContent, 'bmi-report.csv');
    }
}
window.exportBMI = exportBMI;

// EMI Export Callbacks
function exportEMI(format) {
    const emiResult = document.getElementById('emi-result').innerText;
    if (emiResult === 'EMI: Rs 0' || emiResult.includes('Result')) {
        showToast('Please calculate EMI first.', 'error');
        return;
    }
    
    if (format === 'png') {
        triggerPNGDownload('calc-emi', 'emi-report.png');
    } else if (format === 'pdf') {
        triggerPDFDownload('calc-emi', 'emi-report.pdf');
    } else if (format === 'csv') {
        const principal = document.getElementById('emi-amount').value;
        const rate = document.getElementById('emi-rate').value;
        const years = document.getElementById('emi-years').value;
        const totalInt = document.getElementById('emi-interest').innerText;
        const totalPay = document.getElementById('emi-total').innerText;
        
        let csvContent = "Parameter,Value\nLoan Amount," + principal + "\nInterest Rate," + rate + "%\nTenure," + years + " Yrs\nMonthly EMI," + emiResult.replace('EMI: ', '') + "\nTotal Interest," + totalInt + "\nTotal Payment," + totalPay + "\n";
        downloadCSV(csvContent, 'emi-report.csv');
    }
}
window.exportEMI = exportEMI;

// Electricity Bill Export Callbacks
function exportElectricity(format) {
    const elecResult = document.getElementById('electricity-result').innerText;
    if (elecResult === 'Result will appear here' || elecResult.includes('Result')) {
        showToast('Please calculate electricity bill first.', 'error');
        return;
    }
    
    if (format === 'png') {
        triggerPNGDownload('calc-electricity-bill', 'electricity-report.png');
    } else if (format === 'pdf') {
        triggerPDFDownload('calc-electricity-bill', 'electricity-report.pdf');
    } else if (format === 'csv') {
        const state = document.getElementById('elec-state').value;
        const units = document.getElementById('elec-units').value;
        const phase = document.getElementById('elec-phase').value;
        
        let csvContent = "Parameter,Value\nState," + state + "\nConsumed Units," + units + "\nPhase Type," + phase + "\nCalculated Bill," + elecResult.replace(/\r?\n/g, ' ') + "\n";
        downloadCSV(csvContent, 'electricity-report.csv');
    }
}
window.exportElectricity = exportElectricity;

// Helper to trigger CSV file download in browser
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV exported successfully!');
    }
}


// --- FLOATING AI ASSISTANT WIDGET & FUZZY MATCH ENGINE ---

// Open/Close widget
function toggleAIAssistant() {
    const chatWindow = document.getElementById('ai-chat-window');
    if (!chatWindow) return;
    
    const isActive = chatWindow.classList.toggle('active');
    
    if (isActive) {
        document.getElementById('ai-chat-input').focus();
    }
}
window.toggleAIAssistant = toggleAIAssistant;

// Append a message bubble to log
function appendAIMessage(text, sender) {
    const chatLog = document.getElementById('ai-chat-log');
    if (!chatLog) return;
    
    const msg = document.createElement('div');
    msg.className = `ai-msg ${sender}`;
    msg.style.lineHeight = '1.4';
    
    if (sender === 'user') {
        msg.textContent = text;
    } else {
        msg.innerHTML = text;
    }
    
    chatLog.appendChild(msg);
    chatLog.scrollTop = chatLog.scrollHeight;
}

const AI_SHORT_QUERY_TOKENS = new Set(['ac', 'qr', 'fd', 'rd', 'ev', 'gst', 'sip', 'bmi', 'bmr', 'ups', 'wa', 'id', 'kw', 'kwh']);
const AI_STOP_WORDS = new Set(['a', 'an', 'and', 'are', 'can', 'do', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'need', 'of', 'on', 'or', 'please', 'the', 'to', 'tool', 'want', 'what', 'with']);

const AI_TOOL_RULES = [
    { target: 'calc-standard', label: 'Standard Calculator', category: 'basic', keys: ['basic calculator', 'standard calculator', 'addition', 'subtraction', 'multiply', 'divide', 'simple math'], tip: 'Use it for quick everyday arithmetic.' },
    { target: 'calc-scientific', label: 'Scientific Calculator', category: 'basic', keys: ['scientific', 'trig', 'sine', 'cosine', 'tan', 'logarithm', 'ln', 'exponent', 'square root', 'bodmas', 'pemdas'], tip: 'Use it for complex expressions, trigonometry, logs, powers, and roots.' },
    { target: 'calc-bmi', label: 'BMI Calculator', category: 'health', keys: ['bmi', 'body mass', 'obesity', 'overweight', 'underweight', 'healthy weight'], tip: 'Enter height and weight to estimate BMI. Treat health results as guidance, not medical advice.' },
    { target: 'calc-bmr', label: 'BMR Calculator', category: 'health', keys: ['bmr', 'basal metabolic', 'metabolism', 'maintenance calories'], tip: 'Use it to estimate baseline daily calories from age, sex, height, and weight.' },
    { target: 'calc-water', label: 'Water Intake', category: 'health', keys: ['water', 'hydration', 'drink water', 'daily water', 'liters per day'], tip: 'Use it to estimate daily hydration needs.' },
    { target: 'calc-ideal-weight', label: 'Ideal Weight', category: 'health', keys: ['ideal weight', 'healthy weight range', 'target weight'], tip: 'Use it to estimate a healthy weight range from height and sex.' },
    { target: 'calc-protein', label: 'Protein Intake', category: 'health', keys: ['protein', 'protein intake', 'daily protein', 'muscle protein'], tip: 'Use it to estimate protein needs from body weight and activity goal.' },
    { target: 'calc-body-fat', label: 'Body Fat Calculator', category: 'health', keys: ['body fat', 'fat percentage', 'waist neck hip', 'body fat percent'], tip: 'Use it to estimate body fat percentage from body measurements.' },
    { target: 'calc-calorie', label: 'Calorie & Macro', category: 'health', keys: ['calorie', 'calories', 'macro', 'macros', 'nutrition', 'food log', 'carbs', 'protein', 'fat', 'diet'], tip: 'Use it to total calories and macros for foods.' },
    { target: 'calc-emi', label: 'EMI Calculator', category: 'finance', keys: ['emi', 'loan', 'home loan', 'car loan', 'monthly payment', 'mortgage', 'interest rate', 'tenure'], tip: 'Enter loan amount, annual interest, and tenure to estimate monthly EMI.' },
    { target: 'calc-sip', label: 'SIP Calculator', category: 'finance', keys: ['sip', 'mutual fund', 'investment', 'invest', 'wealth growth', 'compounding', 'monthly investment'], tip: 'Use it to project monthly investment growth over time.' },
    { target: 'calc-fd', label: 'FD / SB Calculator', category: 'finance', keys: ['fd', 'fixed deposit', 'sb', 'savings account', 'deposit interest', 'senior citizen'], tip: 'Use it to estimate maturity value for fixed deposits or savings interest.' },
    { target: 'calc-rd', label: 'RD Calculator', category: 'finance', keys: ['rd', 'recurring deposit', 'monthly deposit'], tip: 'Use it to estimate recurring deposit maturity.' },
    { target: 'calc-gst', label: 'GST Calculator', category: 'finance', keys: ['gst', 'sales tax', 'tax', 'cgst', 'sgst', 'add gst', 'remove gst'], tip: 'Use it to add or remove GST from an amount.' },
    { target: 'calc-salary', label: 'Salary Calculator', category: 'finance', keys: ['salary', 'take home', 'in hand', 'hra', 'pf', 'ctc'], tip: 'Use it to estimate monthly in-hand salary from salary components.' },
    { target: 'calc-leave', label: 'Leave Encashment', category: 'finance', keys: ['leave encashment', 'unused leave', 'paid leave', 'leave salary'], tip: 'Use it to estimate pay for unused leave days.' },
    { target: 'calc-curr', label: 'Currency Converter', category: 'finance', keys: ['currency', 'exchange rate', 'usd', 'inr', 'eur', 'convert money', 'forex'], tip: 'Use it to convert currencies with the latest available rate loaded by the site.' },
    { target: 'calc-discount-tax', label: 'Discount & Tax', category: 'finance', keys: ['discount', 'sale price', 'tax included', 'tax excluded', 'final price'], tip: 'Use it for discount and tax price calculations.' },
    { target: 'calc-invoice', label: 'Invoice Generator', category: 'finance', keys: ['invoice', 'billing', 'bill generator', 'receipt', 'pdf invoice', 'customer invoice'], tip: 'Use it to create a simple invoice with items, tax, discount, and preview.' },
    { target: 'calc-power', label: 'Power Calculator', category: 'electricity', keys: ['power', 'watts', 'wattage', 'voltage', 'current', 'ampere', 'amps'], tip: 'Use it for P = V x I electrical power estimates.' },
    { target: 'calc-electricity-bill', label: 'Electricity Bill', category: 'electricity', keys: ['electricity', 'electric bill', 'power consumption', 'ac usage', 'bill rates', 'monthly units', 'kwh cost'], tip: 'Use it to estimate electricity cost from appliance wattage, hours, days, and tariff.' },
    { target: 'calc-kwh', label: 'kWh Calculator', category: 'electricity', keys: ['kwh', 'kilowatt hour', 'energy use', 'unit consumption'], tip: 'Use it to convert watts and usage time into kWh.' },
    { target: 'calc-watt-unit', label: 'Watt to Unit', category: 'electricity', keys: ['watt to unit', 'watts to units', 'unit from watts', 'electric unit'], tip: 'Use it to estimate electricity units from wattage and usage.' },
    { target: 'calc-solar', label: 'Solar Panel Size', category: 'electricity', keys: ['solar', 'solar panel', 'panel size', 'solar array', 'sun hours'], tip: 'Use it to estimate required solar array size from daily usage.' },
    { target: 'calc-inverter', label: 'Inverter Backup', category: 'electricity', keys: ['inverter', 'battery backup', 'backup time', 'ah battery'], tip: 'Use it to estimate inverter backup time from battery capacity and load.' },
    { target: 'calc-ups', label: 'UPS Backup', category: 'electricity', keys: ['ups', 'ups backup', 'computer backup'], tip: 'Use it to estimate UPS runtime.' },
    { target: 'calc-ohm', label: "Ohm's Law", category: 'electricity', keys: ['ohm', 'ohms law', 'resistance', 'voltage current resistance', 'v ir'], tip: 'Use it to solve voltage, current, resistance, or power when two values are known.' },
    { target: 'calc-generator', label: 'Generator Size', category: 'electricity', keys: ['generator', 'generator size', 'kva', 'load generator'], tip: 'Use it to estimate generator kVA size from load.' },
    { target: 'calc-ev', label: 'EV Charging Cost', category: 'electricity', keys: ['ev', 'electric vehicle', 'charging cost', 'ev charging', 'battery charging'], tip: 'Use it to estimate EV charging cost from battery size and tariff.' },
    { target: 'calc-wa', label: 'WhatsApp Link', category: 'web', keys: ['whatsapp', 'wa link', 'chat link', 'direct chat', 'message link'], tip: 'Use it to generate a direct WhatsApp chat link.' },
    { target: 'calc-qr', label: 'QR Code', category: 'web', keys: ['qr', 'qr code', 'barcode', 'scan code', 'quick response'], tip: 'Use it to generate a QR code for links or text.' },
    { target: 'calc-pass', label: 'Password Generator', category: 'web', keys: ['password', 'pwd', 'secure password', 'generate password', 'passphrase'], tip: 'Use it to create a stronger random password.' },
    { target: 'calc-unit', label: 'Unit Converter', category: 'web', keys: ['unit', 'unit converter', 'meters', 'grams', 'inches', 'miles', 'length conversion', 'weight conversion'], tip: 'Use it for common length and weight conversions.' },
    { target: 'calc-word', label: 'Word & Char Count', category: 'web', keys: ['word count', 'character count', 'text count', 'count words'], tip: 'Use it to count words and characters in text.' },
    { target: 'calc-case', label: 'Case Converter', category: 'web', keys: ['case converter', 'uppercase', 'lowercase', 'title case', 'sentence case'], tip: 'Use it to convert text casing.' },
    { target: 'calc-base64', label: 'Base64 Encode/Decode', category: 'web', keys: ['base64', 'encode', 'decode', 'base 64'], tip: 'Use it to encode plain text or decode Base64.' },
    { target: 'calc-color', label: 'Color Converter', category: 'web', keys: ['color', 'hex', 'rgb', 'color converter', 'palette'], tip: 'Use it to convert between HEX and RGB color values.' },
    { target: 'calc-image-converter', label: 'Image Format Converter', category: 'web', keys: ['image', 'image converter', 'jpg', 'png', 'webp', 'format converter'], tip: 'Use it to convert image formats in the browser.' },
    { target: 'calc-uuid', label: 'UUID Generator', category: 'web', keys: ['uuid', 'guid', 'unique id', 'identifier', 'id generator'], tip: 'Use it to generate UUID identifiers.' },
    { target: 'calc-timezone', label: 'Time Zone Converter', category: 'web', keys: ['timezone', 'time zone', 'gmt', 'utc', 'est', 'ist', 'pst', 'compare time'], tip: 'Use it to compare a time across time zones.' },
    { target: 'calc-age', label: 'Age Calculator', category: 'basic', keys: ['age', 'birthday', 'date of birth', 'how old'], tip: 'Use it to calculate exact age from a birth date.' },
    { target: 'calc-date-diff', label: 'Date Difference', category: 'basic', keys: ['date difference', 'days between', 'between dates', 'date range'], tip: 'Use it to count days between two dates.' },
    { target: 'calc-time', label: 'Time Calculator', category: 'basic', keys: ['time calculator', 'hours minutes', 'add time', 'subtract time'], tip: 'Use it to add or subtract time values.' },
    { target: 'calc-pct', label: 'Percentage Calculator', category: 'basic', keys: ['percentage', 'percent', 'increase', 'decrease', 'percent change'], tip: 'Use it for percentage, increase, and decrease calculations.' },
    { target: 'calc-mileage', label: 'Mileage Converter', category: 'basic', keys: ['mileage', 'fuel efficiency', 'mpg', 'km/l', 'l/100km', 'petrol', 'diesel', 'cng', 'lpg', 'km/kwh'], tip: 'Use it to compare fuel efficiency units and running cost.' },
    { target: 'calc-sw', label: 'Stopwatch Timer', category: 'web', keys: ['stopwatch', 'timer', 'lap time'], tip: 'Use it for quick timing and laps.' },
    { target: 'calc-cgpa', label: 'CGPA / SGPA', category: 'education', keys: ['cgpa', 'sgpa', 'gpa', 'grade point', 'semester grade'], tip: 'Use it to calculate GPA from credits and grades.' },
    { target: 'calc-att', label: 'Attendance Calc', category: 'education', keys: ['attendance', 'class attendance', 'bunk', 'required attendance'], tip: 'Use it to estimate attendance percentage and classes needed.' },
    { target: 'calc-formula-explainer', label: 'Formula Explainer', category: 'education', keys: ['formula', 'explain formula', 'formula explainer', 'how formula works'], tip: 'Use it to read short explanations for common formulas.' },
    { target: 'calc-equation-plotter', label: 'Equation Plotter', category: 'education', keys: ['equation', 'plot', 'graph', 'line equation', 'slope'], tip: 'Use it to plot a straight-line equation.' },
    { target: 'calc-circle', label: 'Circle Area & Circumference', category: 'geometry', keys: ['circle', 'area of circle', 'circumference', 'radius'], tip: 'Use it to calculate circle area and circumference.' },
    { target: 'calc-triangle', label: 'Triangle Area', category: 'geometry', keys: ['triangle', 'area of triangle', 'base height'], tip: 'Use it to calculate triangle area.' },
    { target: 'calc-pythagorean', label: 'Pythagorean Theorem', category: 'geometry', keys: ['pythagorean', 'hypotenuse', 'right triangle', 'a2 b2 c2'], tip: 'Use it to solve the hypotenuse of a right triangle.' }
];

function escapeAIHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function normalizeAIText(value) {
    return String(value)
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9%/.+-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getAITokens(value) {
    return normalizeAIText(value)
        .split(' ')
        .filter(token => token && !AI_STOP_WORDS.has(token) && (token.length > 2 || AI_SHORT_QUERY_TOKENS.has(token)));
}

function scoreAliasMatch(normalizedQuery, queryTokens, alias) {
    const normalizedAlias = normalizeAIText(alias);
    if (!normalizedAlias) return 0;

    if (normalizedQuery === normalizedAlias) return 120 + normalizedAlias.length;
    if (` ${normalizedQuery} `.includes(` ${normalizedAlias} `)) return 70 + normalizedAlias.length;

    const aliasTokens = getAITokens(normalizedAlias);
    if (!aliasTokens.length) return 0;

    const hits = aliasTokens.filter(token => queryTokens.has(token)).length;
    if (hits === aliasTokens.length) return 35 + (hits * 6);
    if (hits > 0 && aliasTokens.length <= 2) return hits * 10;
    return hits * 4;
}

function getAIRuleCategory(rule) {
    return rule.category || document.getElementById(rule.target)?.dataset.category || 'all';
}

function getAIGeneralResponse(normalizedQuery) {
    const greeting = ['hi', 'hello', 'hey', 'help'].some(word => ` ${normalizedQuery} `.includes(` ${word} `));
    const asksCapabilities = ['what can you do', 'available tools', 'list tools', 'all calculators', 'which calculators'].some(phrase => normalizedQuery.includes(phrase));

    if (!greeting && !asksCapabilities) return null;

    return 'I can help you find the right calculator and open it for you. Try questions like <strong>monthly EMI for a loan</strong>, <strong>AC electricity bill</strong>, <strong>BMI from height and weight</strong>, <strong>days between dates</strong>, or <strong>generate a QR code</strong>.';
}

function getAICategoryIntent(normalizedQuery) {
    const categories = [
        { category: 'all', label: 'all tools', keys: ['all tools', 'all calculators', 'show all'] },
        { category: 'finance', label: 'finance tools', keys: ['finance', 'financial', 'money', 'loan calculators'] },
        { category: 'electricity', label: 'electricity tools', keys: ['electricity', 'electrical', 'power tools'] },
        { category: 'health', label: 'health tools', keys: ['health', 'fitness', 'body calculators'] },
        { category: 'geometry', label: 'geometry tools', keys: ['geometry', 'area calculators'] },
        { category: 'education', label: 'education tools', keys: ['education', 'study', 'student tools'] },
        { category: 'web', label: 'tech and web tools', keys: ['web tools', 'tech tools', 'text tools'] }
    ];

    const asksToShow = ['show', 'open', 'list', 'find', 'go to'].some(word => ` ${normalizedQuery} `.includes(` ${word} `));
    const asksForGroup = ['tool', 'tools', 'calculator', 'calculators'].some(word => ` ${normalizedQuery} `.includes(` ${word} `));
    if (!asksToShow && !asksForGroup) return null;

    return categories.find(item => item.keys.some(key => normalizedQuery.includes(key))) || null;
}

function findAIToolMatch(query) {
    const normalizedQuery = normalizeAIText(query);
    const queryTokens = new Set(getAITokens(query));
    let best = null;

    AI_TOOL_RULES.forEach(rule => {
        const card = document.getElementById(rule.target);
        const title = card?.querySelector('h3')?.innerText || rule.label;
        const description = card?.querySelector('p')?.innerText || '';
        const aliases = [rule.label, title, description, getAIRuleCategory(rule), ...(rule.keys || [])];

        let score = 0;
        aliases.forEach(alias => {
            score = Math.max(score, scoreAliasMatch(normalizedQuery, queryTokens, alias));
        });

        if (!best || score > best.score) {
            best = { ...rule, score };
        }
    });

    return best && best.score >= 18 ? best : null;
}

function routeAIToTool(rule) {
    const category = getAIRuleCategory(rule);
    const targetEl = document.getElementById(rule.target);

    if (!targetEl) {
        appendAIMessage(`I know about <strong>${escapeAIHTML(rule.label)}</strong>, but I could not find that card on this page.`, 'bot');
        return;
    }

    jumpToTool(rule.target, category);

    const details = targetEl.querySelector('details');
    if (details) details.open = true;

    targetEl.classList.add('pulse-highlight');
    window.setTimeout(() => targetEl.classList.remove('pulse-highlight'), 3200);

    appendAIMessage(`Best match: <strong>${escapeAIHTML(rule.label)}</strong>.<br>${escapeAIHTML(rule.tip || 'I opened the matching calculator for you.')}<br><button type="button" class="ai-tool-action" onclick="jumpToTool('${rule.target}', '${category}')">Open ${escapeAIHTML(rule.label)}</button>`, 'bot');
    showToast(`Opened ${rule.label}`);
}

// Send user message and match query
function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    
    const query = input.value.trim();
    if (!query) return;
    
    // Add user bubble
    appendAIMessage(query, 'user');
    input.value = '';
    
    // Processing / Match
    setTimeout(() => {
        const normalized = normalizeAIText(query);
        const categoryIntent = getAICategoryIntent(normalized);
        const generalResponse = getAIGeneralResponse(normalized);
        
        if (categoryIntent) {
            filterCategory(categoryIntent.category);
            scrollToVisibleCalculator(categoryIntent.category);
            appendAIMessage(`Showing <strong>${escapeAIHTML(categoryIntent.label)}</strong>. You can also ask me for a specific task, like <strong>loan EMI</strong>, <strong>UPS backup</strong>, or <strong>word count</strong>.`, 'bot');
            return;
        }

        if (generalResponse) {
            appendAIMessage(generalResponse, 'bot');
            return;
        }

        const bestMatch = findAIToolMatch(query);

        if (bestMatch) {
            routeAIToTool(bestMatch);
        } else {
            appendAIMessage(`I could not find a direct calculator match for <strong>${escapeAIHTML(query)}</strong>. Try <strong>EMI</strong>, <strong>AC electricity bill</strong>, <strong>body fat</strong>, <strong>date difference</strong>, <strong>QR code</strong>, or <strong>invoice</strong>.`, 'bot');
        }
    }, 400);
}
window.sendAIMessage = sendAIMessage;


// --- MISSING CALCULATORS IMPLEMENTATION ---

// 1. UUID Generator
function generateUUIDs() {
    const version = document.getElementById('uuid-version').value;
    const count = parseInt(document.getElementById('uuid-count').value) || 1;
    const out = document.getElementById('uuid-output');
    
    if (count < 1 || count > 100) {
        showToast('Count must be between 1 and 100.', 'error');
        return;
    }
    
    let uuids = [];
    for (let i = 0; i < count; i++) {
        if (version === '4') {
            // Standard RFC4122 v4 UUID
            uuids.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }));
        } else {
            // RFC4122 v1 UUID (mock time-based using timestamp)
            const d = new Date().getTime();
            const uuid = 'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = (d + Math.random()*16)%16 | 0;
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            uuids.push(uuid);
        }
    }
    
    out.value = uuids.join('\n');
    showToast('UUIDs Generated!');
}
window.generateUUIDs = generateUUIDs;

function copyUUIDs() {
    const out = document.getElementById('uuid-output');
    if (!out.value) {
        showToast('Generate UUIDs first.', 'error');
        return;
    }
    
    navigator.clipboard.writeText(out.value).then(() => {
        showToast('UUIDs copied to clipboard!');
    }).catch(err => {
        console.error(err);
        showToast('Failed to copy to clipboard.', 'error');
    });
}
window.copyUUIDs = copyUUIDs;


// 2. Time Zone Converter
function getTimeZoneParts(date, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    });

    return formatter.formatToParts(date).reduce((parts, part) => {
        if (part.type !== 'literal') parts[part.type] = Number(part.value);
        return parts;
    }, {});
}

function getTimeZoneOffset(date, timeZone) {
    const parts = getTimeZoneParts(date, timeZone);
    const utcFromParts = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return utcFromParts - date.getTime();
}

function zonedWallTimeToDate(value, timeZone) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (!match) return null;

    const [, year, month, day, hour, minute] = match.map(Number);
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
    let offset = getTimeZoneOffset(new Date(utcGuess), timeZone);
    let utcTime = utcGuess - offset;
    offset = getTimeZoneOffset(new Date(utcTime), timeZone);
    utcTime = utcGuess - offset;

    return new Date(utcTime);
}

function formatZonedDate(date, timeZone) {
    return new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    }).format(date);
}

function convertTimeZone() {
    const timeStr = document.getElementById('tz-input-time')?.value;
    const fromZone = document.getElementById('tz-from')?.value;
    const toZone = document.getElementById('tz-to')?.value;
    const resultEl = document.getElementById('tz-result');

    if (!timeStr || !fromZone || !toZone || !resultEl) {
        showToast('Please select a starting time.', 'error');
        return;
    }

    const sourceDate = zonedWallTimeToDate(timeStr, fromZone);
    if (!sourceDate || isNaN(sourceDate.getTime())) {
        showToast('Invalid time format.', 'error');
        return;
    }

    resultEl.innerHTML = `
        <div style="font-weight: 700; color:var(--primary);">${formatZonedDate(sourceDate, toZone)}</div>
        <div style="font-size:0.75rem; color:#a3a3a3; margin-top:0.25rem;">From ${formatZonedDate(sourceDate, fromZone)}</div>
    `;

    showToast('Time converted successfully!');
}
window.convertTimeZone = convertTimeZone;

const mileageFuelProfiles = {
    petrol: { label: 'Petrol', unit: 'L', priceSuffix: '/L', defaultUnit: 'kml' },
    diesel: { label: 'Diesel', unit: 'L', priceSuffix: '/L', defaultUnit: 'kml' },
    cng: { label: 'CNG', unit: 'kg', priceSuffix: '/kg', defaultUnit: 'kmkg' },
    lpg: { label: 'LPG', unit: 'kg', priceSuffix: '/kg', defaultUnit: 'kmkg' },
    ev: { label: 'EV', unit: 'kWh', priceSuffix: '/kWh', defaultUnit: 'kmkwh' }
};

function getMileageEfficiency(value, unit) {
    let efficiency = value;
    let unitLabel = 'L';

    if (unit === 'l100') efficiency = 100 / value;
    if (unit === 'mpg-us') efficiency = value / 2.352145833;
    if (unit === 'mpg-uk') efficiency = value / 2.824809363;
    if (unit === 'kmkg') unitLabel = 'kg';
    if (unit === 'kmkwh') unitLabel = 'kWh';
    if (unit === 'kwh100') {
        efficiency = 100 / value;
        unitLabel = 'kWh';
    }

    return { efficiency, unitLabel };
}

function updateMileageFuelMode(shouldConvert = false) {
    const fuelSelect = document.getElementById('mileage-fuel-type');
    const unitSelect = document.getElementById('mileage-unit');
    const priceUnit = document.getElementById('mileage-price-unit');
    const batteryField = document.getElementById('mileage-battery-field');
    const costHint = document.getElementById('mileage-cost-hint');
    if (!fuelSelect) return;

    const profile = mileageFuelProfiles[fuelSelect.value] || mileageFuelProfiles.petrol;
    const energyUnits = ['kmkg', 'kmkwh', 'kwh100'];

    if (unitSelect && shouldConvert) {
        const needsFuelUnit = fuelSelect.value === 'cng' || fuelSelect.value === 'lpg';
        const needsEvUnit = fuelSelect.value === 'ev';
        if (needsFuelUnit && unitSelect.value !== 'kmkg') unitSelect.value = 'kmkg';
        if (needsEvUnit && !['kmkwh', 'kwh100'].includes(unitSelect.value)) unitSelect.value = 'kmkwh';
        if (!needsFuelUnit && !needsEvUnit && energyUnits.includes(unitSelect.value)) unitSelect.value = profile.defaultUnit;
    }

    if (priceUnit) priceUnit.textContent = profile.priceSuffix;
    if (batteryField) batteryField.hidden = fuelSelect.value !== 'ev';
    if (costHint) costHint.textContent = fuelSelect.value === 'ev' ? 'Charging' : profile.label;
    if (shouldConvert) convertMileage(false);
}
window.updateMileageFuelMode = updateMileageFuelMode;

function convertMileage(showSuccess = true) {
    const value = parseFloat(document.getElementById('mileage-value')?.value);
    const unit = document.getElementById('mileage-unit')?.value || 'kml';
    const result = document.getElementById('mileage-result');
    const costOutput = document.getElementById('mileage-cost-output');

    if (!result) return;
    if (!value || value <= 0) {
        result.innerHTML = 'Enter mileage to see all fuel-efficiency units.';
        if (costOutput) costOutput.textContent = 'Add mileage, distance, and price to estimate cost per trip.';
        if (showSuccess) showFieldError('mileage-value', 'Enter mileage above 0');
        return;
    }

    const { efficiency, unitLabel } = getMileageEfficiency(value, unit);
    if (!efficiency || efficiency <= 0) {
        if (showSuccess) showFieldError('mileage-value', 'Enter mileage above 0');
        return;
    }

    const fuelType = document.getElementById('mileage-fuel-type')?.value || 'petrol';
    const profile = mileageFuelProfiles[fuelType] || mileageFuelProfiles.petrol;
    const kmPerLiter = unitLabel === 'L' ? efficiency : null;
    const litersPer100Km = kmPerLiter ? 100 / kmPerLiter : null;
    const mpgUs = kmPerLiter ? kmPerLiter * 2.352145833 : null;
    const mpgUk = kmPerLiter ? kmPerLiter * 2.824809363 : null;
    const per100 = 100 / efficiency;

    const metrics = [
        `<div class="mileage-metric"><b>Efficiency</b><span>${efficiency.toFixed(2)} km/${unitLabel}</span></div>`,
        `<div class="mileage-metric"><b>${unitLabel}/100km</b><span>${per100.toFixed(2)}</span></div>`
    ];

    if (kmPerLiter) {
        metrics.push(`<div class="mileage-metric"><b>US MPG</b><span>${mpgUs.toFixed(2)}</span></div>`);
        metrics.push(`<div class="mileage-metric"><b>UK MPG</b><span>${mpgUk.toFixed(2)}</span></div>`);
    } else {
        metrics.push(`<div class="mileage-metric"><b>Fuel type</b><span>${profile.label}</span></div>`);
    }

    result.innerHTML = metrics.join('');

    const distance = parseFloat(document.getElementById('mileage-distance')?.value);
    const price = parseFloat(document.getElementById('mileage-price')?.value);
    if (costOutput) {
        if (distance > 0 && price > 0) {
            const usage = distance / efficiency;
            const tripCost = usage * price;
            const costPerKm = tripCost / distance;
            const battery = parseFloat(document.getElementById('mileage-battery')?.value);
            const batteryRange = fuelType === 'ev' && battery > 0 ? battery * efficiency : null;
            costOutput.innerHTML = `
                <div class="mileage-metric"><b>${distance.toFixed(1)} km uses</b><span>${usage.toFixed(2)} ${unitLabel}</span></div>
                <div class="mileage-metric"><b>Trip cost</b><span>${tripCost.toFixed(2)}</span></div>
                <div class="mileage-metric"><b>Cost per km</b><span>${costPerKm.toFixed(2)}</span></div>
                ${batteryRange ? `<div class="mileage-metric"><b>Full battery range</b><span>${batteryRange.toFixed(1)} km</span></div>` : ''}
            `;
        } else {
            costOutput.textContent = `Add distance and ${profile.priceSuffix} price to estimate ${profile.label} cost.`;
        }
    }

    if (showSuccess) showToast('Mileage converted successfully!');
}
window.convertMileage = convertMileage;


// 3. Scientific Calculator
let sciExpression = '';
function appendSci(val) {
    const display = document.getElementById('sci-display');
    const history = document.getElementById('sci-history');
    
    if (sciExpression === '0' || sciExpression === 'Error') {
        sciExpression = '';
    }
    
    sciExpression += val;
    display.innerText = sciExpression;
}
window.appendSci = appendSci;

function clearSci() {
    sciExpression = '';
    document.getElementById('sci-display').innerText = '0';
    document.getElementById('sci-history').innerText = '';
}
window.clearSci = clearSci;

function backspaceSci() {
    const display = document.getElementById('sci-display');
    if (sciExpression.length > 0) {
        sciExpression = sciExpression.slice(0, -1);
        display.innerText = sciExpression || '0';
    }
}
window.backspaceSci = backspaceSci;

function factorialSci() {
    const display = document.getElementById('sci-display');
    const num = parseFloat(sciExpression);
    if (isNaN(num) || num < 0 || num % 1 !== 0) {
        showToast('Factorial requires positive integer.', 'error');
        return;
    }
    
    let fact = 1;
    for (let i = 2; i <= num; i++) fact *= i;
    
    document.getElementById('sci-history').innerText = `${num}!`;
    sciExpression = fact.toString();
    display.innerText = sciExpression;
}
window.factorialSci = factorialSci;

function calculateSci() {
    const display = document.getElementById('sci-display');
    const history = document.getElementById('sci-history');
    
    if (!sciExpression) return;
    
    try {
        // Map common mathematical commands to JavaScript Math equivalents
        let processed = sciExpression
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**');
            
        // Safe evaluation of the math expression
        const result = new Function('return ' + processed)();
        if (!isFinite(result)) throw new Error('Infinity');
        
        history.innerText = sciExpression + ' =';
        sciExpression = (Math.round(result * 1000000) / 1000000).toString();
        display.innerText = sciExpression;
        showToast('Calculation Complete');
    } catch(e) {
        display.innerText = 'Error';
        sciExpression = '';
        showToast('Invalid scientific expression.', 'error');
    }
}
window.calculateSci = calculateSci;


// 4. Invoice Generator
function addInvoiceRow() {
    const container = document.getElementById('invoice-items-container');
    const row = document.createElement('div');
    row.className = 'invoice-item-row';
    row.style.cssText = 'display: flex; gap: 0.4rem; margin-bottom: 0.4rem; width:100%;';
    
    row.innerHTML = `
        <input type="text" class="tool-input inv-item-desc" placeholder="Description" aria-label="Item description" style="flex: 2; min-width: 0;" value="Item Description" oninput="calculateInvoice()">
        <input type="number" class="tool-input inv-item-qty" placeholder="Qty" aria-label="Quantity" min="0" step="1" style="flex: 0.7; min-width: 0;" value="1" oninput="calculateInvoice()">
        <input type="number" class="tool-input inv-item-price" placeholder="Rate" aria-label="Rate" min="0" step="0.01" style="flex: 1.2; min-width: 0;" value="100" oninput="calculateInvoice()">
        <button class="secondary-btn invoice-remove-item" onclick="removeInvoiceRow(this)" aria-label="Remove item" style="padding: 0 0.5rem; min-height:40px; border-radius:8px; margin:0; flex: 0.4;">&times;</button>
    `;
    container.appendChild(row);
    calculateInvoice();
}
window.addInvoiceRow = addInvoiceRow;

function removeInvoiceRow(btn) {
    const row = btn.parentElement;
    row.remove();
    calculateInvoice();
}
window.removeInvoiceRow = removeInvoiceRow;

function calculateInvoice() {
    const rows = document.querySelectorAll('.invoice-item-row');
    let subtotal = 0;
    
    const previewItems = document.getElementById('inv-preview-items');
    previewItems.innerHTML = '';
    
    rows.forEach(row => {
        const desc = row.querySelector('.inv-item-desc').value || 'Item';
        const qty = parseFloat(row.querySelector('.inv-item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.inv-item-price').value) || 0;
        const total = qty * price;
        subtotal += total;
        
        // Add to preview UI
        const itemEl = document.createElement('div');
        itemEl.style.cssText = 'display:flex; justify-content:space-between; font-size:0.8rem;';
        const descEl = document.createElement('span');
        const totalEl = document.createElement('span');
        descEl.textContent = `${desc} (x${qty})`;
        totalEl.textContent = formatReadableAmount(total, 2);
        itemEl.append(descEl, totalEl);
        previewItems.appendChild(itemEl);
    });
    
    const taxRate = parseFloat(document.getElementById('invoice-tax').value) || 0;
    const discountRate = parseFloat(document.getElementById('invoice-discount').value) || 0;
    
    const tax = subtotal * (taxRate / 100);
    const discount = subtotal * (discountRate / 100);
    const totalDue = subtotal + tax - discount;
    
    // Update live previews
    document.getElementById('inv-preview-from').innerText = document.getElementById('inv-from').value || 'Sender';
    document.getElementById('inv-preview-to').innerText = document.getElementById('inv-to').value || 'Client';
    document.getElementById('inv-preview-num').innerText = document.getElementById('inv-number').value || 'INV-001';
    
    const invDate = document.getElementById('inv-date').value;
    document.getElementById('inv-preview-date').innerText = invDate || new Date().toISOString().split('T')[0];
    
    setMoneyText('inv-preview-subtotal', subtotal, { digits: 2 });
    setMoneyText('inv-preview-tax', tax, { digits: 2 });
    setMoneyText('inv-preview-discount', discount, { digits: 2 });
    setMoneyText('inv-preview-total', totalDue, { digits: 2 });
}
window.calculateInvoice = calculateInvoice;

// Export Invoice handler
function exportInvoice(format) {
    calculateInvoice(); // refresh values
    
    if (format === 'png') {
        triggerPNGDownload('invoice-report-wrapper', 'invoice-' + document.getElementById('inv-number').value + '.png');
    } else if (format === 'pdf') {
        triggerPDFDownload('invoice-report-wrapper', 'invoice-' + document.getElementById('inv-number').value + '.pdf');
    } else if (format === 'csv') {
        const rows = document.querySelectorAll('.invoice-item-row');
        const csvCell = value => `"${String(value).replace(/"/g, '""')}"`;
        let csvContent = "Description,Quantity,Price,Total\n";
        
        rows.forEach(row => {
            const desc = row.querySelector('.inv-item-desc').value || 'Item';
            const qty = row.querySelector('.inv-item-qty').value || 0;
            const price = row.querySelector('.inv-item-price').value || 0;
            const total = parseFloat(qty) * parseFloat(price);
            csvContent += `${csvCell(desc)},${csvCell(qty)},${csvCell(price)},${csvCell(total)}\n`;
        });
        
        csvContent += `\nSubtotal,,${csvCell(document.getElementById('inv-preview-subtotal').innerText)}\n`;
        csvContent += `Tax,,${csvCell(document.getElementById('inv-preview-tax').innerText)}\n`;
        csvContent += `Discount,,${csvCell(document.getElementById('inv-preview-discount').innerText)}\n`;
        csvContent += `Total,,${csvCell(document.getElementById('inv-preview-total').innerText)}\n`;
        
        downloadCSV(csvContent, 'invoice-' + document.getElementById('inv-number').value + '.csv');
    }
}
window.exportInvoice = exportInvoice;

// Initialize datetime default for Timezone and Invoice Date
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const tzInput = document.getElementById('tz-input-time');
    if (tzInput) tzInput.value = localISO;
    
    const invDateInput = document.getElementById('inv-date');
    if (invDateInput) invDateInput.value = now.toISOString().split('T')[0];

    document.querySelectorAll('#calc-invoice .invoice-remove-item, #calc-invoice .invoice-item-row .secondary-btn').forEach(btn => {
        btn.setAttribute('aria-label', 'Remove item');
        btn.innerHTML = '&times;';
    });

    document.querySelectorAll('#calc-invoice .invoice-actions button[onclick*="exportInvoice"]').forEach(btn => {
        if (btn.getAttribute('onclick')?.includes("'pdf'")) btn.textContent = 'PDF';
        if (btn.getAttribute('onclick')?.includes("'png'")) btn.textContent = 'PNG';
        if (btn.getAttribute('onclick')?.includes("'csv'")) btn.textContent = 'CSV';
    });

    if (document.getElementById('calc-ideal-weight')) updateIdealHeightUnit();
    if (document.getElementById('calc-mileage')) updateMileageFuelMode(false);
    if (document.getElementById('calc-invoice')) calculateInvoice();
});


// --- MULTILINGUAL LOCALIZATION SUPPORT (EN, ES, FR, DE, HI) ---

const localizationDict = {
    en: {
        title: "Calculator All-in-One",
        subtitle: "Premium productivity & mathematical suite",
        hero_tag: "45+ PREMIUM CALCULATORS",
        hero_title: "Calculate Everything, Instantly",
        hero_desc: "The ultimate responsive tools suite featuring financial planning, electrical physics, healthcare, math, and daily utilities.",
        nav_fund: "Fund Me",
        nav_about: "About",
        nav_contact: "Contact",
        nav_privacy: "Privacy",
        calc_bmi: "BMI Calculator",
        calc_emi: "EMI Calculator",
        calc_electricity: "Electricity Bill Calculator",
        calc_standard: "Standard Calculator",
        calc_sip: "SIP Calculator",
        calc_fd: "FD / SB Calculator",
        calc_rd: "RD Calculator",
        calc_gst: "GST Calculator",
        calc_salary: "Salary Calculator",
        calc_calorie: "Calorie & Macro",
        calc_water: "Water Intake",
        calc_water_desc: "Estimate daily hydration needs",
        calc_ideal_weight: "Ideal Weight",
        calc_protein: "Protein Intake",
        calc_body_fat: "Body Fat %",
        calc_age: "Age Calculator",
        calc_time: "Time Calculator",
        calc_cgpa: "CGPA / SGPA",
        calc_att: "Attendance Calc",
        calc_word: "Word & Char Count",
        calc_base64: "Base64 Encode/Decode",
        calc_color: "Color Converter",
        calc_sw: "Stopwatch Timer",
        calc_discount_tax: "Discount & Tax",
        calc_power: "Power Calculator",
        calc_kwh: "kWh Calculator",
        calc_watt_unit: "Watt to Unit",
        calc_solar: "Solar Panel Size",
        calc_inverter: "Inverter Backup",
        calc_ups: "UPS Backup",
        calc_ohm: "Ohm's Law",
        calc_generator: "Generator Size",
        calc_ev: "EV Charging Cost",
        calc_circle: "Circle Area & Circumference",
        calc_triangle: "Triangle Area",
        calc_pythagorean: "Pythagorean Theorem",
        calc_formula_explainer: "Formula Explainer",
        calc_equation_plotter: "Equation Plotter",
        calc_image_converter: "Image Converter",
        calc_uuid: "UUID Generator",
        calc_timezone: "Time Zone Converter",
        calc_mileage: "Mileage Converter",
        calc_scientific: "Scientific Calculator",
        calc_invoice: "Invoice Generator"
    },
    es: {
        title: "Calculadoras Todo en Uno",
        subtitle: "Suite matemática y de productividad premium",
        hero_tag: "MÁS DE 45 CALCULADORAS PREMIUM",
        hero_title: "Calcula todo, al instante",
        hero_desc: "La última suite de herramientas receptivas que incluye planificación financiera, física eléctrica, salud, matemáticas y utilidades diarias.",
        nav_fund: "Donar",
        nav_about: "Sobre nosotros",
        nav_contact: "Contacto",
        nav_privacy: "Privacidad",
        calc_bmi: "Calculadora de IMC",
        calc_emi: "Calculadora de EMI",
        calc_electricity: "Calculadora de Factura de Electricidad",
        calc_standard: "Calculadora Estándar",
        calc_sip: "Calculadora de SIP",
        calc_fd: "Calculadora de FD / SB",
        calc_rd: "Calculadora de RD",
        calc_gst: "Calculadora de GST",
        calc_salary: "Calculadora de Salario",
        calc_calorie: "Calorías y Macros",
        calc_water: "Consumo de Agua",
        calc_water_desc: "Estimar las necesidades diarias de hidratación",
        calc_ideal_weight: "Peso Ideal",
        calc_protein: "Ingesta de Proteínas",
        calc_body_fat: "Porcentaje de Grasa Corporal",
        calc_age: "Calculadora de Edad",
        calc_time: "Calculadora de Tiempo",
        calc_cgpa: "CGPA / SGPA",
        calc_att: "Calculadora de Asistencia",
        calc_word: "Contador de palabras",
        calc_base64: "Codificar/Decodificar Base64",
        calc_color: "Convertidor de Color",
        calc_sw: "Cronómetro",
        calc_discount_tax: "Descuento e Impuestos",
        calc_power: "Calculadora de Potencia",
        calc_kwh: "Calculadora de kWh",
        calc_watt_unit: "Vatio a Unidad",
        calc_solar: "Tamaño del Panel Solar",
        calc_inverter: "Respaldo de Inversor",
        calc_ups: "Respaldo de UPS",
        calc_ohm: "Ley de Ohm",
        calc_generator: "Tamaño del Generador",
        calc_ev: "Costo de Carga EV",
        calc_circle: "Área y Circunferencia del Círculo",
        calc_triangle: "Área del Triángulo",
        calc_pythagorean: "Teorema de Pitágoras",
        calc_formula_explainer: "Explicador de Fórmulas",
        calc_equation_plotter: "Graficador de Ecuaciones",
        calc_image_converter: "Convertidor de Imagen",
        calc_uuid: "Generador de UUID",
        calc_timezone: "Convertidor de Zona Horaria",
        calc_mileage: "Mileage Converter",
        calc_scientific: "Calculadora Científica",
        calc_invoice: "Generador de Facturas"
    },
    fr: {
        title: "Calculatrice Tout-en-Un",
        subtitle: "Suite mathématique et productivité premium",
        hero_tag: "PLUS DE 45 CALCULATRICES PREMIUM",
        hero_title: "Calculez tout, instantanément",
        hero_desc: "La suite ultime d'outils réactifs comprenant la planification financière, la physique électrique, la santé, les mathématiques et les utilités quotidiennes.",
        nav_fund: "Financer",
        nav_about: "À propos",
        nav_contact: "Contact",
        nav_privacy: "Confidentialité",
        calc_bmi: "Calculateur d'IMC",
        calc_emi: "Calculateur d'EMI",
        calc_electricity: "Calculateur de Facture d'Électricité",
        calc_standard: "Calculatrice Standard",
        calc_sip: "Calculateur de SIP",
        calc_fd: "Calculateur de FD / SB",
        calc_rd: "Calculateur de RD",
        calc_gst: "Calculateur de TPS",
        calc_salary: "Calculateur de Salaire",
        calc_calorie: "Calories et Macros",
        calc_water: "Consommation d'Eau",
        calc_water_desc: "Estimer les besoins quotidiens en eau",
        calc_ideal_weight: "Poids Idéal",
        calc_protein: "Apport Protéique",
        calc_body_fat: "Masse Grasse %",
        calc_age: "Calculateur d'Âge",
        calc_time: "Calculateur de Temps",
        calc_cgpa: "CGPA / SGPA",
        calc_att: "Calculateur d'Assiduité",
        calc_word: "Compteur de Mots",
        calc_base64: "Encodage/Décodage Base64",
        calc_color: "Convertisseur de Couleur",
        calc_sw: "Chronomètre",
        calc_discount_tax: "Remise et Taxe",
        calc_power: "Calculateur de Puissance",
        calc_kwh: "Calculateur de kWh",
        calc_watt_unit: "Watt à Unité",
        calc_solar: "Taille du Panneau Solaire",
        calc_inverter: "Sauvegarde de l'Onduleur",
        calc_ups: "Sauvegarde de l'Alimentation Sans Coupure",
        calc_ohm: "Loi d'Ohm",
        calc_generator: "Taille du Générateur",
        calc_ev: "Coût de Charge VE",
        calc_circle: "Aire et Circonférence du Cercle",
        calc_triangle: "Aire du Triangle",
        calc_pythagorean: "Théorème de Pythagore",
        calc_formula_explainer: "Explication de Formules",
        calc_equation_plotter: "Traceur d'Équations",
        calc_image_converter: "Convertisseur d'Image",
        calc_uuid: "Générateur d'UUID",
        calc_timezone: "Convertisseur de Fuseau Horaire",
        calc_mileage: "Mileage Converter",
        calc_scientific: "Calculatrice Scientifique",
        calc_invoice: "Générateur de Facture"
    },
    de: {
        title: "All-in-One Rechner",
        subtitle: "Premium Produktivitäts- & Mathematik-Suite",
        hero_tag: "45+ PREMIUM RECHNER",
        hero_title: "Alles sofort berechnen",
        hero_desc: "Die ultimative Suite reaktionsschneller Tools mit Finanzplanung, Elektrophysik, Gesundheit, Mathematik und alltäglichen Dienstprogrammen.",
        nav_fund: "Finanzieren",
        nav_about: "Über uns",
        nav_contact: "Kontakt",
        nav_privacy: "Datenschutz",
        calc_bmi: "BMI Rechner",
        calc_emi: "EMI Rechner",
        calc_electricity: "Stromrechner",
        calc_standard: "Standardrechner",
        calc_sip: "SIP Rechner",
        calc_fd: "FD / SB Rechner",
        calc_rd: "RD Rechner",
        calc_gst: "MwSt Rechner",
        calc_salary: "Gehaltsrechner",
        calc_calorie: "Kalorien & Makros",
        calc_water: "Wasserbedarf",
        calc_water_desc: "Täglichen Wasserbedarf schätzen",
        calc_ideal_weight: "Idealgewicht",
        calc_protein: "Proteinzufuhr",
        calc_body_fat: "Körperfettanteil %",
        calc_age: "Altersrechner",
        calc_time: "Zeitrechner",
        calc_cgpa: "CGPA / SGPA",
        calc_att: "Anwesenheitsrechner",
        calc_word: "Wort- & Zeichenzähler",
        calc_base64: "Base64 De-/Kodierung",
        calc_color: "Farbumrechner",
        calc_sw: "Stoppuhr",
        calc_discount_tax: "Rabatt & Steuer",
        calc_power: "Leistungsrechner",
        calc_kwh: "kWh Rechner",
        calc_watt_unit: "Watt in Einheiten",
        calc_solar: "Solarpanel-Größe",
        calc_inverter: "Wechselrichter-Backup",
        calc_ups: "USV-Backup",
        calc_ohm: "Ohmsches Gesetz",
        calc_generator: "Generatorgröße",
        calc_ev: "E-Auto Ladekosten",
        calc_circle: "Kreisfläche & Umfang",
        calc_triangle: "Dreiecksfläche",
        calc_pythagorean: "Satz des Pythagoras",
        calc_formula_explainer: "Formelerklärer",
        calc_equation_plotter: "Gleichungsplotter",
        calc_image_converter: "Bildkonverter",
        calc_uuid: "UUID Generator",
        calc_timezone: "Zeitzonen-Konverter",
        calc_mileage: "Mileage Converter",
        calc_scientific: "Wissenschaftlicher Rechner",
        calc_invoice: "Rechnungsersteller"
    },
    hi: {
        title: "कैलकुलेटर ऑल-इन-वन",
        subtitle: "प्रीमियम उत्पादकता और गणितीय सूट",
        hero_tag: "45+ प्रीमियम कैलकुलेटर",
        hero_title: "सब कुछ तुरंत गणना करें",
        hero_desc: "वित्तीय योजना, विद्युत भौतिकी, स्वास्थ्य सेवा, गणित और दैनिक उपयोगिताओं की विशेषता वाला अंतिम उत्तरदायी उपकरण सूट।",
        nav_fund: "फंड दें",
        nav_about: "बारे में",
        nav_contact: "संपर्क",
        nav_privacy: "गोपनीयता",
        calc_bmi: "बीएमआई कैलकुलेटर",
        calc_emi: "ईएमआई कैलकुलेटर",
        calc_electricity: "बिजली बिल कैलकुलेटर",
        calc_standard: "मानक कैलकुलेटर",
        calc_sip: "एसआईपी कैलकुलेटर",
        calc_fd: "एफडी / एसबी कैलकुलेटर",
        calc_rd: "आरडी कैलकुलेटर",
        calc_gst: "जीएसटी कैलकुलेटर",
        calc_salary: "सैलरी कैलकुलेटर",
        calc_calorie: "कैलोरी और मैक्रो",
        calc_water: "पानी की खपत",
        calc_water_desc: "दैनिक पानी की आवश्यकता का अनुमान लगाएं",
        calc_ideal_weight: "आदर्श वजन",
        calc_protein: "प्रोटीन की मात्रा",
        calc_body_fat: "बॉडी फैट %",
        calc_age: "उम्र कैलकुलेटर",
        calc_time: "समय कैलकुलेटर",
        calc_cgpa: "सीजीपीए / एसजीपीए",
        calc_att: "उपस्थिति कैलकुलेटर",
        calc_word: "शब्द और वर्ण गणना",
        calc_base64: "बेस64 एनकोड/डिकोड",
        calc_color: "कलर कन्वर्टर",
        calc_sw: "स्टॉपवॉच टाइमर",
        calc_discount_tax: "छूट और कर",
        calc_power: "पावर कैलकुलेटर",
        calc_kwh: "किलोवाट घंटा कैलकुलेटर",
        calc_watt_unit: "वाट से यूनिट",
        calc_solar: "सौर पैनल आकार",
        calc_inverter: "इन्वर्टर बैकअप",
        calc_ups: "यूपीएस बैकअप",
        calc_ohm: "ओम का नियम",
        calc_generator: "जेनरेटर आकार",
        calc_ev: "ईवी चार्जिंग लागत",
        calc_circle: "वृत्त क्षेत्रफल और परिधि",
        calc_triangle: "त्रिकोण क्षेत्रफल",
        calc_pythagorean: "पाइथागोरस प्रमेय",
        calc_formula_explainer: "सूत्र व्याख्याता",
        calc_equation_plotter: "समीकरण आलेखक",
        calc_image_converter: "छवि कनवर्टर",
        calc_uuid: "यूयूआईडी जेनरेटर",
        calc_timezone: "समय क्षेत्र कनवर्टर",
        calc_mileage: "Mileage Converter",
        calc_scientific: "वैज्ञानिक कैलकुलेटर",
        calc_invoice: "इनवॉइस जेनरेटर"
    }
};

const extraLanguageContent = {
    te: {
        title: "క్యాల్కులేటర్ ఆల్-ఇన్-వన్",
        hero_tag: "45+ ప్రీమియం క్యాల్కులేటర్లు",
        hero_title: "అన్నింటినీ వెంటనే లెక్కించండి",
        hero_title_html: 'అన్నింటినీ <span class="highlight">వెంటనే</span> లెక్కించండి',
        hero_desc: "ఫైనాన్స్, ఆరోగ్యం, విద్యుత్, గణితం మరియు ఉత్పాదకత కోసం ఉచిత ఆన్‌లైన్ క్యాల్కులేటర్లు మరియు రోజువారీ సాధనాలు.",
        nav_fund: "సహాయం చేయండి",
        nav_about: "గురించి",
        nav_contact: "సంప్రదించండి",
        nav_privacy: "గోప్యత"
    },
    ta: {
        title: "கால்குலேட்டர் ஆல்-இன்-ஒன்",
        hero_tag: "45+ பிரீமியம் கால்குலேட்டர்கள்",
        hero_title: "எல்லாவற்றையும் உடனடியாக கணக்கிடுங்கள்",
        hero_title_html: 'எல்லாவற்றையும் <span class="highlight">உடனடியாக</span> கணக்கிடுங்கள்',
        hero_desc: "நிதி, ஆரோக்கியம், மின்சாரம், கணிதம் மற்றும் உற்பத்தித்திறனுக்கான இலவச ஆன்லைன் கால்குலேட்டர்கள் மற்றும் தினசரி கருவிகள்.",
        nav_fund: "ஆதரிக்கவும்",
        nav_about: "பற்றி",
        nav_contact: "தொடர்பு",
        nav_privacy: "தனியுரிமை"
    },
    kn: {
        title: "ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಆಲ್-ಇನ್-ಒನ್",
        hero_tag: "45+ ಪ್ರೀಮಿಯಂ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು",
        hero_title: "ಎಲ್ಲವನ್ನೂ ತಕ್ಷಣ ಲೆಕ್ಕಿಸಿ",
        hero_title_html: 'ಎಲ್ಲವನ್ನೂ <span class="highlight">ತಕ್ಷಣ</span> ಲೆಕ್ಕಿಸಿ',
        hero_desc: "ಹಣಕಾಸು, ಆರೋಗ್ಯ, ವಿದ್ಯುತ್, ಗಣಿತ ಮತ್ತು ಉತ್ಪಾದಕತೆಗಾಗಿ ಉಚಿತ ಆನ್‌ಲೈನ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು ಮತ್ತು ದೈನಂದಿನ ಸಾಧನಗಳು.",
        nav_fund: "ಬೆಂಬಲಿಸಿ",
        nav_about: "ಬಗ್ಗೆ",
        nav_contact: "ಸಂಪರ್ಕ",
        nav_privacy: "ಗೌಪ್ಯತೆ"
    },
    ml: {
        title: "കാൽക്കുലേറ്റർ ഓൾ-ഇൻ-വൺ",
        hero_tag: "45+ പ്രീമിയം കാൽക്കുലേറ്ററുകൾ",
        hero_title: "എല്ലാം ഉടൻ കണക്കാക്കൂ",
        hero_title_html: 'എല്ലാം <span class="highlight">ഉടൻ</span> കണക്കാക്കൂ',
        hero_desc: "ഫിനാൻസ്, ആരോഗ്യം, വൈദ്യുതി, ഗണിതം, ഉൽപ്പാദനക്ഷമത എന്നിവയ്ക്കുള്ള സൗജന്യ ഓൺലൈൻ കാൽക്കുലേറ്ററുകളും ദൈനംദിന ഉപകരണങ്ങളും.",
        nav_fund: "പിന്തുണയ്ക്കുക",
        nav_about: "കുറിച്ച്",
        nav_contact: "ബന്ധപ്പെടുക",
        nav_privacy: "സ്വകാര്യത"
    },
    mr: {
        title: "कॅल्क्युलेटर ऑल-इन-वन",
        hero_tag: "45+ प्रीमियम कॅल्क्युलेटर",
        hero_title: "सगळे काही तत्काळ मोजा",
        hero_title_html: 'सगळे काही <span class="highlight">तत्काळ</span> मोजा',
        hero_desc: "फायनान्स, आरोग्य, वीज, गणित आणि उत्पादकतेसाठी मोफत ऑनलाइन कॅल्क्युलेटर आणि दैनंदिन साधने.",
        nav_fund: "सहाय्य करा",
        nav_about: "माहिती",
        nav_contact: "संपर्क",
        nav_privacy: "गोपनीयता"
    },
    bn: {
        title: "ক্যালকুলেটর অল-ইন-ওয়ান",
        hero_tag: "45+ প্রিমিয়াম ক্যালকুলেটর",
        hero_title: "সবকিছু সঙ্গে সঙ্গে হিসাব করুন",
        hero_title_html: 'সবকিছু <span class="highlight">সঙ্গে সঙ্গে</span> হিসাব করুন',
        hero_desc: "ফাইন্যান্স, স্বাস্থ্য, বিদ্যুৎ, গণিত এবং উৎপাদনশীলতার জন্য বিনামূল্যের অনলাইন ক্যালকুলেটর ও দৈনন্দিন টুলস.",
        nav_fund: "সহায়তা করুন",
        nav_about: "সম্পর্কে",
        nav_contact: "যোগাযোগ",
        nav_privacy: "গোপনীয়তা"
    },
    gu: {
        title: "કેલ્ક્યુલેટર ઓલ-ઇન-વન",
        hero_tag: "45+ પ્રીમિયમ કેલ્ક્યુલેટર",
        hero_title: "બધું તરત ગણો",
        hero_title_html: 'બધું <span class="highlight">તરત</span> ગણો',
        hero_desc: "ફાઇનાન્સ, આરોગ્ય, વીજળી, ગણિત અને પ્રોડક્ટિવિટી માટે મફત ઓનલાઇન કેલ્ક્યુલેટર અને દૈનિક સાધનો.",
        nav_fund: "સહાય કરો",
        nav_about: "વિશે",
        nav_contact: "સંપર્ક",
        nav_privacy: "ગોપનીયતા"
    },
    ar: {
        title: "الحاسبة الشاملة",
        hero_tag: "أكثر من 45 حاسبة مميزة",
        hero_title: "احسب كل شيء فورًا",
        hero_title_html: 'احسب كل شيء <span class="highlight">فورًا</span>',
        hero_desc: "حاسبات مجانية عبر الإنترنت وأدوات يومية للمال والصحة والكهرباء والرياضيات والإنتاجية.",
        nav_fund: "ادعمني",
        nav_about: "حول",
        nav_contact: "اتصال",
        nav_privacy: "الخصوصية"
    },
    zh: {
        title: "多功能计算器",
        hero_tag: "45+ 个高级计算器",
        hero_title: "立即计算一切",
        hero_title_html: '立即<span class="highlight">计算一切</span>',
        hero_desc: "免费的在线计算器和日常工具，适用于金融、健康、电力、数学和效率场景。",
        nav_fund: "支持我",
        nav_about: "关于",
        nav_contact: "联系",
        nav_privacy: "隐私"
    },
    ja: {
        title: "オールインワン電卓",
        hero_tag: "45以上のプレミアム計算機",
        hero_title: "すべてをすぐに計算",
        hero_title_html: 'すべてを<span class="highlight">すぐに</span>計算',
        hero_desc: "金融、健康、電気、数学、生産性に使える無料オンライン計算機と毎日の便利ツール。",
        nav_fund: "支援する",
        nav_about: "概要",
        nav_contact: "連絡先",
        nav_privacy: "プライバシー"
    },
    pt: {
        title: "Calculadora Tudo-em-Um",
        hero_tag: "45+ calculadoras premium",
        hero_title: "Calcule tudo instantaneamente",
        hero_title_html: 'Calcule tudo <span class="highlight">instantaneamente</span>',
        hero_desc: "Calculadoras online gratuitas e ferramentas diárias para finanças, saúde, eletricidade, matemática e produtividade.",
        nav_fund: "Apoiar",
        nav_about: "Sobre",
        nav_contact: "Contato",
        nav_privacy: "Privacidade"
    },
    ru: {
        title: "Калькулятор Все-в-одном",
        hero_tag: "45+ премиум-калькуляторов",
        hero_title: "Мгновенно считайте всё",
        hero_title_html: 'Мгновенно считайте <span class="highlight">всё</span>',
        hero_desc: "Бесплатные онлайн-калькуляторы и ежедневные инструменты для финансов, здоровья, электричества, математики и продуктивности.",
        nav_fund: "Поддержать",
        nav_about: "О нас",
        nav_contact: "Контакты",
        nav_privacy: "Конфиденциальность"
    }
};

Object.entries(extraLanguageContent).forEach(([code, dict]) => {
    localizationDict[code] = { ...localizationDict.en, ...dict };
});

const LANGUAGE_OPTIONS = Object.freeze([
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Spanish' },
    { code: 'fr', label: 'FR', name: 'French' },
    { code: 'de', label: 'DE', name: 'German' },
    { code: 'hi', label: 'HI', name: 'Hindi' },
    { code: 'te', label: 'TE', name: 'Telugu' },
    { code: 'ta', label: 'TA', name: 'Tamil' },
    { code: 'kn', label: 'KN', name: 'Kannada' },
    { code: 'ml', label: 'ML', name: 'Malayalam' },
    { code: 'mr', label: 'MR', name: 'Marathi' },
    { code: 'bn', label: 'BN', name: 'Bengali' },
    { code: 'gu', label: 'GU', name: 'Gujarati' },
    { code: 'ar', label: 'AR', name: 'Arabic' },
    { code: 'zh', label: 'ZH', name: 'Chinese' },
    { code: 'ja', label: 'JA', name: 'Japanese' },
    { code: 'pt', label: 'PT', name: 'Portuguese' },
    { code: 'ru', label: 'RU', name: 'Russian' }
]);

function getLanguageMeta(lang) {
    return LANGUAGE_OPTIONS.find(option => option.code === lang) || LANGUAGE_OPTIONS[0];
}

function closeLanguagePickers(exceptPicker = null) {
    document.querySelectorAll('[data-language-picker].is-open').forEach(picker => {
        if (picker === exceptPicker) return;
        picker.classList.remove('is-open');
        picker.querySelector('[data-language-trigger]')?.setAttribute('aria-expanded', 'false');
    });
}

function syncLanguagePickers(lang = document.getElementById('lang-select')?.value || 'en') {
    const meta = getLanguageMeta(lang);

    document.querySelectorAll('[data-language-picker]').forEach(picker => {
        const select = picker.querySelector('select');
        const trigger = picker.querySelector('[data-language-trigger]');
        const label = picker.querySelector('[data-language-label]');

        if (select && select.value !== meta.code) {
            select.value = meta.code;
        }
        if (label) {
            label.textContent = meta.label;
        }
        if (trigger) {
            trigger.title = `${meta.name} (${meta.label})`;
        }

        picker.querySelectorAll('[data-language-option]').forEach(option => {
            const isSelected = option.dataset.languageOption === meta.code;
            option.classList.toggle('is-selected', isSelected);
            option.setAttribute('aria-selected', String(isSelected));
        });
    });
}

function initializeLanguagePickers() {
    document.querySelectorAll('#lang-select, #mobile-lang-select').forEach(select => {
        const picker = select.closest('[data-language-picker]');
        const trigger = picker?.querySelector('[data-language-trigger]');
        const menu = picker?.querySelector('[data-language-menu]');
        if (!picker || !trigger || !menu) return;
        const currentLanguage = LANGUAGE_OPTIONS.some(option => option.code === select.value) ? select.value : 'en';

        picker.classList.add('is-enhanced');
        menu.id = menu.id || `${select.id}-menu`;
        trigger.setAttribute('aria-controls', menu.id);
        select.innerHTML = '';
        menu.innerHTML = '';

        LANGUAGE_OPTIONS.forEach(({ code, label, name }) => {
            const nativeOption = document.createElement('option');
            const option = document.createElement('button');
            const codeLabel = document.createElement('span');
            const nameLabel = document.createElement('span');

            nativeOption.value = code;
            nativeOption.textContent = select.id === 'mobile-lang-select' ? `${name} (${label})` : label;
            nativeOption.selected = code === currentLanguage;
            select.appendChild(nativeOption);

            option.type = 'button';
            option.className = 'language-option';
            option.dataset.languageOption = code;
            option.setAttribute('role', 'option');
            option.title = `${name} (${label})`;

            codeLabel.className = 'language-option-code';
            codeLabel.textContent = label;
            nameLabel.className = 'language-option-name';
            nameLabel.textContent = name;

            option.append(codeLabel, nameLabel);
            option.addEventListener('click', () => {
                changeLanguage(code);
                closeLanguagePickers();
                trigger.focus();
            });
            menu.appendChild(option);
        });

        if (!picker.dataset.languagePickerReady) {
            trigger.addEventListener('click', () => {
                const shouldOpen = !picker.classList.contains('is-open');
                closeLanguagePickers(picker);
                picker.classList.toggle('is-open', shouldOpen);
                trigger.setAttribute('aria-expanded', String(shouldOpen));
            });

            trigger.addEventListener('keydown', event => {
                if (event.key === 'Escape') {
                    closeLanguagePickers();
                    trigger.focus();
                }
            });

            select.addEventListener('change', () => changeLanguage(select.value));
            picker.dataset.languagePickerReady = 'true';
        }
    });

    syncLanguagePickers();
}

function changeLanguage(lang) {
    const meta = getLanguageMeta(lang);
    const activeLang = meta.code;
    document.documentElement.lang = activeLang;
    
    // Set selects values
    const navSelect = document.getElementById('lang-select');
    const mobSelect = document.getElementById('mobile-lang-select');
    if (navSelect) navSelect.value = activeLang;
    if (mobSelect) mobSelect.value = activeLang;
    syncLanguagePickers(activeLang);
    
    const dict = { ...localizationDict.en, ...(localizationDict[activeLang] || {}) };
    
    // Update main titles
    const titleEl = document.querySelector('.logo');
    if (titleEl) titleEl.innerText = dict.title;
    
    const heroTag = document.querySelector('.badge');
    if (heroTag) heroTag.innerText = dict.hero_tag;
    
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        if (dict.hero_title_html) {
            heroTitle.innerHTML = dict.hero_title_html;
        } else {
            // preserve the gradient highlight word if possible
            if (activeLang === 'en') {
                heroTitle.innerHTML = 'Calculate Everything, <span class="highlight">Instantly</span>';
            } else if (activeLang === 'es') {
                heroTitle.innerHTML = 'Calcula todo, <span class="highlight">al instante</span>';
            } else if (activeLang === 'fr') {
                heroTitle.innerHTML = 'Calculez tout, <span class="highlight">instantanément</span>';
            } else if (activeLang === 'de') {
                heroTitle.innerHTML = 'Alles sofort <span class="highlight">berechnen</span>';
            } else if (activeLang === 'hi') {
                heroTitle.innerHTML = 'सब कुछ तुरंत <span class="highlight">गणना करें</span>';
            } else {
                heroTitle.innerText = dict.hero_title;
            }
        }
    }
    
    const heroDesc = document.querySelector('.hero-content p:not(.typing-container)');
    if (heroDesc) heroDesc.innerText = dict.hero_desc;
    
    // Update Card Titles
    for (const [key, val] of Object.entries(dict)) {
        if (key.startsWith('calc_')) {
            const cardId = key.replace('calc_', 'calc-');
            const card = document.getElementById(cardId);
            if (card) {
                const cardHeader = card.querySelector('h3');
                if (cardHeader) cardHeader.innerText = val;
            }
        }
    }
    
    // Save language preference in LocalStorage
    try {
        localStorage.setItem('calculator-lang-preference', activeLang);
    } catch(e) {}
    
    showToast(`Language switched to ${meta.name}`);
}
window.changeLanguage = changeLanguage;

document.addEventListener('click', event => {
    if (!event.target.closest('[data-language-picker]')) {
        closeLanguagePickers();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeLanguagePickers();
    }
});

// Trigger preference load on start
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguagePickers();

    try {
        const savedLang = localStorage.getItem('calculator-lang-preference');
        if (savedLang && LANGUAGE_OPTIONS.some(option => option.code === savedLang)) {
            setTimeout(() => {
                changeLanguage(savedLang);
            }, 100);
        }
    } catch(e) {}
});

