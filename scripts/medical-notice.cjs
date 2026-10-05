const medicalNotice = '<div class="ymyl-disclaimer" data-medical-notice><strong>Medical Notice:</strong> This tool provides general physiological benchmarks based on standard reference tables and does not constitute clinical diagnostic advice. Always consult a qualified medical professional for health evaluations.</div>';
function applyMedicalNotice(html, file) {
  if (!['bmi-calculator.html', 'tools.html', 'health-calculators.html'].includes(file)) return html;
  html = html.replace(/<div class="ymyl-disclaimer" data-medical-notice>[\s\S]*?<\/div>/g, '');
  if (file === 'tools.html') {
    let count = 0;
    html = html.replace(/(<div\b[^>]*class="[^"]*tool-demo-card[^"]*"[^>]*data-category="health"[^>]*>[\s\S]*?<\/h3>\s*<p>[\s\S]*?<\/p>)/g, match => { count++; return match + '\n' + medicalNotice; });
    if (count !== 8) throw new Error('Expected eight health tool cards, found ' + count);
    return html;
  }
  if (file === 'health-calculators.html') {
    if (!/<section class="page-shell\b[^\"]*">/.test(html)) throw new Error('Missing health directory section');
    return html.replace(/<section class="page-shell\b[^\"]*">/, match => match + medicalNotice);
  }
  const start = html.indexOf('<aside class="calculator-tool-card"');
  const end = html.indexOf('</form>', start);
  if (start < 0 || end < 0) throw new Error('Missing BMI form');
  return html.slice(0,end+7) + '\n' + medicalNotice + html.slice(end+7);
}
module.exports = { applyMedicalNotice };
