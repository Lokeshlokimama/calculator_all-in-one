// Ensure animations respect reduced motion settings
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Typing Effect for Hero Subtitle
const typingTextElement = document.querySelector('.typing-text');
const words = ["smooth scroll.", "interactive cards.", "glowing buttons.", "premium aesthetics."];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;

function typeEffect() {
    if (prefersReducedMotion) {
        typingTextElement.textContent = "fluid animations.";
        document.querySelector('.cursor').style.display = 'none';
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
setTimeout(typeEffect, 1000);

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
if (!prefersReducedMotion) {
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
        const bar = document.getElementById('bmi-progress');
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = '65%'; }, 100);
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

// --- EMI Calculator ---
function formatReadableAmount(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue <= 0) return 'Rs 0';

    return 'Rs ' + Math.round(numberValue).toLocaleString('en-IN');
}

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
        showToast('Please enter loan amount');
        return;
    }
    if (annualRate === null || Number.isNaN(annualRate) || annualRate < 0) {
        showToast('Please enter interest rate');
        return;
    }
    if (!months || months <= 0) {
        showToast('Please enter tenure in months');
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

    document.getElementById('emi-monthly-result').innerText = formatReadableAmount(emi);
    document.getElementById('emi-interest-result').innerText = formatReadableAmount(totalInterest);
    document.getElementById('emi-total-result').innerText = formatReadableAmount(totalPayable);
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

    qrImage.onload = () => {
        qrPrompt.style.display = 'none';
        qrImage.style.display = 'block';
        qrContainer.style.background = '#fff';
        qrContainer.style.border = 'none';
        showToast('QR Code Generated!');
    };

    qrImage.onerror = () => {
        qrPrompt.innerText = 'Error';
        showToast('Failed to generate QR. Check connection.');
    };

    qrImage.src = qrUrl;
}
window.generateRealQR = generateRealQR;

// --- Category Filtering ---
function scrollToVisibleCalculator(category) {
    const selector = category === 'all'
        ? '.tool-demo-card:not(.hidden)'
        : `.tool-demo-card[data-category="${category}"]:not(.hidden)`;
    const target = document.querySelector(selector) || document.getElementById('tools');

    if (!target) return;

    window.requestAnimationFrame(() => {
        const navbar = document.querySelector('.navbar');
        const offset = (navbar?.offsetHeight || 0) + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
            top: Math.max(0, top),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });
}

function filterCategory(category, sourceEvent) {
    if (sourceEvent) sourceEvent.preventDefault();

    const grid = document.querySelector('.tools-grid');
    const isAll = category === 'all';

    document.querySelectorAll('[data-category-link]').forEach(link => {
        link.classList.toggle('active', link.dataset.categoryLink === category);
    });

    grid?.classList.toggle('is-filtered', !isAll);

    document.querySelectorAll('.tool-demo-card').forEach((card, index) => {
        const shouldShow = isAll || card.dataset.category === category;
        card.classList.toggle('hidden', !shouldShow);
        card.setAttribute('aria-hidden', String(!shouldShow));

        if (shouldShow) {
            card.style.transitionDelay = prefersReducedMotion ? '0s' : `${Math.min(index, 8) * 0.04}s`;
            setTimeout(() => card.classList.add('active'), 10);
        } else {
            card.style.transitionDelay = '0s';
            card.classList.remove('active');
        }
    });

    if (sourceEvent) {
        scrollToVisibleCalculator(category);
    }
}
window.filterCategory = filterCategory;

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

function calcIdealWeight() {
    const g = document.getElementById('iw-gender').value;
    const h = parseFloat(document.getElementById('iw-height').value);
    if (!h) { showToast('Please enter height'); return; }

    const baseWeight = g === 'm' ? 50 : 45.5;
    const extraInches = (h / 2.54) - 60;

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
    const r = parseFloat(document.getElementById('sip-rate').value) / 100 / 12;
    const n = parseFloat(document.getElementById('sip-years').value) * 12;
    if (!P || !r || !n) { showToast('Please enter all values'); return; }

    const M = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    document.getElementById('sip-result').innerText = '₹ ' + Math.round(M).toLocaleString('en-IN');
    showToast('SIP Calculated!');
}
window.calcSIP = calcSIP;

function calcFD() {
    const P = parseFloat(document.getElementById('fd-principal').value);
    let r = parseFloat(document.getElementById('fd-rate').value);
    const citizenBump = parseFloat(document.getElementById('fd-citizen').value);
    const t = parseFloat(document.getElementById('fd-years').value);

    if (!P || !r || !t) { showToast('Please enter all values'); return; }

    r = (r + citizenBump) / 100;
    const n = 4; // Quarterly compounding
    const A = P * Math.pow((1 + r / n), n * t);

    document.getElementById('fd-result').innerText = '₹ ' + Math.round(A).toLocaleString('en-IN');
    showToast('FD/SB Calculated!');
}
window.calcFD = calcFD;

