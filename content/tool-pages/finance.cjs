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
  }
];
