// Builds one standalone, indexable page per tool that previously existed only as a
// widget section of tools.html (tools.html#calc-*). The widget markup is lifted from
// tools.html so the existing, tested logic in script.js keeps working unchanged;
// each page carries its own written explanation from content/tool-pages/*.cjs.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const site = 'https://calculatorsallinone.com';
const contentDir = path.join(root, 'content', 'tool-pages');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = html => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function loadSpecs() {
  if (!fs.existsSync(contentDir)) return [];
  const specs = [];
  for (const name of fs.readdirSync(contentDir).filter(n => n.endsWith('.cjs')).sort()) {
    delete require.cache[require.resolve(path.join(contentDir, name))];
    for (const spec of require(path.join(contentDir, name))) specs.push(spec);
  }
  const seen = new Set();
  for (const s of specs) {
    for (const key of ['id', 'slug', 'title', 'description', 'h1', 'lede', 'kicker', 'appCategory', 'sections', 'faqs']) {
      if (!s[key] || (Array.isArray(s[key]) && !s[key].length)) throw new Error(`Tool page spec ${s.slug || s.id} is missing ${key}`);
    }
    if (seen.has(s.slug)) throw new Error('Duplicate tool page slug ' + s.slug);
    seen.add(s.slug);
    if (s.description.length > 165) throw new Error(`Meta description too long for ${s.slug} (${s.description.length})`);
  }
  return specs;
}

// Return the full outer HTML of <div id="ID" ...> ... </div> using balanced <div> matching.
function extractWidget(source, id) {
  const start = source.indexOf(`<div id="${id}" `);
  if (start < 0) throw new Error('Widget not found in tools.html: ' + id);
  const tag = /<\/?div\b[^>]*>/g;
  tag.lastIndex = start;
  let depth = 0, m;
  while ((m = tag.exec(source))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return source.slice(start, tag.lastIndex);
  }
  throw new Error('Unbalanced widget markup: ' + id);
}

function adaptWidget(widget, spec) {
  let html = widget
    .replace(/<div class="card-glow"><\/div>\s*/, '')
    .replace(/<h3>[\s\S]*?<\/h3>\s*/, '')                     // the page H1 names the tool
    .replace(/^(<div[^>]*>)\s*<p[^>]*>[\s\S]*?<\/p>\s*/, '$1') // one-line card blurb
    .replace(/<details class="formula-explainer">[\s\S]*?<\/details>\s*/, '') // formula is written out below
    .replace(/class="([^"]*)\bscroll-reveal\b([^"]*)"/, 'class="$1$2"')
    .replace(/class="([^"]*)\bstagger-item\b([^"]*)"/, 'class="$1$2"')
    .replace(/class="([^"]*)\bresult-card\b([^"]*)"/, 'class="$1standalone-widget$2"');
  // Visible labels for controls that only had placeholder text.
  const labelled = new Set([...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map(m => m[1]));
  const wrapped = new Set([...html.matchAll(/<label\b[^>]*>(?:(?!<\/label>)[\s\S])*?id="([^"]+)"/g)].map(m => m[1]));
  const labels = spec.labels || {};
  html = html.replace(/(<div class="input-wrapper">\s*)?(<(input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>)/g, (all, wrapper, control, kind, id) => {
    if (labelled.has(id) || wrapped.has(id) || /type="(hidden|checkbox|radio|range|file|color)"/.test(control)) return all;
    const ph = (control.match(/placeholder="([^"]*)"/) || [])[1];
    const name = labels[id] || ph || (control.match(/aria-label="([^"]*)"/) || [])[1];
    if (!name) return all;
    const clean = name.replace(/:\s*$/, '');
    const label = `<label class="field-label" for="${id}">${esc(clean)}</label>`;
    return wrapper ? label + wrapper + control : label + control;
  });
  // Controls without an id (e.g. repeated rows) get an accessible name from their placeholder.
  html = html.replace(/<(input|textarea)\b(?![^>]*\bid=)(?![^>]*aria-label=)([^>]*placeholder="([^"]+)"[^>]*)>/g,
    (all, tag, attrs, ph) => `<${tag} aria-label="${ph}"${attrs}>`);
  return html;
}

function faqSchema(spec) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: spec.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: text(a) } }))
  };
}

