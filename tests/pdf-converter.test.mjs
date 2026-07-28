import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const pdfToolPages = [
    ['images-to-pdf', 'Images to PDF Converter'],
    ['merge-pdf', 'Merge PDF Online'],
    ['split-pdf', 'Split PDF Online'],
    ['compress-pdf', 'Compress PDF Online'],
    ['pdf-password-helper', 'PDF Password Helper'],
    ['ocr-scanned-pdf', 'OCR Scanned PDF']
];

test('PDF converter page has SEO, privacy, modes, FAQs, and next-tool ideas', async () => {
    const [html, script] = await Promise.all([
        readFile(path.join(root, 'pdf-converter', 'index.html'), 'utf8'),
        readFile(path.join(root, 'pdf-converter', 'pdf-converter.js'), 'utf8')
    ]);

    assert.match(html, /<title>PDF Converter \| PDF to Word and Images<\/title>/);
    assert.match(html, /rel="canonical" href="https:\/\/calculatorsallinone\.com\/pdf-converter\/"/);
    assert.match(html, /property="og:title" content="PDF Converter \| PDF to Word and Images"/);
    assert.match(html, /PDF to Word/);
    assert.match(html, /PDF to Image/);
    assert.match(html, /No server upload/);
    assert.match(html, /Browser processing/);
    assert.match(html, /href="\/images-to-pdf\/"/);
    assert.match(html, /href="\/merge-pdf\/"/);
    assert.match(html, /href="\/split-pdf\/"/);
    assert.match(html, /href="\/compress-pdf\/"/);
    assert.match(html, /href="\/pdf-password-helper\/"/);
    assert.match(html, /href="\/ocr-scanned-pdf\/"/);
    assert.equal((html.match(/<details>/g) || []).length, 6);

    const schema = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(schema, 'PDF converter should include JSON-LD');
    const parsed = JSON.parse(schema);
    assert.equal(parsed['@type'], 'FAQPage');
    assert.equal(parsed.mainEntity.length, 6);

    assert.match(script, /const MAX_FILE_SIZE = 25 \* 1024 \* 1024;/);
    assert.match(script, /PDFJS_SRC = 'https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js\/3\.11\.174\/pdf\.min\.js'/);
    assert.match(script, /JSZIP_SRC = 'https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jszip\/3\.10\.1\/jszip\.min\.js'/);
    assert.doesNotMatch(script, /\bfetch\s*\(/, 'PDF converter should not upload files through fetch');
});

test('site entry points link to the PDF converter', async () => {
    const [home, utility, sitemap, privacy, buildScript, packageJson] = await Promise.all([
        readFile(path.join(root, 'index.html'), 'utf8'),
        readFile(path.join(root, 'utility-tools.html'), 'utf8'),
        readFile(path.join(root, 'sitemap.xml'), 'utf8'),
        readFile(path.join(root, 'privacy.html'), 'utf8'),
        readFile(path.join(root, 'scripts', 'build-static.mjs'), 'utf8'),
        readFile(path.join(root, 'package.json'), 'utf8')
    ]);

    assert.match(home, /href="\/pdf-converter\/">PDF Converter/);
    assert.match(home, /PDF conversion/);
    assert.match(utility, /href="\/pdf-converter\/">PDF Converter/);
    assert.match(sitemap, /https:\/\/calculatorsallinone\.com\/pdf-converter\//);
    assert.match(privacy, /PDF converter files/);
    assert.match(buildScript, /'pdf-converter'/);
    assert.match(packageJson, /pdf-converter\/pdf-converter\.js/);
    assert.match(packageJson, /pdf-tools-suite\.js/);
    for (const [slug] of pdfToolPages) {
        assert.match(home, new RegExp(`href="\\/${slug}\\/`), `homepage should link ${slug}`);
        assert.match(utility, new RegExp(`href="\\/${slug}\\/`), `utility page should link ${slug}`);
        assert.match(sitemap, new RegExp(`https:\\/\\/calculatorsallinone\\.com\\/${slug}\\/`), `sitemap should include ${slug}`);
        assert.match(buildScript, new RegExp(`'${slug}'`), `static build should copy ${slug}`);
    }
});

test('focused PDF tool pages are indexable, wired, and honest about local limits', async () => {
    const sharedScript = await readFile(path.join(root, 'pdf-tools-suite.js'), 'utf8');
    assert.match(sharedScript, /dataset\.pdfTool/);
    assert.match(sharedScript, /PDFLIB_SRC/);
    assert.match(sharedScript, /TESSERACT_SRC/);
    assert.doesNotMatch(sharedScript, /\bfetch\s*\(/, 'PDF tools should not upload files through fetch');

    for (const [slug, titleText] of pdfToolPages) {
        const html = await readFile(path.join(root, slug, 'index.html'), 'utf8');
        assert.match(html, new RegExp(`<title>${titleText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), `${slug} should have an SEO title`);
        assert.match(html, new RegExp(`rel="canonical" href="https:\\/\\/calculatorsallinone\\.com\\/${slug}\\/`), `${slug} should have canonical URL`);
        assert.match(html, /<h1\b/i, `${slug} should have one H1`);
        assert.match(html, /pdf-tools-suite\.js/, `${slug} should load shared PDF tools script`);
        assert.match(html, /No server upload|No PDF upload|Local processing|Browser OCR|Browser merge/i, `${slug} should explain local/browser processing`);
        assert.match(html, /<footer class="ai-footer">/, `${slug} should include footer navigation`);
        assert.doesNotMatch(html, /coming soon|Lorem ipsum|Content goes here/i, `${slug} should not contain placeholder copy`);
    }

    const passwordPage = await readFile(path.join(root, 'pdf-password-helper', 'index.html'), 'utf8');
    assert.match(passwordPage, /does not add or remove passwords from PDF files/i);
    assert.match(passwordPage, /No fake encryption/i);

    const compressPage = await readFile(path.join(root, 'compress-pdf', 'index.html'), 'utf8');
    assert.match(compressPage, /image-based PDF copy/i);
    assert.match(compressPage, /selectable text, links, and form fields may be removed/i);
});
