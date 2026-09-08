const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '.site-build');
const manifest = new Set(require('./site-files.json'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.jpeg': 'image/jpeg' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  let file = pathname.replace(/^\//, '');
  if (!file || file.endsWith('/')) file += 'index.html';
  if (!manifest.has(file) && manifest.has(file + '/index.html')) {
    res.writeHead(301, { Location: pathname + '/' }).end(); return;
  }
  const valid = manifest.has(file) && fs.existsSync(path.join(root, file));
  res.writeHead(valid ? 200 : 404, { 'Content-Type': types[path.extname(valid ? file : '404.html')] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(path.join(root, valid ? file : '404.html')).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Local site: http://127.0.0.1:4173'));
