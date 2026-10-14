const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function visit(saved, storageBlocked = false) {
  const nodes = [];
  const requests = [];
  const preferences = new Map(saved ? [['calculator-analytics-consent', saved]] : []);
  const element = tag => {
    const node = { tag, style: {}, children: [], handlers: {}, setAttribute() {}, focus() {},
      appendChild(child) { this.children.push(child); if (child.tag === 'script') requests.push(child.src); },
      addEventListener(event, callback) { this.handlers[event] = callback; },
      querySelector() { return this.children.find(child => child.tag === 'button'); }, remove() { this.removed = true; } };
    nodes.push(node);
    return node;
  };
  const document = { head: element('head'), body: element('body'), createElement: element, querySelector: () => null };
  const window = {};
  const localStorage = { getItem: key => { if (storageBlocked) throw Error('blocked'); return preferences.get(key); }, setItem: (key, value) => { if (storageBlocked) throw Error('blocked'); preferences.set(key, value); } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../analytics.js'), 'utf8'), { document, window, localStorage });
  return { nodes, requests, preferences, window };
}
test('analytics makes no request before choice or after saved decline; consent enables one page view', () => {
  assert.equal(visit('denied').requests.length, 0);
  const page = visit();
  assert.equal(page.requests.length, 0);
  page.nodes.find(n => n.textContent === 'Accept analytics').handlers.click();
  assert.equal(page.requests.length, 1);
  assert.match(page.requests[0], /id=G-MRCMVF9545$/);
  assert.equal(page.preferences.get('calculator-analytics-consent'), 'granted');
  assert.equal(page.window.dataLayer[1][0], 'config');
  page.nodes.find(n => n.textContent === 'Accept analytics').handlers.click();
  assert.equal(page.requests.length, 1);
  page.nodes.find(n => n.textContent === 'Decline').handlers.click();
  assert.equal(page.window['ga-disable-G-MRCMVF9545'], true);
  assert.equal(page.preferences.get('calculator-analytics-consent'), 'denied');
  assert.equal(visit('granted').requests.length, 1);
});
test('blocked browser storage still permits an explicit per-page consent choice', () => {
  const page = visit(null, true);
  assert.equal(page.requests.length, 0);
  page.nodes.find(n => n.textContent === 'Accept analytics').handlers.click();
  assert.equal(page.requests.length, 1);
});
