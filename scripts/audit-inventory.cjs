// Private audit artifact: intentionally absent from the public manifest.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = require('./site-files.json');
const aliases = require('./consolidated-routes.json');
const plain = html => html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').replace(/\|/g,'/').trim();
const evidence = {
  'index.html':['Browser: search, empty results, category links; desktop 1366px/mobile 375px','Task directory, not 62 simultaneous forms','Previously 214512-byte homepage; now 16849 bytes','Retain directory; preserve toolbox and old anchors'],
  'tools.html':['Selected unit matrices and browser flows, NOT all tools end-to-end','62 utilities with expandable methods','Incorrect examples and validation inconsistencies','Correct examples and logic; specialist review remains valuable'],
  'emi-calculator.html':['Browser normal/zero-rate/invalid tenure; unit tests','Monthly-tenure reducing-balance payment','Wrong totals, zero-interest statement and unsupported affordability rule','Corrected examples, limitations and currency-label note'],
  'loan-calculator.html':['Dedicated-handler unit tests','Year-tenure alternative to EMI','Rounded payment used to derive interest example','Corrected; target for overlapping home-loan page'],
  'bmi-calculator.html':['Source/unit checks; not full browser test this run','Adult screening with input units','Vague age audience; unsupported health interpretation','Specify CDC adult categories and rounding limits'],
  'sip-calculator.html':['Dedicated and actual chart-handler tests','Contribution/growth breakdown','Contribution timing unclear; rate convention inconsistent','Nominal rate/12 and beginning-of-month contributions'],
  'gst-calculator.html':['Mobile reverse-tax browser test; unit tests','Arithmetic, not legal classification','Fixed list restricted applicable rates','User-entered rate, CBIC link, duplicate consolidation'],
  'currency-converter.html':['Actual provider request and simulated failures','Dated reference rates','Missing date could be labelled current; no timeout','Validate rates and timestamps; 72-hour age cap and 15-second timeout'],
  'qr-code-generator.html':['Browser generation; saved SVG contents verified','Local payload preview and download','Sticky desktop panel obstructed lower actions','Removed sticky positioning; physical scan interoperability unverified'],
  'pdf-converter/index.html':['Real browser libraries: text/PNG export; corrupt PDF rejected','Text-only .doc and page-image workflows','No new defect in tested conversions','Retain; downloaded text and PNG dimensions checked'],
  'sip-step-up-calculator/index.html':['Actual form-handler tests','Annual contribution increases','Used a different return convention from ordinary SIP','Aligned convention and added worked example'],
  'emi-calculator-with-prepayment/index.html':['Actual form-handler and payment tests','Prepayment applied to remaining balance','Prior final-payment correction already existed','Retain; lender-specific fees excluded'],
  'electricity-bill-calculator-india/index.html':['Actual form-handler tests','User-entered usage/rate/charges, not official tariffs','State tariffs/subsidies are not modelled','Retain existing consolidated estimator']
};
const rows = [];
for(const file of files.filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const route='/'+file.replace(/index\.html$/,'');
  const title=plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'Ownership verification');
  let detail=evidence[file];
  if(aliases[route]) detail=['Navigation only; HTTP/body checks','No independent tool needed','Overlapping/old route','Ad-free meta-refresh to '+aliases[route]+'; excluded from sitemap'];
  if(!detail && /-calculators\.html|utility-tools\.html/.test(file)) detail=['Navigation; links checked','Category selection, not a distinct tool','Ad loader on mainly navigational page','Keep hub; remove ad loader, not hide with robots'];
  if(!detail && /^(about|contact|privacy|terms|disclaimer|editorial-standards)\.html$/.test(file)) detail=['Informational; source/links checked','Existing contact, policies and methods','Account consent configuration needs owner verification','Preserve; no duplicate policies or invented credentials'];
  if(!detail) detail=['Source/links checked; not individually browser-certified','Purpose-specific workflow; novelty not established','No additional specific defect established by recorded checks','Retain; link checks are not functional certification'];
  rows.push('| ['+route+'](https://calculatorsallinone.com'+route+') | '+title+' | '+detail.join(' | ')+' |');
}
const source=fs.readFileSync(path.join(root,'tools.html'),'utf8');
const cards=[...source.matchAll(/<div id="(calc-[^"]+)" class="[^"]*tool-demo-card[^"]*" data-category="([^"]+)"[^>]*>[\s\S]*?<h3>([^<]+)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g)];
const tested=new Set('standard bmi emi tip pass unit bmr water ideal-weight protein body-fat due-date sip fd rd gst salary leave curr age time pct fraction quadratic cgpa att word case base-converter subnet aspect-ratio color sw discount-tax power kwh watt-unit solar inverter ups generator circle triangle pythagorean volume uuid mileage scientific invoice'.split(' '));
const defects={bmr:'Example corrected to 1649 kcal/day',water:'Explanation used 0.033 while code used 0.035; corrected','ideal-weight':'Height rounding changed result; corrected to 70.5 kg','body-fat':'Example corrected from 17.5% to 19.2%',rd:'Example corrected to 128425.30; overflow guarded',sip:'Fractional monthly contributions rejected',curr:'Rate date, value and timeout checks added',fraction:'Decimals silently truncated; now rejected',subnet:'Decimal CIDR silently truncated; now rejected',quadratic:'Overflow now rejected',scientific:'Unbounded factorial; now restricted to integers 0–170','electricity-bill':'Invented chart tax/fixed charges removed','date-diff':'Impossible dates now rejected'};
const tools=cards.map(m=>{
  const id=m[1].slice(5);
  const state=id==='triangle'?'Browser plus unit tests':tested.has(id)?'Selected unit cases; coverage varies':'Source/UI only; full workflow unverified';
  return '| [/tools.html#'+m[1]+'](https://calculatorsallinone.com/tools.html#'+m[1]+') | '+plain(m[3])+' ('+m[2]+') | '+state+' | '+plain(m[4])+'; not claimed unique on the web | '+(defects[id]||'No additional specific defect established in recorded checks')+' | Retain; see method and test limitations |';
});
const header='| URL | Purpose | Working tool? Evidence | Unique value / overlap | Confirmed defects or uncertainty | Action |\n|---|---|---|---|---|---|\n';
fs.writeFileSync(path.join(root,'AUDIT-INVENTORY.md'),'# Page and tool inventory — 22 September 2026\n\nScope: '+rows.length+' HTML files in the release manifest and '+cards.length+' toolbox anchors. This is not a claim that every workflow or input passed. The manifest describes the local build; branch-root hosting can expose extra files. HTTP checks do not execute calculators. Originality relative to competitors and the exact cause of Google’s decision are not established.\n\n## Public routes\n\n'+header+rows.join('\n')+'\n\n## Toolbox\n\n'+header+tools.join('\n')+'\n\nSee [REPAIR-REPORT.md](REPAIR-REPORT.md) for evidence, exclusions and deployment checks.\n');
console.log('Inventoried '+rows.length+' HTML routes and '+cards.length+' toolbox entries.');
