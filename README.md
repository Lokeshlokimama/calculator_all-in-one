# Calculator All-in-One

Static premium calculator landing page built in Antigravity.

The page includes finance, health, education, web, daily utility, and AI-assisted tools with responsive styling. Run the local server so clean routes and server endpoints work together:

```powershell
npm run dev
```

Then open `http://127.0.0.1:4173/`.

## AI Deepfake Checker

The clean routes are `/ai-tools/` and `/deepfake-checker/`. The checker validates JPG, JPEG, PNG, and WebP images up to 5 MB, previews the selection locally, and sends the image as an in-memory request to `/api/deepfake-checker`. Uploaded files are not written to disk.

Server configuration uses `DEEPFAKE_API_KEY` and `DEEPFAKE_PROVIDER`; browser code never receives the API key. Two production adapters are registered:

- `hive` sends the in-memory image to Hive's synchronous AI-generated/deepfake detection endpoint.
- `reality-defender` requests a signed upload URL, uploads the in-memory bytes directly, and polls the ensemble result.

For local use, add the matching private key to the ignored `.env.local` file and choose either provider name. The local server loads that file automatically. Until a valid key and provider are configured, the endpoint intentionally returns `PROVIDER_NOT_CONFIGURED` rather than a fabricated result.

For production, this repository is configured for Cloudflare Pages Functions. The `functions/api/deepfake-checker.js` wrapper exposes `/api/deepfake-checker`, while `wrangler.jsonc` enables Node.js compatibility and declares `DEEPFAKE_API_KEY` as a required secret. Cloudflare's request allowance supports the full 5 MB application limit; platforms with a lower request-body cap are not suitable without changing the upload architecture.

Use `npm run build` as the Pages build command and `dist` as the output directory. In Cloudflare Pages, add `DEEPFAKE_API_KEY` as an encrypted secret and set `DEEPFAKE_PROVIDER` to `hive` or `reality-defender` for both Production and Preview as needed. The Wrangler configuration defaults the provider to `hive`. Never place the key in frontend code or a plaintext Wrangler variable.

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
npm run build
```

The suite validates calculator formulas and edge cases, metadata, JSON-LD, internal links, sitemap coverage, publisher disclosures, source-backed calculator sections, content depth, and repeated boilerplate.
