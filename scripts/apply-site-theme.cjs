const fs = require('node:fs');
const path = require('node:path');
function applySiteTheme(root, files) {
  let count = 0;
  for (const file of files) {
    if (!file.endsWith('.html') || file === 'index.html' || file.startsWith('google')) continue;
    const filename = path.join(root, file);
    let html = fs.readFileSync(filename, 'utf8');
    if (/<meta[^>]+http-equiv=["']refresh/i.test(html)) continue;
    html = html.replace(/<header\b([^>]*)>([\s\S]*?)<\/header>/i, (tag, attributes, content) => {
      if (/<details\b/i.test(content)) return tag;
      const nav = content.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i);
      if (!nav) return tag;
      return `<header${attributes}>${content}<details class="mobile-menu theme-added-menu"><summary>Menu</summary><div class="mobile-menu-panel">${nav[1]}</div></details></header>`;
    });
    html = html.replace(/<body([^>]*)>/i, (tag, attributes) => {
      if (/\bsite-themed\b/.test(attributes)) return tag;
      if (/class=["']/i.test(attributes)) return '<body' + attributes.replace(/class=(["'])(.*?)\1/i, (_, quote, classes) => `class=${quote}${classes} site-themed${quote}`) + '>';
      return `<body class="site-themed"${attributes}>`;
    });
    if (!html.includes('href="/site-theme.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/site-theme.css"><script defer src="/site-theme.js"></script>\n</head>');
    html = html.replace(/(<meta name="theme-color" content=")[^"]+/, '$1#f2f0e9');
    fs.writeFileSync(filename, html);
    count++;
  }
  return count;
}
module.exports = { applySiteTheme };