function calcRD() {
    const P = parseFloat(document.getElementById('rd-monthly').value);
    const r = parseFloat(document.getElementById('rd-rate').value) / 100;
    const n = parseFloat(document.getElementById('rd-months').value);

    if (!P || !r || !n) { showToast('Please enter all values'); return; }

    const maturity = P * n + P * (n * (n + 1) / 2) * (r / 12);
    document.getElementById('rd-result').innerText = '₹ ' + Math.round(maturity).toLocaleString('en-IN');
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

    document.getElementById('gst-result').innerText = '₹ ' + result.toFixed(2).toLocaleString('en-IN');
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

    document.getElementById('sal-result').innerText = '₹ ' + Math.round(inHand).toLocaleString('en-IN') + ' / month';
    showToast('Salary Estimated!');
}
window.calcSalary = calcSalary;

function calcLeave() {
    const basic = parseFloat(document.getElementById('leave-basic').value);
    const days = parseFloat(document.getElementById('leave-days').value);
    if (!basic || !days) { showToast('Please enter all values'); return; }

    const dailyWage = basic / 30;
    const result = dailyWage * days;
    document.getElementById('leave-result').innerText = '₹ ' + Math.round(result).toLocaleString('en-IN');
    showToast('Leave Encashment Calculated!');
}
window.calcLeave = calcLeave;

const CURRENCY_API_BASE = 'https://open.er-api.com/v6/latest';
const CURRENCY_CACHE_PREFIX = 'daily-needs-currency-rates-';
const CURRENCY_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const currencyRateMemoryCache = new Map();

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
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
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
    const text = input.value;
    if (!text) { showToast('Enter some text first'); return; }

    let result = '';
    switch (type) {
        case 'upper': result = text.toUpperCase(); break;
        case 'lower': result = text.toLowerCase(); break;
        case 'title': result = text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); break;
        case 'camel': result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); break;
    }
    input.value = result;
    showToast('Case converted!');
}
window.convertCase = convertCase;

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

    document.getElementById('dt-result').innerText = '₹ ' + finalPrice.toFixed(2).toLocaleString('en-IN');
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
    return Number(value.toFixed(digits)).toLocaleString('en-IN', {
        maximumFractionDigits: digits
    });
}

function formatRupees(value) {
    return 'Rs ' + formatCalcNumber(value, 2);
}

function requirePositiveInputs(fields) {
    const values = {};

    for (const field of fields) {
        const value = readCalcNumber(field.id);
        if (value === null || value <= 0) {
            showToast(`Please enter valid ${field.label}`);
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

function calcElectricityBill() {
    const values = requirePositiveInputs([
        { id: 'bill-units', label: 'units/kWh' },
        { id: 'bill-rate', label: 'rate' }
    ]);
    if (!values) return;

    const bill = values['bill-units'] * values['bill-rate'];
    setResultText('bill-result', formatRupees(bill), 'Electricity bill calculated');
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
    setResultText('ev-result', formatRupees(cost), 'EV charging cost calculated');
}
window.calcEvChargingCost = calcEvChargingCost;

// Global triggerTool for inline onclick handlers
window.triggerTool = triggerTool;

// Scroll to specific calculator from hero
function scrollToCalc(id, category) {
    // 1. Filter to the correct category first so it's visible
    filterCategory(category);

    // 2. Wait a tiny bit for the DOM filter to apply, then scroll
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
            // Scroll it into the center of the viewport
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

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

// Database of calculators to show in hero floating cards
const heroToolsDatabase = [
    { id: 'calc-sip', category: 'finance', icon: '📈', title: 'SIP', desc: 'Wealth Planner' },
    { id: 'calc-sw', category: 'web', icon: '⏱️', title: 'Stopwatch', desc: 'Track Tasks' },
    { id: 'calc-cgpa', category: 'education', icon: '🎓', title: 'CGPA / SGPA', desc: 'Grade Tracker' },
    { id: 'calc-curr', category: 'finance', icon: '💱', title: 'Currency', desc: 'Live Rates' },
    { id: 'calc-word', category: 'web', icon: '📝', title: 'Word Count', desc: 'Text Analysis' },
    { id: 'calc-bmi', category: 'health', icon: '🥗', title: 'Body Fat', desc: 'Health Stats' },
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
                 <div style="width: 150px; height: 150px; background: #fff; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <span style="color:#000; font-weight:bold;">UPI QR Code</span>
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
                 <p style="margin-bottom: 1.5rem;">Calculator All-in-One is a free online utility platform for educational/productivity tools. Support helps maintain hosting/API costs and future improvements.</p>
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

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initHeroFloatingCards();

    const initialCategory = new URLSearchParams(window.location.search).get('category');
    if (['all', 'basic', 'finance', 'electricity', 'health', 'education', 'web'].includes(initialCategory)) {
        filterCategory(initialCategory);
    }

    if (new URLSearchParams(window.location.search).get('preview') === 'support') {
        setTimeout(() => {
            document.getElementById('support-ad')?.scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 50);
    }

    setTimeout(() => {
        openFooterModal('donate');
    }, 700);
});
