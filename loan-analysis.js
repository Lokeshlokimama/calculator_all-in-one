(function(root) {
    'use strict';
    function analyze(principal, annualRate, months) {
        if (![principal, annualRate, months].every(Number.isFinite) || principal <= 0 || annualRate < 0 || !Number.isInteger(months) || months < 1 || months > 1200) throw new Error('Invalid loan inputs');
        const rate = annualRate / 1200;
        const payment = rate === 0 ? principal / months : principal * rate / -Math.expm1(-months * Math.log1p(rate));
        if (!Number.isFinite(payment * months)) throw new Error('Loan exceeds supported range');
        let balance = principal, interestTotal = 0;
        const rows = [];
        for (let month = 1; month <= months; month++) {
            const interest = balance * rate;
            const principalPart = month === months ? balance : Math.min(balance, Math.max(0, payment - interest));
            const paid = principalPart + interest;
            balance = Math.max(0, balance - principalPart);
            interestTotal += interest;
            if (![balance, paid, interestTotal].every(Number.isFinite)) throw new Error('Loan exceeds supported range');
            rows.push({month, payment:paid, interest, principal:principalPart, balance});
        }
        return {payment, interest:interestTotal, total:principal + interestTotal, rows};
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = {analyze};
    else root.LoanAnalysis = {analyze};
})(typeof window === 'undefined' ? {} : window);
