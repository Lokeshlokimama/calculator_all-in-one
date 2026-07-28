import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const deepfakeHandler = require('../api/deepfake-checker.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadLocalEnvironment() {
    try {
        const source = await readFile(path.join(root, '.env.local'), 'utf8');
        for (const line of source.replace(/^\uFEFF/, '').split(/\r?\n/)) {
            const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/i);
            if (!match || process.env[match[1]] !== undefined) continue;
            let value = match[2];
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[match[1]] = value;
        }
    } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
    }
}

await loadLocalEnvironment();

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const contentTypes = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.svg', 'image/svg+xml'],
    ['.png', 'image/png'],
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.webp', 'image/webp'],
    ['.xml', 'application/xml; charset=utf-8'],
    ['.txt', 'text/plain; charset=utf-8']
]);

function setSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
}

async function resolveStaticFile(urlPath) {
    const decoded = decodeURIComponent(urlPath);
    let relativePath = decoded.replace(/^\/+/, '');
    if (!relativePath) relativePath = 'index.html';
    if (relativePath.endsWith('/')) relativePath += 'index.html';

    let filePath = path.resolve(root, relativePath);
    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) return null;
    try {
        const details = await stat(filePath);
        if (details.isDirectory()) filePath = path.join(filePath, 'index.html');
        return filePath;
    } catch {
        return null;
    }
}

const server = createServer(async (req, res) => {
    setSecurityHeaders(res);
    const url = new URL(req.url || '/', `http://${req.headers.host || `${host}:${port}`}`);

    if (url.pathname === '/api/deepfake-checker') {
        await deepfakeHandler(req, res);
        return;
    }

    if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, HEAD');
        res.end('Method not allowed');
        return;
    }

    try {
        const filePath = await resolveStaticFile(url.pathname);
        if (!filePath) {
            const notFound = await readFile(path.join(root, '404.html'));
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            if (req.method === 'HEAD') res.end();
            else res.end(notFound);
            return;
        }

        const body = await readFile(filePath);
        res.statusCode = 200;
        res.setHeader('Content-Type', contentTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream');
        if (req.method === 'HEAD') res.end();
        else res.end(body);
    } catch {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Local server could not read this file.');
    }
});

server.listen(port, host, () => {
    console.log(`Calculator All-in-One local server: http://${host}:${port}`);
});
