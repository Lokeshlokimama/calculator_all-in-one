// Optional tracking and ad delivery remain off until consent and placements are reviewed.
// Ownership verification uses the AdSense meta tag and ads.txt, not an ad loader.
function removeOptionalLoaders(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, script =>
    /googletagmanager\.com|pagead2\.googlesyndication\.com|\bgtag\s*\(|window\.gtag|adsbygoogle/.test(script) ? '' : script)
    .replace(/<link\b[^>]*(?:googletagmanager\.com|pagead2\.googlesyndication\.com)[^>]*>/gi, '')
    .replace(/<!-- Google tag \(gtag\.js\) -->/g, '');
}
module.exports = { removeOptionalLoaders };
