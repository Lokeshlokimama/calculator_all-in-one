const fs = require('node:fs');
const path = require('node:path');
function adSpace(placement) {
  return `\n<!-- publisher-ad-space:${placement}:start -->\n<aside class="publisher-ad-space" aria-label="Advertisements" data-ad-placement="${placement}"><p class="publisher-ad-label">Advertisements</p><div class="publisher-ad-mount" id="ad-${placement}"><!-- Reserved ad-unit mount. Configure ad delivery separately before inserting a provider unit. --></div></aside>\n<!-- publisher-ad-space:${placement}:end -->\n`;
}
function elementEnd(html, openingIndex) {
  const opening = html.slice(openingIndex).match(/^<(\w+)\b[^>]*>/);
  if (!opening) throw new Error('Invalid placement boundary');
  const tag = opening[1];
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tags.lastIndex = openingIndex;
  let depth = 0, match;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (!depth) return tags.lastIndex;
  }
  throw new Error('Unclosed placement boundary');
}
function unwrapReadingRow(html) {
  return html.replace(/<!-- publisher-reading-row:start -->\s*<div class="publisher-reading-row">/g, '')
    .replace(/<\/div>\s*<!-- publisher-reading-row:end -->/g, '');
}
function applyAdSpaces(root, files) {
  let pages = 0, placements = 0;
  for (const file of files.filter(file => file.endsWith('.html'))) {
    const filename = path.join(root, file);
    let html = unwrapReadingRow(fs.readFileSync(filename, 'utf8'));
    html = html.replace(/\n?<!-- publisher-ad-space:([\w-]+):start -->[\s\S]*?<!-- publisher-ad-space:\1:end -->\n?/g, '');
    if (file.startsWith('google') || file === '404.html' || /http-equiv=["']refresh|name=["']robots["'][^>]*noindex/i.test(html)) continue;
    if (!html.includes('</main>')) throw new Error('Missing main for ad placement: ' + file);
    if (!html.includes('href="/ad-spaces.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/ad-spaces.css">\n</head>');
    const hero = html.match(/<(?:section|div)\b[^>]*class="[^"]*\b(?:page-hero|traffic-hero|ai-hero|hero)\b[^"]*"[^>]*>/i);
    if (hero) {
      const end = elementEnd(html, hero.index);
      html = html.slice(0, end) + adSpace('content-top') + html.slice(end);
    } else {
      // Retirement pages put their introductory text before the two-column layout.
      html = html.replace('<div class="layout">', adSpace('content-top') + '<div class="layout">');
    }
    if (!html.includes('id="ad-content-top"')) throw new Error('No safe top placement in ' + file);
    placements++;
    if (html.includes('<!-- extended-guide:start -->')) {
      html = html.replace(/<!-- extended-guide:start -->[\s\S]*?<!-- extended-guide:end -->/, guide =>
        `<!-- publisher-reading-row:start --><div class="publisher-reading-row">${guide}${adSpace('reading-sidebar')}</div><!-- publisher-reading-row:end -->`);
      placements++;
    } else if (file === 'index.html') {
      html = html.replace('<div class="currency-band wrap">', adSpace('after-featured') + '<div class="currency-band wrap">');
      placements++;
    } else if (file === 'tools.html') {
      html = html.replace('<section class="seo-content-section"', adSpace('content-middle') + '<section class="seo-content-section"');
      placements++;
    } else {
      const education = html.match(/<section\b[^>]*class="[^"]*\bpdf-education-section\b[^"]*"[^>]*>/i);
      if (education) {
        const end = elementEnd(html, education.index);
        html = html.slice(0, end) + adSpace('content-middle') + html.slice(end);
        placements++;
      } else {
        const mainStart = html.indexOf('<main');
        const articles = [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/gi)].filter(match => match.index > mainStart);
        if (articles.length >= 2) {
          const middle = articles[Math.floor((articles.length - 1) / 2)];
          const end = middle.index + middle[0].length;
          html = html.slice(0, end) + adSpace('content-middle') + html.slice(end);
          placements++;
        }
      }
    }
    html = html.replace('</main>', adSpace('content-end') + '</main>');
    fs.writeFileSync(filename, html);
    pages++;
    placements++;
  }
  return {pages, placements};
}
module.exports = {applyAdSpaces, unwrapReadingRow};
