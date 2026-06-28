import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const domain = 'https://calculatorsallinone.com';
const calculatorPages = [
    'emi-calculator.html', 'bmi-calculator.html', 'age-calculator.html',
    'percentage-calculator.html', 'gst-calculator.html', 'loan-calculator.html',
    'sip-calculator.html', 'currency-converter.html', 'password-generator.html',
    'qr-code-generator.html'
];
const categoryPages = [
    'finance-calculators.html', 'health-calculators.html',
    'electricity-calculators.html', 'math-calculators.html',
    'geometry-calculators.html', 'utility-tools.html'
];

const files = (await readdir(root)).filter((file) => file.endsWith('.html') && !file.startsWith('google'));
const pages = new Map(await Promise.all(files.map(async (file) => [file, await readFile(path.join(root, file), 'utf8')])));

function one(html, pattern, label) {
    const matches = [...html.matchAll(pattern)];
    assert.equal(matches.length, 1, `${label} should occur exactly once`);
    return matches[0][1];
}

function visibleWords(html) {
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
    return body
        .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z#0-9]+;/gi, ' ')
        .match(/[A-Za-z0-9]+/g)?.length || 0;
}

test('every indexable page has unique metadata, one H1, canonical URL, and valid structured data', () => {
    const titles = new Set();
    const descriptions = new Set();
    for (const [file, html] of pages) {
        const title = one(html, /<title>([^<]+)<\/title>/gi, `${file} title`).trim();
        const description = one(html, /<meta\s+name="description"\s+content="([^"]+)"/gi, `${file} description`).trim();
        const canonical = one(html, /<link\s+rel="canonical"\s+href="([^"]+)"/gi, `${file} canonical`);
        assert.ok(!titles.has(title), `${file} title must be unique`);
        assert.ok(!descriptions.has(description), `${file} description must be unique`);
        titles.add(title);
        descriptions.add(description);
        assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${file} should contain one H1`);
        assert.equal(canonical, file === 'index.html' ? `${domain}/` : `${domain}/${file}`);
        for (const script of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
            assert.doesNotThrow(() => JSON.parse(script[1]), `${file} contains invalid JSON-LD`);
        }
    }
});

test('AdSense, trust, privacy, and editorial requirements are present', () => {
    for (const [file, html] of pages) {
        const isNoIndex = /name="robots"\s+content="noindex/i.test(html);
        const expectedAdLoaders = isNoIndex ? 0 : 1;
        assert.equal((html.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/gi) || []).length, expectedAdLoaders, `${file} has the wrong number of AdSense loaders`);
        assert.match(html, /href="privacy\.html"/i, `${file} should link Privacy`);
        assert.match(html, /href="about\.html"/i, `${file} should link About`);
        assert.match(html, /href="contact\.html"/i, `${file} should link Contact`);
        assert.match(html, /href="editorial-standards\.html"/i, `${file} should link Editorial Standards`);
    }
    const privacy = pages.get('privacy.html');
    for (const phrase of ['Google AdSense', 'Google Analytics', 'cookies', 'IP address', 'api.qrserver.com', 'privacy controls']) {
        assert.match(privacy, new RegExp(phrase, 'i'), `privacy policy should disclose ${phrase}`);
    }
    const standards = pages.get('editorial-standards.html');
    for (const phrase of ['How calculations are tested', 'Source selection', 'Corrections', 'Advertising independence', 'Last reviewed']) {
        assert.match(standards, new RegExp(phrase, 'i'), `editorial standards should include ${phrase}`);
    }
});

test('calculator pages contain substantial, attributable, source-backed, non-duplicated content', () => {
    const paragraphOwners = new Map();
    for (const file of calculatorPages) {
        const html = pages.get(file);
        assert.ok(html, `${file} must exist`);
        assert.ok(visibleWords(html) >= 800, `${file} should contain at least 800 visible words`);
        assert.match(html, /class="[^"]*content-byline[^"]*"/i, `${file} needs visible authorship and review information`);
        assert.match(html, /class="[^"]*content-evidence[^"]*"/i, `${file} needs calculation assumptions and evidence`);
        assert.match(html, /<a\s+[^>]*href="https:\/\//i, `${file} needs at least one external reference`);
        for (const heading of ['What this calculator does', 'When to use it', 'Formula used', 'Step-by-step example', 'Benefits', 'Common mistakes', 'FAQs', 'Related calculators']) {
            assert.match(html, new RegExp(`<h2>${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/h2>`, 'i'), `${file} needs a ${heading} section`);
        }
        const faqMarkup = html.match(/<div class="faq-list">([\s\S]*?)<\/div>/i)?.[1] || '';
        const faqCount = (faqMarkup.match(/<details\b/gi) || []).length;
        assert.ok(faqCount >= 5 && faqCount <= 8, `${file} should contain 5 to 8 FAQs, found ${faqCount}`);
        const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
            .map((match) => match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
            .filter((text) => text.length >= 140);
        for (const paragraph of paragraphs) {
            const key = paragraph.toLowerCase();
            const owners = paragraphOwners.get(key) || [];
            owners.push(file);
            paragraphOwners.set(key, owners);
        }
    }
    const duplicates = [...paragraphOwners.entries()].filter(([, owners]) => owners.length > 1);
    assert.deepEqual(duplicates, [], `long paragraphs should not be duplicated: ${JSON.stringify(duplicates)}`);
});

test('homepage and category pages provide substantial, useful navigation content', () => {
    const home = pages.get('index.html');
    const guide = home.match(/<section class="seo-content-section"[\s\S]*?<\/section>/i)?.[0] || '';
    assert.ok(visibleWords(`<body>${guide}</body>`) >= 1000, 'homepage calculator guide should contain at least 1000 words');
    for (const phrase of ['Finance Calculators', 'Health Calculators', 'Math Calculators', 'Power &amp; Electricity Calculators', 'Geometry Calculators', 'Popular calculators', 'Why use our calculators?', 'Questions people ask']) {
        assert.match(guide, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `homepage guide should include ${phrase}`);
    }
    for (const file of categoryPages) {
        const html = pages.get(file);
        assert.ok(html, `${file} must exist`);
        assert.ok(visibleWords(html) >= 350, `${file} should contain at least 350 visible words`);
        assert.match(html, /class="related-calculators category-directory"/i, `${file} needs a linked calculator directory`);
    }
    const toolCardCount = (home.match(/class="[^"]*tool-demo-card[^"]*"/gi) || []).length;
    assert.ok(toolCardCount >= 60, `homepage should preserve the full calculator set, found ${toolCardCount}`);
    assert.equal((home.match(/class="formula-explainer"/gi) || []).length, toolCardCount, 'every homepage tool needs a formula explanation');
    assert.equal((home.match(/<strong>Formula:<\/strong>/gi) || []).length, toolCardCount, 'every homepage tool needs a formula');
    assert.equal((home.match(/<strong>Example:<\/strong>/gi) || []).length, toolCardCount, 'every homepage tool needs an example');
});

test('all local HTML links resolve and crawlable pages are represented in the sitemap', async () => {
    for (const [file, html] of pages) {
        for (const match of html.matchAll(/href="([^"]+)"/gi)) {
            const href = match[1];
            if (/^(https?:|mailto:|tel:|#)/i.test(href)) continue;
            const target = href.startsWith('/') ? href.slice(1) : href;
            const pathname = target.split(/[?#]/)[0];
            if (!pathname) continue;
            const resolved = path.resolve(root, pathname);
            assert.ok(resolved.startsWith(root), `${file} contains an unsafe local path ${pathname}`);
            await assert.doesNotReject(() => access(resolved), `${file} links to missing ${pathname}`);
        }
    }
    const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
    const urls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
    for (const [file, html] of pages) {
        if (/name="robots"\s+content="noindex/i.test(html)) continue;
        const expected = file === 'index.html' ? `${domain}/` : `${domain}/${file}`;
        assert.ok(urls.has(expected), `sitemap is missing ${expected}`);
    }
});

test('robots, sitemap, ads.txt, and homepage do not expose obvious approval blockers', async () => {
    const [robots, sitemap, ads, home] = await Promise.all([
        readFile(path.join(root, 'robots.txt'), 'utf8'),
        readFile(path.join(root, 'sitemap.xml'), 'utf8'),
        readFile(path.join(root, 'ads.txt'), 'utf8'),
        readFile(path.join(root, 'index.html'), 'utf8')
    ]);
    assert.match(robots, /User-agent:\s*\*/i);
    assert.match(robots, /Allow:\s*\//i);
    assert.match(robots, new RegExp(`Sitemap: ${domain.replaceAll('.', '\\.')}\/sitemap\\.xml`, 'i'));
    assert.match(sitemap, /<urlset\b/);
    assert.match(ads, /^google\.com, pub-9409281508068005, DIRECT, f08c47fec0942fa0\s*$/);
    assert.doesNotMatch(home, /Advertisement Space|0\s*ms\s*<\/h2>/i);
});

test('pages avoid placeholders, duplicate IDs, missing image text, and a monetized 404', () => {
    for (const [file, html] of pages) {
        assert.doesNotMatch(html, /href="(?:\/)?#"|>\s*Title\s*<|Content goes here|Lorem ipsum|Advertisement Space|coming soon/i, `${file} contains placeholder or dead-link content`);
        for (const image of html.matchAll(/<img\b([^>]*)>/gi)) {
            assert.match(image[1], /\balt="[^"]*"/i, `${file} contains an image without alt text`);
        }
    }
    const home = pages.get('index.html');
    const ids = [...home.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
    assert.equal(ids.length, new Set(ids).size, 'homepage IDs should be unique');
    const notFound = pages.get('404.html');
    assert.match(notFound, /name="robots"\s+content="noindex, follow"/i);
    assert.doesNotMatch(notFound, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i, '404 page must not load ads');
});
