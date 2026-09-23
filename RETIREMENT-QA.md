# Retirement calculators — 24 September 2026

Added EPF savings, standard-scope EPS pension and NPS retirement scenario pages, linked from the homepage directory and finance hub. Source: scripts/build-retirement.cjs; shared calculations and UI: retirement-calculators.js. The public manifest and generated sitemap include all three pages.

## Deliberate model limits

- EPF uses actual employee and employer EPF contributions, excluding EPS, rather than inferring every worker's contribution split from gross pay. Projection starts in April, with month-end deposits and annual March interest credit. Rates and growth are editable assumptions. No withdrawals, mid-year starts, tax accounting or official statement reconstruction.
- EPS implements salary × credited service / 70 for normal pension at 58, entirely post-1 September 2014 service and standard capped salary. Scope confirmation is required. No automatic service rounding/weightage, mixed-period calculation, higher pension, early/deferred pension, statutory supplements or award determination. Users must supply confirmed service; under-10-year entries are refused, not declared legally ineligible.
- NPS uses an effective annual return converted to monthly, month-end deposits, annual step-up and an editable annuity scenario. Negative returns are allowed. Allocation is not an exit-rule or tax-entitlement determination. Future returns and insurer payouts are not guaranteed.

## Evidence

Official live research included NPS Trust's calculator and regulations index (which lists 2026 amendments), and indexed EPFO official pension-manual/FAQ extracts. Direct retrieval of several EPFO pages failed or timed out. This is disclosed here rather than claiming a complete current legal review. Public pages link the official references; verify availability and specific account rules with the authorities.

- https://npstrust.org.in/nps-calculator
- https://npstrust.org.in/act-and-regulations
- https://www.epfindia.gov.in/site_docs/PDFs/Downloads_PDFs/Pension_Manual.pdf
- https://www.epfindia.gov.in/site_en/For_Employees.php

Automated suite: 58 tests passed, including nine new retirement tests with independent formula matrices, conservation checks, zero/negative returns, growth, inflation, salary cap, unsupported EPS scope, fractional durations, missing/non-finite/negative inputs and bounded-overflow handling. HTTP tests cover the expanded 80-file release manifest; static checks cover 62 HTML files and the sitemap.

Actual local browser checks: EPF one-year example 29,234; result cleared after input change; fractional duration blocked by native validation; reset restored 20 years. EPS unchecked scope blocked submission; checked 10-year case produced 2,142.86; nine-year case produced a clear refusal. Mobile EPS and NPS document widths were 360px at a 375px viewport including scrollbar, with no document overflow. NPS zero-return ten-year example produced 600,000 corpus, 240,000 annuity allocation, 360,000 other portion and 1,200 monthly annuity. Console check returned no warnings/errors. Viewport restored afterward.

Browser checks used the in-app Browser skill, not standalone Playwright MCP or Chrome DevTools MCP. No physical-device testing, full request waterfall, specialist legal certification or claim to cover every conceivable case. New pages have no analytics, advertising or external calculation requests.
