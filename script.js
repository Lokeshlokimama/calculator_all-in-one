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

function initFoodSelect() {
    const select = document.getElementById('food-select');
    if (!select) return;

    const groups = {};
    for (const [id, food] of Object.entries(foodDatabase)) {
        if (!groups[food.category]) groups[food.category] = [];
        groups[food.category].push({ id, name: food.name });
    }

    for (const [category, foods] of Object.entries(groups)) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;
        foods.forEach(f => {
            const option = document.createElement('option');
            option.value = f.id;
            option.textContent = f.name;
            optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
    }
}
// Init immediately since script is loaded at the end of the body
initFoodSelect();

let totalMacros = { carbs: 0, protein: 0, fat: 0 };

function addFood() {
    const select = document.getElementById('food-select');
    const gramsInput = document.getElementById('food-grams');
    const foodId = select.value;
    const grams = parseFloat(gramsInput.value);

    if (!foodId || !grams || grams <= 0) {
        showToast('Please select a food and enter a valid weight.');
        return;
    }

    const food = foodDatabase[foodId];
    const multiplier = grams / 100;

    const addedCarbs = food.carbs * multiplier;
    const addedProtein = food.protein * multiplier;
    const addedFat = food.fat * multiplier;

    totalMacros.carbs += addedCarbs;
    totalMacros.protein += addedProtein;
    totalMacros.fat += addedFat;

    // Add to UI list
    const foodList = document.getElementById('food-list');
    const item = document.createElement('div');
    item.className = 'food-item reveal-text';

    item.innerHTML = `
        <span>${food.name} (${grams}g)</span>
        <span style="color:#a3a3a3">${Math.round(addedCarbs)}C | ${Math.round(addedProtein)}P | ${Math.round(addedFat)}F</span>
    `;
    foodList.appendChild(item);

    // Trigger reveal animation
    setTimeout(() => item.classList.add('active'), 50);

    updateMacroBars();
    showToast(`Added ${grams}g of ${food.name}!`);

    // Reset inputs
    select.value = '';
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
function filterCategory(category, sourceEvent) {
    if (sourceEvent) sourceEvent.preventDefault();

    const toolsSection = document.getElementById('tools');
    const grid = document.querySelector('.tools-grid');
    const isAll = category === 'all';

    document.querySelectorAll('[data-category-link]').forEach(link => {
        link.classList.toggle('active', link.dataset.categoryLink === category);
    });

    document.querySelectorAll('.ad-inline').forEach(ad => {
        ad.classList.toggle('filter-hidden', !isAll);
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

    if (sourceEvent && toolsSection && !toolsSection.contains(sourceEvent.currentTarget)) {
        toolsSection.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
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

async function calcCurrency() {
    const amt = parseFloat(document.getElementById('curr-amount').value);
    const from = document.getElementById('curr-from').value;
    const to = document.getElementById('curr-to').value;
    const btn = document.getElementById('curr-btn');

    if (!amt) { showToast('Please enter amount'); return; }

    btn.innerText = "Fetching...";
    try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await res.json();
        const rate = data.rates[to];
        const result = amt * rate;
        document.getElementById('curr-result').innerText = result.toFixed(2);
        showToast('Converted Successfully!');
    } catch (e) {
        document.getElementById('curr-result').innerText = 'Error';
        showToast('API fetch failed');
    }
    btn.innerText = "Convert";
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
    { id: 'calc-pass', category: 'web', icon: '🔒', title: 'Password', desc: 'Generator' }
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
        body: "<p>We value your privacy. We do not store or share your personal data. All calculations are performed directly in your browser. Google Analytics or AdSense may collect standard usage data in accordance with their policies.</p>"
    },
    terms: {
        title: "Terms & Conditions",
        body: "<p>By using this website, you agree to these terms. The tools provided here are for informational purposes only and should not be considered professional financial or medical advice.</p>"
    },
    refund: {
        title: "Refund Policy",
        body: "<p>As this is a free digital tool platform, any voluntary donations made to support the site are final and non-refundable.</p>"
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
        title: "Enjoying the Calculators?",
        body: `<div style="text-align:center;">
                 <p style="margin-bottom: 1.5rem;">If you find these free tools helpful, kindly support us so we can keep the servers running and add more features!</p>
                 <a href="${razorpayPaymentLink}" target="_blank" rel="noopener noreferrer" class="glowing-btn demo-btn ripple-btn" style="padding: 0.8rem 1.5rem; width: auto; margin: 0.5rem; text-decoration: none; display: inline-block;">Donate via Razorpay</a>
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
    if (['all', 'basic', 'finance', 'health', 'education', 'web'].includes(initialCategory)) {
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
