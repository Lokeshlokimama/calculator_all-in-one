# All-page spacing review — 7 October 2026

Inspected HTML and stylesheet usage for all 65 public HTML routes in the local build. This is source coverage, not a completed all-page visual certification.

## Findings

- The shared theme forces 3 px corners on most content and calculator cards. The PDF converter override covers only its converter panel and nested controls; other card families remain candidates for softer corners.
- The generic checker-stage sets vertical padding but no horizontal padding. Any other page using it needs a left/right spacing review.
- Browser measurements were saved only for the routes listed below. Other routes remain unverified in the browser because repeated navigation/debugger synchronization stalls prevented completing the sweep. The previous 6 October overflow audit does not certify these new concerns.
- Browser measurement values are diagnostic candidates; screenshot review is still required before accepting a full-page visual pass.

## Per-route coverage

| Route | Source finding | Browser measurement coverage |
|---|---|---|
| 404.html | Shared 3 px card corners | 1440 / 390 / 320 px measured; visual review open |
| about.html | Shared 3 px card corners | 1440 / 390 / 320 px measured; visual review open |
| privacy-policy.html | Shared 3 px card corners | 1440 / 390 / 320 px measured; visual review open |
| age-calculator.html | Shared 3 px card corners | 1440 / 390 / 320 px measured; visual review open |
| andhra-pradesh-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| bescom-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| bmi-calculator.html | Shared 3 px card corners | Open |
| bulk-qr-code-generator/index.html | Shared 3 px card corners | Open |
| compress-pdf-to-100kb/index.html | Compatibility redirect; review destination | Open |
| compress-pdf/index.html | Shared 3 px card corners; Stage has no horizontal padding | Open |
| contact.html | Shared 3 px card corners | Open |
| currency-converter.html | Shared 3 px card corners | Open |
| delhi-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| disclaimer.html | Shared 3 px card corners | Open |
| editorial-standards.html | Shared 3 px card corners | Open |
| electricity-bill-calculator-india/index.html | Shared 3 px card corners | Open |
| electricity-calculators.html | Shared 3 px card corners | Open |
| emi-calculator-with-prepayment/index.html | Shared 3 px card corners | Open |
| emi-calculator.html | Shared 3 px card corners | Open |
| finance-calculators.html | Shared 3 px card corners | Open |
| geometry-calculators.html | Shared 3 px card corners | Open |
| gst-calculator-india/index.html | Compatibility redirect; review destination | Open |
| gst-calculator.html | Shared 3 px card corners | Open |
| gujarat-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| health-calculators.html | Shared 3 px card corners | Open |
| home-loan-emi-calculator-india/index.html | Compatibility redirect; review destination | Open |
| images-to-pdf/index.html | Shared 3 px card corners; Stage has no horizontal padding | Open |
| index.html | Separate layout; inspect visually | Open |
| tools.html | Shared 3 px card corners | Open |
| epf-calculator.html | Shared 3 px card corners | Open |
| eps-pension-calculator.html | Separate layout; inspect visually | Open |
| nps-calculator.html | Shared 3 px card corners | Open |
| jpg-to-pdf/index.html | Compatibility redirect; review destination | Open |
| kerala-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| loan-calculator.html | Shared 3 px card corners | Open |
| math-calculators.html | Shared 3 px card corners | Open |
| merge-pdf/index.html | Shared 3 px card corners; Stage has no horizontal padding | Open |
| msedcl-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| ocr-scanned-pdf/index.html | Shared 3 px card corners; Stage has no horizontal padding | Open |
| password-generator.html | Shared 3 px card corners | Open |
| pdf-converter/index.html | Shared 3 px card corners | Open |
| pdf-password-helper/index.html | Shared 3 px card corners; Stage has no horizontal padding | Open |
| pdf-to-jpg/index.html | Compatibility redirect; review destination | Open |
| pdf-to-word/index.html | Compatibility redirect; review destination | Open |
| percentage-calculator.html | Shared 3 px card corners | Open |
| privacy.html | Shared 3 px card corners | Open |
| punjab-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| qr-code-generator.html | Shared 3 px card corners | Open |
| rajasthan-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| sip-calculator.html | Shared 3 px card corners | Open |
| sip-step-up-calculator/index.html | Shared 3 px card corners | Open |
| split-pdf/index.html | Shared 3 px card corners; Stage has no horizontal padding | Open |
| telangana-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| terms.html | Shared 3 px card corners | Open |
| tneb-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| upi-qr-code-generator/index.html | Shared 3 px card corners | Open |
| utility-tools.html | Shared 3 px card corners | Open |
| uttar-pradesh-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| vcard-qr-code-generator/index.html | Shared 3 px card corners | Open |
| west-bengal-electricity-bill-calculator/index.html | Compatibility redirect; review destination | Open |
| whatsapp-qr-code-generator/index.html | Shared 3 px card corners | Open |
| wifi-qr-code-generator/index.html | Shared 3 px card corners | Open |
| convert-to-pdf/index.html | Shared 3 px card corners | Open |
| pdf-tools/index.html | Shared 3 px card corners | Open |
| pdf-workbench/index.html | Shared 3 px card corners | Open |
