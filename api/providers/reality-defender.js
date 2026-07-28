'use strict';

const BASE_URL = 'https://api.prd.realitydefender.xyz';
const POLLING_INTERVAL_MS = 2_000;
const MAX_ATTEMPTS = 20;
const REQUEST_TIMEOUT_MS = 15_000;
const OVERALL_TIMEOUT_MS = 50_000;

function safeFileName(fileName) {
    const baseName = String(fileName || 'upload.jpg').split(/[\\/]/).pop();
    return baseName.replace(/[^a-z0-9._ -]/gi, '_').slice(-200) || 'upload.jpg';
}

function normalizeScore(value) {
    if (value === null || value === undefined || value === '') return null;
    let parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    if (parsed > 1) parsed /= 100;
    return Math.min(1, Math.max(0, parsed));
}

function normalizeRealityDefenderResponse(payload) {
    const summary = payload?.resultsSummary || {};
    const status = String(summary.status || payload?.overallStatus || '').toUpperCase();
    const confidence = normalizeScore(summary?.metadata?.finalScore);

    if (status === 'FAKE' || status === 'MANIPULATED') {
        return {
            verdict: 'likely_ai_generated',
            confidence: confidence ?? 0.5,
            explanation: 'Reality Defender classified the image as fake or manipulated using its ensemble result.'
        };
    }

    if (status === 'AUTHENTIC') {
        return {
            verdict: 'likely_real',
            confidence: confidence ?? 0.5,
            explanation: 'Reality Defender classified the image as authentic using its ensemble result.'
        };
    }

    if (status === 'SUSPICIOUS') {
        return {
            verdict: 'uncertain',
            confidence: confidence ?? 0.5,
            explanation: 'Reality Defender marked the image as suspicious, but did not return a definitive classification.'
        };
    }

    if (status === 'NOT_APPLICABLE') {
        return {
            verdict: 'uncertain',
            confidence: confidence ?? 0,
            explanation: 'Reality Defender could not apply its detection models reliably to this image.'
        };
    }

    if (status === 'UNABLE_TO_EVALUATE') {
        return {
            verdict: 'uncertain',
            confidence: confidence ?? 0,
            explanation: 'Reality Defender was unable to evaluate this image.'
        };
    }

    throw new Error(`Reality Defender returned unsupported status "${status || 'empty'}".`);
}

function isAnalyzing(payload) {
    const status = String(payload?.resultsSummary?.status || payload?.overallStatus || '').toUpperCase();
    if (!status || status === 'ANALYZING' || status === 'PROCESSING') return true;

    const models = Array.isArray(payload?.models) ? payload.models : [];
    return models.some((model) => String(model?.status || '').toUpperCase() === 'ANALYZING')
        && models.every((model) => ['ANALYZING', 'NOT_APPLICABLE'].includes(String(model?.status || '').toUpperCase()));
}

async function fetchWithTimeout(fetchImpl, url, options, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetchImpl(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

async function readJson(response, label) {
    if (!response.ok) throw new Error(`${label} failed with status ${response.status}.`);
    return response.json();
}

function createRealityDefenderProvider({
    fetchImpl = globalThis.fetch,
    baseUrl = BASE_URL,
    pollingIntervalMs = POLLING_INTERVAL_MS,
    maxAttempts = MAX_ATTEMPTS,
    sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
} = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('Reality Defender requires a fetch implementation.');

    return {
        async analyze({ buffer, fileName, apiKey }) {
            const deadline = Date.now() + OVERALL_TIMEOUT_MS;
            const apiHeaders = { 'Content-Type': 'application/json', 'X-API-KEY': apiKey };
            const requestTimeout = () => Math.max(1, Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now()));

            const signedResponse = await fetchWithTimeout(fetchImpl, `${baseUrl}/api/files/aws-presigned`, {
                method: 'POST',
                headers: apiHeaders,
                body: JSON.stringify({ fileName: safeFileName(fileName) })
            }, requestTimeout());
            const signedPayload = await readJson(signedResponse, 'Reality Defender signed URL request');
            const signedUrl = signedPayload?.response?.signedUrl;
            const requestId = signedPayload?.requestId;
            if (!signedUrl || !requestId) throw new Error('Reality Defender returned an invalid upload response.');

            const uploadResponse = await fetchWithTimeout(fetchImpl, signedUrl, {
                method: 'PUT',
                body: buffer
            }, requestTimeout());
            if (!uploadResponse.ok) throw new Error(`Reality Defender upload failed with status ${uploadResponse.status}.`);

            for (let attempt = 0; attempt < maxAttempts && Date.now() < deadline; attempt += 1) {
                const resultResponse = await fetchWithTimeout(
                    fetchImpl,
                    `${baseUrl}/api/media/users/${encodeURIComponent(requestId)}`,
                    { method: 'GET', headers: apiHeaders },
                    requestTimeout()
                );

                if (resultResponse.status === 404) {
                    if (attempt + 1 < maxAttempts) await sleep(pollingIntervalMs);
                    continue;
                }

                const resultPayload = await readJson(resultResponse, 'Reality Defender result request');
                if (!isAnalyzing(resultPayload)) return normalizeRealityDefenderResponse(resultPayload);
                if (attempt + 1 < maxAttempts) await sleep(pollingIntervalMs);
            }

            throw new Error('Reality Defender analysis timed out.');
        }
    };
}

module.exports = createRealityDefenderProvider();
module.exports.createRealityDefenderProvider = createRealityDefenderProvider;
module.exports._internal = { normalizeRealityDefenderResponse, isAnalyzing, normalizeScore };
