'use strict';

const HIVE_ENDPOINT = 'https://api.thehive.ai/api/v2/task/sync';
const REQUEST_TIMEOUT_MS = 45_000;
const DECISION_THRESHOLD = 0.9;

function score(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : null;
}

function safeFileName(fileName) {
    const baseName = String(fileName || 'upload.jpg').split(/[\\/]/).pop();
    return baseName.replace(/[^a-z0-9._ -]/gi, '_').slice(-200) || 'upload.jpg';
}

function collectClassScores(value, scores = new Map()) {
    if (!value || typeof value !== 'object') return scores;

    if (Array.isArray(value)) {
        for (const item of value) collectClassScores(item, scores);
        return scores;
    }

    const className = typeof value.class === 'string' ? value.class.toLowerCase() : '';
    const classScore = score(value.score);
    if (className && classScore !== null) {
        scores.set(className, Math.max(classScore, scores.get(className) || 0));
    }

    for (const nested of Object.values(value)) collectClassScores(nested, scores);
    return scores;
}

function normalizeHiveResponse(payload) {
    const scores = collectClassScores(payload);
    const aiGenerated = scores.get('ai_generated') ?? 0;
    const deepfake = scores.get('deepfake') ?? 0;
    const notAiGenerated = scores.get('not_ai_generated') ?? 0;
    const syntheticSignal = Math.max(aiGenerated, deepfake);

    if (!scores.has('ai_generated') && !scores.has('deepfake') && !scores.has('not_ai_generated')) {
        throw new Error('Hive returned no supported detection classes.');
    }

    if (syntheticSignal >= DECISION_THRESHOLD && syntheticSignal >= notAiGenerated) {
        const leadingSignal = deepfake >= aiGenerated ? 'deepfake manipulation' : 'AI-generation';
        return {
            verdict: 'likely_ai_generated',
            confidence: syntheticSignal,
            explanation: `Hive detected a strong ${leadingSignal} signal in this image.`
        };
    }

    if (notAiGenerated >= DECISION_THRESHOLD && notAiGenerated > syntheticSignal) {
        return {
            verdict: 'likely_real',
            confidence: notAiGenerated,
            explanation: 'Hive found a strong not-AI-generated signal and no stronger synthetic-media signal.'
        };
    }

    return {
        verdict: 'uncertain',
        confidence: Math.max(aiGenerated, deepfake, notAiGenerated),
        explanation: 'Hive found mixed or below-threshold signals, so the image cannot be classified confidently.'
    };
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

function createHiveProvider({ fetchImpl = globalThis.fetch, endpoint = HIVE_ENDPOINT } = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('Hive requires a fetch implementation.');

    return {
        async analyze({ buffer, mimeType, fileName, apiKey }) {
            const formData = new FormData();
            formData.append('media', new Blob([buffer], { type: mimeType }), safeFileName(fileName));

            const response = await fetchWithTimeout(fetchImpl, endpoint, {
                method: 'POST',
                headers: { Authorization: `Token ${apiKey}` },
                body: formData
            }, REQUEST_TIMEOUT_MS);

            if (!response.ok) throw new Error(`Hive request failed with status ${response.status}.`);
            return normalizeHiveResponse(await response.json());
        }
    };
}

module.exports = createHiveProvider();
module.exports.createHiveProvider = createHiveProvider;
module.exports._internal = { normalizeHiveResponse, collectClassScores };
