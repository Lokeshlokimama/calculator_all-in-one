# Website master checklist

This is the only active checklist for Calculator All-in-One. Read it before every website task, apply it to the whole affected site before every push, and update this file whenever the owner raises a concern. Do not create another checklist. Historical audits are evidence, not alternative completion criteria.

## Required workflow every time

These are recurring requirements, not a claim that every possible device/input has been tested. Current-run completion and remaining limits are recorded below.

- [ ] Start from this checklist and the complete public manifest in `scripts/site-files.json`; do not silently narrow an all-page request to the homepage.
- [ ] Apply consistent UI/UX to every content/error page, including calculators, category directories, trust pages and file tools. Check compatibility redirects separately.
- [ ] Browser-check each public page at 320, 390 and 1440 px. Check overflow, readable text/contrast, meaningful images, headings, labels, result states and comfortable edge spacing. Save per-page measurements and screenshots.
- [ ] Give main bordered panels at least 20 px horizontal padding on phones and 28–36 px on desktop. Compact badges/controls may use less. Keep tool, upload, result and workflow surfaces softly rounded.
- [ ] Check menus, keyboard focus, skip links, scrolling, search, categories, clear controls, query-state persistence and all destinations/anchors. Check every internal link, external reference, asset and mailto syntax; distinguish provider blocking from broken links.
- [ ] Check valid, empty, invalid and boundary calculator inputs, units, outputs, stale-result clearing, resets where available and independently checked formulas.
- [ ] Check animations do not obstruct controls; respect reduced motion and provide pause controls for continuous effects. Keep floating helper panels readable and within the viewport.
- [ ] Use truthful currency and language options. Do not claim exchange conversion or unavailable translation. Verify branding and About, Contact, Privacy, Terms and Disclaimer. Contact email: calculators@proton.me.
- [ ] Review explanatory depth, originality, categories, examples and limitations. Word counts, testing and ad scripts do not guarantee AdSense approval.
- [ ] Preserve one approved AdSense loader and top/middle/bottom reserved spaces. Desktop side placements must stack on phones. Ad delivery is separate from installation.
- [ ] Keep PDF tools discoverable in search and navigation. Check supported/unsupported, empty/corrupt/oversized inputs, preview, clear, page limits and exports. Reopen downloaded PDFs to verify page count, dimensions, content and saved form values.
- [ ] State Office rendering limits honestly. Exclude AI PDF features and never require an AI key. Keep backend tools unavailable until HTTPS service and real outputs are verified; require upload consent, password validation, temporary cleanup and busy/error feedback.
- [ ] Use the owner's free Render plan; do not enable paid compute/upgrades without permission. Test health, cold-start feedback and server outputs with synthetic files before claiming backend readiness.
- [ ] Inspect the diff; preserve unrelated changes and private fixtures. Run build, links, syntax, relevant tests and backend tests. Record passed/failed/untested separately.
- [ ] Publish tested changes directly to `main` using a normal fast-forward/merge, never force-push. A feature-branch push is not completion.
- [ ] Wait for the Pages job; verify the live commit marker and every public file against the exact release artifact with `scripts/verify-live.cjs`. Check deployed pages and asset versions. Report pushed, deployed and live-verified separately.
- [ ] Leave actual unresolved concerns open. Never use a passing automated suite as proof of unperformed browser checks.

## Current review — 12 October 2026

The review covers all 65 public user-facing HTML routes: 47 content/error pages and 18 compatibility redirects. The additional Google ownership-verification HTML is an intentionally plain verification endpoint checked by the route validator.

Fixes in this review: shared blue/white typography and surfaces aligned with the homepage, rounded cards/controls, 20–34 px main-panel padding, readable search controls, unlabelled OCR/password outputs, mobile directory grid sizing, long-number result wrapping, and broken external EPFO references. Historical homepage work and its limitations have been consolidated here.

### Evidence and results

