'use strict';

const { getProvider } = require('./providers');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const ALLOWED_VERDICTS = new Set(['likely_real', 'likely_ai_generated', 'uncertain']);

class PayloadTooLargeError extends Error {}

function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(payload));
}

function providerNotConfigured(res) {
    sendJson(res, 503, {
        error: {
            code: 'PROVIDER_NOT_CONFIGURED',
            message: 'Deepfake detection provider is not configured. Set DEEPFAKE_API_KEY and choose DEEPFAKE_PROVIDER=hive or reality-defender on the server.'
        }
    });
}

function decodeFileName(headerValue) {
    if (!headerValue) return 'upload';
    try {
        return decodeURIComponent(String(headerValue));
    } catch {
        return String(headerValue);
    }
}

function hasAllowedExtension(fileName) {
    const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
    return ALLOWED_EXTENSIONS.has(extension);
}

function hasMatchingSignature(buffer, mimeType) {
    if (mimeType === 'image/jpeg') {
        return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (mimeType === 'image/png') {
        return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
    if (mimeType === 'image/webp') {
        return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    }
    return false;
}

async function readRawBody(req) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (req.body instanceof Uint8Array) return Buffer.from(req.body);
    if (typeof req.body === 'string') return Buffer.from(req.body, 'binary');

    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buffer.length;
        if (total > MAX_FILE_SIZE) throw new PayloadTooLargeError();
        chunks.push(buffer);
    }
    return Buffer.concat(chunks);
}

function normalizeProviderResult(result) {
    if (!result || !ALLOWED_VERDICTS.has(result.verdict)) {
        throw new Error('Provider returned an unsupported verdict.');
    }
    const confidence = Number(result.confidence);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
        throw new Error('Provider returned an invalid confidence score.');
    }
    const explanation = String(result.explanation || '').trim();
    if (!explanation) throw new Error('Provider returned no explanation.');
    return { verdict: result.verdict, confidence, explanation };
}

async function handler(req, res, environment = process.env) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST to analyze an image.' } });
        return;
    }

    const providerName = environment.DEEPFAKE_PROVIDER;
    const apiKey = environment.DEEPFAKE_API_KEY;
    const provider = getProvider(providerName);
    if (!apiKey || !provider) {
        providerNotConfigured(res);
        return;
    }

    const mimeType = String(req.headers['content-type'] || '').split(';', 1)[0].trim().toLowerCase();
    const fileName = decodeFileName(req.headers['x-file-name']);
    const contentLength = Number(req.headers['content-length'] || 0);

    if (!ALLOWED_MIME_TYPES.has(mimeType) || !hasAllowedExtension(fileName)) {
        sendJson(res, 415, {
            error: {
                code: 'UNSUPPORTED_FILE_TYPE',
                message: 'Choose a JPG, JPEG, PNG, or WebP image.'
            }
        });
        return;
    }

    if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE) {
        sendJson(res, 413, {
            error: {
                code: 'FILE_TOO_LARGE',
                message: 'The image exceeds the 5 MB upload limit.'
            }
        });
        return;
    }

    try {
        const buffer = await readRawBody(req);
        if (!buffer.length) {
            sendJson(res, 400, { error: { code: 'EMPTY_FILE', message: 'Choose an image containing file data.' } });
            return;
        }
        if (buffer.length > MAX_FILE_SIZE) throw new PayloadTooLargeError();
        if (!hasMatchingSignature(buffer, mimeType)) {
            sendJson(res, 415, {
                error: {
                    code: 'INVALID_IMAGE_SIGNATURE',
                    message: 'The file contents do not match the selected image format.'
                }
            });
            return;
        }

        const providerResult = await provider.analyze({ buffer, mimeType, fileName, apiKey });
        sendJson(res, 200, { result: normalizeProviderResult(providerResult) });
    } catch (error) {
        if (error instanceof PayloadTooLargeError) {
            sendJson(res, 413, { error: { code: 'FILE_TOO_LARGE', message: 'The image exceeds the 5 MB upload limit.' } });
            return;
        }
        sendJson(res, 502, {
            error: {
                code: 'PROVIDER_REQUEST_FAILED',
                message: 'The detection provider could not complete this analysis. Try again later.'
            }
        });
    }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
module.exports._internal = { MAX_FILE_SIZE, normalizeProviderResult, hasMatchingSignature };
