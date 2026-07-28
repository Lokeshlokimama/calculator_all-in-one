import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const handler = require('../api/deepfake-checker.js');
const { registerProvider, getProvider, listProviders } = require('../api/providers');
const { createHiveProvider } = require('../api/providers/hive');
const { createRealityDefenderProvider } = require('../api/providers/reality-defender');
const root = path.resolve(import.meta.dirname, '..');
const { onRequest: cloudflareDeepfakeHandler } = await import('../functions/api/deepfake-checker.js');

function jsonResponse(payload, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async json() { return payload; }
    };
}

function request(buffer = Buffer.alloc(0), headers = {}) {
    const req = Readable.from(buffer.length ? [buffer] : []);
    req.method = 'POST';
    req.headers = headers;
    return req;
}

function response() {
    let finish;
    const done = new Promise((resolve) => { finish = resolve; });
    const headers = new Map();
    return {
        statusCode: 200,
        setHeader(name, value) { headers.set(name.toLowerCase(), value); },
        end(body = '') { finish({ statusCode: this.statusCode, headers, body: String(body) }); },
        done
    };
}

async function invoke(req) {
    const res = response();
    await handler(req, res);
    const result = await res.done;
    return { ...result, json: JSON.parse(result.body) };
}

test('AI tool pages expose clean-route SEO, supported formats, privacy notes, and six FAQs', async () => {
    const [hub, checker, client] = await Promise.all([
        readFile(path.join(root, 'ai-tools', 'index.html'), 'utf8'),
        readFile(path.join(root, 'deepfake-checker', 'index.html'), 'utf8'),
        readFile(path.join(root, 'deepfake-checker', 'deepfake-checker.js'), 'utf8')
    ]);

    assert.match(hub, /rel="canonical" href="https:\/\/calculatorsallinone\.com\/ai-tools\/"/);
    assert.match(checker, /rel="canonical" href="https:\/\/calculatorsallinone\.com\/deepfake-checker\/"/);
    assert.match(checker, /accept="[^"]*\.jpg[^"]*\.jpeg[^"]*\.png[^"]*\.webp/i);
    assert.match(checker, /5 MB/i);
    assert.match(checker, /not store|not stored/i);
    assert.match(checker, /should not be treated as legal proof/i);
    assert.equal((checker.match(/<details>/g) || []).length, 6);
    assert.match(checker, /"@type": "FAQPage"/);
    assert.doesNotMatch(client, /DEEPFAKE_API_KEY\s*=/);
});

test('API reports a clear provider-not-configured state without exposing a key', async () => {
    const previousKey = process.env.DEEPFAKE_API_KEY;
    const previousProvider = process.env.DEEPFAKE_PROVIDER;
    delete process.env.DEEPFAKE_API_KEY;
    delete process.env.DEEPFAKE_PROVIDER;
    try {
        const result = await invoke(request());
        assert.equal(result.statusCode, 503);
        assert.equal(result.json.error.code, 'PROVIDER_NOT_CONFIGURED');
        assert.doesNotMatch(result.body, /api[_-]?key["']?\s*:/i);
    } finally {
        if (previousKey === undefined) delete process.env.DEEPFAKE_API_KEY;
        else process.env.DEEPFAKE_API_KEY = previousKey;
        if (previousProvider === undefined) delete process.env.DEEPFAKE_PROVIDER;
        else process.env.DEEPFAKE_PROVIDER = previousProvider;
    }
});

test('registered adapters receive an in-memory image and return normalized results', async () => {
    const providerName = 'test-memory-provider';
    let received;
    registerProvider(providerName, {
        async analyze(input) {
            received = input;
            return { verdict: 'likely_real', confidence: 0.91, explanation: 'Test adapter found no configured synthetic-media signal.' };
        }
    });
    const previousKey = process.env.DEEPFAKE_API_KEY;
    const previousProvider = process.env.DEEPFAKE_PROVIDER;
    process.env.DEEPFAKE_API_KEY = 'test-only-key';
    process.env.DEEPFAKE_PROVIDER = providerName;
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

    try {
        const result = await invoke(request(jpeg, {
            'content-type': 'image/jpeg',
            'content-length': String(jpeg.length),
            'x-file-name': 'sample.jpg'
        }));
        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.json.result, {
            verdict: 'likely_real',
            confidence: 0.91,
            explanation: 'Test adapter found no configured synthetic-media signal.'
        });
        assert.equal(received.fileName, 'sample.jpg');
        assert.equal(received.mimeType, 'image/jpeg');
        assert.equal(received.buffer.equals(jpeg), true);
        assert.equal(received.apiKey, 'test-only-key');
    } finally {
        if (previousKey === undefined) delete process.env.DEEPFAKE_API_KEY;
        else process.env.DEEPFAKE_API_KEY = previousKey;
        if (previousProvider === undefined) delete process.env.DEEPFAKE_PROVIDER;
        else process.env.DEEPFAKE_PROVIDER = previousProvider;
    }
});

test('production provider registry includes Hive and Reality Defender aliases', () => {
    assert.deepEqual(listProviders().filter((name) => ['hive', 'reality-defender'].includes(name)), ['hive', 'reality-defender']);
    assert.equal(typeof getProvider('hive')?.analyze, 'function');
    assert.equal(getProvider('realitydefender'), getProvider('reality-defender'));
    assert.equal(getProvider('reality_defender'), getProvider('reality-defender'));
});

test('Hive adapter submits multipart image bytes and normalizes real vendor classes', async () => {
    let requestDetails;
    const provider = createHiveProvider({
        async fetchImpl(url, options) {
            requestDetails = { url, options };
            return jsonResponse({
                status: [{ response: { output: [{ classes: [
                    { class: 'ai_generated', score: 0.96 },
                    { class: 'not_ai_generated', score: 0.04 },
                    { class: 'deepfake', score: 0.12 }
                ] }] } }]
            });
        }
    });
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    const result = await provider.analyze({ buffer, mimeType: 'image/jpeg', fileName: 'sample.jpg', apiKey: 'server-key' });

    assert.equal(requestDetails.url, 'https://api.thehive.ai/api/v2/task/sync');
    assert.equal(requestDetails.options.method, 'POST');
    assert.equal(requestDetails.options.headers.Authorization, 'Token server-key');
    assert.equal(requestDetails.options.body.get('media').name, 'sample.jpg');
    assert.deepEqual(result, {
        verdict: 'likely_ai_generated',
        confidence: 0.96,
        explanation: 'Hive detected a strong AI-generation signal in this image.'
    });
});

test('Reality Defender adapter uploads bytes without storage, polls, and normalizes ensemble result', async () => {
    const calls = [];
    let resultChecks = 0;
    const provider = createRealityDefenderProvider({
        pollingIntervalMs: 0,
        maxAttempts: 3,
        sleep: async () => {},
        async fetchImpl(url, options) {
            calls.push({ url, options });
            if (url.endsWith('/api/files/aws-presigned')) {
                return jsonResponse({
                    response: { signedUrl: 'https://upload.example/signed' },
                    requestId: 'request-123',
                    mediaId: 'media-123'
                });
            }
            if (url === 'https://upload.example/signed') return jsonResponse({});
            resultChecks += 1;
            if (resultChecks === 1) {
                return jsonResponse({ resultsSummary: { status: 'ANALYZING', metadata: {} } });
            }
            return jsonResponse({ resultsSummary: { status: 'AUTHENTIC', metadata: { finalScore: 94 } } });
        }
    });
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const result = await provider.analyze({ buffer, fileName: 'sample.png', apiKey: 'server-key' });

    assert.equal(calls[0].options.headers['X-API-KEY'], 'server-key');
    assert.deepEqual(JSON.parse(calls[0].options.body), { fileName: 'sample.png' });
    assert.equal(calls[1].options.method, 'PUT');
    assert.equal(calls[1].options.body, buffer);
    assert.equal(calls[1].options.headers, undefined);
    assert.equal(calls[2].url, 'https://api.prd.realitydefender.xyz/api/media/users/request-123');
    assert.deepEqual(result, {
        verdict: 'likely_real',
        confidence: 0.94,
        explanation: 'Reality Defender classified the image as authentic using its ensemble result.'
    });
});

test('Cloudflare Pages function accepts the full 5 MB limit and delegates to the shared API', async () => {
    const providerName = 'test-cloudflare-provider';
    registerProvider(providerName, {
        async analyze({ buffer }) {
            assert.equal(buffer.length, 5 * 1024 * 1024);
            return {
                verdict: 'uncertain',
                confidence: 0.73,
                explanation: 'Contract test completed without persisting the uploaded bytes.'
            };
        }
    });

    const image = Buffer.alloc(5 * 1024 * 1024);
    image.set([0xff, 0xd8, 0xff], 0);
    const cloudflareResponse = await cloudflareDeepfakeHandler({
        request: new Request('https://example.com/api/deepfake-checker', {
            method: 'POST',
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Length': String(image.length),
                'X-File-Name': 'five-megabytes.jpg'
            },
            body: image
        }),
        env: { DEEPFAKE_API_KEY: 'test-only-key', DEEPFAKE_PROVIDER: providerName }
    });

    assert.equal(cloudflareResponse.status, 200);
    assert.deepEqual(await cloudflareResponse.json(), {
        result: {
            verdict: 'uncertain',
            confidence: 0.73,
            explanation: 'Contract test completed without persisting the uploaded bytes.'
        }
    });
});

test('API rejects oversized images before invoking a provider', async () => {
    const providerName = 'test-size-provider';
    let called = false;
    registerProvider(providerName, { async analyze() { called = true; } });
    const previousKey = process.env.DEEPFAKE_API_KEY;
    const previousProvider = process.env.DEEPFAKE_PROVIDER;
    process.env.DEEPFAKE_API_KEY = 'test-only-key';
    process.env.DEEPFAKE_PROVIDER = providerName;
    try {
        const result = await invoke(request(Buffer.alloc(0), {
            'content-type': 'image/png',
            'content-length': String((5 * 1024 * 1024) + 1),
            'x-file-name': 'large.png'
        }));
        assert.equal(result.statusCode, 413);
        assert.equal(result.json.error.code, 'FILE_TOO_LARGE');
        assert.equal(called, false);
    } finally {
        if (previousKey === undefined) delete process.env.DEEPFAKE_API_KEY;
        else process.env.DEEPFAKE_API_KEY = previousKey;
        if (previousProvider === undefined) delete process.env.DEEPFAKE_PROVIDER;
        else process.env.DEEPFAKE_PROVIDER = previousProvider;
    }
});
