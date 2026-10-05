epf-calculator.html

## Reconstruct the annual projection from your inputs

### Start with credited amounts rather than a salary shortcut

This calculator asks for actual employee and employer EPF contributions because a total salary does not tell the tool how much reached the EPF account. Read the relevant lines of your passbook or payroll record and keep the pension/EPS allocation separate. If you enter the same employer amount in two categories outside this tool, you can double-count saving without any visible arithmetic error.

Suppose the employee EPF amount is 1,800 per month and the employer EPF-only amount is 550. The combined deposit is 2,350 each month, and twelve deposits total 28,200. At zero interest and zero opening balance, the closing estimate is therefore 28,200. This is a contribution check, not a statement that these contribution amounts apply to every employee. Replace them with the amounts actually credited for the scenario you are modelling.

An opening balance is money already present at the start of the modelled financial year. Do not also enter that balance as a new monthly contribution. A positive opening amount earns interest under the chosen assumptions, while current-year deposits enter at their specified dates. Keeping those two components separate lets you explain a closing balance without counting the same money twice.

### Follow the April-to-March timing convention

The projection starts on 1 April. Monthly deposits are added at month end and begin earning interest from the following month. Interest is accumulated and credited annually in March. The model does not compound each month's accrued interest into the next month's opening balance before that annual credit. This timing is why a generic monthly-compounding savings formula does not reproduce the calculation exactly.

Using an illustrative annual rate of 8%, an opening balance of 100,000 contributes 8,000 of interest over a complete year under the constant-balance assumptions. For the 2,350 monthly deposit example, the first month's deposit earns eleven months of interest, the next earns ten, and the March deposit earns none during that financial year. The sum of those month counts is 66. Deposit interest is 2,350 × 66 × 0.08 / 12, or 1,034. Closing balance becomes 137,234 when the opening balance, 28,200 contributions, and 9,034 total interest are combined.

These are synthetic arithmetic examples, not a current notified rate or an individual EPFO statement. The default rate is editable for that reason. If you need the actual applicable rate or credited interest for an account, verify it through official information and the account record rather than interpreting the default as a promise.

### Model a change in monthly contributions

Contribution growth is applied once each April. At a 10% annual increase, a combined monthly deposit of 2,350 becomes 2,585 in the next modelled year. With a zero interest assumption, year two deposits total 31,020 and the two-year closing amount from a zero opening balance is 59,220. This isolates the increase in contributions from the effect of interest.

If your contribution changes midway through a financial year, that annual step-up convention does not reproduce the actual schedule. Similarly, a delayed credit cannot be described merely by keeping the original deposit amount and reducing the annual interest rate. The date and amount of each deposit are different inputs to an exact reconciliation. Use the annual projection for the stated forward scenario and a dated ledger for a statement investigation.

### Read the year table as a reconciliation

For each row, opening balance plus contributions plus interest should equal closing balance before display rounding. The next row begins with the previous closing amount. A small apparent difference after summing rounded cells can be a display issue; inspect the assumptions before assuming that an account has lost money. The model keeps precision internally and rounds the displayed currency amounts.

Zero projection years returns the opening balance. It does not add twelve deposits or a year's interest. This is useful when confirming that the opening amount has been entered correctly. Very large unsupported inputs should be rejected rather than allowed to produce an infinite corpus that looks like a valid account value.

### Match the result to the question

Use this page for a forward EPF-balance scenario. It does not calculate EPS pension, NPS annuity, an eligibility decision, a withdrawal entitlement, or tax on interest. Those questions require their own rules and records. Keep the April start, rate assumption, EPF-only employer contribution, and annual increase visible when sharing the projection. The clearer that record is, the easier it becomes to distinguish a model limitation from a genuine passbook discrepancy.
