# Repository and publisher audit — 6 October 2026

## Changes

- Replaced the legacy Gmail address with contact@calculatorsallinone.com in tracked HTML, JavaScript, JSON, Markdown and generator sources.
- Standardized footer copyright copy and removed personal maintainer credits. Build normalization covers all content pages, including the homepage, retirement tools and PDF tools.
- Standardized existing JSON-LD publisher and author objects to the site Organization and domain contact address. No fictitious individual author or professional qualification was added.
- Replaced About with mission, methodology, formula limits, sourcing, corrections and advertising disclosures while retaining the shared design and navigation.
- Expanded Terms and Disclaimer with acceptable use, file permissions, external services, reuse, legal limitations and specific financial/health/engineering caveats. Privacy and Editorial Standards retain detailed disclosures and corrections guidance.
- Added regression checks for internal reviewer comments, stale credits, nonstandard footers and publisher branding. The requested reviewer phrases were absent from public HTML before this revision; defensive cleanup prevents their return.

## Verification

- All 62 public HTML routes, internal links, anchors, metadata, JSON-LD, sitemap and syntax checks passed. Public build contains 42 indexable content pages, 18 navigation-only compatibility routes, an error page and ownership verification page.
- All 72 automated tests passed, including numerical examples, invalid-input boundaries, file tools, HTTP route status and exact authorized AdSense script placement.
- Six trust pages checked at 320 and 1440 px: one H1 each, domain contact present, no horizontal overflow.
- Existing live About, Contact, Privacy, Terms, Disclaimer, Editorial Standards and robots.txt returned HTTP 200 for a request using Mediapartners-Google, without an X-Robots-Tag block. This verifies an accessible HTTP response, not an actual Google crawl.
- robots.txt allows all user agents and declares the sitemap. Only intentionally excluded compatibility routes use noindex; content pages remain indexable. Hosting configuration has no application login gate.
- The existing 20 topic-specific extended guides continue to pass the 1,000–1,500-word editorial-length check. Working calculator examples and external source references remain. Word count alone does not establish content quality or originality.

## Outstanding external work

The owner confirmed that contact@calculatorsallinone.com is not configured yet. Contact explains this and links to the public repository issue tracker as an interim reporting channel. DNS currently points to Spaceship nameservers and Spaceship forwarding MX records; that does not prove a receiving alias exists. Mailbox/forwarding setup and a real delivery test are still required.

Google approval, actual crawler visits, indexed coverage, plagiarism across the entire web, account-level policy flags and regional consent configuration cannot be established from this repository. No professional team credentials or independent certification were invented. The AdSense connection loader remains installed; display mounts do not contain individual ad-unit codes. Before serving ads where required, configure appropriate Google-certified consent handling in the account.

Policy references: [Google Publisher Policies](https://support.google.com/adsense/answer/10008391), [AdSense crawler](https://support.google.com/adsense/answer/99376), [ad placement policies](https://support.google.com/adsense/answer/1346295).
