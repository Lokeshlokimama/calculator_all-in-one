# PDF suite verification

- AI summarization and translation removed from scope; no API credential required or created by this change.
- Browser tests: all 46 content pages at desktop 1440 and mobile 375; no horizontal overflow, global search present, three ad reservations per page.
- PDF catalogue search finds watermark, hides unrelated cards and gives clear no-match feedback. Disconnected online service states its actual availability and disables processing.
- Browser page-editor downloads independently inspected with pypdf: organize/extract page order, removal page count, rotation, numbering, watermark, crop box, text overlay, typed signature stamp and filled form field value.
- Removing every page is rejected. Form export no longer applies stale hidden page ranges. Input and Clear are locked while loading/exporting.
- Local backend tests: encryption, correct-password unlock, extracted text comparison, Markdown, readable Word/Excel/PowerPoint exports, invalid files/passwords and raster redaction passed. Browser/backend upload consent and encrypted download were exercised; downloaded encryption was verified with right and wrong passwords.
- Eight Python tests: five passed locally, three skipped because LibreOffice, Ghostscript and qpdf are absent. Container CI checks those integrations. Docker is unavailable locally; do not describe container integrations as verified before CI completes.
- Existing 72 site/calculator tests and build/link/schema/syntax checks passed.
- Backend is not public until deployed to Render and configured with its HTTPS endpoint. Its deployment blueprint selects Render's 1 CPU / 2 GB compute plan; account/billing setup and final hosted checks remain.
- PDF/A conformance has not been independently validated. Office-to-PDF fidelity, arbitrary damaged PDFs, real-world document complexity and cryptographic certificate signing are not certified. PDF-to-Office conversion is explicitly text-based; sign tool is a typed visual stamp.
