const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const files = require('./site-files.json');
const site = 'https://calculatorsallinone.com';
const root = path.resolve(__dirname, '..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const failures = [];
let cursor = 0, passed = 0;
async function worker() {
  while (cursor < files.length) {
    const file = files[cursor++];
    if (file === '.nojekyll') continue;
    const route = file === 'index.html' ? '/' : '/' + file.replace(/index\.html$/, '');
    try {
      const response = await fetch(site + route, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
      const bytes = Buffer.from(await response.arrayBuffer());
      const expected = file === '404.html' ? [200, 404] : [200];
      if (!expected.includes(response.status)) throw new Error('HTTP ' + response.status);
      // Git may normalize text line endings when GitHub Pages checks out the commit.
      const textFile = /\.(html|css|js|xml|txt|svg)$/.test(file) || file === 'CNAME';
      const local = fs.readFileSync(path.join(root, file));
      const normalize = value => textFile ? value.toString('utf8').replace(/\r\n/g, '\n') : value;
      if (hash(normalize(bytes)) !== hash(normalize(local))) throw new Error('live content differs from release');
      passed++;
    } catch (error) { failures.push(route + ': ' + error.message); }
  }
}
Promise.all(Array.from({ length: 4 }, worker)).then(() => {
  console.log(`Live files matching release: ${passed}/${files.length - 1}`);
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
});
