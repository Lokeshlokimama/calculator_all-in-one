const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '..', '.qa_final', 'adsense');
fs.mkdirSync(dir, { recursive: true });
function makePdf(count) {
  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  const kids = [];
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  for (let i = 0; i < count; i++) {
    const page = 4 + i * 2;
    kids.push(page + ' 0 R');
    objects[page] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${page + 1} 0 R >>`;
    const stream = `BT /F1 20 Tf 50 700 Td (Synthetic test page ${i + 1}) Tj ET\n`;
    objects[page + 1] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`;
  }
  objects[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${count} >>`;
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = Buffer.byteLength(pdf);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  return pdf + `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
}
for (const count of [2, 41]) fs.writeFileSync(path.join(dir, `sample-${count}.pdf`), makePdf(count));
fs.writeFileSync(path.join(dir, 'invalid.pdf'), 'This is not PDF data.');
console.log('Synthetic PDF fixtures: ' + dir);
