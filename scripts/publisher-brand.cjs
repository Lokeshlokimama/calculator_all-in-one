const email = 'contact@calculatorsallinone.com';
const copyright = '<p class="copyright">© 2026 Calculator All-in-One. All rights reserved. Built for fast, accurate browser calculations.</p>';
function standardizePublisher(html) {
  html = html.replace(/<!--\s*AdSense\b[\s\S]*?-->/gi, '')
    .replace(/<(p|div)\b[^>]*>\s*(?:Trust page )?checked for AdSense review\.?\s*<\/\1>/gi, '')
    .replace(/AdSense review note\.?\s*/gi, '')
    .replace(/support\.aiagents@gmail\.com/g, email)
    .replace(/<p\b[^>]*class="maintainer-credit"[^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<p\b[^>]*class="copyright"[^>]*>[\s\S]*?<\/p>/gi, copyright);
  html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, footer => {
    footer = footer.replace(/<span>\s*(?:©|&copy;)\s*2026 Calculator All-in-One\.?\s*<\/span>/gi, '');
    return footer.includes('class="copyright"') ? footer : footer.replace('</footer>', copyright + '</footer>');
  });
  html = html.replace(/[ \t]+\r?$/gm, '').trimEnd() + '\n';
  return html.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, open, json, close) => {
    const data = JSON.parse(json);
    function visit(value) {
      if (!value || typeof value !== 'object') return;
      for (const key of ['publisher', 'author']) {
        if (value[key]) value[key] = { '@type': 'Organization', name: 'Calculator All-in-One', url: 'https://calculatorsallinone.com/', email };
      }
      Object.values(value).forEach(visit);
    }
    visit(data);
    return open + '\n' + JSON.stringify(data, null, 2) + '\n' + close;
  });
}
module.exports = { standardizePublisher };
