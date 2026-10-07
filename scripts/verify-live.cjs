const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function verifyRelease({ root, site, files, fetchImpl = fetch, attempts = 1, delayMs = 10000, expectedSha }) {
  const releaseFiles = files.filter(file => file !== '.nojekyll');
  if (expectedSha) {
    const marker = JSON.parse(fs.readFileSync(path.join(root, 'deployment.json'), 'utf8'));
    if (marker.commit !== expectedSha) throw new Error('Release artifact does not match deployment commit');
    releaseFiles.push('deployment.json');
  }
  let failures = [];
  for (let attempt = 1; attempt <= attempts; attempt++) {
    failures = [];
    let cursor = 0;
    async function worker() {
      while (cursor < releaseFiles.length) {
        const file = releaseFiles[cursor++];
        const route = file === 'index.html' ? '/' : '/' + file.replace(/index\.html$/, '');
        try {
          const url = new URL(site.replace(/\/$/, '') + route);
          url.searchParams.set('release-check', expectedSha || Date.now().toString());
          const response = await fetchImpl(url, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
          if (!(file === '404.html' ? [200, 404] : [200]).includes(response.status)) throw new Error('HTTP ' + response.status);
          const bytes = Buffer.from(await response.arrayBuffer());
          const local = fs.readFileSync(path.join(root, file));
          const textFile = /\.(html|css|js|xml|txt|svg|json)$/.test(file) || file === 'CNAME';
          const normalize = value => textFile ? value.toString('utf8').replace(/\r\n/g, '\n') : value;
          if (hash(normalize(bytes)) !== hash(normalize(local))) throw new Error('live content differs from release');
        } catch (error) { failures.push(route + ': ' + error.message); }
      }
    }
    await Promise.all(Array.from({ length: 4 }, worker));
    if (!failures.length) return { passed: releaseFiles.length, attempts: attempt };
    if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error('Live deployment verification failed:\n' + failures.join('\n'));
}
if (require.main === module) {
  verifyRelease({
    root: path.resolve(__dirname, '..', process.env.RELEASE_ROOT || '.site-build'),
    site: process.env.DEPLOYMENT_URL || 'https://calculatorsallinone.com',
    files: require('./site-files.json'), expectedSha: process.env.EXPECTED_SHA, attempts: 6
  }).then(result => console.log(`Live deployment verified: ${result.passed} files match the release${process.env.EXPECTED_SHA ? ' at ' + process.env.EXPECTED_SHA : ''}.`))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { verifyRelease };
