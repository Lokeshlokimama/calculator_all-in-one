const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {removeOptionalLoaders} = require('../scripts/publisher-safety.cjs');
test('publisher cleanup removes direct and deferred tracking, preserving tools and metadata', () => {
  const kept = '<script src="/calculator-pages.js"></script><script type="application/ld+json">{"name":"Tool"}</script><meta name="google-adsense-account" content="ca-pub-9409281508068005">';
  const input = kept + '<script async src="https://www.googletagmanager.com/gtag/js"></script><script>gtag("config","id")</script><script>setTimeout(()=>load("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"),3500)</script>';
  assert.equal(removeOptionalLoaders(input), kept);
  assert.equal(removeOptionalLoaders(kept), kept);
});
test('public HTML contains no optional ad or analytics loaders', () => {
  const root = path.resolve(__dirname, '..');
  for (const file of require('../scripts/site-files.json').filter(f=>f.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(root,file),'utf8');
    assert.doesNotMatch(html,/googletagmanager\.com|pagead2\.googlesyndication\.com|adsbygoogle/,file);
  }
  assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'), /name="google-adsense-account"/);
});
