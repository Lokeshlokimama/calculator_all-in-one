(function (root) {
    'use strict';
    const regions = {IN:'INR',US:'USD',GB:'GBP',AU:'AUD',CA:'CAD',NZ:'NZD',JP:'JPY',CN:'CNY',HK:'HKD',SG:'SGD',AE:'AED',SA:'SAR',QA:'QAR',KW:'KWD',BH:'BHD',OM:'OMR',CH:'CHF',SE:'SEK',NO:'NOK',DK:'DKK',PL:'PLN',CZ:'CZK',HU:'HUF',RO:'RON',ZA:'ZAR',BR:'BRL',MX:'MXN',KR:'KRW',ID:'IDR',MY:'MYR',TH:'THB',PH:'PHP',VN:'VND',PK:'PKR',BD:'BDT',LK:'LKR',NP:'NPR',TR:'TRY',IL:'ILS',EG:'EGP',NG:'NGN',KE:'KES',DE:'EUR',FR:'EUR',IT:'EUR',ES:'EUR',PT:'EUR',IE:'EUR',NL:'EUR',BE:'EUR',AT:'EUR',FI:'EUR',GR:'EUR',CY:'EUR',MT:'EUR',EE:'EUR',LV:'EUR',LT:'EUR',SK:'EUR',SI:'EUR',HR:'EUR'};
    const zones = {'Asia/Kolkata':'IN','Asia/Calcutta':'IN','Asia/Dubai':'AE','Asia/Riyadh':'SA','Asia/Qatar':'QA','Asia/Kuwait':'KW','Asia/Bahrain':'BH','Asia/Muscat':'OM','Asia/Singapore':'SG','Asia/Tokyo':'JP','Asia/Seoul':'KR','Asia/Shanghai':'CN','Asia/Hong_Kong':'HK','Asia/Kuala_Lumpur':'MY','Asia/Bangkok':'TH','Asia/Manila':'PH','Asia/Jakarta':'ID','Asia/Karachi':'PK','Asia/Dhaka':'BD','Asia/Colombo':'LK','Asia/Kathmandu':'NP','Asia/Katmandu':'NP','Europe/London':'GB','Europe/Paris':'FR','Europe/Berlin':'DE','Europe/Rome':'IT','Europe/Madrid':'ES','Europe/Dublin':'IE','Europe/Amsterdam':'NL','Europe/Zurich':'CH','Europe/Stockholm':'SE','Europe/Oslo':'NO','Europe/Copenhagen':'DK','America/New_York':'US','America/Chicago':'US','America/Denver':'US','America/Los_Angeles':'US','America/Phoenix':'US','America/Anchorage':'US','Pacific/Honolulu':'US','America/Toronto':'CA','America/Vancouver':'CA','America/Halifax':'CA','America/Winnipeg':'CA','America/Edmonton':'CA','America/Mexico_City':'MX','America/Sao_Paulo':'BR','Australia/Sydney':'AU','Australia/Melbourne':'AU','Australia/Brisbane':'AU','Australia/Perth':'AU','Australia/Adelaide':'AU','Pacific/Auckland':'NZ','Africa/Johannesburg':'ZA','Africa/Nairobi':'KE','Africa/Lagos':'NG'};
    function resolve({saved = '', timeZone = '', languages = [], supported = []} = {}) {
        const valid = code => /^[A-Z]{3}$/.test(code) && (supported.length ? supported.includes(code) : Object.values(regions).includes(code));
        if (valid(saved)) return {currency:saved, source:'saved choice'};
        const zoneCurrency = regions[zones[timeZone]];
        if (zoneCurrency && valid(zoneCurrency)) return {currency:zoneCurrency, source:'browser time zone'};
        for (const language of languages) {
            // Explicit region only: never infer a country from language alone.
            const region = String(language).replace(/_/g,'-').split(/-u-|-x-/i)[0].split('-').slice(1).find(part=>/^[A-Za-z]{2}$/.test(part));
            const currency = regions[region?.toUpperCase()];
            if (currency && valid(currency)) return {currency, source:'browser region'};
        }
        return {currency: supported.length && !supported.includes('USD') ? supported[0] : 'USD', source:'fallback; choose your currency if needed'};
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = {resolve};
    if (!root.document) return;
    function detect(supported) {
        let saved = '', timeZone = '';
        try { saved = root.localStorage.getItem('calculator-display-currency') || ''; } catch {}
        try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch {}
        let currencies = supported;
        if (!currencies) { try { currencies = Intl.supportedValuesOf('currency'); } catch { currencies = Object.values(regions); } }
        return resolve({saved,timeZone,languages:root.navigator.languages || [root.navigator.language],supported:currencies});
    }
    function announce(currency) {
        const info = typeof currency === 'string' ? {currency, source:'manual choice'} : detect();
        let note = document.getElementById('local-currency-note');
        if (!note) {
            const header = document.querySelector('header');
            if (!header) return;
            note = document.createElement('p'); note.id = 'local-currency-note'; note.setAttribute('role','status');
            note.style.cssText = 'font-size:12px;line-height:1.4;margin:8px 0;flex-basis:100%;color:inherit;';
            header.appendChild(note);
        }
        note.textContent = `Display currency: ${info.currency} (${info.source}). Regional estimate, not GPS. Amounts are not exchange-converted.`;
    }
    root.LocalCurrency = {resolve, detect, announce};
    document.addEventListener('DOMContentLoaded', announce);
})(typeof window === 'undefined' ? {} : window);
