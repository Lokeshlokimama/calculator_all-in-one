'use strict';

// Provider adapters normalize vendor-specific responses to:
// { verdict: 'likely_real' | 'likely_ai_generated' | 'uncertain', confidence: 0..1, explanation: string }
const providers = new Map();
const aliases = new Map([
    ['realitydefender', 'reality-defender'],
    ['reality_defender', 'reality-defender']
]);

function registerProvider(name, adapter) {
    const normalizedName = String(name || '').trim().toLowerCase();
    if (!normalizedName) throw new TypeError('Provider name is required.');
    if (!adapter || typeof adapter.analyze !== 'function') {
        throw new TypeError(`Provider "${normalizedName}" must expose an analyze function.`);
    }
    providers.set(normalizedName, adapter);
}

function getProvider(name) {
    const normalizedName = String(name || '').trim().toLowerCase();
    const canonicalName = aliases.get(normalizedName) || normalizedName;
    return canonicalName ? providers.get(canonicalName) || null : null;
}

function listProviders() {
    return [...providers.keys()];
}

registerProvider('hive', require('./hive'));
registerProvider('reality-defender', require('./reality-defender'));

module.exports = { registerProvider, getProvider, listProviders };
