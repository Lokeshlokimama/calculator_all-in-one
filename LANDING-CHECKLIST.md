# Landing page checklist — 8 October 2026

Scope: the local Calculator All-in-One homepage at http://127.0.0.1:4174/. Reviewed against the Vercel Web Interface Guidelines: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

## Completed checks

- [x] Build succeeds: 99 public files, 71 directory tools.
- [x] Site lint succeeds: 66 HTML files, internal links and anchors, metadata, JSON-LD, sitemap, redirects, ads.txt, JavaScript syntax.
- [x] Existing automated suite: 76 tests passed, zero failures, including HTTP route checks.
- [x] Initial directory shows 12 of 71 tools; expansion shows all 71.
- [x] Expanded directory now persists through reload with `?view=all`.
- [x] Search trims whitespace and ignores case. EMI + Finance returns one matching tool.
- [x] Search and category survive reload through URL parameters.
- [x] PDF quick filter returns six matching tools; keyboard Enter activates it.
- [x] No-result search displays actionable help; Clear filters restores defaults and focuses search.
- [x] Keyboard skip link has visible focus; after activation, Tab reaches search.
- [x] Expanding the directory focuses and scrolls to the first newly revealed tool.
- [x] No unnamed directory links or unlabelled inputs in the rendered page.
- [x] Non-decorative text contrast reviewed from rendered colors; advertisement label failure corrected from #77796d to #64665b on #f5f3ed.
- [x] Loan slider keyboard Home/End work. At 10% annual interest and 60 months, 50,000 produces 1,062.35/month; 1,000,000 produces 21,247.04/month.
- [x] INR/USD selection changes formatting and persists across reload.
- [x] Phone layouts checked at 320px and 390px, tablet at 768px, desktop at the default 1101px viewport. No horizontal overflow in settled layouts.
- [x] Console error log empty for the tested homepage interactions.
- [x] Reduced-motion CSS and JavaScript branches reviewed; decorative entrances finish within approximately one second, with no continuous loops.
- [x] Font swap behavior retained; added preconnect hints for the font hosts.
- [x] Clear filters and Show all controls now have visible hover feedback.

## Fixes made

1. Stored expanded state in the URL and restored it on reload.
2. Removed preventScroll when focusing the newly revealed tool.
3. Increased advertisement label contrast.
4. Added explicit accessible names to all directory links so offscreen content visibility does not remove their names from the accessibility tree.
5. Added missing button hover feedback and font connection hints.

## Verification limits

Browser interaction tests used the Codex in-app Chromium browser. This is not a full WCAG certification, screen-reader session, Safari/Firefox test, physical-device test, or Lighthouse performance benchmark. Reduced-motion handling was verified in source, not through an emulated browser preference. Existing route and calculation tests cover their own scenarios; this review did not manually exercise every tool workflow.

Everything remains local. No GitHub push or deployment was performed.
