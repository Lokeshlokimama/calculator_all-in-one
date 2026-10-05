// Normalize all loaders before installing the explicitly authorized publisher code.
const adsenseLoader = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9409281508068005" crossorigin="anonymous"></script>';
function removeOptionalLoaders(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, script =>
    /googletagmanager\.com|pagead2\.googlesyndication\.com|\bgtag\s*\(|window\.gtag|adsbygoogle/.test(script) ? '' : script)
    .replace(/<link\b[^>]*(?:googletagmanager\.com|pagead2\.googlesyndication\.com)[^>]*>/gi, '')
    .replace(/<!-- Google tag \(gtag\.js\) -->/g, '');
}
module.exports = { removeOptionalLoaders, adsenseLoader };
