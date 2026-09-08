# Calculator All-in-One

Static browser calculators and PDF/QR utilities. Node 20+ is used for local builds and checks; there are no npm dependencies to install.

Run `npm run verify` to generate the working tool pages, build a public-file-only copy in `.site-build/`, validate links/metadata/redirects, and run regression tests. Run `npm run serve` and open http://127.0.0.1:4173 to test that copy.

The public file allowlist is `scripts/site-files.json`. Private environment files, documents, and local QA artifacts are excluded from the build. Add new public assets explicitly to the allowlist.

Edit generated tool content in `scripts/generate-traffic-pages.js`. Consolidated URLs live in `scripts/consolidated-routes.json`; the build creates ad-free compatibility redirects and excludes them from the sitemap. GitHub Pages serves these as HTML meta-refresh redirects, not HTTP 301 responses.

GitHub Pages publishes the repository's main branch. Pushes to a feature branch alone do not update the live site. CI runs `npm run verify` on pushes and pull requests. After a content release, run `node scripts/verify-live.cjs` to compare the public files with the local release.

Tests check specific behaviors and known failures. They are not a certification of every calculator or a guarantee of AdSense approval. See `ADSENSE-REMEDIATION.md` for the September 2026 audit.
