// Static coverage complements browser measurements; it does not certify layout.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = require('./site-files.json').filter(p => p.endsWith('.html') && !p.startsWith('google'));
const browser = JSON.parse(fs.readFileSync(path.join(root, 'SPACING-AUDIT-2026-10-07.json'), 'utf8'));
const classes = new Set(['calculator-tool-card', 'calculator-copy-card', 'content-card', 'traffic-card', 'traffic-panel', 'traffic-path-card', 'ai-info-card', 'ai-tool-card', 'checker-stage', 'checker-workbench', 'upload-card', 'result-card', 'pdf-mode-card', 'privacy-panel', 'ai-hero-proof']);
const rows = pages.map(page => {
  const html = fs.readFileSync(path.join(root, '.site-build', page), 'utf8');
  const redirect = /http-equiv=["']refresh["']/i.test(html);
  const matched = [...html.matchAll(/class=["']([^"']+)["']/g)].flatMap(m => m[1].split(/\s+/)).filter(c => classes.has(c));
  const themed = html.includes('site-theme.css');
  return { page, redirect, themed, squareCardCandidates: themed ? [...new Set(matched)] : [], unpaddedStageCandidate: matched.includes('checker-stage') && page !== 'pdf-converter/index.html', browser: browser.find(r => r.page === page) || null };
});
const report = ['# All-page spacing review — 7 October 2026', '', `Inspected HTML and stylesheet usage for all ${rows.length} public HTML routes in the local build. This is source coverage, not a completed all-page visual certification.`, '', '## Findings', '', '- The shared theme forces 3 px corners on most content and calculator cards. The PDF converter override covers only its converter panel and nested controls; other card families remain candidates for softer corners.', '- The generic checker-stage sets vertical padding but no horizontal padding. Any other page using it needs a left/right spacing review.', '- Browser measurements were saved only for the routes listed below. Other routes remain unverified in the browser because repeated navigation/debugger synchronization stalls prevented completing the sweep. The previous 6 October overflow audit does not certify these new concerns.', '- Browser measurement values are diagnostic candidates; screenshot review is still required before accepting a full-page visual pass.', '', '## Per-route coverage', '', '| Route | Source finding | Browser measurement coverage |', '|---|---|---|'];
for (const r of rows) {
  const finding = r.redirect ? 'Compatibility redirect; review destination' : [r.squareCardCandidates.length ? 'Shared 3 px card corners' : 'Separate layout; inspect visually', r.unpaddedStageCandidate ? 'Stage has no horizontal padding' : ''].filter(Boolean).join('; ');
  const measured = r.browser && r.browser.checks.length === 3 && r.browser.checks.every(c => c && typeof c.width === 'number');
  report.push(`| ${r.page} | ${finding} | ${measured ? '1440 / 390 / 320 px measured; visual review open' : 'Open'} |`);
}
fs.writeFileSync(path.join(root, 'SPACING-SOURCE-AUDIT-2026-10-07.json'), JSON.stringify(rows, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'SPACING-AUDIT-2026-10-07.md'), report.join('\n') + '\n');
console.log(JSON.stringify({routes: rows.length, redirects: rows.filter(r => r.redirect).length, cornerCandidates: rows.filter(r => !r.redirect && r.squareCardCandidates.length).length, stageCandidates: rows.filter(r => r.unpaddedStageCandidate).map(r => r.page), browserMeasured: browser.length}));
