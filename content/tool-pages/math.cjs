// Standalone page content for math, education and geometry widgets that live in tools.html.
// Worked examples recalculated independently; keep in sync with script.js.
const math = { hub: 'math-calculators.html', hubName: 'Math calculators', kicker: 'Math Calculator', appCategory: 'EducationalApplication' };
const edu = { hub: 'math-calculators.html', hubName: 'Math calculators', kicker: 'Student Calculator', appCategory: 'EducationalApplication' };
const geo = { hub: 'geometry-calculators.html', hubName: 'Geometry calculators', kicker: 'Geometry Calculator', appCategory: 'EducationalApplication' };

module.exports = [
  {
    ...math,
    id: 'calc-fraction',
    slug: 'fraction-calculator',
    title: 'Fraction Calculator | Add, Subtract, Multiply and Divide Fractions',
    description: 'Add, subtract, multiply or divide two fractions and get the answer in simplest form and as a decimal, with the working explained.',
    h1: 'Fraction Calculator',
    lede: 'Add, subtract, multiply or divide two fractions and get the answer reduced to its simplest form, plus its decimal value.',
    method: 'exact integer arithmetic, then reduce by the greatest common divisor',
    labels: { 'frac-a-num': 'First numerator', 'frac-a-den': 'First denominator', 'frac-op': 'Operation', 'frac-b-num': 'Second numerator', 'frac-b-den': 'Second denominator' },
    sections: [
      ['What this calculator does', `<p>Enter two fractions as whole-number numerators and denominators, choose an operation, and the calculator returns the result in lowest terms and as a decimal. It uses exact whole-number arithmetic, so there are no rounding errors in the fraction itself.</p>`, 'intro-card'],
      ['Rules used', `<p>Add: a/b + c/d = (a&times;d + c&times;b) &divide; (b&times;d)</p><p>Subtract: a/b &minus; c/d = (a&times;d &minus; c&times;b) &divide; (b&times;d)</p><p>Multiply: a/b &times; c/d = (a&times;c) &divide; (b&times;d)</p><p>Divide: a/b &divide; c/d = (a&times;d) &divide; (b&times;c)</p><p>The result is then divided top and bottom by their greatest common divisor (GCD) to reach simplest form.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li><strong>1/2 + 1/3</strong> = (1&times;3 + 1&times;2) &divide; (2&times;3) = 5/6, decimal 0.833333</li><li><strong>3/4 &divide; 2/5</strong> = (3&times;5) &divide; (4&times;2) = 15/8, decimal 1.875 (as a mixed number, 1 7/8)</li><li><strong>2/6 &times; 3/4</strong> = 6/24, which simplifies to <strong>1/4</strong> because the GCD of 6 and 24 is 6</li></ul>`, 'example-box'],
      ['Working with mixed numbers and negatives', `<p>Convert mixed numbers to improper fractions first: 2&frac12; becomes (2&times;2 + 1)/2 = 5/2. For a negative fraction, put the minus sign on the numerator, for example &minus;3 over 4. The calculator accepts negative whole numbers in either box. Denominators cannot be zero, and you cannot divide by a fraction whose numerator is zero.</p>`],
      ['Why simplify?', `<p>Simplest form makes fractions easy to compare and is what exams usually expect. 6/24 and 1/4 are equal, but 1/4 is far easier to read. To simplify by hand, find the largest number that divides both the numerator and denominator, and divide both by it.</p>`],
      ['Common mistakes', `<ul><li>Adding numerators and denominators directly: 1/2 + 1/3 is not 2/5.</li><li>Forgetting to flip the second fraction when dividing.</li><li>Entering a mixed number like 1 1/2 into one box instead of converting to 3/2.</li></ul>`]
    ],
    faqs: [
      ['How do you add fractions with different denominators?', 'Multiply each numerator by the other fraction&rsquo;s denominator, add, and put the sum over the product of the denominators. Then simplify.'],
      ['How do I enter a mixed number?', 'Convert it to an improper fraction first: whole &times; denominator + numerator, over the denominator.'],
      ['Can I use decimals?', 'No. Enter whole numbers only; convert decimals to fractions first, for example 0.25 = 1/4.'],
      ['Why is the decimal shown to six places?', 'Many fractions have repeating decimals, so the decimal is rounded for display. The fraction is exact.'],
      ['Can it handle negative fractions?', 'Yes. Enter a negative numerator.']
    ],
    related: [['/percentage-calculator.html', 'Percentage Calculator'], 'calc-quadratic', 'calc-scientific']
  },
  {
    ...math,
    id: 'calc-quadratic',
    slug: 'quadratic-equation-solver',
    title: 'Quadratic Equation Solver | Roots, Discriminant and Vertex',
    description: 'Solve ax² + bx + c = 0 for real or complex roots, with the discriminant and the vertex of the parabola, and the working explained.',
    h1: 'Quadratic Equation Solver',
    lede: 'Solve any quadratic equation of the form ax&sup2; + bx + c = 0 and see its roots, discriminant and vertex.',
    method: 'quadratic formula',
    labels: { 'quad-a': 'Coefficient a', 'quad-b': 'Coefficient b', 'quad-c': 'Constant c' },
    sections: [
      ['What this calculator does', `<p>Enter the coefficients a, b and c of ax&sup2; + bx + c = 0. The solver returns the roots (real or complex), the discriminant, and the vertex of the parabola y = ax&sup2; + bx + c. Coefficient a cannot be zero, because then the equation is linear, not quadratic.</p>`, 'intro-card'],
      ['Formula used', `<p>x = (&minus;b &plusmn; &radic;(b&sup2; &minus; 4ac)) &divide; 2a</p><p>Discriminant D = b&sup2; &minus; 4ac</p><p>Vertex = (&minus;b &divide; 2a, value of y at that x)</p>`, 'formula-box'],
      ['What the discriminant tells you', `<ul><li><strong>D &gt; 0</strong>: two different real roots; the parabola crosses the x-axis twice.</li><li><strong>D = 0</strong>: one repeated real root; the parabola touches the x-axis at its vertex.</li><li><strong>D &lt; 0</strong>: no real roots; two complex roots of the form p &plusmn; qi, and the parabola does not cross the x-axis.</li></ul>`],
      ['Worked examples', `<ul><li><strong>x&sup2; &minus; 5x + 6 = 0</strong>: D = 25 &minus; 24 = 1, so roots = (5 &plusmn; 1) &divide; 2 = <strong>3 and 2</strong>. Vertex at (2.5, &minus;0.25).</li><li><strong>x&sup2; + 2x + 5 = 0</strong>: D = 4 &minus; 20 = &minus;16, so roots = (&minus;2 &plusmn; 4i) &divide; 2 = <strong>&minus;1 &plusmn; 2i</strong>. Vertex at (&minus;1, 4).</li></ul>`, 'example-box'],
      ['Checking an answer', `<p>Substitute each root back into the equation. For x = 3 in the first example: 9 &minus; 15 + 6 = 0. You can also check with the sum and product of roots: for ax&sup2; + bx + c, the roots add to &minus;b/a and multiply to c/a. For the first example, 3 + 2 = 5 and 3 &times; 2 = 6.</p>`],
      ['Common mistakes', `<ul><li>Not rearranging the equation to equal zero first. For x&sup2; = 5x &minus; 6, enter a = 1, b = &minus;5, c = 6.</li><li>Dropping the sign of b: if the term is &minus;5x, b is &minus;5.</li><li>Dividing only &radic;D by 2a instead of the whole numerator.</li></ul>`]
    ],
    faqs: [
      ['What if a is zero?', 'The equation is linear (bx + c = 0) with solution x = &minus;c/b. The solver needs a non-zero a.'],
      ['Does it show complex roots?', 'Yes. When the discriminant is negative, roots are shown as p &plusmn; qi.'],
      ['How are results rounded?', 'Results are shown to up to four decimal places.'],
      ['What is the vertex?', 'The turning point of the parabola: its lowest point if a is positive, highest if a is negative.'],
      ['Can it factorise the equation?', 'It gives the roots r and s; the factorised form is a(x &minus; r)(x &minus; s).']
    ],
    related: ['calc-equation-plotter', 'calc-fraction', 'calc-scientific']
  },
  {
    ...edu,
    id: 'calc-cgpa',
    slug: 'cgpa-calculator',
    title: 'CGPA and SGPA Calculator | Credit-Weighted Grade Point Average',
    description: 'Calculate SGPA or CGPA from subject credits and grade points on a 10-point scale, with how weighting works and notes on percentage conversion.',
    h1: 'CGPA and SGPA Calculator',
    lede: 'Work out your semester or cumulative grade point average from each subject&rsquo;s credits and grade points on a 10-point scale.',
    method: 'credit-weighted average of grade points',
    toolHeading: 'Enter credits and grade points',
    sections: [
      ['What this calculator does', `<p>For each subject, enter its credits and the grade point you earned on a 10-point scale. Add as many subjects as you need. The calculator returns the credit-weighted average, which is your SGPA for one semester, or your CGPA if you enter all subjects across semesters.</p>`, 'intro-card'],
      ['Formula used', `<p>GPA = &Sigma;(Credits &times; Grade points) &divide; &Sigma;Credits</p><p>A subject with more credits counts for more. Rows left completely empty are ignored.</p>`, 'formula-box'],
      ['Worked example', `<p>A semester with four subjects:</p><ul><li>4 credits, grade point 9 &rarr; 36</li><li>3 credits, grade point 8 &rarr; 24</li><li>2 credits, grade point 10 &rarr; 20</li><li>1 credit, grade point 7 &rarr; 7</li></ul><p>Total points 87 over 10 credits gives an <strong>SGPA of 8.70</strong>. A simple average of the four grades would be 8.50, which shows why credit weighting matters.</p>`, 'example-box'],
      ['SGPA vs CGPA', `<p>SGPA covers one semester. CGPA covers all semesters so far. The correct way to get CGPA is to weight each semester by its total credits, not to average the SGPAs, because semesters can have different credit loads. If every semester has the same number of credits, the two methods give the same answer.</p>`],
      ['Converting CGPA to percentage', `<p>There is no single conversion; each board or university publishes its own. CBSE used CGPA &times; 9.5 for Class 10 when it graded that way. Many universities use CGPA &times; 10, and some use other formulas such as (CGPA &minus; 0.75) &times; 10 or (CGPA &minus; 0.5) &times; 10. Use the formula on your university&rsquo;s official grade sheet or regulations, especially for job and admission applications.</p>`],
      ['Understanding each input', `<ul><li><strong>Credits</strong> &mdash; from your syllabus or grade card. Labs and projects often have fewer credits than theory papers.</li><li><strong>Grade point</strong> &mdash; 0 to 10, from your university&rsquo;s letter-grade table (for example O = 10, A+ = 9, A = 8 at many institutions).</li></ul>`],
      ['Common mistakes', `<ul><li>Entering the letter grade&rsquo;s marks instead of its grade point.</li><li>Averaging SGPAs across semesters with different credits.</li><li>Including audit or non-credit courses, which usually carry zero credits.</li></ul>`]
    ],
    faqs: [
      ['What is the difference between SGPA and CGPA?', 'SGPA is for one semester; CGPA is the credit-weighted average across all semesters so far.'],
      ['How do I convert CGPA to percentage?', 'Use your university&rsquo;s official formula. Common ones are CGPA &times; 9.5 or CGPA &times; 10.'],
      ['Does it work on a 4-point scale?', 'No. Grade points must be from 0 to 10.'],
      ['What if I failed a subject?', 'Enter its grade point (often 0) and credits as your university counts it; rules on re-attempts vary.'],
      ['Can I add more subjects?', 'Yes. Use the add subject button for each extra row.']
    ],
    related: ['calc-att', ['/percentage-calculator.html', 'Percentage Calculator'], 'calc-fraction']
  },
  {
    ...edu,
    id: 'calc-att',
    slug: 'attendance-calculator',
    title: 'Attendance Calculator | Classes Needed to Reach 75% Attendance',
    description: 'Find your current attendance percentage and how many classes you must attend to reach a target such as 75%, or how many you can miss.',
    h1: 'Attendance Calculator',
    lede: 'Check your current attendance and find out how many more classes you need to reach the minimum, such as 75%, or how many you can safely miss.',
    method: 'solve (attended + x) ÷ (total + x) = target',
    labels: { 'att-total': 'Total classes held', 'att-present': 'Classes attended', 'att-target': 'Target attendance (%)' },
    sections: [
      ['What this calculator does', `<p>Enter the number of classes held so far, how many you attended, and your target percentage. If you are below the target, it tells you how many consecutive classes you must attend to reach it. If you are above, it tells you how many you could miss and still stay at or above the target.</p>`, 'intro-card'],
      ['Formulas used', `<p>Current % = Attended &divide; Total &times; 100</p><p>Classes needed (if below target) = (Target &times; Total &minus; 100 &times; Attended) &divide; (100 &minus; Target), rounded up</p><p>Classes you can miss (if above target) = Attended &times; 100 &divide; Target &minus; Total, rounded down</p>`, 'formula-box'],
      ['Worked examples', `<ul><li><strong>Below target</strong>: 30 attended out of 45 is 66.7%. To reach 75%: (75 &times; 45 &minus; 3,000) &divide; 25 = <strong>15 more classes</strong>. Check: 45 &divide; 60 = 75%.</li><li><strong>Above target</strong>: 54 out of 60 is 90%. You could miss 54 &times; 100 &divide; 75 &minus; 60 = <strong>12 classes</strong> and still be at 54 &divide; 72 = 75%.</li><li><strong>Exactly at target</strong>: 30 out of 40 is 75%; missing even one class drops you below.</li></ul>`, 'example-box'],
      ['Why the 75% rule matters', `<p>Many Indian universities and boards require 75% attendance to sit end-semester exams, with some allowing condonation down to about 65% for medical or other valid reasons and a fee. Rules vary by institution, and some count attendance per subject rather than overall. Check your college&rsquo;s regulations, and use this tool per subject if that is how yours works.</p>`],
      ['Plan ahead, not just the next class', `<p>The numbers assume every future class happens and you attend (or miss) all of them in a row. In reality the total keeps growing. Re-run the calculation every couple of weeks with updated numbers, and keep a buffer above the minimum for illness or emergencies.</p>`],
      ['Common mistakes', `<ul><li>Using overall attendance when your college counts each subject separately.</li><li>Forgetting labs or tutorials that count as separate classes.</li><li>Planning to sit exactly at 75% with no margin.</li></ul>`]
    ],
    faqs: [
      ['How many classes do I need to attend to get 75%?', 'Enter your totals; the tool solves (attended + x) &divide; (total + x) = 75% for x.'],
      ['Can I reach 100% after missing a class?', 'No. Once you have missed one, attending more brings you closer but never exactly to 100%.'],
      ['Does it work per subject?', 'Yes. Enter that subject&rsquo;s numbers.'],
      ['What is condonation?', 'Many institutions allow students slightly below 75% to appear for exams for valid reasons, often with documentation and a fee.'],
      ['Why is the result rounded?', 'Classes are whole numbers, so needed classes round up and missable classes round down, keeping you at or above the target.']
    ],
    related: ['calc-cgpa', ['/percentage-calculator.html', 'Percentage Calculator'], 'calc-date-diff']
  },
  {
    ...geo,
    id: 'calc-circle',
    slug: 'circle-area-calculator',
    title: 'Circle Area and Circumference Calculator | From Radius',
    description: 'Calculate the area and circumference of a circle from its radius, with formulas, worked examples and how to start from the diameter.',
    h1: 'Circle Area and Circumference Calculator',
    lede: 'Enter a circle&rsquo;s radius to get its area and circumference, with the formulas and a few practical examples.',
    method: 'A = πr², C = 2πr',
    labels: { 'circle-radius': 'Radius (r)' },
    sections: [
      ['What this calculator does', `<p>Enter the radius of a circle in any unit. The calculator returns the area (in square units) and the circumference, which is the distance around the edge (in the same unit as the radius).</p>`, 'intro-card'],
      ['Formulas used', `<p>Area = &pi; &times; r&sup2;</p><p>Circumference = 2 &times; &pi; &times; r</p><p>&pi; (pi) is about 3.14159. The calculator uses full precision and rounds the answer to two decimal places.</p>`, 'formula-box'],
      ['Worked example', `<p>A circle with radius 7 cm:</p><ul><li>Area = &pi; &times; 49 = <strong>153.94 cm&sup2;</strong></li><li>Circumference = 2 &times; &pi; &times; 7 = <strong>43.98 cm</strong></li></ul><p>With the school approximation &pi; = 22/7, the area is exactly 154 cm&sup2; and the circumference 44 cm, which is why 7 is a popular textbook radius.</p>`, 'example-box'],
      ['Starting from the diameter or circumference', `<ul><li>If you know the <strong>diameter</strong>, halve it: radius = diameter &divide; 2. A 30 cm pizza has radius 15 cm and area about 707 cm&sup2;.</li><li>If you know the <strong>circumference</strong>, divide by 2&pi;: radius = C &divide; 6.2832. This is handy for tree trunks or pipes measured with a tape.</li></ul>`],
      ['Practical uses', `<ul><li>Comparing pizza sizes: a 30 cm pizza has 2.25 times the area of a 20 cm one, not 1.5 times.</li><li>Estimating paint or tiles for a round table or floor area.</li><li>Finding the length of edging or fencing around a circular bed.</li></ul>`],
      ['Common mistakes', `<ul><li>Entering the diameter as the radius, which makes the area four times too big.</li><li>Giving area in plain units instead of square units.</li><li>Mixing units, such as a radius in cm and expecting an area in m&sup2;. 1 m&sup2; = 10,000 cm&sup2;.</li></ul>`]
    ],
    faqs: [
      ['What is the formula for the area of a circle?', 'Area = &pi; &times; radius&sup2;.'],
      ['How do I find the radius from the diameter?', 'Divide the diameter by 2.'],
      ['Which value of pi is used?', 'Full JavaScript precision (3.141592653589793); results are rounded to two decimals.'],
      ['What units does it use?', 'Any unit. Area comes out in that unit squared.'],
      ['How do I find the area of a semicircle?', 'Calculate the full area and divide by 2.']
    ],
    related: ['calc-volume', 'calc-triangle', 'calc-pythagorean']
  },
  {
    ...geo,
    id: 'calc-triangle',
    slug: 'triangle-area-calculator',
    title: 'Triangle Area Calculator | Area from Base and Height',
    description: 'Calculate the area of any triangle from its base and perpendicular height, with how to find the height and what to do when you only know the sides.',
    h1: 'Triangle Area Calculator',
    lede: 'Find the area of any triangle from its base and perpendicular height.',
    method: 'A = ½ × base × height',
    labels: { 'tri-base': 'Base (b)', 'tri-height': 'Perpendicular height (h)' },
    sections: [
      ['What this calculator does', `<p>Enter the length of one side as the base, and the perpendicular height from that base to the opposite corner. The calculator returns the area in square units.</p>`, 'intro-card'],
      ['Formula used', `<p>Area = &frac12; &times; base &times; height</p><p>This works for every triangle: right-angled, isosceles, equilateral or scalene. A triangle is exactly half of a parallelogram with the same base and height.</p>`, 'formula-box'],
      ['Worked example', `<p>A triangle with a base of 10 m and a height of 8 m has an area of &frac12; &times; 10 &times; 8 = <strong>40 m&sup2;</strong>.</p><p>For a right-angled triangle, the two sides that meet at the right angle are a base and height, so a triangle with legs of 6 cm and 4 cm has an area of 12 cm&sup2;.</p>`, 'example-box'],
      ['The height must be perpendicular', `<p>The height is the straight-line distance at a right angle from the base to the opposite vertex, not the length of a sloping side. In an obtuse triangle the height can fall outside the triangle, on an extension of the base line. If you measure a sloping side instead, the area will be too large.</p>`],
      ['When you only know the three sides', `<p>Use Heron&rsquo;s formula. Let s = (a + b + c) &divide; 2. Then area = &radic;(s(s&minus;a)(s&minus;b)(s&minus;c)). For sides 13, 14 and 15: s = 21 and area = &radic;(21 &times; 8 &times; 7 &times; 6) = 84. This is useful for land plots measured along their boundaries.</p>`],
      ['Common mistakes', `<ul><li>Using a slanted side as the height.</li><li>Forgetting the &frac12;.</li><li>Mixing units between base and height.</li></ul>`]
    ],
    faqs: [
      ['What is the formula for the area of a triangle?', 'Area = &frac12; &times; base &times; perpendicular height.'],
      ['Can any side be the base?', 'Yes, as long as you use the height perpendicular to that side.'],
      ['How do I find the area of an equilateral triangle?', 'Area = (&radic;3 &divide; 4) &times; side&sup2;, or use base = side and height = side &times; 0.866.'],
      ['What if I only know the sides?', 'Use Heron&rsquo;s formula, explained above.'],
      ['What units is the answer in?', 'The square of whatever unit you used.']
    ],
    related: ['calc-pythagorean', 'calc-circle', 'calc-volume']
  },
  {
    ...geo,
    id: 'calc-pythagorean',
    slug: 'pythagorean-theorem-calculator',
    title: 'Pythagorean Theorem Calculator | Hypotenuse from Two Sides',
    description: 'Find the hypotenuse of a right-angled triangle from the two shorter sides using a² + b² = c², with how to find a missing shorter side.',
    h1: 'Pythagorean Theorem Calculator',
    lede: 'Find the longest side of a right-angled triangle from the two sides that meet at the right angle.',
    method: 'c = √(a² + b²)',
    labels: { 'pyth-a': 'Side a', 'pyth-b': 'Side b' },
    sections: [
      ['What this calculator does', `<p>Enter the two shorter sides (legs) of a right-angled triangle. The calculator returns the hypotenuse, the side opposite the right angle, which is always the longest.</p>`, 'intro-card'],
      ['Formula used', `<p>a&sup2; + b&sup2; = c&sup2;, so c = &radic;(a&sup2; + b&sup2;)</p><p>The theorem applies only to right-angled triangles.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>Sides 3 and 4: c = &radic;(9 + 16) = &radic;25 = <strong>5</strong></li><li>Sides 5 and 12: c = &radic;(25 + 144) = <strong>13</strong></li><li>A TV 121.8 cm wide and 68.5 cm tall has a diagonal of about 139.7 cm, which is <strong>55 inches</strong>.</li></ul><p>Whole-number sets like 3-4-5 and 5-12-13 are called Pythagorean triples.</p>`, 'example-box'],
      ['Finding a missing shorter side', `<p>If you know the hypotenuse c and one leg a, rearrange: b = &radic;(c&sup2; &minus; a&sup2;). A 5 m ladder with its foot 3 m from a wall reaches &radic;(25 &minus; 9) = 4 m up the wall. This calculator solves for the hypotenuse only, so do this rearrangement by hand or with the scientific calculator.</p>`],
      ['Practical uses', `<ul><li>Checking a corner is square during construction: measure 3 units along one side and 4 along the other; the diagonal should be exactly 5. Builders call this the 3-4-5 method.</li><li>Screen and frame diagonals.</li><li>Straight-line distance between two points on a map grid.</li><li>Length of a ramp or roof rafter from its rise and run.</li></ul>`],
      ['Common mistakes', `<ul><li>Using it for a triangle that is not right-angled.</li><li>Adding the sides before squaring: (3 + 4)&sup2; is not 3&sup2; + 4&sup2;.</li><li>Entering the hypotenuse as one of the legs.</li></ul>`]
    ],
    faqs: [
      ['What is the Pythagorean theorem?', 'In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.'],
      ['Can I find a shorter side?', 'Yes, with b = &radic;(c&sup2; &minus; a&sup2;). This tool calculates the hypotenuse only.'],
      ['Does it work for non-right triangles?', 'No. For those, use the law of cosines.'],
      ['How is the answer rounded?', 'To two decimal places.'],
      ['What is the 3-4-5 rule?', 'A triangle with sides 3, 4 and 5 always has a right angle, which builders use to set out square corners.']
    ],
    related: ['calc-triangle', 'calc-circle', 'calc-scientific']
  },
  {
    ...geo,
    id: 'calc-volume',
    slug: 'volume-calculator',
    title: 'Volume Calculator | Cube, Sphere and Cylinder Volume',
    description: 'Calculate the volume of a cube, sphere or cylinder, with formulas, worked examples and how to convert a tank’s volume to litres.',
    h1: 'Volume Calculator (Cube, Sphere, Cylinder)',
    lede: 'Choose a shape, enter its dimensions, and get the volume, with a quick way to turn it into litres for tanks and containers.',
    method: 'standard solid geometry formulas',
    labels: { 'volume-shape': 'Shape', 'volume-a': 'Side or radius', 'volume-b': 'Height' },
    sections: [
      ['What this calculator does', `<p>Select a cube, sphere or cylinder. Enter the side length (cube) or radius (sphere and cylinder), plus the height for a cylinder. The calculator returns the volume in cubic units.</p>`, 'intro-card'],
      ['Formulas used', `<p>Cube: V = side&sup3;</p><p>Sphere: V = 4/3 &times; &pi; &times; r&sup3;</p><p>Cylinder: V = &pi; &times; r&sup2; &times; height</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>Cube with side 3 cm: 3&sup3; = <strong>27 cm&sup3;</strong></li><li>Sphere with radius 3 cm: 4/3 &times; &pi; &times; 27 = <strong>113.10 cm&sup3;</strong></li><li>Cylinder with radius 3 cm and height 5 cm: &pi; &times; 9 &times; 5 = <strong>141.37 cm&sup3;</strong></li></ul>`, 'example-box'],
      ['Turning volume into litres', `<p>1 litre = 1,000 cm&sup3;, and 1 m&sup3; = 1,000 litres. A cylindrical water tank with a radius of 0.5 m (1 m across) and a height of 1.2 m holds &pi; &times; 0.25 &times; 1.2 = 0.9425 m&sup3;, which is about <strong>942 litres</strong>. Measure inside dimensions for capacity; outside measurements include the wall thickness.</p>`],
      ['Other common shapes', `<ul><li>Cuboid (box, rectangular tank): length &times; width &times; height.</li><li>Cone: 1/3 &times; &pi; &times; r&sup2; &times; height, a third of the matching cylinder.</li><li>Hemisphere: half the sphere result.</li></ul>`],
      ['Common mistakes', `<ul><li>Entering the diameter instead of the radius, which makes a sphere 8 times too large.</li><li>Mixing units, such as radius in metres and height in centimetres.</li><li>Reporting volume in square instead of cubic units.</li></ul>`]
    ],
    faqs: [
      ['How do I calculate the volume of a water tank?', 'For a cylindrical tank, use the cylinder option with inside radius and height in metres, then multiply m&sup3; by 1,000 for litres.'],
      ['How do I convert cm&sup3; to litres?', 'Divide by 1,000.'],
      ['Does it do rectangular boxes?', 'Not directly. Multiply length &times; width &times; height.'],
      ['Why is the sphere result so sensitive to radius?', 'Volume grows with the cube of the radius, so doubling the radius makes the volume eight times larger.'],
      ['How is the answer rounded?', 'To two decimal places.']
    ],
    related: ['calc-circle', 'calc-unit', 'calc-triangle']
  },
  {
    ...edu,
    id: 'calc-formula-explainer',
    slug: 'formula-explainer',
    title: 'Formula Explainer | E = mc², Compound Interest and Newton’s Gravitation',
    description: 'Understand three famous formulas term by term: Einstein’s E = mc², the compound interest formula, and Newton’s law of universal gravitation.',
    h1: 'Formula Explainer',
    lede: 'Pick a famous formula and see what each symbol means, then work through a real example of each below.',
    method: 'term-by-term explanation with worked numbers',
    toolHeading: 'Choose a formula',
    labels: { 'formula-select': 'Formula' },
    sections: [
      ['What this page does', `<p>Choose one of three formulas from the menu to see each symbol labelled. The sections below go further, showing what each formula means and putting real numbers into it. They are chosen because each one turns up constantly: in physics class, in personal finance, and in explaining why things fall.</p>`, 'intro-card'],
      ['E = mc&sup2;: mass and energy', `<p><strong>E</strong> is energy in joules, <strong>m</strong> is mass in kilograms, and <strong>c</strong> is the speed of light, about 3 &times; 10<sup>8</sup> metres per second. Because c&sup2; is so large (9 &times; 10<sup>16</sup>), a tiny mass corresponds to a huge amount of energy.</p><p><strong>Example:</strong> 1 gram (0.001 kg) of mass is equivalent to 0.001 &times; 9 &times; 10<sup>16</sup> = 9 &times; 10<sup>13</sup> joules, about 21 kilotonnes of TNT, more than the Hiroshima bomb released. In practice, nuclear power plants and the Sun convert only a small fraction of their fuel&rsquo;s mass into energy.</p>`],
      ['A = P(1 + r/n)<sup>nt</sup>: compound interest', `<p><strong>A</strong> is the final amount, <strong>P</strong> the principal (starting amount), <strong>r</strong> the annual interest rate as a decimal, <strong>n</strong> how many times a year interest is added, and <strong>t</strong> the number of years. Interest earns interest, so growth speeds up over time.</p><p><strong>Example:</strong> 1,00,000 at 8% compounded quarterly for 5 years: 1,00,000 &times; (1 + 0.08 &divide; 4)<sup>20</sup> &asymp; <strong>1,48,595</strong>. The same money at 8% simple interest would reach only 1,40,000. See the FD calculator to try your own numbers.</p>`, 'example-box'],
      ['F = G m<sub>1</sub>m<sub>2</sub> / r&sup2;: gravity', `<p><strong>F</strong> is the force of attraction in newtons, <strong>G</strong> is the gravitational constant (6.674 &times; 10<sup>&minus;11</sup> N m&sup2;/kg&sup2;), <strong>m<sub>1</sub></strong> and <strong>m<sub>2</sub></strong> are the two masses in kilograms, and <strong>r</strong> is the distance between their centres in metres. Doubling the distance cuts the force to a quarter: this is the inverse-square law.</p><p><strong>Example:</strong> Earth (5.972 &times; 10<sup>24</sup> kg) pulling on a 70 kg person at Earth&rsquo;s radius (6.371 &times; 10<sup>6</sup> m) gives F &asymp; <strong>687 N</strong>, which is that person&rsquo;s weight. Dividing by 70 gives about 9.8 m/s&sup2;, the familiar acceleration due to gravity.</p>`],
      ['Tips for reading any formula', `<ul><li>Find what is being calculated: the single symbol on the left.</li><li>Check the units of every symbol before substituting numbers.</li><li>Look for powers and denominators: they show what has the biggest effect, such as c&sup2; or 1/r&sup2;.</li><li>Try an easy number first to see if the answer makes sense.</li></ul>`]
    ],
    faqs: [
      ['Why is the speed of light squared in E = mc&sup2;?', 'It comes from the units and the physics of relativity: energy has units of mass &times; velocity&sup2;, and c is the conversion factor between mass and energy.'],
      ['What does n mean in the compound interest formula?', 'The number of times interest is added each year: 1 for yearly, 4 for quarterly, 12 for monthly.'],
      ['Why does gravity fall with distance squared?', 'The force spreads out over the surface of an ever-larger sphere, whose area grows with the square of the radius.'],
      ['Will more formulas be added?', 'The explainer currently covers these three. Suggestions are welcome through the contact page.'],
      ['Can I calculate with these formulas here?', 'Compound interest can be calculated with the FD calculator. The other two are worked through by hand above.']
    ],
    related: ['calc-fd', 'calc-scientific', 'calc-equation-plotter']
  },
  {
    ...edu,
    id: 'calc-equation-plotter',
    slug: 'linear-equation-plotter',
    title: 'Linear Equation Plotter | Graph y = mx + b Online',
    description: 'Plot a straight line from its slope and y-intercept and see how changing m and b moves the graph, with the slope-intercept form explained.',
    h1: 'Linear Equation Plotter (y = mx + b)',
    lede: 'Enter a slope and an intercept to draw the straight line y = mx + b, and see how each number changes the graph.',
    method: 'y = mx + b plotted from x = −10 to 10',
    labels: { 'plot-m': 'Slope (m)', 'plot-b': 'Y-intercept (b)' },
    sections: [
      ['What this tool does', `<p>Enter a slope m and a y-intercept b, then plot. The tool draws the line y = mx + b for x from &minus;10 to 10. It is a quick way to see the shape of a linear equation or check homework.</p>`, 'intro-card'],
      ['Slope-intercept form', `<p>y = mx + b</p><p><strong>m</strong> (slope) is how much y changes when x increases by 1. Positive slopes rise to the right, negative slopes fall, and a slope of 0 is a flat line.</p><p><strong>b</strong> (intercept) is where the line crosses the y-axis, the value of y when x = 0.</p>`, 'formula-box'],
      ['Worked example', `<p>For y = 2x + 5 (the default values):</p><ul><li>At x = 0, y = 5, so the line crosses the y-axis at 5.</li><li>At x = 5, y = 15; at x = &minus;5, y = &minus;5.</li><li>It crosses the x-axis where 2x + 5 = 0, at x = &minus;2.5.</li></ul>`, 'example-box'],
      ['Getting an equation into this form', `<p>Many equations need rearranging first. For 2x + 3y = 12: subtract 2x from both sides (3y = &minus;2x + 12), then divide by 3 (y = &minus;0.667x + 4). Enter m = &minus;0.667 and b = 4. To find the slope from two points (x<sub>1</sub>, y<sub>1</sub>) and (x<sub>2</sub>, y<sub>2</sub>), use m = (y<sub>2</sub> &minus; y<sub>1</sub>) &divide; (x<sub>2</sub> &minus; x<sub>1</sub>), then b = y<sub>1</sub> &minus; m &times; x<sub>1</sub>.</p>`],
      ['Things to try', `<ul><li>Keep b fixed and change m: the line rotates around the y-intercept.</li><li>Keep m fixed and change b: the line slides up and down, staying parallel.</li><li>Lines with the same slope are parallel; slopes whose product is &minus;1 are perpendicular.</li></ul>`],
      ['Limitations', `<p>The plotter draws straight lines only. Vertical lines such as x = 3 cannot be written as y = mx + b, so they cannot be plotted here. For quadratics, use the quadratic solver to find roots and the vertex. The graph needs the chart library to load from a public CDN.</p>`]
    ],
    faqs: [
      ['What is slope-intercept form?', 'Writing a straight line as y = mx + b, where m is the slope and b the y-intercept.'],
      ['How do I find the x-intercept?', 'Set y = 0 and solve: x = &minus;b &divide; m.'],
      ['Can it plot curves?', 'No. It plots straight lines only.'],
      ['Why can&rsquo;t I plot x = 3?', 'A vertical line has an undefined slope and cannot be written as y = mx + b.'],
      ['What range of x is shown?', 'From &minus;10 to 10.']
    ],
    related: ['calc-quadratic', 'calc-scientific', 'calc-fraction']
  }
];
