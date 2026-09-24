# PDF layout repair — 24 September 2026

The PDF converter inherited a two-column section and a second nested two-column
workbench. Its upload form measured only 34px at a 1163px viewport. The section
now stacks its introduction, steps and full-width workbench. A desktop results
column is created only while the output panel is visible. Anchor scrolling leaves
room for the fixed navigation. The converter stylesheet URL is versioned.

## Executed checks

- Browser measurements on the repaired converter at 320, 390, 768, 959, 960,
  1163 and 1440px: no page-level horizontal overflow; initial form width ranges
  from 257 to 1088px (1016px at 1163px).
- Results-visible static fixture at the same widths: stacked below 960px;
  side-by-side from 960px, without page overflow. This is a layout fixture,
  not a successful conversion or download test.
- All 42 sitemap pages loaded in the local browser at 390, 768 and 1440px:
  126 checks found no missing H1, page-level horizontal overflow, or visible
  form/workbench/upload card narrower than 150px.
- Additional interaction checks: homepage search for EPF returns one matching
  tool; EPF Calculate estimate displays results without mobile page overflow.
  The annual table is wider than its scroll container, as expected.
- Visually inspected converter desktop/mobile screenshots and merge-PDF desktop.
- `npm run verify`: build, site validation and all 62 tests pass.

## Reproduce the results layout

Run `npm run build`, then `node scripts/serve-pdf-layout-qa.cjs`, then open
`http://127.0.0.1:4174/pdf-converter/index.html?results`.
This local-only fixture removes the result panel's hidden attribute and scripts;
it is excluded from the public build manifest.

## Limits

The 42-page scan checks initial rendered layout, not every hidden tool, input
combination, accessibility requirement, browser engine, conversion or download.
No claim is made that this UI repair guarantees AdSense approval.
