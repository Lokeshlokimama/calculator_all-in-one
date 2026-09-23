// Synthetic, non-personal browser-upload fixtures. Never publish this directory.
const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '..', '.qa-fixtures');
fs.mkdirSync(dir, {recursive:true});
const stream = 'BT /F1 18 Tf 72 720 Td (Calculator QA: sample text 123) Tj ET';
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
];
let pdf = '%PDF-1.4\n';
const offsets = [0];
objects.forEach((object,i)=>{ offsets.push(Buffer.byteLength(pdf)); pdf += `${i+1} 0 obj\n${object}\nendobj\n`; });
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
pdf += offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('');
pdf += `trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
fs.writeFileSync(path.join(dir,'sample.pdf'),pdf);
fs.writeFileSync(path.join(dir,'corrupt.pdf'),'Not a valid PDF. Synthetic negative test.');
fs.writeFileSync(path.join(dir,'unsupported.txt'),'Synthetic unsupported upload test.');
fs.writeFileSync(path.join(dir,'pixel.png'),Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6nAAAAABJRU5ErkJggg==','base64'));
console.log(dir);
