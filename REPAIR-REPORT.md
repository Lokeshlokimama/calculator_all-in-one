# Website repair and verification — 22–23 September 2026

## Outcome and scope

Changes are local on `codex/content-quality-repair`, based on upstream commit `5a30fb03655c6ab77c4cd3812db1f89db3a2f951`. No push, deployment, AdSense submission, or account-setting change was made. The reviewed site is https://calculatorsallinone.com. These repairs address demonstrated defects; they do not establish Google's exact rejection cause or guarantee approval.

The [inventory](AUDIT-INVENTORY.md) covers 59 public HTML routes and 62 toolbox entries, distinguishing functional evidence from source-only checks. The build contains 76 public files, 39 indexable pages and 18 compatibility redirects. Existing September fixes were preserved, including secure password/UUID generation, salary deductions, prepayment final installments and PDF size/page safeguards.

## Implemented repairs

- Replaced the 214,512-byte homepage with a 16,849-byte searchable directory plus a 1,411-byte directory script. These are file sizes, not measured Core Web Vitals. All 62 tools remain in `tools.html`; old calculator anchors still route to tools.
- Corrected EMI and loan examples without multiplying rounded installments. For 500,000 at 10% over 60 months: payment 10,623.52, total 637,411.34 and interest 137,411.34. Clarified zero-interest behavior, excluded fees, and display-currency labels.
- Corrected inconsistent BMR, reference-weight, body-fat, water and RD examples; clarified adult BMI scope and rounding. Added assumptions and removed unsupported return/affordability claims. Health outputs remain estimates, not clinical advice.
- Aligned SIP and step-up SIP to nominal annual return divided by 12, with beginning-of-month contributions; rejected fractional contribution counts. Removed invented electricity chart tax and fixed charges.
- Made GST rate user-entered with an official classification reference. Consolidated duplicate GST and home-loan routes; preserved older aliases. Removed advertising loaders from six navigation/category hubs.
- Hardened invalid dates, fractional CIDR/fractions, unsafe numeric ranges, factorial limits, overflow, exchange-rate freshness and timeouts. Currency data must have a valid provider timestamp; missing dates are not invented. Removed unsupported currency fee-range and fee-comparison claims.
- Fixed sticky calculator panels that made QR download actions unreachable at a desktop viewport. Added browser-storage disclosure to the existing privacy page.
- Added independent calculation regression cases, release-route HTTP checks and synthetic PDF/image fixtures. No user documents were used.

## Executed verification

`npm run verify` passed: generated build, static checks and **49 tests, 49 passed, zero failed**. Static checks cover internal links/anchors, metadata, JSON-LD, sitemap, redirects, ads.txt and JavaScript syntax. HTTP tests request all 76 release files, check 18 alias bodies and distinguish missing/private routes from successful responses on the local server.

Unit tests cover normal, zero, invalid and overflow cases across selected calculators, plus matrices for passwords, attendance, loans and calendar dates. Some tests execute extracted functions or simulated form handlers; these are not full browser tests. Existing PDF safeguard tests use library mocks.

Interactive testing used the available in-app Browser skill/runtime, not a standalone Playwright MCP or Chrome DevTools MCP (neither was available). The skill supplied supported interaction, viewport, file-upload and console interfaces. No full request waterfall, Lighthouse run or field Core Web Vitals measurement was available/performed.

Recorded browser checks:

| Check | Observed result |
|---|---|
| Directory desktop 1366×900 and mobile viewport 375×812 | Search/category navigation and empty-search status worked; measured document widths showed no horizontal overflow on checked views |
| EMI normal, zero rate, fractional tenure | Correct amounts; native validation rejected fractional months |
| Mobile triangle and reverse GST | 10×8/2 = 40; 1180 inclusive of 18% = 1000 base + 180 tax |
| QR generation/download | SVG downloaded; exact contents matched the local engine's output for the test URL; download became reachable after layout fix |
| PDF text and page-image export | Real browser libraries processed a synthetic one-page PDF; downloaded .doc contained expected text and PNG measured 918×1188 |
| Corrupt PDF | Preview/conversion reported invalid PDF structure instead of fabricated output |
| Currency provider | 100 USD → INR displayed 9,587.34, with 95.8734 rate and provider timestamp 22 September 2026 00:02:31 GMT; this is recorded test data, not a current quote |

Console checks for the recorded successful QR/PDF/currency flows returned no errors/warnings. This is not a claim that every route or request was error-free. Browser mobile testing used viewport emulation, not a physical phone. Viewport overrides were reset afterward.

## Research and policy interpretation

Official Google guidance was researched live. Google emphasizes useful original content and user experience, not a guaranteed word count, article count or approval score: [AdSense content and experience](https://support.google.com/adsense/answer/10015918). Advertising on screens without substantive publisher content or mainly navigational screens is restricted: [publisher-content policy](https://support.google.com/publisherpolicies/answer/11112688). The repairs therefore improve actual tools and consolidate overlap rather than add filler or hide pages from reviewers.

[Google Publisher Policies](https://support.google.com/adsense/answer/10502938) and [Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) were consulted separately; passing technical SEO checks does not establish AdSense eligibility. Formula/audience checks also used [CFPB amortization](https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/), [CDC adult BMI categories](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html), [NHS hydration guidance](https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/), [Investor.gov](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator) and [CBIC rates](https://cbic-gst.gov.in/gst-goods-services-rates.html). These sources do not certify the entire site.

## Remaining uncertainties and release gates

1. Consent: analytics loads immediately in inspected source. Account-level consent configuration was not inspected. Verify applicable consent flows before optional tracking/ads, including Google's [certified CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en) for personalized advertising in the EEA, UK and Switzerland. This report is not a legal-compliance certification.
2. Hosting: README describes GitHub Pages publishing main. The allowlist protects the `.site-build` copy and local server, NOT repository-root hosting. Confirm the actual publishing source and prevent unintended audit/source files from becoming public; do not assume CI automatically publishes `.site-build`. No hosting migration was performed.
3. Coverage: not all 62 workflows were individually browser-tested. OCR, every PDF variant, physical QR scans, real-device behavior, full network failures and specialist medical/tax review remain unverified. Local regression success is narrower than production certification.
4. Content/business value: originality against the wider web, sustained genuine user interest, traffic and Search Console status were not established. A broad generic tool collection may still need stronger task-specific value. Do not fabricate traffic, credentials, testimonials or expert review.
5. AdSense: the latest supplied screenshot says review is unavailable until **26 September 2026**. That is not a promise of approval or a reason to submit immediately. Confirm the current account state and resolve remaining issues first.

## Deployment checklist — requires owner approval

- Review the diff and this report; retain a rollback reference to the current production commit.
- Confirm publishing source and consent configuration. Keep existing hosting unless a change is explicitly approved.
- Run `npm run verify` and `node scripts/audit-inventory.cjs` on the approved revision. Use a clean release output and the intended public-file manifest.
- Publish only after approval; feature-branch changes alone do not update main's site.
- After deployment, run `node scripts/verify-live.cjs`; repeat fresh desktop/mobile calculator, QR and PDF checks against production. Verify canonical URLs, sitemap, actual redirect behavior, ads.txt and the unchanged publisher ID `ca-pub-9409281508068005`.
- Compatibility redirects are HTML meta-refresh pages, not HTTP 301 redirects on GitHub Pages. Check old inbound URLs, not just the new directory.
- Review real user feedback and indexing, then request AdSense review only when the account permits it and substantive quality work is ready. No approval guarantee is possible.
