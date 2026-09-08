const fs = require('node:fs');
const path = require('node:path');
const files = require('./site-files.json');
const routes = require('./consolidated-routes.json');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.site-build');
const site = 'https://calculatorsallinone.com';

// Compatibility pages are navigational only: no ads, tracking, or duplicate article.
// GitHub Pages cannot set per-route HTTP redirects; zero-second refresh is its fallback.
for (const [oldRoute, destination] of Object.entries(routes)) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${destination}">
<link rel="canonical" href="${site}${destination.split('#')[0]}">
<title>Tool moved | Calculator All-in-One</title>
</head>
<body><main><h1>This tool has moved</h1><p>We combined overlapping pages into one working tool.</p><p><a href="${destination}">Continue to the tool</a></p></main></body>
</html>
`;
  fs.writeFileSync(path.join(root, oldRoute, 'index.html'), html);
}

const htmlFiles = files.filter(file => file.endsWith('.html'));
const indexed = htmlFiles.filter(file => {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  return !/name=["']robots["'][^>]+noindex/i.test(html) &&
    file !== '404.html' && !file.startsWith('google');
});
const entries = indexed.map(file => {
  const route = file === 'index.html' ? '/' : '/' + file.replace(/index\.html$/, '');
  return `  <url><loc>${site}${route}</loc></url>`;
});
// Do not pretend all pages were editorially reviewed on the build date.
fs.writeFileSync(path.join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`);
fs.mkdirSync(output, { recursive: true });
for (const file of files) {
  const destination = path.resolve(output, file);
  if (!destination.startsWith(output + path.sep)) throw new Error('Invalid manifest path');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
}
console.log(`Built ${files.length} public files; ${indexed.length} indexable pages; ${Object.keys(routes).length} compatibility redirects.`);