- [x] All 47 content/error pages checked at 320, 390 and 1440 px: 141 browser measurements and screenshots. No horizontal overflow, unlabelled visible controls or failed loaded images; main panels meet padding/radius requirements. Mobile and desktop screenshot sheets reviewed. Evidence: `.qa-all-pages/browser-final.json`, `screenshots/`, `final-sheet-*.jpg`.
- [x] All 18 compatibility redirects reached their intended destinations, including hashes: `.qa-all-pages/redirects.json`.
- [x] All 2,095 URL occurrences audited: 83 unique internal URLs and 25 external URLs returned expected HTTP success. Every mailto syntax checked; all source anchors validated by lint. Evidence: `.qa-all-pages/links.json`; reproduce with `node scripts/audit-all-links.cjs` while the local built site is served at port 4175.
- [x] Shared menu opening/Escape closing and global PDF search tested on all 46 non-home content pages: `navigation.json`. Homepage search/category/query persistence is also covered by the existing release tests. Removed duplicate legacy search forms and unwanted QR initial autofocus.
- [x] Calculator valid/empty states exercised on 13 dedicated routes, retirement resets, EPS scope acknowledgement/result and timestamped USD/INR conversion checked; six QR pages produced previews (bulk produced two). Native required inputs block empty submission. Independent arithmetic, boundary and failure tests: 76 passed, zero failed. Evidence: `forms.json`, `eps.json`, `currency.json`, `qr.json`, `npm run verify`.
- [x] PDF merge/split/images/compress downloads reopened: expected page count/order/dimensions and text where preserved. Corrupt PDF, invalid split range and 41-page compression limit rejected. Filled PDF form export reopened and its saved field value matched. OCR downloaded text matched the synthetic source. Evidence: `downloads.json`, `pdf-inspection.json`, `editor.json`, `ocr.json`.
- [x] Ten Office/image/text formats previewed with print export enabled; unsupported legacy .doc rejected. Remote HTTPS service health and real synthetic conversions tested (Markdown, compare, DOCX/XLSX/PPTX, protection/unlock including wrong password, repair, PDF/A, redaction, valid DOCX-to-PDF). Outputs inspected. Local backend suite: five passed, three dependency-based skips (qpdf/Ghostscript/LibreOffice absent locally); remote equivalents exercised. Evidence: `office.json`, `backend/results.json`, `backend/office-valid.json`.
- [x] Build/lint validated 66 HTML endpoints, metadata, JSON-LD, sitemap, assets, redirects, one approved AdSense loader and JavaScript syntax. Contact remains calculators@proton.me. Broken EPFO and advertising opt-out references replaced with reachable official pages.
- [x] Removed the separate LANDING-CHECKLIST.md after merging its concerns here; README and AGENTS.md require this master before every task. Historical reports are retained as evidence.
- [ ] Release gate: push to main, wait for Pages, verify live commit marker and every uploaded file. Status is independently evidenced by the [Publish tested website workflow](https://github.com/Lokeshlokimama/calculator_all-in-one/actions/workflows/pages.yml); a local pass alone is not deployment completion.

### Page-by-page browser coverage

“Pass” below means the measured layout/labels/images/panel checks at all three widths, not every possible calculator input or native print outcome.

| Public page | 320 px | 390 px | 1440 px |
|---|---|---|---|
| /404.html | Pass | Pass | Pass |
| /about.html | Pass | Pass | Pass |
| /privacy-policy.html | Pass | Pass | Pass |
| /age-calculator.html | Pass | Pass | Pass |
| /bmi-calculator.html | Pass | Pass | Pass |
| /bulk-qr-code-generator/ | Pass | Pass | Pass |
| /compress-pdf/ | Pass | Pass | Pass |
| /contact.html | Pass | Pass | Pass |
| /currency-converter.html | Pass | Pass | Pass |
| /disclaimer.html | Pass | Pass | Pass |
| /editorial-standards.html | Pass | Pass | Pass |
| /electricity-bill-calculator-india/ | Pass | Pass | Pass |
| /electricity-calculators.html | Pass | Pass | Pass |
| /emi-calculator-with-prepayment/ | Pass | Pass | Pass |
| /emi-calculator.html | Pass | Pass | Pass |
| /finance-calculators.html | Pass | Pass | Pass |
| /geometry-calculators.html | Pass | Pass | Pass |
| /gst-calculator.html | Pass | Pass | Pass |
| /health-calculators.html | Pass | Pass | Pass |
| /images-to-pdf/ | Pass | Pass | Pass |
| / | Pass | Pass | Pass |
| /tools.html | Pass | Pass | Pass |
| /epf-calculator.html | Pass | Pass | Pass |
| /eps-pension-calculator.html | Pass | Pass | Pass |
| /nps-calculator.html | Pass | Pass | Pass |
| /loan-calculator.html | Pass | Pass | Pass |
| /math-calculators.html | Pass | Pass | Pass |
| /merge-pdf/ | Pass | Pass | Pass |
| /ocr-scanned-pdf/ | Pass | Pass | Pass |
| /password-generator.html | Pass | Pass | Pass |
| /pdf-converter/ | Pass | Pass | Pass |
| /pdf-password-helper/ | Pass | Pass | Pass |
| /percentage-calculator.html | Pass | Pass | Pass |
| /privacy.html | Pass | Pass | Pass |
| /qr-code-generator.html | Pass | Pass | Pass |
| /sip-calculator.html | Pass | Pass | Pass |
| /sip-step-up-calculator/ | Pass | Pass | Pass |
| /split-pdf/ | Pass | Pass | Pass |
| /terms.html | Pass | Pass | Pass |
| /upi-qr-code-generator/ | Pass | Pass | Pass |
| /utility-tools.html | Pass | Pass | Pass |
| /vcard-qr-code-generator/ | Pass | Pass | Pass |
| /whatsapp-qr-code-generator/ | Pass | Pass | Pass |
| /wifi-qr-code-generator/ | Pass | Pass | Pass |
| /convert-to-pdf/ | Pass | Pass | Pass |
| /pdf-tools/ | Pass | Pass | Pass |
| /pdf-workbench/ | Pass | Pass | Pass |

All 18 redirect paths: `/andhra-pradesh-electricity-bill-calculator/`, `/bescom-electricity-bill-calculator/`, `/compress-pdf-to-100kb/`, `/delhi-electricity-bill-calculator/`, `/gst-calculator-india/`, `/gujarat-electricity-bill-calculator/`, `/home-loan-emi-calculator-india/`, `/jpg-to-pdf/`, `/kerala-electricity-bill-calculator/`, `/msedcl-electricity-bill-calculator/`, `/pdf-to-jpg/`, `/pdf-to-word/`, `/punjab-electricity-bill-calculator/`, `/rajasthan-electricity-bill-calculator/`, `/telangana-electricity-bill-calculator/`, `/tneb-electricity-bill-calculator/`, `/uttar-pradesh-electricity-bill-calculator/`, `/west-bengal-electricity-bill-calculator/`.

### Remaining manual/environment limits

- [ ] Native operating-system Print/Save-as-PDF dialogs and printer output were not exercised. Office preview/export-button availability does not certify native printing or exact Office fidelity.
- [ ] Physical-phone QR scanning, cross-browser/device matrix and a forced free-Render cold-start stress test were not performed. QR previews and real warm-service outputs passed; paid infrastructure remains unauthorized.
- [ ] Every combination of the 71 directory tools and every supported file was not individually browser-tested. Independent automated examples/boundaries and the named synthetic browser flows are the evidence; do not expand that into an exhaustive claim.
- [ ] Actual third-party ad delivery and AdSense approval cannot be certified by loader/placement validation.

### Historical concerns retained

- The 7 October audit left all-page browser coverage, square corners, six PDF stage padding cases and deployed rechecks open. These are required checks in this review, not forgotten exceptions.
- The 8 October homepage review passed 76 automated tests and homepage interactions only. It did not certify the other pages. “Show all” persistence, focus scrolling, labels, contrast and font connections were fixed then.
- Backend conversions depend on free-service availability, limits and real downloaded outputs. AI features remain excluded. No financial, medical, legal, engineering or regulatory entitlement is certified by these tests.
- Historical QA/audit reports remain read-only records; all new concerns and completion status go only in this master checklist.
