# Calculator All-in-One

Static premium calculator landing page built in Antigravity.

Open `index.html` directly in a browser. The page includes finance, health, education, web, and daily utility calculators with animated cards, AdSense integration, a donation footer, and responsive styling.

## AdSense readiness requirements

The repository treats AdSense approval as a content-and-trust requirement, not only an ad-script requirement. Before requesting review:

- Keep the publisher ID consistent in the AdSense loader and `ads.txt`.
- Publish original, useful text that explains each calculator's method, assumptions, worked examples, limitations, and test cases.
- Attribute health, finance, tax, and security claims to primary or first-party sources.
- Maintain visible About, Contact, Privacy, Terms, Disclaimer, and Editorial Standards pages.
- Disclose Google Analytics, Google AdSense, cookies, IP-address processing, and calculator inputs sent to third-party services.
- Keep ads visually separate from controls and results; never encourage clicks or ship empty ad placeholders.
- Use unique titles, descriptions, canonical URLs, one H1, valid structured data, crawlable internal links, `robots.txt`, and a complete sitemap.
- Test ordinary inputs, zero-rate/zero-value behavior where valid, invalid inputs, and boundary cases before publishing formula changes.

Google does not publish a guaranteed minimum word count or page count. The test suite uses a repository-specific 800-word floor for dedicated calculator pages as a regression guard, while also rejecting duplicated long boilerplate. Passing the tests improves readiness but cannot guarantee AdSense approval, indexing, traffic, or policy review outcomes.

## Verification

Run all checks with the bundled or system Node.js runtime:

```powershell
npm test
```

The suite validates calculator formulas and edge cases, metadata, JSON-LD, internal links, sitemap coverage, publisher disclosures, source-backed calculator sections, content depth, and repeated boilerplate.
