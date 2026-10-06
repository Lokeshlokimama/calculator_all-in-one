# Free Render connection

- Render dashboard confirms calculator-pdf-service uses Docker Free; no paid service or workspace upgrade was activated by the agent.
- Public service URL observed in dashboard: https://calculator-pdf-service.onrender.com. Health returns all eleven backend tasks.
- Synthetic hosted tests passed for protect/unlock, repair, PDF/A output intent, raster redaction, PDF-to-Word/Excel/PowerPoint, Markdown, text comparison and DOCX/XLSX/PPTX-to-PDF.
- Hosted tests used only generated examples and test passwords. PDF/A output is not independently certified; complex Office layouts still need review.
- Free-resource changes: one job at a time, 10 MB per input, 100 PDF pages, 512 MB container CI check, 90-second frontend health wake-up allowance.
- Pre-push browser audit: 46 content pages, desktop 1440/mobile375, all 92 checks passed for overflow, tool search and three ad reservations. Build/link/syntax checks and five local backend tests passed; three CLI tests require container CI.
- Versioned the PDF configuration and frontend script so cached disconnected state is refreshed.
- Latest backend resource changes require Render redeployment; public frontend connection requires GitHub Pages publishing. Verify both before claiming the final update live.
