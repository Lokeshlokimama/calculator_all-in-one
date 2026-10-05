const financialNotice = '<div class="ymyl-disclaimer"><strong>Financial Notice:</strong> Calculations are mathematical estimates for planning purposes only and exclude statutory fees, rate adjustments, or custom amortization schedules. Consult a licensed financial advisor before entering into loan agreements.</div>';
const financialNoticePages = ['emi-calculator.html', 'loan-calculator.html', 'emi-calculator-with-prepayment/index.html'];
function applyFinancialNotice(html, file) {
  if (!financialNoticePages.includes(file)) return html;
  html = html.replace(/<div class="ymyl-disclaimer">[\s\S]*?<\/div>/g, '');
  const start = html.search(/<aside\b[^>]*class="(?:calculator-tool-card|traffic-tool-card)"/);
  const end = html.indexOf('</form>', start);
  if (start < 0 || end < 0) throw new Error('Missing loan calculator form: ' + file);
  return html.slice(0, end + 7) + '\n' + financialNotice + html.slice(end + 7);
}
module.exports = { applyFinancialNotice, financialNoticePages };
