const header = document.querySelector("[data-header]");
const typingText = document.querySelector("#typingText");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const toastRegion = document.querySelector(".toast-region");

const phrases = [
  "Daily needs calculators",
  "No login. No clutter.",
  "Calories, BMI, EMI, food nutrition",
  "Fast results with premium motion"
];

const foodData = {
  banana: { name: "Banana", serving: "medium serving", calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  rice: { name: "Cooked rice", serving: "1 cup", calories: 205, protein: 4.3, carbs: 45, fat: 0.4 },
  egg: { name: "Boiled egg", serving: "1 large egg", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  chicken: { name: "Chicken breast", serving: "100g cooked", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  oats: { name: "Oats", serving: "40g dry", calories: 150, protein: 5, carbs: 27, fat: 3 },
  paneer: { name: "Paneer", serving: "100g", calories: 265, protein: 18, carbs: 6, fat: 20 },
  almonds: { name: "Almonds", serving: "28g handful", calories: 164, protein: 6, carbs: 6, fat: 14 },
  dal: { name: "Dal", serving: "1 cup cooked", calories: 230, protein: 14, carbs: 40, fat: 1 }
};

let phraseIndex = 0;
let letterIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typingText) return;

  const current = phrases[phraseIndex];
  typingText.textContent = current.slice(0, letterIndex);

  if (!deleting && letterIndex < current.length) {
    letterIndex += 1;
  } else if (deleting && letterIndex > 0) {
    letterIndex -= 1;
  } else if (!deleting) {
    deleting = true;
    window.setTimeout(typeLoop, 1300);
    return;
  } else {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }

  window.setTimeout(typeLoop, deleting ? 35 : 62);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastRegion.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function animateResult(element) {
  if (!element) return;
  element.classList.remove("is-fresh");
  void element.offsetWidth;
  element.classList.add("is-fresh");
}

function copyText(value, fallbackMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value).then(() => showToast(fallbackMessage));
  } else {
    showToast(fallbackMessage);
  }
}

function countUp(counter) {
  const target = Number(counter.dataset.count);
  const isInstant = target === 1;
  const isZero = target === 0;
  const suffix = counter.dataset.suffix ?? (counter.parentElement?.textContent?.includes("%") ? "%" : "");
  const duration = 1100;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    counter.textContent = isInstant ? "Instant" : isZero ? "No" : `${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      if (entry.target.classList.contains("counter-row")) {
        counters.forEach((counter) => countUp(counter));
      }
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 14);
});

typeLoop();

document.querySelectorAll("[data-tool-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.toolJump);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

document.querySelector("#calcButton")?.addEventListener("click", () => {
  const input = document.querySelector("#calcInput");
  const result = document.querySelector("#calcResult strong");
  const wrapper = document.querySelector("#calcResult");
  const expression = input.value.trim();

  if (!/^[\d+\-*/().\s]+$/.test(expression)) {
    showToast("Use numbers and basic operators only.");
    return;
  }

  try {
    const value = Function(`"use strict"; return (${expression})`)();
    result.textContent = Number.isFinite(value) ? Number(value.toFixed(4)).toLocaleString("en-IN") : "Invalid";
    animateResult(wrapper);
  } catch {
    result.textContent = "Invalid";
    animateResult(wrapper);
  }
});

document.querySelector("#qrButton")?.addEventListener("click", () => {
  const qr = document.querySelector("#qrResult .qr-large");
  const source = document.querySelector("#qrInput").value || "Daily Needs Calculator";
  [...qr.children].forEach((cell, index) => {
    const code = source.charCodeAt(index % source.length) || index;
    cell.style.opacity = code % 3 === 0 ? "0.28" : "1";
  });
  animateResult(document.querySelector("#qrResult"));
  showToast("QR generated successfully.");
});

document.querySelector("#waButton")?.addEventListener("click", () => {
  const phone = document.querySelector("#phoneInput").value.replace(/\D/g, "");
  const message = encodeURIComponent(document.querySelector("#messageInput").value.trim());
  const link = `https://wa.me/${phone}?text=${message}`;
  document.querySelector("#waResult strong").textContent = `wa.me/${phone}`;
  animateResult(document.querySelector("#waResult"));
  copyText(link, "WhatsApp link copied.");
});

document.querySelector("#passwordButton")?.addEventListener("click", () => {
  const words = ["Flow", "Vista", "Prime", "Nova", "Spark", "Pulse"];
  const symbols = ["#", "@", "$", "%"];
  const password = `${words[Math.floor(Math.random() * words.length)]}-${Math.floor(10 + Math.random() * 89)}${symbols[Math.floor(Math.random() * symbols.length)]}${words[Math.floor(Math.random() * words.length)]}`;
  document.querySelector("#passwordResult strong").textContent = password;
  animateResult(document.querySelector("#passwordResult"));
  copyText(password, "Password generated and copied.");
});

