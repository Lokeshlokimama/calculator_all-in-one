# Convert to PDF and tool search verification

- Browser checks: all 44 content pages at 1440 and 375 pixels; no horizontal overflow, tool search present, three reserved ad spaces each.
- Converter also checked at 320 pixels without horizontal overflow.
- Sample DOCX paragraph content, XLSX sparse cell alignment and stored values, PPTX presentation slide order, TXT, Markdown, CSV, JSON, HTML, PNG, JPG and WebP previews passed.
- HTML script content removed; preview uses a sandboxed frame and escaped content.
- Empty, oversized, unsupported legacy DOC and corrupt DOCX rejected; PDF action disabled. Clear resets the preview and file state.
- Search from the converter navigates to filtered homepage results. Word finds the new converter; unmatched text displays guidance. PDF and Files filtering checked.
- Build, internal links, metadata, schema, sitemap and JavaScript syntax checks passed. All 72 existing calculation and publisher tests passed.
- PDF action was exercised but native print dialog interaction timed out in browser automation; escaped back to the page with no console errors. A final saved PDF was not inspected. Browser print support remains device-dependent.
- Office conversion is content-based. Exact layout, charts, images embedded in Office files, macros, old binary Office formats and uncached formulas are outside its scope. Synthetic test documents do not cover every real-world Office file.
- No new performance benchmark, full originality scan, independent legal review or Googlebot live inspection was performed for this change.
