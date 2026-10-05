# Content expansion — 6 October 2026

Twenty existing tool guides now have 1,000–1,500 words of editorial content. The additions are independently written task-specific explanations, with synthetic numerical examples, input interpretation, troubleshooting, and limitations. They are not copied source articles or synonym-spun versions of one template. Necessary shared notices remain. This is not a comprehensive plagiarism certification.

| Guide | Article words |
|---|---:|
| Age | 1,147 |
| BMI | 1,155 |
| Bulk QR | 1,134 |
| Currency conversion | 1,046 |
| Electricity bill | 1,072 |
| EMI prepayment | 1,036 |
| EMI | 1,276 |
| GST | 1,208 |
| EPF | 1,100 |
| NPS | 1,087 |
| Loan | 1,139 |
| Password generation | 1,088 |
| Percentage | 1,115 |
| General QR | 1,166 |
| SIP | 1,158 |
| Step-up SIP | 1,070 |
| UPI QR | 1,175 |
| vCard QR | 1,092 |
| WhatsApp QR | 1,068 |
| Wi-Fi QR | 1,059 |

Counts combine existing and added article elements, strip HTML, and count whitespace-delimited words. Calculator labels and navigation are excluded. Eight other tool guides remain below the target and are not represented as expanded.

## Validation

- Build, internal routes and anchors, metadata, JavaScript syntax, and all 72 automated tests passed.
- All 20 updated pages checked at 320 px and 1440 px: one added guide each, no horizontal overflow.
- Repeated build confirmed no duplicate guide injection.
- No shared 24-word sequences found between the new guide source files; this checks internal duplication only.
- The new EMI example was entered in the browser: 120,000 at 12% for 12 months produces 10,661.85, matching the text.
- Independently checked the zero-return step-up contribution totals, EPF annual interest example, NPS annuity illustration, percentage comparisons and inclusive-tax reversal.
- Supplemental Markdown is preserved in content/guides; scripts/build-guides.cjs inserts it during each build. Static checking enforces the requested article range and single insertion for every selected guide.

## Sources and limits

Google's AdSense guidance prioritises useful original content and clear navigation; these changes do not guarantee approval. Reference: https://support.google.com/adsense/answer/7299563 . Source links on applicable guides point to CDC, CFPB, CBIC, SEBI, NPCI and WhatsApp documentation. Numerical scenarios use the site's implemented assumptions and are not real lender offers, future returns, current tax classifications, medical prescriptions or completed payments.

No AdSense application was submitted and no ad or tracking loaders were enabled by this update. Homepage performance scores from the earlier audit were not remeasured for this content-only update.
