// Standalone page content for finance widgets that live in tools.html.
// Section tuples: [heading, html body, optional extra class]. FAQ tuples: [question, answer].
// Every worked example below was recalculated independently; keep them in sync with script.js.
module.exports = [
  {
    id: 'calc-roi',
    slug: 'roi-calculator',
    hub: 'finance-calculators.html', hubName: 'Finance calculators',
    kicker: 'Finance Calculator',
    appCategory: 'FinanceApplication',
    title: 'ROI Calculator | Return on Investment, Net Profit and Multiple',
    description: 'Calculate return on investment, net profit and value multiple from what you put in, what it is worth now and the costs you paid along the way.',
    h1: 'ROI Calculator',
    lede: 'Find out what an investment actually earned after costs, as a percentage of what you put in, before you compare it with anything else.',
    method: 'simple (non-annualised) return after costs',
    sections: [
      ['What this calculator does', `<p>Return on investment (ROI) answers one question: for every unit of money you put in, how much did you gain or lose? Enter the amount invested, the final value today (or the sale price), and any extra costs you paid on top of the investment, such as brokerage, stamp duty, maintenance or platform fees.</p><p>The result shows three numbers. <strong>Net profit</strong> is the money gained after costs. <strong>ROI</strong> expresses that profit as a percentage of the amount invested. <strong>Value multiple</strong> shows how many times the original amount the final value represents.</p>`, 'intro-card'],
      ['Formula used', `<p>Net profit = Final value &minus; Investment &minus; Costs</p><p>ROI = Net profit &divide; Investment &times; 100</p><p>Value multiple = Final value &divide; Investment</p><p>The value multiple deliberately ignores costs: it describes how the asset itself grew. ROI and net profit are the after-cost figures. If costs are large, the two can tell different stories, which is exactly why both are shown.</p>`, 'formula-box'],
      ['Worked example', `<p>You buy a second-hand machine for a small business for 50,000, spend 1,500 on transport and repairs, and sell it later for 62,000.</p><ul><li>Net profit = 62,000 &minus; 50,000 &minus; 1,500 = <strong>10,500</strong></li><li>ROI = 10,500 &divide; 50,000 &times; 100 = <strong>21.00%</strong></li><li>Value multiple = 62,000 &divide; 50,000 = <strong>1.24x</strong></li></ul><p>Without the 1,500 of costs the ROI would look like 24%. Leaving costs out is the most common way ROI gets overstated.</p>`, 'example-box'],
      ['ROI ignores time', `<p>A 21% return earned in one year and a 21% return earned over three years are not equally good, but simple ROI shows the same number for both. To compare investments held for different lengths of time, convert to an annual rate:</p><p>Annualised return = (1 + ROI &divide; 100)<sup>1 &divide; years</sup> &minus; 1</p><p>For the example above, 21% over three years is (1.21)<sup>1/3</sup> &minus; 1 &asymp; <strong>6.56% a year</strong>. That is less than many fixed deposits pay, which changes the decision completely. For money added in instalments rather than once, use the <a href="/sip-calculator.html">SIP calculator</a> instead, because simple ROI treats every rupee as invested on day one.</p>`],
      ['Understanding each input', `<ul><li><strong>Initial investment</strong> &mdash; the purchase price or the amount you put in. It must be above zero.</li><li><strong>Final value</strong> &mdash; what the investment is worth now, or what you sold it for. Zero is allowed, for an investment that was lost entirely.</li><li><strong>Extra costs</strong> &mdash; money spent because of the investment but not part of the price: brokerage, taxes paid on purchase, repairs, insurance, subscription or platform fees. Leave it at 0 if there were none.</li></ul>`],
      ['Assumptions and limitations', `<p>This is a simple, single-period return. It does not account for the time the money was invested, income received along the way (such as dividends or rent) unless you add it to the final value, inflation, or tax on the gain. Tax rules on capital gains differ by country and holding period, so the after-tax return can be noticeably lower. Results are estimates for comparison, not investment advice.</p>`],
      ['Common mistakes', `<ul><li>Leaving out costs, which inflates ROI.</li><li>Comparing ROI figures from investments held for different lengths of time without annualising them.</li><li>Using ROI for regular monthly investments, where each instalment was invested for a different period.</li><li>Forgetting income received during the holding period, such as rent or dividends, which understates ROI.</li></ul>`]
    ],
    faqs: [
      ['What is a good ROI?', 'It depends on the time period and risk. Compare the annualised return with a low-risk alternative such as a fixed deposit over the same period; if the risky investment does not beat it, the extra risk was not rewarded.'],
      ['Can ROI be negative?', 'Yes. If the final value is less than the investment plus costs, net profit and ROI are negative. A final value of 0 gives an ROI of &minus;100% or worse once costs are included.'],
      ['Why is the value multiple different from ROI?', 'The multiple compares only the final value with the amount invested, so it ignores costs. ROI subtracts costs. With no costs, a 1.24x multiple equals a 24% ROI.'],
      ['Does this include tax?', 'No. Enter the final value after tax if you want an after-tax ROI, or treat tax paid as an extra cost.'],
      ['Should I use ROI for mutual fund SIPs?', 'No. Instalments are invested at different times, so simple ROI misstates the return. Use the SIP calculator or an XIRR calculation instead.']
    ],
    related: ['calc-fd', 'calc-discount-tax', ['/sip-calculator.html', 'SIP Calculator']]
  },
  {
    id: 'calc-tip',
    slug: 'tip-calculator',
    hub: 'finance-calculators.html', hubName: 'Finance calculators',
    kicker: 'Finance Calculator',
    appCategory: 'FinanceApplication',
    title: 'Tip Calculator and Bill Splitter | Tip Amount and Per-Person Share',
    description: 'Work out the tip on a bill and split the total evenly between any number of people, with the tip amount, total and each person’s share shown.',
    h1: 'Tip Calculator and Bill Splitter',
    lede: 'Add a tip to a restaurant or delivery bill and split the total fairly, so nobody has to do the arithmetic at the table.',
    method: 'percentage tip on the bill, split evenly',
    sections: [
      ['What this calculator does', `<p>Enter the bill amount, the tip percentage you want to leave, and how many people are sharing. The calculator shows the tip in money, the bill total including the tip, and what each person pays if the total is split evenly.</p><p>It is meant for the everyday case: a group meal, a shared taxi, a delivery order split between flatmates. It treats everyone as paying the same share.</p>`, 'intro-card'],
      ['Formula used', `<p>Tip = Bill &times; Tip % &divide; 100</p><p>Total = Bill + Tip</p><p>Each person pays = Total &divide; Number of people</p>`, 'formula-box'],
      ['Worked example', `<p>Four friends have dinner and the bill is 2,400. They agree on a 10% tip.</p><ul><li>Tip = 2,400 &times; 10 &divide; 100 = <strong>240</strong></li><li>Total = 2,400 + 240 = <strong>2,640</strong></li><li>Each person pays = 2,640 &divide; 4 = <strong>660</strong></li></ul>`, 'example-box'],
      ['Tip on the bill before or after tax?', `<p>Enter whichever amount you want the tip to be calculated on. Many people tip on the pre-tax food total, because GST or sales tax is not part of the service. If you tip on the final printed amount, the tip will be slightly larger. Neither is wrong; just be consistent within a group.</p><p><strong>Check for a service charge first.</strong> In India, a restaurant cannot add a service charge to the bill by default; the Central Consumer Protection Authority&rsquo;s guidelines make it voluntary, and you can ask for it to be removed. If a service charge is already on the bill and you are happy to pay it, set the tip to 0 or reduce it so you do not tip twice.</p>`],
      ['Understanding each input', `<ul><li><strong>Bill amount</strong> &mdash; the amount to tip on (see above). Zero is allowed.</li><li><strong>Tip percent</strong> &mdash; for example 5, 10 or 15. Enter 0 to simply split a bill.</li><li><strong>People</strong> &mdash; a whole number of at least 1.</li></ul>`],
      ['Limitations', `<p>The split is even. If people ordered very different amounts, split the items first and use this only for the shared tip. Per-person amounts are rounded to two decimals for display, so the shares can add up to a few paise or cents more or less than the total; one person can round up to cover the difference.</p>`],
      ['Common mistakes', `<ul><li>Tipping on top of a service charge that is already included.</li><li>Entering the tip as a decimal (0.1) instead of a percentage (10).</li><li>Counting the person paying the card twice, or forgetting them, in the number of people.</li></ul>`]
    ],
    faqs: [
      ['How much should I tip in India?', 'There is no fixed rule. Around 5&ndash;10% at sit-down restaurants is common where no service charge is billed, and many people round up for delivery or cab drivers. It is always your choice.'],
      ['Can I use it just to split a bill?', 'Yes. Set the tip percent to 0 and it divides the bill evenly.'],
      ['Does it handle uneven splits?', 'No. It splits evenly. For uneven orders, total each person&rsquo;s items separately first.'],
      ['Why do the shares not add up exactly?', 'Shares are rounded to two decimal places for display. The unrounded shares do add up to the total.'],
      ['Is a service charge the same as a tip?', 'A service charge is added by the restaurant; a tip is given by you. In India the service charge is voluntary, so you can ask for it to be removed and tip directly instead.']
    ],
    related: ['calc-discount-tax', ['/percentage-calculator.html', 'Percentage Calculator'], ['/gst-calculator.html', 'GST Calculator']]
  },
  {
    id: 'calc-fd',
    slug: 'fd-calculator',
    hub: 'finance-calculators.html', hubName: 'Finance calculators',
    kicker: 'Finance Calculator',
    appCategory: 'FinanceApplication',
    title: 'FD Calculator | Fixed Deposit Maturity with Quarterly Compounding',
    description: 'Estimate fixed deposit maturity value and interest with quarterly compounding, including the extra rate many banks offer senior citizens.',
    h1: 'FD Calculator',
    lede: 'See what a fixed deposit will be worth at maturity, and how much of that is interest, using the quarterly compounding most Indian banks apply.',
    method: 'compound interest, compounded quarterly',
    sections: [
      ['What this calculator does', `<p>Enter the deposit amount, the annual interest rate the bank quotes, and the period in years. Choose whether the senior citizen rate applies. The calculator returns the maturity value, the amount deposited and the interest earned.</p><p>It models a <strong>cumulative</strong> fixed deposit, where interest is added back to the deposit every quarter and paid out at the end. That is the reinvestment option most banks offer, and it is what produces the &ldquo;maturity value&rdquo; on a bank&rsquo;s FD receipt.</p>`, 'intro-card'],
      ['Formula used', `<p>Maturity = P &times; (1 + r &divide; 4)<sup>4 &times; t</sup></p><p>P is the deposit, r is the annual rate as a decimal (plus 0.5 percentage points if senior citizen is selected), and t is the time in years. The 4 represents quarterly compounding.</p>`, 'formula-box'],
      ['Worked example', `<p>A deposit of 1,00,000 for 5 years at 7% a year, normal rate:</p><ul><li>Maturity = 1,00,000 &times; (1 + 0.07 &divide; 4)<sup>20</sup> = <strong>1,41,477.82</strong></li><li>Interest = <strong>41,477.82</strong></li></ul><p>With the senior citizen option the rate becomes 7.5% and the maturity rises to <strong>1,44,994.80</strong>, about 3,500 more over five years.</p>`, 'example-box'],
      ['Quoted rate vs effective yield', `<p>Because interest is compounded four times a year, a 7% FD actually grows by about 7.19% in a year: 1,00,000 becomes 1,07,185.90. Banks sometimes print this &ldquo;annualised yield&rdquo; next to the rate. When you compare an FD with a bond, a savings scheme or a mutual fund, compare effective yields, not headline rates.</p>`],
      ['Understanding each input', `<ul><li><strong>Deposit amount</strong> &mdash; the lump sum you place in the FD.</li><li><strong>Interest rate</strong> &mdash; the annual rate on the bank&rsquo;s rate card for your tenure, from 0 to 100.</li><li><strong>Time period</strong> &mdash; in years. Use decimals for part years: 18 months is 1.5.</li><li><strong>Citizen type</strong> &mdash; the senior option adds 0.5 percentage points, which is the most common extra rate. Some banks offer more or less; if yours differs, choose Normal and type the bank&rsquo;s actual senior rate.</li></ul>`],
      ['Assumptions and limitations', `<p>The calculator assumes the rate stays fixed, compounding is quarterly, and you do not withdraw early. It does not deduct tax. In India, FD interest is added to your income and taxed at your slab rate, and banks deduct TDS when interest crosses the annual threshold, so the money you actually receive can be lower. Premature withdrawal usually carries a penalty of around 0.5&ndash;1% on the rate. Small finance banks and non-bank deposits can carry different risk from scheduled banks; deposit insurance under DICGC covers up to 5 lakh per depositor per bank.</p><p>The tool also labels itself for savings (SB) accounts. Savings accounts in India are usually credited quarterly too, but their rates can change at any time and balances move, so treat an SB result as a rough guide only.</p>`],
      ['Common mistakes', `<ul><li>Entering months in the years field. Five years is 5, not 60.</li><li>Comparing a cumulative FD maturity with a monthly-payout FD. Payout FDs do not compound, so they show lower total interest.</li><li>Choosing senior citizen and also typing the senior rate, which adds the bonus twice.</li><li>Forgetting tax when comparing an FD with tax-advantaged options.</li></ul>`]
    ],
    faqs: [
      ['Is FD interest compounded monthly or quarterly?', 'Most Indian banks compound cumulative FDs quarterly, which is what this calculator uses. Check your bank&rsquo;s terms if unsure.'],
      ['Does the result include TDS?', 'No. It shows interest before tax. TDS and income tax depend on your total income and the forms you submit to the bank.'],
      ['How much extra do senior citizens get?', 'Commonly 0.5 percentage points, which the senior option adds. Some banks offer up to about 0.75 or more on special schemes.'],
      ['Can I use it for a monthly interest FD?', 'Not directly. A payout FD pays simple interest each period: deposit &times; rate &divide; 12 per month. Use the cumulative result only for reinvestment FDs.'],
      ['Why is my bank&rsquo;s figure slightly different?', 'Banks may count exact days for short tenures or broken periods and round each quarter. Small differences are normal; the bank&rsquo;s FD advice is final.']
    ],
    related: ['calc-rd', 'calc-roi', ['/sip-calculator.html', 'SIP Calculator']]
  },
  {
    id: 'calc-rd',
    slug: 'rd-calculator',
    hub: 'finance-calculators.html', hubName: 'Finance calculators',
    kicker: 'Finance Calculator',
    appCategory: 'FinanceApplication',
    title: 'RD Calculator | Recurring Deposit Maturity and Interest',
    description: 'Estimate the maturity value of a monthly recurring deposit with quarterly compounding, and see how much of it is your deposits and how much is interest.',
    h1: 'RD Calculator',
    lede: 'Find out what a fixed monthly saving in a recurring deposit grows to by maturity, using the quarterly compounding Indian banks apply.',
    method: 'monthly deposits, interest compounded quarterly',
    sections: [
      ['What this calculator does', `<p>A recurring deposit (RD) lets you save a fixed amount every month for a set number of months and earn a fixed rate on it. Enter the monthly instalment, the annual rate and the number of months. The calculator returns the maturity value, the total of your deposits, and the interest earned.</p>`, 'intro-card'],
      ['How the interest is worked out', `<p>Each instalment earns interest from the month it is paid until maturity, so the first instalment earns the most and the last earns the least. Banks compound RD interest quarterly. This calculator converts the quarterly rate into an equivalent monthly rate and then adds up every instalment&rsquo;s growth, assuming each deposit is made at the start of its month:</p><p>Monthly rate m = (1 + r &divide; 4)<sup>1/3</sup> &minus; 1</p><p>Maturity = P &times; (1 + m) &times; ((1 + m)<sup>n</sup> &minus; 1) &divide; m</p><p>P is the monthly deposit, r the annual rate as a decimal and n the number of months.</p>`, 'formula-box'],
      ['Worked example', `<p>Deposit 5,000 at the start of each month for 24 months at 6.5% a year:</p><ul><li>Total deposited = 5,000 &times; 24 = <strong>1,20,000</strong></li><li>Maturity value = <strong>1,28,425.30</strong></li><li>Interest earned = <strong>8,425.30</strong></li></ul><p>A smaller check: 2,000 a month for 12 months at 7% gives 24,924.26, of which 924.26 is interest.</p>`, 'example-box'],
      ['Why RD interest looks lower than the rate', `<p>In the example, 8,425 of interest on 1,20,000 looks like only 7% over two years. That is not a mistake. Your money was not all invested for the whole period: the last instalment was in the account for just one month. On average, an RD balance is invested for about half the term, so RD interest is roughly half of what a lump-sum FD of the same total would earn.</p>`],
      ['Understanding each input', `<ul><li><strong>Monthly deposit</strong> &mdash; the fixed instalment, above zero.</li><li><strong>Interest rate</strong> &mdash; the annual RD rate for your tenure.</li><li><strong>Time period</strong> &mdash; in whole months, from 1 to 1200. Banks usually offer 6 months to 10 years.</li></ul>`],
      ['Assumptions and limitations', `<p>The result assumes every instalment is paid on time at the start of the month and the rate stays fixed. Banks charge a penalty for missed instalments and may close the RD after several defaults. Some banks calculate RD maturity with slightly different day-count conventions, so expect small differences from the bank&rsquo;s schedule. Interest is taxable at your slab rate and subject to TDS, which this calculator does not deduct.</p>`],
      ['Common mistakes', `<ul><li>Entering the period in years instead of months.</li><li>Expecting RD interest to equal rate &times; total deposits &times; years. Later instalments earn for less time.</li><li>Comparing an RD with a SIP using only the headline rate. A SIP has market risk and no guaranteed rate; an RD has a fixed rate.</li></ul>`]
    ],
    faqs: [
      ['Is RD better than FD?', 'If you already have the lump sum, an FD at the same rate earns more because all the money is invested from day one. An RD suits saving from monthly income.'],
      ['Is RD interest compounded quarterly?', 'Yes, at most Indian banks and the post office, which this calculator assumes.'],
      ['What happens if I miss an instalment?', 'Banks usually charge a small penalty per missed month, and repeated defaults can lead to premature closure. The calculator assumes no missed payments.'],
      ['Is RD interest taxable?', 'Yes. It is taxed as income at your slab rate, and TDS applies above the threshold.'],
      ['Why does my bank show a slightly different maturity?', 'Banks may use day counts or round at each quarter. Differences of a few rupees are normal; your bank&rsquo;s RD schedule is final.']
    ],
    related: ['calc-fd', ['/sip-calculator.html', 'SIP Calculator'], ['/sip-step-up-calculator/', 'SIP Step-Up Calculator']]
  },
  {
    id: 'calc-salary',
    slug: 'salary-calculator',
    hub: 'finance-calculators.html', hubName: 'Finance calculators',
    kicker: 'Finance Calculator',
    appCategory: 'FinanceApplication',
    title: 'CTC to In-Hand Salary Calculator | Monthly Take-Home Estimate',
    description: 'Estimate monthly in-hand salary from annual CTC, basic pay percentage, employee PF and the tax and deductions shown on your payslip.',
    h1: 'CTC to In-Hand Salary Calculator',
    lede: 'Turn an annual CTC figure into an estimate of the cash that reaches your bank account each month, using the deductions from your own payslip.',
    method: 'monthly CTC minus employee PF and entered deductions',
    sections: [
      ['What this calculator does', `<p>Job offers in India are usually quoted as cost to company (CTC), but CTC is not what you are paid each month. Enter the annual CTC, the share of it that is basic salary, the monthly income tax (TDS) from your payslip, and any other monthly deductions. The calculator shows monthly CTC, the employee provident fund (PF) deduction it assumes, the tax you entered, and an estimated in-hand amount.</p>`, 'intro-card'],
      ['Formula used', `<p>Monthly CTC = Annual CTC &divide; 12</p><p>Basic = Monthly CTC &times; Basic %</p><p>Employee PF = Basic &times; 12%</p><p>In-hand = Monthly CTC &minus; Employee PF &minus; Monthly tax &minus; Other deductions</p>`, 'formula-box'],
      ['Worked example', `<p>An offer of 12,00,000 a year with basic at 40% of CTC, 5,000 monthly TDS on the payslip and 1,000 of other deductions:</p><ul><li>Monthly CTC = 12,00,000 &divide; 12 = <strong>1,00,000</strong></li><li>Basic = 1,00,000 &times; 40% = <strong>40,000</strong></li><li>Employee PF = 40,000 &times; 12% = <strong>4,800</strong></li><li>In-hand = 1,00,000 &minus; 4,800 &minus; 5,000 &minus; 1,000 = <strong>89,200</strong> a month</li></ul>`, 'example-box'],
      ['Why your real in-hand is usually lower', `<p>This is a simplified model and, on purpose, it is generous. CTC typically includes money you do not receive monthly:</p><ul><li><strong>Employer PF contribution</strong> (another 12% of basic) goes to your PF account, not your salary.</li><li><strong>Gratuity</strong> provision, about 4.81% of basic, is paid only when you leave after qualifying service.</li><li><strong>Variable pay or bonus</strong> is paid later, and may be paid partly or not at all.</li><li><strong>Insurance premiums</strong> and other benefits are costs to the employer, not cash to you.</li><li><strong>Professional tax</strong> is deducted monthly in many states.</li></ul><p>Add these to &ldquo;other monthly deductions&rdquo;, or take them out of CTC first, for a more realistic figure. The most accurate source is the salary breakup in your offer letter or a recent payslip.</p>`],
      ['Understanding each input', `<ul><li><strong>Annual CTC</strong> &mdash; the yearly figure from the offer letter.</li><li><strong>Basic salary %</strong> &mdash; usually 40&ndash;50% of CTC; it drives PF. From 0 to 100.</li><li><strong>Monthly tax from payslip</strong> &mdash; this tool does not calculate income tax. Use the TDS on your payslip, or 0 if none.</li><li><strong>Other monthly deductions</strong> &mdash; professional tax, insurance, loans, canteen and so on.</li></ul>`],
      ['Assumptions and limitations', `<p>PF is calculated as 12% of the basic share you enter. Many employers cap PF at 12% of a 15,000 wage ceiling (1,800 a month) unless you opt for full PF, so your PF may be lower and in-hand higher. The tool does not pick a tax regime or apply slabs, rebates or deductions. Treat the result as an estimate for comparing offers, not a payslip.</p>`],
      ['Common mistakes', `<ul><li>Dividing CTC by 12 and calling it monthly salary.</li><li>Ignoring variable pay, which can be a large share of CTC at senior levels.</li><li>Leaving tax at 0 on a salary that clearly attracts TDS.</li></ul>`]
    ],
    faqs: [
      ['What is CTC?', 'Cost to company: everything the employer spends on you in a year, including salary, employer PF, gratuity provision, insurance and variable pay.'],
      ['Why is PF 12% of basic?', 'Under the EPF scheme both employee and employer contribute 12% of basic wages (basic plus DA). Only the employee share is deducted from your pay.'],
      ['Does this calculate income tax?', 'No. Enter the monthly TDS from your payslip. Tax depends on the regime you choose and your deductions.'],
      ['My PF is capped at 1,800. How do I model that?', 'Set basic % so that basic is 15,000, or add the difference back. A future version may add a PF cap option.'],
      ['Is this useful for comparing two offers?', 'Yes, as long as you use the same assumptions for both, and check how much of each CTC is variable.']
    ],
    related: ['calc-leave', ['/epf-calculator.html', 'EPF Savings Calculator'], ['/eps-pension-calculator.html', 'EPS Pension Calculator']]
  },
  {
    id: 'calc-leave',
    slug: 'leave-encashment-calculator',
    hub: 'finance-calculators.html', hubName: 'Finance calculators',
    kicker: 'Finance Calculator',
    appCategory: 'FinanceApplication',
    title: 'Leave Encashment Calculator | Earned Leave Payout Estimate',
    description: 'Estimate the payout for unused earned leave from monthly basic pay plus DA and the number of leave days, using the common 30-day month basis.',
    h1: 'Leave Encashment Calculator',
    lede: 'Estimate how much you would receive for unused earned leave at resignation, retirement or year-end encashment.',
    method: 'one day’s pay = (basic + DA) ÷ 30',
    sections: [
      ['What this calculator does', `<p>Leave encashment converts unused earned (privilege) leave into money. Enter your monthly basic pay plus dearness allowance (DA) and the number of earned leave days to be encashed. The calculator shows one day&rsquo;s wage and the total payable.</p>`, 'intro-card'],
      ['Formula used', `<p>Daily wage = (Basic + DA) &divide; 30</p><p>Encashment = Daily wage &times; Leave days</p><p>Dividing by 30 is the basis used for central government employees and many organisations. Some employers divide by 26 working days instead, which gives a higher figure; check your leave policy.</p>`, 'formula-box'],
      ['Worked example', `<p>Monthly basic plus DA of 45,000 and 20 days of earned leave:</p><ul><li>Daily wage = 45,000 &divide; 30 = <strong>1,500</strong></li><li>Encashment = 1,500 &times; 20 = <strong>30,000</strong></li></ul><p>If your employer uses a 26-day basis, the same leave is worth about 34,615. That 4,600 difference is why the divisor in your policy matters.</p>`, 'example-box'],
      ['Tax on leave encashment', `<p>Encashment during service is taxed as salary. Encashment at retirement or resignation is treated differently: central and state government employees are fully exempt, while for other employees the exemption is the lowest of several limits, including a lifetime cap set by the government (raised to 25 lakh from April 2023). The calculator shows the gross payout before any tax.</p>`],
      ['Understanding each input', `<ul><li><strong>Monthly Basic + DA</strong> &mdash; the last drawn basic pay plus dearness allowance. Do not use gross salary; HRA and other allowances are normally excluded.</li><li><strong>Earned leave</strong> &mdash; the number of encashable days. Many employers limit how many can be carried forward or encashed (for example, 300 days for central government).</li></ul>`],
      ['Limitations', `<p>Your organisation&rsquo;s leave rules decide the divisor, which pay elements count, the maximum days and whether encashment is allowed during service at all. Under the Factories Act and state Shops and Establishments Acts the rules differ again. Use this as an estimate and confirm with HR or your service rules.</p>`],
      ['Common mistakes', `<ul><li>Using gross or CTC instead of basic plus DA.</li><li>Including casual or sick leave, which usually cannot be encashed.</li><li>Assuming the whole payout is tax-free for a private-sector job.</li></ul>`]
    ],
    faqs: [
      ['Is leave encashment calculated on 30 or 26 days?', 'It depends on your employer. Government rules use 30; some private employers use 26 working days. This calculator uses 30.'],
      ['Which salary components are included?', 'Normally basic pay and DA only. Check your leave policy for any other component.'],
      ['Is leave encashment taxable?', 'During service, yes, as salary. At retirement, government employees are fully exempt; others get an exemption up to the limits in the Income Tax Act.'],
      ['Can I encash leave every year?', 'Only if your employer allows it. Many allow it only at separation.'],
      ['Does it work for half-days?', 'Yes. Enter decimals, for example 12.5 days.']
    ],
    related: ['calc-salary', ['/epf-calculator.html', 'EPF Savings Calculator'], ['/eps-pension-calculator.html', 'EPS Pension Calculator']]
  },
  {
    id: 'calc-discount-tax',
    slug: 'discount-and-tax-calculator',
    hub: 'finance-calculators.html', hubName: 'Finance calculators',
    kicker: 'Finance Calculator',
    appCategory: 'FinanceApplication',
    title: 'Discount and Tax Calculator | Final Price After Discount and GST',
    description: 'Find the final price of an item after a percentage discount and then tax such as GST, with the money saved and the tax added shown separately.',
    h1: 'Discount and Tax Calculator',
    lede: 'Check what you will actually pay when a discount is applied and tax is added on top, and how much the discount really saved.',
    method: 'discount first, then tax on the discounted price',
    sections: [
      ['What this calculator does', `<p>Enter the original (list) price, the discount percentage and the tax percentage. The calculator applies the discount first, then adds tax to the discounted price, and shows the amount saved, the tax added and the final price.</p>`, 'intro-card'],
      ['Formula used', `<p>Discounted price = Price &times; (1 &minus; Discount % &divide; 100)</p><p>Tax added = Discounted price &times; Tax % &divide; 100</p><p>Final price = Discounted price + Tax added</p>`, 'formula-box'],
      ['Worked example', `<p>A pair of shoes listed at 2,000 with 20% off, and 18% GST added at billing:</p><ul><li>Discounted price = 2,000 &times; 0.80 = 1,600, so you save <strong>400</strong></li><li>Tax added = 1,600 &times; 18% = <strong>288</strong></li><li>Final price = 1,600 + 288 = <strong>1,888</strong></li></ul><p>A common shortcut is to subtract 20% and add 18% to the list price together (2,000 &times; 0.98 = 1,960). That is wrong, because the tax is charged on the discounted amount, not the original.</p>`, 'example-box'],
      ['Order matters, and so does MRP', `<p>In India, tax is charged on the transaction value, which is the price after any discount shown on the invoice. That is the order this calculator uses.</p><p>Most retail products in India carry an MRP that already includes GST. If a shop gives 20% off an MRP of 2,000, you simply pay 1,600 and no tax is added on top; enter the tax as 0. Use a tax rate only when prices are shown before tax, as on many B2B quotes, hotel tariffs and some online listings.</p>`],
      ['Understanding each input', `<ul><li><strong>Original price</strong> &mdash; the list price before discount.</li><li><strong>Discount</strong> &mdash; a percentage from 0 to 100. Leave blank for no discount.</li><li><strong>Tax</strong> &mdash; a percentage from 0 to 100, for example 5, 12, 18 or 28 for GST slabs, or a local sales tax rate. Leave blank for none.</li></ul>`],
      ['Stacked discounts', `<p>&ldquo;20% off plus an extra 10%&rdquo; is not 30% off. The second discount applies to the already reduced price: 2,000 &times; 0.8 &times; 0.9 = 1,440, which is 28% off. To model this, run the first discount, then enter the result as the new price with the second discount.</p>`],
      ['Common mistakes', `<ul><li>Adding tax to an MRP that already includes it.</li><li>Adding discount and tax percentages together.</li><li>Treating stacked discounts as one combined percentage.</li></ul>`]
    ],
    faqs: [
      ['Is GST charged before or after discount?', 'After. GST is charged on the transaction value, which is the price after a discount shown on the invoice.'],
      ['Do I need to add GST to the MRP?', 'No. MRP in India already includes all taxes. Enter 0 tax when the discount is on MRP.'],
      ['How do I find the original price from a discounted price?', 'Divide the sale price by (1 &minus; discount &divide; 100). For 1,600 after 20% off: 1,600 &divide; 0.8 = 2,000.'],
      ['Can I use it for sales tax outside India?', 'Yes. Enter your local sales tax rate. The order of calculation is the same in most places.'],
      ['What if I only want to remove GST from a price?', 'Use the GST calculator&rsquo;s remove GST mode instead.']
    ],
    related: ['calc-tip', ['/gst-calculator.html', 'GST Calculator'], ['/percentage-calculator.html', 'Percentage Calculator']]
  },
  {
    id: 'calc-invoice',
    slug: 'invoice-generator',
    hub: 'finance-calculators.html', hubName: 'Finance calculators',
    kicker: 'Business Tool',
    appCategory: 'BusinessApplication',
    title: 'Free Invoice Generator | Create and Download an Invoice as PDF',
    description: 'Create a simple invoice with line items, discount and tax, preview it live, and download it as a PDF, PNG or CSV. Runs in your browser.',
    h1: 'Invoice Generator',
    lede: 'Create a clean invoice for freelance work or a small sale in a couple of minutes, with totals worked out for you and a PDF to send.',
    method: 'discount on subtotal, then tax on the discounted amount',
    toolHeading: 'Build your invoice',
    labels: { 'invoice-tax': 'Tax %', 'invoice-discount': 'Discount %' },
    sections: [
      ['What this tool does', `<p>Fill in who the invoice is from and to, an invoice number and date, an optional due date and notes, and one line per item with a description, quantity and rate. The preview updates as you type and shows the subtotal, discount, tax and total due. When it looks right, download it as a PDF or PNG to send, or as a CSV for your records.</p><p>Everything is built in your browser. The invoice details are not uploaded to this site&rsquo;s server.</p>`, 'intro-card'],
      ['How the totals are calculated', `<p>Line total = Quantity &times; Rate</p><p>Subtotal = sum of all line totals</p><p>Discount = Subtotal &times; Discount %</p><p>Taxable amount = Subtotal &minus; Discount</p><p>Tax = Taxable amount &times; Tax %</p><p>Total due = Taxable amount + Tax</p><p>The discount is applied before tax, which is the order used on standard GST and VAT invoices.</p>`, 'formula-box'],
      ['Worked example', `<p>A freelancer bills a client for:</p><ul><li>Website design, 1 &times; 25,000 = 25,000</li><li>Hosting, 12 months &times; 500 = 6,000</li></ul><p>Subtotal 31,000. A 10% discount takes off 3,100, leaving 27,900 taxable. 18% tax on that is 5,022, so the <strong>total due is 32,922</strong>.</p>`, 'example-box'],
      ['Is this a GST tax invoice?', `<p>Not on its own. A GST-registered business in India must show specific details on a tax invoice, including the supplier&rsquo;s GSTIN, the recipient&rsquo;s GSTIN for B2B sales, HSN or SAC codes, place of supply, and the tax split into CGST and SGST, or IGST for inter-state supplies. This generator applies one tax percentage and has no separate fields for those.</p><p>You can include GSTIN and HSN details in the &ldquo;From&rdquo;, &ldquo;Bill to&rdquo; and item description fields, but for regular GST billing an accounting or billing tool that produces compliant invoices is the safer choice. This tool suits freelancers, unregistered small businesses, quotes and pro-forma invoices.</p>`],
      ['Tips for a clear invoice', `<ul><li>Use a numbering pattern you will keep, such as INV-2026-001, and never reuse a number.</li><li>Always set a due date and write the payment method in the notes: bank details, UPI ID or a payment link.</li><li>Describe each line so the client can match it to the work agreed.</li><li>Check the downloaded PDF before sending it.</li></ul>`],
      ['Limitations', `<p>One tax rate applies to every line, and the discount is a percentage of the subtotal. There is no logo upload, multiple tax rates or saved client list. Data is not saved between visits, so download your invoice before closing the page.</p>`]
    ],
    faqs: [
      ['Is this invoice generator free?', 'Yes, with no sign-up and no watermark.'],
      ['Are my invoice details stored?', 'No. The invoice is assembled in your browser. The PDF and PNG export libraries are loaded from a public CDN, but your invoice data is not sent to this site.'],
      ['Can I add GST?', 'You can add a single tax percentage. A full GST tax invoice needs extra fields such as GSTIN, HSN/SAC and the CGST/SGST or IGST split.'],
      ['Can I apply a fixed-amount discount?', 'The discount field takes a percentage, and negative line amounts are not accepted. Convert the amount instead: amount &divide; subtotal &times; 100. For 1,000 off a 31,000 subtotal, enter 3.2258.'],
      ['Why does the total show &ldquo;Invalid input&rdquo;?', 'A quantity, rate, tax or discount is negative or out of range. Tax and discount must be between 0 and 100%.']
    ],
    related: ['calc-discount-tax', ['/gst-calculator.html', 'GST Calculator'], ['/upi-qr-code-generator/', 'UPI QR Code Generator']]
  }
];
