const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'tools.html'), 'utf8');
const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const dedicated = { 'calc-emi':'emi-calculator.html', 'calc-bmi':'bmi-calculator.html', 'calc-sip':'sip-calculator.html', 'calc-age':'age-calculator.html', 'calc-pct':'percentage-calculator.html', 'calc-gst':'gst-calculator.html', 'calc-pass':'password-generator.html', 'calc-qr':'qr-code-generator.html', 'calc-curr':'currency-converter.html', 'calc-electricity-bill':'electricity-bill-calculator-india/' };
const cards = [...source.matchAll(/<div id="(calc-[^"]+)" class="[^"]*tool-demo-card[^"]*" data-category="([^"]+)"[^>]*>[\s\S]*?<h3>([^<]+)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g)].map(m => ({id:m[1], category:m[2], title:m[3], description:m[4].replace(/<[^>]+>/g, '')}));
if (cards.length < 40) throw new Error('Tool directory extraction unexpectedly lost cards');
for (const [id, title, description, url] of [
  ['calc-epf','EPF Savings Calculator','Project provident fund savings from actual EPF contributions.','epf-calculator.html'],
  ['calc-eps','EPS Pension Calculator','Standard pension formula with explicit service and scope limits.','eps-pension-calculator.html'],
  ['calc-nps','NPS Retirement Calculator','Corpus, annuity scenarios and inflation-adjusted savings.','nps-calculator.html'],
  ['file-to-pdf','Convert Files to PDF','Word DOCX, Excel XLSX, PowerPoint PPTX, images and text to printable PDF.','convert-to-pdf/'],
  ['images-to-pdf','Images to PDF','Combine JPG, PNG and WebP images into a PDF.','images-to-pdf/'],
  ['pdf-converter','PDF Converter','Extract PDF text or convert pages to images.','pdf-converter/'],
  ['merge-pdf','Merge PDF','Combine existing PDF documents.','merge-pdf/']
]) { dedicated[id] = url; cards.push({id, title, description, category:id.startsWith('calc-')?'finance':'files'}); }
const links = cards.map(c => `<a id="${c.id}" data-tool-link="true" data-category="${c.category}" href="/${dedicated[c.id] || 'tools.html#'+c.id}"><h3>${c.title}</h3><p>${c.description}</p><span class="tool-category">${escape(c.category)}</span></a>`).join('\n');
const categories = [...new Set(cards.map(c=>c.category))];
const html = fs.readFileSync(path.join(__dirname, 'landing-template.html'), 'utf8')
  .replaceAll('{{COUNT}}', String(cards.length))
  .replace('{{CATEGORIES}}', categories.map(c => `<option value="${c}">${escape(c[0].toUpperCase()+c.slice(1))}</option>`).join(''))
  .replace('{{TOOLS}}', links);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`Built directory with ${cards.length} existing tools`);
