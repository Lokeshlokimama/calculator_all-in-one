const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const files = require('./site-files.json');
const redirects = require('./consolidated-routes.json');
const root = path.resolve(__dirname, '..');
const site = 'https://calculatorsallinone.com';
const errors = [];
const pages = new Map();
for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) { errors.push('Missing public file: ' + file); continue; }
  if (file.endsWith('.html')) pages.set(file, fs.readFileSync(path.join(root, file), 'utf8'));
}
function pageFile(url) {
  const pathname = decodeURIComponent(url.pathname);
  return pathname === '/' ? 'index.html' : pathname.replace(/^\//, '') + (pathname.endsWith('/') ? 'index.html' : '');
}
for (const [file, html] of pages) {
  if (file.startsWith('google')) continue;
  const route = '/' + file.replace(/index\.html$/, '');
  const base = new URL(route, site);
  const moved = redirects[route];
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) errors.push(file + ': duplicate element IDs');
  if ((html.match(/<h1\b/gi) || []).length !== 1) errors.push(file + ': expected one H1');
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(file + ': missing title');
  if (/Search intent|long-tail searches|AdSense readiness|checked for AdSense|AdSense review note/i.test(html)) errors.push(file + ': internal marketing/review copy is public');
  if (moved) {
    if (!/name="robots" content="noindex, follow"/.test(html) || !html.includes('content="0; url=' + moved + '"')) errors.push(file + ': invalid redirect');
    if (/adsbygoogle|googletagmanager/.test(html)) errors.push(file + ': ads/tracking on navigation-only page');
  } else if (file !== '404.html') {
    if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(file + ': missing description');
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical !== base.href) errors.push(file + ': wrong canonical ' + canonical);
  }
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { errors.push(file + ': invalid structured data'); }
  }
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const raw = match[1].replace(/&amp;/g, '&');
    if (!raw || raw === '#' || /^(mailto:|tel:|data:|blob:|javascript:)/.test(raw)) continue;
    let url;
    try { url = new URL(raw, base); } catch { errors.push(file + ': invalid URL ' + raw); continue; }
    if (url.origin !== site) continue;
    const target = pageFile(url);
    if (!files.includes(target)) { errors.push(file + ': missing linked asset/page ' + raw); continue; }
    if (!moved && redirects[url.pathname]) errors.push(file + ': still links to consolidated URL ' + raw);
    if (url.hash && pages.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!pages.get(target).includes('id="' + id + '"') && !pages.get(target).includes("id='" + id + "'")) errors.push(file + ': broken anchor ' + raw);
    }
  }
}
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (locations.length !== new Set(locations).size) errors.push('Duplicate sitemap URLs');
for (const [file, html] of pages) {
  if (file === '404.html' || file.startsWith('google')) continue;
  const url = site + '/' + file.replace(/index\.html$/, '');
  const indexable = !/name="robots"[^>]*noindex/.test(html);
  if (locations.includes(url) !== indexable) errors.push('Sitemap mismatch: ' + file);
}
const expectedAds = 'google.com, pub-9409281508068005, DIRECT, f08c47fec0942fa0';
if (fs.readFileSync(path.join(root, 'ads.txt'), 'utf8').trim() !== expectedAds) errors.push('Publisher ads.txt mismatch');
for (const file of [...files.filter(f => f.endsWith('.js')), ...fs.readdirSync(__dirname).filter(f => /\.(cjs|js)$/.test(f)).map(f => 'scripts/' + f)]) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(file + ': ' + result.stderr);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${pages.size} HTML files, internal links and anchors, metadata, JSON-LD, sitemap, redirects, ads.txt, and JavaScript syntax.`);
