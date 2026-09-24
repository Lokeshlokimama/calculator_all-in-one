// Local-only layout fixture: exercise the results-visible CSS without a file upload.
// Run after npm run build. This file is not in the public deployment manifest.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '.site-build');
const manifest = new Set(require('./site-files.json'));
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = url.pathname.slice(1) || 'index.html';
  if (!manifest.has(file)) { res.writeHead(404).end(); return; }
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  if (file === 'pdf-converter/index.html' && url.searchParams.has('results')) {
    let html = fs.readFileSync(path.join(root, file), 'utf8');
    html = html.replace(/(<aside\b[^>]*id="pdf-output-card"[^>]*) hidden/, '$1');
    // Keep this static fixture from resetting the displayed result state.
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    res.end(html);
  } else fs.createReadStream(path.join(root, file)).pipe(res);
}).listen(4174, '127.0.0.1', () => console.log('PDF layout fixture: http://127.0.0.1:4174/pdf-converter/index.html?results'));
