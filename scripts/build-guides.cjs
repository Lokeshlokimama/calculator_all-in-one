const fs = require('node:fs');
const path = require('node:path');
const guideRoot = path.join(__dirname, '..', 'content', 'guides');
function escape(value) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function applyGuides(root) {
  let count = 0;
  for (const name of fs.readdirSync(guideRoot).filter(name => name.endsWith('.md'))) {
    const source = fs.readFileSync(path.join(guideRoot, name), 'utf8');
    const [target, ...blocks] = source.trim().split(/\r?\n\s*\r?\n/);
    const filename = path.join(root, target.trim());
    const body = blocks.map(block => {
      if (block.startsWith('## ')) return `<h2>${escape(block.slice(3))}</h2>`;
      if (block.startsWith('### ')) return `<h3>${escape(block.slice(4))}</h3>`;
      if (block.startsWith('Source: ')) {
        const [url, ...label] = block.slice(8).split(' ');
        if (!/^https:\/\//.test(url)) throw new Error('Invalid source in ' + name);
        return `<p class="source-note">Reference: <a href="${escape(url)}">${escape(label.join(' '))}</a>. Examples above use this calculator’s assumptions.</p>`;
      }
      return `<p>${escape(block.replace(/\r?\n/g, ' '))}</p>`;
    }).join('\n');
    let html = fs.readFileSync(filename, 'utf8').replace(/\n?<!-- extended-guide:start -->[\s\S]*?<!-- extended-guide:end -->\n?/g, '');
    if (!html.includes('</main>')) throw new Error('Missing main in ' + target);
    html = html.replace('</main>', `\n<!-- extended-guide:start -->\n<article class="calculator-copy-card content-card extended-guide">${body}</article>\n<!-- extended-guide:end -->\n</main>`);
    fs.writeFileSync(filename, html);
    count++;
  }
  return count;
}
module.exports = { applyGuides };