function page(spec, widget, specsById) {
  const url = `${site}/${spec.slug}.html`;
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: spec.h1, url, applicationCategory: spec.appCategory, operatingSystem: 'Any', description: spec.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: 'Calculator All-in-One', url: site + '/', email: 'calculators@proton.me' } },
    faqSchema(spec),
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site + '/' },
      { '@type': 'ListItem', position: 2, name: spec.hubName, item: `${site}/${spec.hub}` },
      { '@type': 'ListItem', position: 3, name: spec.h1, item: url } ] }
  ].map(o => `    <script type="application/ld+json" data-managed-schema>\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');

  const sections = spec.sections.map(([h, body, cls]) =>
    `                <article class="calculator-copy-card${cls ? ' ' + cls : ''}"><h2>${esc(h)}</h2>${body}</article>`).join('\n');
  const faqs = `                <article class="calculator-copy-card"><h2>FAQs</h2><div class="faq-list">${spec.faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary>${a.startsWith('<') ? a : `<p>${a}</p>`}</details>`).join('')}</div></article>`;
  const related = (spec.related || []).map(r => {
    const target = specsById[r];
    if (target) return `<a href="/${target.slug}.html">${esc(target.h1)}</a>`;
    if (Array.isArray(r)) return `<a href="${r[0]}">${esc(r[1])}</a>`;
    if (process.env.STRICT_TOOL_PAGES) throw new Error(`Unknown related tool ${r} on ${spec.slug}`);
    console.warn(`  related tool ${r} on ${spec.slug} has no page yet; skipped`);
    return '';
  }).filter(Boolean);
  related.push(`<a href="/${spec.hub}">All ${esc(spec.hubName.toLowerCase())}</a>`);
  const scripts = [(spec.needsQrEngine || /qrcode|qr-code|QRCode/.test(widget)) ? '    <script src="qr-code-engine.js?v=20260812qr" defer></script>' : '', '    <script src="script.js?v=20260924-currency" defer></script>'].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(spec.title)}</title>
    <meta name="description" content="${esc(spec.description)}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Calculator All-in-One">
    <meta name="theme-color" content="#fafbff">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Calculator All-in-One">
    <meta property="og:title" content="${esc(spec.title)}">
    <meta property="og:description" content="${esc(spec.description)}">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${esc(spec.title)}">
    <meta name="twitter:description" content="${esc(spec.description)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="stylesheet" href="style.css?v=20260922-audit">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
${schemas}
</head>
<body class="site-themed standalone-tool-page">
    <a class="skip-link" href="#calculator">Skip to calculator</a>
    <header class="navbar">
        <a href="/" class="logo" style="text-decoration: none;">Calculator All-in-One</a>
        <form class="header-search calculator-search" role="search" data-site-search><input type="search" name="search" placeholder="Search calculators..." aria-label="Search calculators"><button type="submit">Search</button><small>Search all calculators</small></form>
        <nav><a href="/#tools">All Tools</a><a href="/?category=finance#tools">Finance</a><a href="/?category=health#tools">Health</a><a href="/?category=electricity#tools">Electricity</a><a href="about.html">About</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a></nav>
        <details class="mobile-menu"><summary>Menu</summary><div class="mobile-menu-panel"><a href="/#tools">All Tools</a><a href="/?category=finance#tools">Finance</a><a href="/?category=health#tools">Health</a><a href="/?category=electricity#tools">Electricity</a><a href="about.html">About Us</a><a href="contact.html">Contact Us</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms and Conditions</a><a href="disclaimer.html">Disclaimer</a></div></details>
    </header>

    <main class="calculator-page-main">
        <section class="calculator-page-layout">
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/${spec.hub}">${esc(spec.hubName)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(spec.h1)}</span></nav>
            <div class="calculator-page-hero">
                <div class="page-kicker">${esc(spec.kicker)}</div>
                <h1>${esc(spec.h1)}</h1>
                <p>${spec.lede}</p>
            </div>
            <div class="review-strip"><strong>Maintained by <a href="/about.html#owner">Kumara Samigari Lokesh</a></strong><span>Method: ${esc(spec.method || 'see formula below')}</span><a href="/editorial-standards.html">Methods and limitations</a></div>
            <aside class="calculator-tool-card" id="calculator">
                <h2>${esc(spec.toolHeading || 'Enter your numbers')}</h2>
                ${widget}
            </aside>
            <section class="calculator-copy enriched-calculator-copy">
${sections}
${faqs}
                <article class="calculator-copy-card"><h2>Related tools</h2><p class="related-links">${related.join(' ')}</p></article>
            </section>
        </section>
</main>

    <footer class="site-footer">
        <div class="footer-links" style="text-align: center; margin: 0 0 2rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem;">
            <a href="privacy.html">Privacy Policy</a><a href="about.html">About Us</a><a href="contact.html">Contact Us</a><a href="terms.html">Terms & Conditions</a><a href="disclaimer.html">Disclaimer</a>
        </div>

        <p class="copyright">© 2026 Calculator All-in-One. All rights reserved. Built for fast, accurate browser calculations.</p>
    </footer>
${scripts}
</body>
</html>
`;
}

function buildToolPages() {
  const specs = loadSpecs();
  if (!specs.length) return { pages: 0, specs };
  const source = fs.readFileSync(path.join(root, 'tools.html'), 'utf8');
  const byId = Object.fromEntries(specs.map(s => [s.id, s]));
  for (const spec of specs) {
    const widget = adaptWidget(extractWidget(source, spec.id), spec);
    const file = path.join(root, spec.slug + '.html');
    // Generated pages are rebuilt from source each time; the later build steps
    // (theme, notices, ad spaces, loaders) are applied after this.
    fs.writeFileSync(file, page(spec, widget, byId));
  }
  // Register the pages in the public manifest.
  const manifestPath = path.join(__dirname, 'site-files.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let added = 0;
  for (const spec of specs) if (!manifest.includes(spec.slug + '.html')) { manifest.push(spec.slug + '.html'); added++; }
  if (added) fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  // Point every link at the real page instead of tools.html / homepage fragments.
  let rewritten = 0;
  for (const file of manifest.filter(f => f.endsWith('.html'))) {
    const filename = path.join(root, file);
    if (!fs.existsSync(filename)) continue;
    let html = fs.readFileSync(filename, 'utf8');
    const before = html;
    for (const spec of specs) {
      const pattern = new RegExp(`href="(?:https://calculatorsallinone\\.com)?/?(?:tools\\.html|index\\.html)?#${spec.id}"`, 'g');
      if (file === 'tools.html') continue; // tools.html keeps its in-page anchors
      html = html.replace(pattern, `href="/${spec.slug}.html"`);
    }
    if (html !== before) { fs.writeFileSync(filename, html); rewritten++; }
  }
  return { pages: specs.length, specs, rewritten };
}

module.exports = { buildToolPages, loadSpecs, extractWidget, adaptWidget };
if (require.main === module) {
  const r = buildToolPages();
  console.log(`Built ${r.pages} standalone tool pages; rewrote links in ${r.rewritten || 0} files`);
}
