const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verifyRelease } = require('../scripts/verify-live.cjs');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-check-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'index.html'), 'release\r\n');
  fs.writeFileSync(path.join(root, 'deployment.json'), JSON.stringify({ commit: 'abc123' }));
  return { root, site: 'https://example.com', files: ['index.html'], expectedSha: 'abc123' };
}
test('live verification checks commit marker and normalizes text line endings', async t => {
  const result = await verifyRelease({ ...fixture(t), fetchImpl: async url => {
    assert.equal(url.searchParams.get('release-check'), 'abc123');
    return new Response(url.pathname === '/' ? 'release\n' : JSON.stringify({ commit: 'abc123' }));
  } });
  assert.equal(result.passed, 2);
});
test('stale release cannot pass even when HTTP status is successful', async t => {
  await assert.rejects(verifyRelease({ ...fixture(t), fetchImpl: async () => new Response('old release') }), /live content differs/);
});
test('temporary propagation mismatch retries and then succeeds', async t => {
  let calls = 0;
  const result = await verifyRelease({ ...fixture(t), attempts: 2, delayMs: 0, fetchImpl: async url => {
    const firstAttempt = calls++ < 2;
    return new Response(firstAttempt ? 'old' : url.pathname === '/' ? 'release\n' : JSON.stringify({ commit: 'abc123' }));
  } });
  assert.equal(result.attempts, 2);
});
test('incorrect build commit and unsuccessful HTTP responses fail verification', async t => {
  const options = fixture(t);
  await assert.rejects(verifyRelease({ ...options, expectedSha: 'wrong' }), /artifact does not match/);
  await assert.rejects(verifyRelease({ ...options, fetchImpl: async () => new Response('unavailable', { status: 503 }) }), /HTTP 503/);
});
