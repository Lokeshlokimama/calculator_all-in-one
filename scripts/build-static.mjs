import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, 'dist');
const expectedOutput = path.join(root, 'dist');

if (output !== expectedOutput || !output.startsWith(`${root}${path.sep}`)) {
    throw new Error('Refusing to build outside the project dist directory.');
}

const publicExtensions = new Set(['.css', '.html', '.js', '.svg', '.txt', '.xml']);
const publicRootNames = new Set(['CNAME']);
const publicDirectories = [
    'ai-tools',
    'assets',
    'deepfake-checker',
    'pdf-converter',
    'images-to-pdf',
    'merge-pdf',
    'split-pdf',
    'compress-pdf',
    'pdf-password-helper',
    'ocr-scanned-pdf'
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!publicRootNames.has(entry.name) && !publicExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    await cp(path.join(root, entry.name), path.join(output, entry.name));
}

for (const directory of publicDirectories) {
    await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}

console.log(`Static site assembled in ${output}`);
