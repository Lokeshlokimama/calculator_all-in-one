# Content and functionality remediation — 8 September 2026

The account screenshots identify **Low value content**. They do not identify individual rejected URLs. This audit addresses observed site problems; it cannot disclose Google's internal rationale or guarantee approval.

## Changes

- Consolidated 12 near-duplicate state electricity pages into one clearly labelled flat/average-rate estimator. It now explains the complete arithmetic, a reproducible worked example, appliance comparison, and the limits of using an average rate for slab billing.
- Consolidated four intermediary PDF URLs into the working converter, Images to PDF, or Compress PDF. Navigation now opens the working tools directly. Compatibility pages have no ads or analytics and are excluded from the sitemap.
- Removed public search-targeting/AdSense-readiness copy and unsubstantiated review claims. Updated privacy disclosures, password guidance, salary assumptions, UUID behavior and RD explanations.
- Replaced insecure password randomness with browser cryptography, removed mock UUID v1 output, replaced invented salary-tax assumptions with user-entered deductions, corrected recurring-deposit compounding and prepayment final-payment accounting, and tightened calculation input validation.
- Fixed PDF compression that could silently omit pages after page 40 or alter physical page sizes. Invalid or excessive file selections now produce errors. Image export also rejects PDFs over its 30-page limit without partial output. File inputs are locked during asynchronous processing.
- Made Word export limitations explicit: selectable text in an HTML-based .doc, not native DOCX or original layout reconstruction. Added a specific error for scans without selectable text.
- Added a public-file build allowlist, static link/metadata/sitemap checks, regression tests, and GitHub CI. Existing local private files are not release assets.

## Checks and limits

Run `npm run verify`. Regression cases cover selected loan/prepayment boundaries, RD compounding, entered salary deductions, password/UUID generation, PDF input validation, range selection, page-count rejection and compression geometry. PDF regression tests use controlled library doubles; browser testing additionally uses synthetic PDF files and the real loaded libraries.

Static checks cover every public HTML file, internal links/anchors, metadata, structured data, sitemap eligibility, redirects and ads.txt. This does not imply that every possible tool input, device or third-party service has been tested.

The live ads.txt is checked against the publisher ID shown in the account screenshots. Its presence does not fix a low-value-content rejection by itself.

## Publishing and review

1. Publish the verified release to main.
2. Run `node scripts/verify-live.cjs` and confirm the public content matches.
3. In AdSense, open Sites → calculatorsallinone.com and inspect the current issue. Request review after the corrections are live. Google must recrawl and reassess; a code change cannot directly change the account approval status.
4. If a new issue is reported, record its exact wording and date. Do not add query-targeted clones, untested tools or claims of approval to respond to a rejection.

## Policy references

- [Google: ads on screens without publisher content or with low-value content](https://support.google.com/publisherpolicies/answer/11112688?hl=en)
- [Google Search: doorway abuse](https://developers.google.com/search/docs/essentials/spam-policies#doorway-abuse)
- [Google: site not ready to show ads](https://support.google.com/adsense/answer/12176698?hl=en)
- [Google: ads.txt guidance](https://support.google.com/adsense/answer/12171612)
