# Page design and link audit — 6 October 2026

Checked the local build at http://127.0.0.1:4173.

## Results

- All 43 content pages share the cream background, Segoe UI typography, charcoal text and orange accents. The homepage uses its dedicated landing stylesheet; 42 other pages use the shared theme.
- All 43 pages were checked at 390 px, and rechecked at 320 px and 1440 px: no horizontal overflow. Headers and footers were present on every content page.
- All 18 compatibility URLs were opened in the browser and redirected to their intended themed destinations, including PDF anchors.
- Static checking passed for all 62 HTML files, internal linked assets/pages and fragment targets. One of these files is the Google verification response, which is intentionally not a user-facing design page.
- All 71 automated tests passed after changes.

## Changes

- Added matching mobile Menu controls to the 404, EPF, EPS and NPS pages. Checked opening each menu and verified link touch targets exceeded 44 px.
- Aligned retirement header links with the shared header typography.
- Styled toolbox policy/support popups with the same cream panels and charcoal text. Opened the Refund Policy popup to verify its rendered design.
- Added the menu generation to the theme build step so regenerated retirement pages retain it.

## Scope

Pages share a design language, with layouts and navigation destinations adapted to their tools; they are not identical copies. External reference/payment links lead to other websites and do not inherit this design. External destinations were not checked or payment flows opened. Internal links and anchors were checked statically; compatibility redirects were also followed in the browser. Full screenshots were reviewed for representative retirement and modal layouts; computed style and sizing checks covered every content page.

Detailed per-page and redirect evidence: DESIGN-LINK-AUDIT-2026-10-06.json.