document.querySelector("#emiButton")?.addEventListener("click", () => {
  const amount = Number(document.querySelector("#loanAmount").value);
  const rate = Number(document.querySelector("#loanRate").value) / 12 / 100;
  const months = Number(document.querySelector("#loanYears").value) * 12;
  const emi = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  const total = emi * months;
  const interest = Math.max(total - amount, 0);
  const principalShare = Math.round((amount / total) * 100) || 0;
  const interestShare = Math.max(100 - principalShare, 0);

  document.querySelector("#emiResult strong").textContent = `Rs ${Math.round(emi).toLocaleString("en-IN")}`;
  const bars = document.querySelectorAll("#emiResult .split-bars span");
  bars[0].style.setProperty("--bar", `${principalShare}%`);
  bars[0].textContent = `Principal ${principalShare}%`;
  bars[1].style.setProperty("--bar", `${interestShare}%`);
  bars[1].textContent = `Interest ${interestShare}%`;
  animateResult(document.querySelector("#emiResult"));
  showToast("EMI calculated.");
});

document.querySelector("#calorieButton")?.addEventListener("click", () => {
  const age = Number(document.querySelector("#calorieAge").value);
  const weight = Number(document.querySelector("#calorieWeight").value);
  const height = Number(document.querySelector("#calorieHeight").value);
  const activity = Number(document.querySelector("#activityLevel").value);
  const sex = document.querySelector("#calorieSex").value;
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === "female" ? -161 : 5);
  const calories = Math.max(0, Math.round(bmr * activity));
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.45) / 4);
  const fats = Math.round((calories * 0.25) / 9);
  const bars = document.querySelectorAll("#calorieResult .split-bars span");

  document.querySelector("#calorieResult strong").textContent = `${calories.toLocaleString("en-IN")} kcal/day`;
  bars[0].textContent = `Protein ${protein}g`;
  bars[1].textContent = `Carbs ${carbs}g`;
  bars[2].textContent = `Fats ${fats}g`;
  animateResult(document.querySelector("#calorieResult"));
  showToast("Calories calculated.");
});

document.querySelector("#burnButton")?.addEventListener("click", () => {
  const weight = Number(document.querySelector("#burnWeight").value);
  const minutes = Number(document.querySelector("#burnMinutes").value);
  const met = Number(document.querySelector("#burnActivity").value);
  const calories = Math.max(0, Math.round((met * 3.5 * weight * minutes) / 200));
  const intensity = met < 4 ? "Light" : met < 7 ? "Moderate" : met < 9 ? "High" : "Very high";
  const width = Math.max(14, Math.min(94, met * 9));

  document.querySelector("#burnResult strong").textContent = `${calories.toLocaleString("en-IN")} kcal`;
  document.querySelector("#burnResult .bmi-track span").style.width = `${width}%`;
  document.querySelector("#burnResult > span").textContent = `${intensity} intensity estimate`;
  animateResult(document.querySelector("#burnResult"));
  showToast("Calories burned calculated.");
});

function updateFoodNutrition() {
  const selected = document.querySelector("#foodSelect").value;
  const item = foodData[selected] ?? foodData.banana;
  const facts = document.querySelectorAll("#foodResult .nutrition-facts span");

  document.querySelector("#foodResult small").textContent = `${item.name} per ${item.serving}`;
  document.querySelector("#foodResult strong").textContent = `${item.calories} kcal`;
  facts[0].textContent = `Protein ${item.protein}g`;
  facts[1].textContent = `Carbs ${item.carbs}g`;
  facts[2].textContent = `Fat ${item.fat}g`;
  animateResult(document.querySelector("#foodResult"));
}

document.querySelector("#foodButton")?.addEventListener("click", () => {
  updateFoodNutrition();
  showToast("Food nutrition loaded.");
});

document.querySelector("#foodSelect")?.addEventListener("change", updateFoodNutrition);

document.querySelector("#bmiButton")?.addEventListener("click", () => {
  const heightCm = Number(document.querySelector("#heightInput").value);
  const weight = Number(document.querySelector("#weightInput").value);
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "High";
  const progress = Math.max(12, Math.min(92, ((bmi - 14) / 26) * 100));

  document.querySelector("#bmiResult strong").textContent = `${bmi.toFixed(1)} ${label}`;
  document.querySelector("#bmiResult .bmi-track span").style.width = `${progress}%`;
  animateResult(document.querySelector("#bmiResult"));
  showToast("BMI calculated.");
});

document.querySelectorAll(".accordion-button").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    panel.classList.toggle("open", !isOpen);
  });
});
