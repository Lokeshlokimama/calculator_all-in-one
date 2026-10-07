# Website review checklist

Update this checklist whenever the owner raises a concern. Apply it before every push to main and verify the live deployment afterward. Use the Browser skill for UI and UX checks. Record actual results; never mark an untested case as passed.

- Check every content page on desktop and mobile for overflow, consistent colors, readable text, and comfortable edge spacing.
- Check left and right inner spacing on every bordered panel: headings, paragraphs, badges, workflow steps and controls must not touch the border. Aim for at least 20 px in main tool panels on mobile and 28–36 px on desktop, with smaller spacing only for compact controls.
- Check corners across tool panels, upload areas, result cards and workflow steps. Avoid sharp square edges on these surfaces; use consistent, softly rounded corners and verify that shared theme overrides do not flatten them.
- Browser-check every public page at 320 px, 390 px and desktop width for these spacing and corner concerns. Record per-page findings, inspect representative screenshots, and check compatibility redirects separately. Keep unresolved or untested cases open.
- Check headers remain usable while scrolling, menus open and close, search finds tools, and links reach working destinations.
- Check animations do not obstruct controls, reduced motion and pause controls work, and floating assistant panels fit the screen with readable responses.
- Check calculator valid, empty, invalid and boundary inputs, units, outputs, reset controls and relevant formula tests.
- Check currency formatting and truthful language choices; no placeholder localization claims.
- Check accessible About, Contact, Privacy, Terms and Disclaimer pages, domain branding and absence of reviewer notes. Do not claim unconfigured mailboxes work.
- Check article depth, meaningful categories and originality concerns. Do not claim a word count guarantees AdSense approval.
- Preserve one authorized AdSense loader and reserved top/middle/bottom spaces; check desktop side placements stack on mobile. Do not equate script installation with ad delivery.
- Inspect changes before committing, run build/link/syntax checks and relevant tests, push to main, then verify the latest deployment and browser cache versions.
- On every deployment, confirm the intended commit reached the publishing branch (`main`); a feature-branch push is not a deployment. Check the Pages job result and run `scripts/verify-live.cjs` against the exact uploaded build artifact. Confirm the live commit marker and public file contents match that release, retry briefly for propagation, and fail the deployment job when verification fails. Report pushed, deployed and live-verified status separately; never claim success from a push alone.
- PDF tools must be easy to find through page search and the directory. Test supported formats, unsupported/empty/corrupt/oversized files, preview, clear and PDF export. State Office layout limits and supported extensions honestly.
- AI PDF features are excluded at the owner's request. Do not create or require an AI key. Verify page editing against downloaded PDFs, forms against saved field values, and backend upload consent, password validation, encryption/unlocking and temporary-file cleanup. Backend-only tools remain unavailable until an HTTPS service is deployed and checked.
- Use the owner's chosen free Render plan; never enable paid compute or workspace upgrades without explicit approval. Test cold-start messaging, resource limits and busy responses. Confirm hosted conversion outputs before connecting the public frontend.

## Spacing and corners review — 7 October 2026

- [x] Inspect all 65 public HTML routes for shared styles and affected panel classes (47 content/error routes and 18 compatibility redirects).
- [x] Record spacing, corner and browser coverage findings in `SPACING-AUDIT-2026-10-07.md` and the accompanying JSON evidence.
- [ ] Soften shared card corners: 45 content/error routes contain classes affected by the shared 3 px corner rule; review each applicable surface before changing the theme.
- [ ] Check and correct missing horizontal stage padding on Compress PDF, Images to PDF, Merge PDF, OCR Scanned PDF, PDF Password Helper and Split PDF.
- [ ] Complete all-page browser and screenshot checks at 1440, 390 and 320 px. Only four routes have complete saved measurement sets in this audit; repeated browser synchronization stalls prevented the remaining checks. Do not mark the all-page visual review passed.
- [ ] Recheck the deployed site after any spacing/corner fixes, including upload, result and mobile states.
