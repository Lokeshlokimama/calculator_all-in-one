// Standalone page content for health widgets that live in tools.html.
// These are general estimates, not medical advice; the widgets carry the site's medical notice.
// Worked examples recalculated independently; keep in sync with script.js.
const hub = { hub: 'health-calculators.html', hubName: 'Health calculators', kicker: 'Health Calculator', appCategory: 'HealthApplication' };
const bmi = ['/bmi-calculator.html', 'BMI Calculator'];

module.exports = [
  {
    ...hub,
    id: 'calc-calorie',
    slug: 'calorie-macro-calculator',
    title: 'Calorie and Macro Calculator | Calories, Carbs, Protein and Fat in Food',
    description: 'Look up calories, carbohydrate, protein and fat for a dish by weight, add several foods and see the running macro split for a meal or a day.',
    h1: 'Calorie and Macro Calculator',
    lede: 'Add the foods in a meal by weight and see the calories and the carbohydrate, protein and fat split, using a built-in food table and the USDA food database.',
    method: 'kcal = 4 × carbs + 4 × protein + 9 × fat',
    toolHeading: 'Add foods',
    labels: { 'food-search': 'Dish or ingredient', 'food-grams': 'Weight (grams)' },
    sections: [
      ['What this calculator does', `<p>Type a dish or ingredient, enter the weight you ate in grams, and add it. The tool finds nutrition values per 100 g, scales them to your portion, and adds the carbohydrate, protein and fat to a running total with a chart of the split. Add several foods to see a whole meal.</p><p>Nutrition values come first from a small built-in table of common dishes, including Indian staples such as roti, dal, rice, idli, dosa and paneer, and otherwise from the US Department of Agriculture&rsquo;s FoodData Central database. Each added item shows which source was used.</p>`, 'intro-card'],
      ['How calories are worked out', `<p>Calories (kcal) = Carbohydrate (g) &times; 4 + Protein (g) &times; 4 + Fat (g) &times; 9</p><p>These are the standard Atwater energy factors used on food labels. Fibre and alcohol are not counted separately.</p>`, 'formula-box'],
      ['Worked example', `<p>Using the built-in values:</p><ul><li>100 g of roti: 45 g carbs, 9 g protein, 1.5 g fat = 45&times;4 + 9&times;4 + 1.5&times;9 = <strong>229.5 kcal</strong></li><li>150 g of cooked white rice: 42 g carbs, 4.05 g protein, 0.45 g fat = <strong>188.25 kcal</strong></li></ul>`, 'example-box'],
      ['How accurate is it?', `<p>Treat the numbers as a reasonable estimate, not a lab measurement. Home-cooked dishes vary a lot with recipe, oil and portion: a roti made with ghee, or dal with a tadka, can carry noticeably more fat than a plain version. Restaurant food is usually richer than home cooking. For packaged foods, the nutrition label on the pack is more accurate than any database. For a fuller list of Indian foods, the Indian Food Composition Tables published by ICMR&ndash;National Institute of Nutrition are the reference source.</p>`],
      ['Tips for useful entries', `<ul><li>Weigh food after cooking if you look up cooked items, such as cooked rice or dal.</li><li>Use simple names: &ldquo;rice&rdquo;, &ldquo;paneer&rdquo;, &ldquo;banana&rdquo;. Very specific dish names may not be found.</li><li>Add cooking oil as its own item if you know roughly how much was used; one tablespoon is about 14 g.</li></ul>`],
      ['Who should be careful', `<p>If you have diabetes, kidney disease or another condition that affects what you eat, or if counting food is causing you stress, talk to a doctor or registered dietitian rather than relying on a calculator. This tool shows general nutrition information, not a diet plan.</p>`],
      ['Privacy', `<p>Your food list stays in this page. When a dish is not in the built-in table, its name is sent to the USDA FoodData Central service to look it up; the weight and your list are not sent. See the privacy policy for details.</p>`]
    ],
    faqs: [
      ['Where do the nutrition values come from?', 'A built-in table of common dishes, then the USDA FoodData Central database for anything else. Each result shows its source.'],
      ['Why is my dish not found?', 'Try a simpler or more common name, or the main ingredient.'],
      ['Are the values for raw or cooked food?', 'It depends on the entry; the name says, for example &ldquo;White Rice (Cooked)&rdquo;. Match how you weighed it.'],
      ['Does it save my food log?', 'No. The list resets when you leave the page.'],
      ['How are calories calculated?', '4 kcal per gram of carbohydrate and protein, and 9 kcal per gram of fat.']
    ],
    related: ['calc-bmr', 'calc-protein', bmi]
  },
  {
    ...hub,
    id: 'calc-bmr',
    slug: 'bmr-calculator',
    title: 'BMR Calculator | Basal Metabolic Rate with the Mifflin-St Jeor Equation',
    description: 'Estimate your basal metabolic rate, the energy your body uses at rest, from age, sex, weight and height using the Mifflin-St Jeor equation.',
    h1: 'BMR Calculator',
    lede: 'Estimate how many calories your body uses at complete rest each day, the starting point for understanding daily energy needs.',
    method: 'Mifflin-St Jeor equation',
    labels: { 'bmr-gender': 'Sex', 'bmr-age': 'Age (years)', 'bmr-weight': 'Weight (kg)', 'bmr-height': 'Height (cm)' },
    sections: [
      ['What this calculator does', `<p>Basal metabolic rate (BMR) is the energy your body needs to keep running at rest: breathing, circulation, temperature and organ function. Enter your sex, age, weight and height and the calculator estimates BMR in kilocalories per day.</p>`, 'intro-card'],
      ['Formula used', `<p>The Mifflin-St Jeor equation (1990), widely used in clinical nutrition:</p><p>Men: BMR = 10 &times; weight (kg) + 6.25 &times; height (cm) &minus; 5 &times; age + 5</p><p>Women: BMR = 10 &times; weight (kg) + 6.25 &times; height (cm) &minus; 5 &times; age &minus; 161</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>A 30-year-old man, 70 kg, 175 cm: 700 + 1,093.75 &minus; 150 + 5 = <strong>1,649 kcal/day</strong> (1,648.75 rounded).</li><li>A 30-year-old woman, 60 kg, 160 cm: 600 + 1,000 &minus; 150 &minus; 161 = <strong>1,289 kcal/day</strong>.</li></ul>`, 'example-box'],
      ['BMR is not your daily calorie need', `<p>You burn more than your BMR every day, because you move, digest food and work. Total daily energy expenditure is often estimated by multiplying BMR by an activity factor: about 1.2 for mostly sitting, rising to about 1.7&ndash;1.9 for very active people. For the man above, a lightly active day (about 1.375) would be roughly 2,270 kcal. These multipliers are rough, and individual needs vary.</p><p>BMR is not a target to eat to. Eating at or below BMR for long periods is not a healthy plan for most people; a doctor or registered dietitian can help if you are trying to change weight.</p>`],
      ['How accurate is it?', `<p>Mifflin-St Jeor is one of the more accurate equations for adults, but it estimates the average for people of your size. Body composition matters: two people with the same weight and height can differ because muscle uses more energy than fat. Some studies suggest these equations can overestimate BMR in some South Asian populations. Treat the result as a starting point. The equation is designed for adults, not children or pregnant women.</p>`],
      ['Understanding each input', `<ul><li><strong>Sex</strong> &mdash; the equation has separate constants for men and women.</li><li><strong>Age</strong> in years, <strong>weight</strong> in kilograms, <strong>height</strong> in centimetres. To convert, 1 inch = 2.54 cm and 1 lb &asymp; 0.454 kg.</li></ul>`]
    ],
    faqs: [
      ['What is a normal BMR?', 'It depends on size, age and sex. Many adult women fall around 1,200&ndash;1,500 kcal/day and many adult men around 1,500&ndash;1,900.'],
      ['Is BMR the same as RMR?', 'They are close. BMR is measured under stricter conditions; RMR is slightly higher. The Mifflin-St Jeor result is often described as resting energy.'],
      ['Why does BMR drop with age?', 'Mostly because muscle mass tends to fall with age, and the equation reflects that with &minus;5 kcal per year.'],
      ['Should I eat my BMR in calories?', 'No. BMR is the energy used at rest. Daily needs are higher once activity is included; ask a professional before restricting intake.'],
      ['Does it work for children?', 'No. It is for adults.']
    ],
    related: ['calc-calorie', 'calc-protein', bmi]
  },
  {
    ...hub,
    id: 'calc-water',
    slug: 'water-intake-calculator',
    title: 'Water Intake Calculator | Rough Daily Fluid Estimate by Weight',
    description: 'Get a rough, weight-based daily fluid estimate adjusted for activity, with the limits of such rules and when to follow medical advice instead.',
    h1: 'Water Intake Calculator',
    lede: 'Get a rough, weight-based starting figure for daily fluids, and understand why your real needs depend on climate, activity and health.',
    method: 'weight × 0.035 L × activity multiplier',
    labels: { 'water-weight': 'Weight (kg)', 'water-activity': 'Activity level' },
    sections: [
      ['What this calculator does', `<p>Enter your weight and choose an activity level. The calculator multiplies weight by 35 ml per kilogram and an activity multiplier to give an illustrative daily fluid amount in litres.</p>`, 'intro-card'],
      ['Formula used', `<p>Fluid (litres) = Weight (kg) &times; 0.035 &times; Activity multiplier</p><p>Multipliers: light activity 1.0, moderate 1.2, high 1.5.</p>`, 'formula-box'],
      ['Worked example', `<p>A 70 kg adult with moderate activity: 70 &times; 0.035 &times; 1.2 = 2.94, shown as <strong>2.9 litres</strong> a day. At light activity the same person gets 2.45, shown as 2.5 litres.</p>`, 'example-box'],
      ['Read this before using the number', `<p>There is no single correct amount of water. Rules of thumb like this one are simple averages. Health authorities give broad ranges instead: the European Food Safety Authority, for example, considers about 2.0 litres a day for women and 2.5 litres for men adequate as <em>total</em> water, which includes the water in food (often 20&ndash;30% of intake). The NHS suggests 6 to 8 glasses of fluid a day for most people in the UK climate.</p><p>Your needs rise in hot and humid weather, which is much of India for much of the year, with physical work or exercise, and with fever, vomiting or diarrhoea. Pale yellow urine is a simple everyday sign of being well hydrated.</p>`],
      ['When not to use this', `<p>Some people are told by their doctor to <strong>limit</strong> fluids, for example with heart failure, some kidney conditions or liver disease. Follow that advice, not this calculator. Pregnant and breastfeeding women, older adults and children also have different needs. Drinking very large amounts quickly can be harmful.</p>`],
      ['What counts as fluid', `<p>Water, milk, buttermilk, tea, coffee, coconut water and soups all count. Fruit and vegetables add more. Sugary drinks add fluid but also a lot of sugar.</p>`]
    ],
    faqs: [
      ['How much water should I drink a day?', 'It varies. This tool gives a rough weight-based figure; general guidance for adults is around 2&ndash;2.5 litres of total water a day, more in heat or with activity.'],
      ['Do tea and coffee count?', 'Yes. Moderate amounts of tea and coffee count towards fluid intake.'],
      ['Does food count towards water intake?', 'Yes. Food supplies a meaningful share of total water, which this simple rule does not separate.'],
      ['I have a kidney or heart condition. Should I use this?', 'No. Follow your doctor&rsquo;s advice on fluids.'],
      ['Can you drink too much water?', 'Yes. Very large amounts in a short time can lower blood sodium dangerously. Spread intake through the day.']
    ],
    related: ['calc-protein', 'calc-bmr', bmi]
  },
  {
    ...hub,
    id: 'calc-ideal-weight',
    slug: 'ideal-weight-calculator',
    title: 'Ideal Weight Calculator | Devine Formula Reference Weight from Height',
    description: 'Calculate the Devine formula reference weight for your height, and see how it compares with a healthy BMI range and why it is not a target.',
    h1: 'Ideal Weight Calculator (Devine Formula)',
    lede: 'Calculate the Devine reference weight for your height, a figure doctors use for medication dosing, and see how it relates to a healthy weight range.',
    method: 'Devine (1974) formula',
    labels: { 'iw-gender': 'Sex', 'iw-height': 'Height', 'iw-height-unit': 'Height unit' },
    sections: [
      ['What this calculator does', `<p>Enter your sex and height in centimetres or inches. The calculator returns a single reference weight from the Devine formula. Despite the common name &ldquo;ideal weight&rdquo;, this is a historical reference value, not a personal goal.</p>`, 'intro-card'],
      ['Formula used', `<p>Men: 50 kg + 2.3 kg for every inch over 5 feet</p><p>Women: 45.5 kg + 2.3 kg for every inch over 5 feet</p><p>Height in centimetres is converted with 1 inch = 2.54 cm. Heights of 5 feet (152.4 cm) or less return the base value.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>A man 175 cm tall is 68.9 inches, 8.9 inches over 5 feet: 50 + 2.3 &times; 8.9 = <strong>70.5 kg</strong>.</li><li>A woman 160 cm tall is 63.0 inches, 3.0 inches over 5 feet: 45.5 + 2.3 &times; 3.0 = <strong>52.4 kg</strong>.</li></ul>`, 'example-box'],
      ['What the Devine formula is actually for', `<p>Dr Ben Devine published this formula in 1974 to estimate body size for dosing certain medicines. It was never derived from studies of health outcomes, and it gives one number rather than a range. Many people are perfectly healthy well above or below it, and muscular people often weigh more.</p><p>For a health-oriented view, a BMI range is more useful. For adults of South Asian origin, Indian guidelines and the WHO suggest a lower healthy BMI cut-off of about 23 rather than 25, because health risks start at lower body weight. For the 175 cm man above, a BMI of 18.5&ndash;23 corresponds to about 57&ndash;70 kg. Waist size is another useful measure of health risk.</p>`],
      ['Limitations', `<p>Not for children, pregnancy, or heights below 5 feet, where the formula was not designed to be used. It ignores frame size, muscle and age. If you are concerned about your weight, a doctor can assess it properly.</p>`],
      ['Common mistakes', `<ul><li>Treating the result as a target to reach.</li><li>Rounding height to whole inches before calculating, which changes the result by up to about 1 kg.</li><li>Entering centimetres with the unit set to inches.</li></ul>`]
    ],
    faqs: [
      ['Is the Devine ideal weight accurate?', 'It is a consistent reference formula, mainly for medication dosing. It is not a measure of what is healthy for you.'],
      ['What is a healthy weight range for my height?', 'Use the BMI calculator. For South Asian adults, a BMI of 18.5 to about 23 is commonly recommended.'],
      ['Why is the result the same for very short people?', 'The formula starts at 5 feet; at or below that it returns the base value.'],
      ['Are there other ideal weight formulas?', 'Yes, including Robinson, Miller and Hamwi. They give slightly different single values and share the same limitations.'],
      ['Can I use inches?', 'Yes. Choose inches from the unit menu.']
    ],
    related: [bmi, 'calc-body-fat', 'calc-bmr']
  },
  {
    ...hub,
    id: 'calc-protein',
    slug: 'protein-intake-calculator',
    title: 'Protein Intake Calculator | Daily Protein in Grams by Body Weight',
    description: 'Estimate daily protein in grams from body weight and activity level, using common grams-per-kilogram ranges, with notes for Indian diets.',
    h1: 'Protein Intake Calculator',
    lede: 'Estimate a daily protein figure in grams from your weight and activity level, and see how it compares with dietary guidelines.',
    method: 'weight × grams per kilogram',
    labels: { 'protein-weight': 'Weight (kg)', 'protein-goal': 'Activity or goal' },
    sections: [
      ['What this calculator does', `<p>Enter your body weight and choose an activity level or goal. The calculator multiplies your weight by a grams-per-kilogram figure to give an illustrative daily protein amount.</p>`, 'intro-card'],
      ['Formula used', `<p>Protein (g/day) = Weight (kg) &times; Ratio (g/kg)</p><p>Ratios offered: sedentary 0.8, active 1.2, building muscle 1.6, heavy lifting 2.0.</p>`, 'formula-box'],
      ['Worked example', `<p>A 70 kg adult:</p><ul><li>Sedentary: 70 &times; 0.8 = <strong>56 g</strong></li><li>Active: 70 &times; 1.2 = <strong>84 g</strong></li><li>Building muscle: 70 &times; 1.6 = <strong>112 g</strong></li></ul>`, 'example-box'],
      ['Where these numbers come from', `<p>The 0.8 g/kg figure is close to the general recommended dietary allowance for healthy adults; ICMR&ndash;NIN&rsquo;s 2020 recommendations for Indians use about 0.83 g/kg. Higher figures of 1.2&ndash;2.0 g/kg are commonly used in sports nutrition for people doing regular endurance or strength training. Above about 1.6 g/kg, studies show little extra benefit for muscle gain for most people.</p>`],
      ['Meeting it on an Indian diet', `<p>Surveys suggest many Indian diets are high in cereals and fall short on protein. Common sources and approximate protein content:</p><ul><li>Cooked dal, 1 katori (about 150 g): 7&ndash;9 g</li><li>Paneer, 100 g: about 18 g</li><li>Curd, 200 g: about 6&ndash;8 g</li><li>Eggs, 1 large: about 6 g</li><li>Chicken, 100 g cooked: about 25&ndash;30 g</li><li>Soya chunks, 30 g dry: about 15 g</li><li>Roasted chana, 30 g: about 6 g</li></ul><p>Spreading protein across meals is generally recommended.</p>`],
      ['Who should check with a doctor', `<p>People with kidney disease are often advised to limit protein, and pregnant or breastfeeding women, older adults and people recovering from illness may need different amounts. Follow medical advice if it differs from this estimate.</p>`]
    ],
    faqs: [
      ['How much protein do I need a day?', 'Many healthy adults need about 0.8 g per kg of body weight; active people often aim for 1.2&ndash;1.6 g/kg.'],
      ['Should I use my current or target weight?', 'Most guidance uses current weight for people in a healthy range. People with high body fat sometimes use a reference weight; a dietitian can advise.'],
      ['Is too much protein harmful?', 'For healthy people moderate excess is generally considered safe, but people with kidney disease should follow medical advice.'],
      ['Can vegetarians get enough protein?', 'Yes, by combining dals, dairy, soya, nuts and seeds, and including a protein source at each meal.'],
      ['Do I need protein supplements?', 'Not usually. Most people can meet their needs from food.']
    ],
    related: ['calc-calorie', 'calc-bmr', 'calc-water']
  },
  {
    ...hub,
    id: 'calc-body-fat',
    slug: 'body-fat-calculator',
    title: 'Body Fat Calculator | US Navy Tape Measure Method',
    description: 'Estimate body fat percentage from height, neck, waist and (for women) hip measurements using the US Navy circumference method.',
    h1: 'Body Fat Calculator (US Navy Method)',
    lede: 'Estimate your body fat percentage with just a measuring tape, using the circumference method developed for the US Navy.',
    method: 'US Navy circumference equations',
    labels: { 'bf-gender': 'Sex', 'bf-height': 'Height (cm)', 'bf-neck': 'Neck (cm)', 'bf-waist': 'Waist (cm)', 'bf-hip': 'Hip (cm)' },
    sections: [
      ['What this calculator does', `<p>Enter your sex, height and body measurements in centimetres. Women also enter hip circumference. The calculator estimates the percentage of your body weight that is fat.</p>`, 'intro-card'],
      ['Formula used', `<p>Developed by Hodgdon and Beckett for the US Navy, using measurements in centimetres:</p><p>Men: Body fat % = 495 &divide; (1.0324 &minus; 0.19077 &times; log<sub>10</sub>(waist &minus; neck) + 0.15456 &times; log<sub>10</sub>(height)) &minus; 450</p><p>Women: Body fat % = 495 &divide; (1.29579 &minus; 0.35004 &times; log<sub>10</sub>(waist + hip &minus; neck) + 0.22100 &times; log<sub>10</sub>(height)) &minus; 450</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>Man, 175 cm tall, neck 38 cm, waist 88 cm: about <strong>19.2%</strong>.</li><li>Woman, 162 cm tall, neck 32 cm, waist 76 cm, hip 98 cm: about <strong>30.3%</strong>.</li></ul>`, 'example-box'],
      ['How to measure', `<ul><li><strong>Neck</strong>: just below the larynx (Adam&rsquo;s apple), tape sloping slightly down at the front.</li><li><strong>Waist</strong>: men at the navel; women at the narrowest point of the waist. Relax and breathe out normally; do not pull in.</li><li><strong>Hip</strong> (women): around the widest part of the buttocks.</li><li>Keep the tape level and snug but not compressing the skin. Measure twice and use the average.</li></ul>`],
      ['How accurate is it?', `<p>Tape-based methods are estimates. Compared with lab methods such as DEXA scans, the Navy method is often within a few percentage points for many people, but errors can be larger for very lean, very muscular or higher-weight people. A 1 cm change in waist measurement moves the result noticeably, so measuring consistently matters more than the exact number. It is most useful for tracking change over time.</p>`],
      ['Putting the number in context', `<p>Healthy body fat ranges depend on age and sex; women naturally carry more essential fat than men. Rather than chasing a specific percentage, many clinicians watch waist circumference, because fat around the abdomen is linked with diabetes and heart disease risk. Indian guidelines flag a waist above about 90 cm for men and 80 cm for women as higher risk.</p>`]
    ],
    faqs: [
      ['Is the Navy body fat method accurate?', 'It is a reasonable estimate for many people, often within a few percentage points, but less reliable for very muscular or very lean people.'],
      ['Why do women need a hip measurement?', 'The women&rsquo;s equation was developed with hip circumference because fat distribution differs between sexes.'],
      ['Can I use inches?', 'Convert to centimetres first: inches &times; 2.54.'],
      ['Why does the result say Error?', 'The measurements are outside what the formula can use, often because the waist is not larger than the neck. Re-measure.'],
      ['How often should I measure?', 'Every few weeks under the same conditions is enough to see trends.']
    ],
    related: [bmi, 'calc-ideal-weight', 'calc-bmr']
  },
  {
    ...hub,
    id: 'calc-due-date',
    slug: 'pregnancy-due-date-calculator',
    title: 'Pregnancy Due Date Calculator | Estimated Due Date from Last Period',
    description: 'Estimate the pregnancy due date, conception date, current weeks and trimester from the first day of your last period and your cycle length.',
    h1: 'Pregnancy Due Date Calculator',
    lede: 'Estimate your due date from the first day of your last menstrual period, adjusted for your usual cycle length.',
    method: 'Naegele’s rule with cycle-length adjustment',
    labels: { 'due-lmp': 'First day of last menstrual period', 'due-cycle': 'Usual cycle length (days)' },
    sections: [
      ['What this calculator does', `<p>Enter the first day of your last menstrual period (LMP) and your usual cycle length. The calculator estimates your due date, an approximate conception date, how many weeks and days pregnant you are today, and your current trimester.</p>`, 'intro-card'],
      ['How it is calculated', `<p>Due date = LMP + 280 days + (cycle length &minus; 28)</p><p>Approximate conception = LMP + (cycle length &minus; 14) days</p><p>This is Naegele&rsquo;s rule, which assumes a 40-week pregnancy counted from the start of the last period, with an adjustment for cycles longer or shorter than 28 days. Pregnancy weeks are counted from the LMP, so you are considered about 2 weeks pregnant at conception.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>LMP 1 January 2026, 28-day cycle: due date <strong>8 October 2026</strong>, conception around 15 January.</li><li>Same LMP, 32-day cycle: due date <strong>12 October 2026</strong>, conception around 19 January.</li></ul>`, 'example-box'],
      ['How reliable is a due date?', `<p>A due date is an estimate. Only a small share of babies arrive on the exact day; most are born within about two weeks either side. An early ultrasound, ideally in the first trimester, is usually more accurate than LMP dating, especially if your cycles are irregular or you are unsure of the date. If your scan gives a different date, your doctor or midwife will normally use the scan date.</p>`],
      ['Trimesters', `<ul><li>First trimester: weeks 1 to 12</li><li>Second trimester: weeks 13 to 27</li><li>Third trimester: week 28 until birth</li></ul>`],
      ['Limitations', `<p>The calculation does not suit pregnancies after IVF or other fertility treatment, where the transfer date gives a more accurate estimate, or very irregular cycles. Cycle lengths from 20 to 45 days are accepted. This tool gives general information only; antenatal care with a qualified doctor or midwife is important throughout pregnancy.</p>`]
    ],
    faqs: [
      ['How is the due date calculated?', 'By adding 280 days to the first day of your last period, adjusted for cycles that are not 28 days long.'],
      ['Why does pregnancy count from my last period, not conception?', 'The LMP is usually known, while conception is not. By convention, pregnancy is dated from the LMP.'],
      ['Is an ultrasound due date more accurate?', 'Usually yes, especially an early scan. Doctors often update the due date after the first-trimester scan.'],
      ['Can I use this after IVF?', 'Not accurately. Your clinic will calculate the due date from the embryo transfer date.'],
      ['Is my data stored?', 'No. The dates are used only in your browser to show the result.']
    ],
    related: [['/age-calculator.html', 'Age Calculator'], 'calc-date-diff', 'calc-water']
  }
];
