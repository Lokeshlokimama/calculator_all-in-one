const fs = require('node:fs');
const path = require('node:path');
function adSpace(placement) {
  return `\n<!-- publisher-ad-space:${placement}:start -->\n<aside class="publisher-ad-space" aria-label="Advertisements" data-ad-placement="${placement}"><p class="publisher-ad-label">Advertisements</p><div class="publisher-ad-mount" id="ad-${placement}"><!-- Reserved ad-unit mount. Configure ad delivery separately before inserting a provider unit. --></div></aside>\n<!-- publisher-ad-space:${placement}:end -->\n`;
}
function applyAdSpaces(root, files) {
  let pages = 0, placements = 0;
  for (const file of files.filter(file => file.endsWith('.html'))) {
    const filename = path.join(root, file);
    let html = fs.readFileSync(filename, 'utf8');
    html = html.replace(/\n?<!-- publisher-ad-space:([\w-]+):start -->[\s\S]*?<!-- publisher-ad-space:\1:end -->\n?/g, '');
    if (file.startsWith('google') || file === '404.html' || /http-equiv=["']refresh|name=["']robots["'][^>]*noindex/i.test(html)) continue;
    if (!html.includes('</main>')) throw new Error('Missing main for ad placement: ' + file);
    if (!html.includes('href="/ad-spaces.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/ad-spaces.css">\n</head>');
    if (html.includes('<!-- extended-guide:start -->')) {
      html = html.replace('<!-- extended-guide:start -->', adSpace('between-guides') + '<!-- extended-guide:start -->');
      placements++;
    } else if (file === 'index.html') {
      html = html.replace('<div class="currency-band wrap">', adSpace('after-featured') + '<div class="currency-band wrap">');
      placements++;
    }
    html = html.replace('</main>', adSpace('content-end') + '</main>');
    fs.writeFileSync(filename, html);
    pages++;
    placements++;
  }
  return {pages, placements};
}
module.exports = {applyAdSpaces};
