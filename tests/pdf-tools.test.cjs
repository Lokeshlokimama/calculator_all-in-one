const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'pdf-tools-suite.js'), 'utf8');
const pdfFile = (extra = {}) => ({ name: 'sample.pdf', type: 'application/pdf', size: 5000, arrayBuffer: async () => new ArrayBuffer(8), ...extra });
function suite(pageCount = 2, scale = 2) {
  const handlers = {};
  const input = { disabled: false, files: [], closest() { return null; }, addEventListener: (event, fn) => { handlers['input:' + event] = fn; } };
  const action = { addEventListener: (event, fn) => { handlers['action:' + event] = fn; } };
  const clear = { addEventListener() {} };
  const output = { innerHTML: '', hidden: true };
  const status = { textContent: '', dataset: {} };
  const nodes = { '[data-tool-input]': input, '[data-tool-action]': action, '[data-tool-clear]': clear, '[data-tool-status]': status, '[data-tool-output]': output,
    '[data-compress-scale]': { value: String(scale) }, '[data-compress-quality]': { value: '0.65' } };
  const formats = [], images = [], rendered = [];
  let destroyed = false;
  class PdfWriter {
    constructor(options) { formats.push(options.format); }
    addPage(format) { formats.push(format); }
    addImage(...args) { images.push(args); }
    output() { return { size: 2000 }; }
  }
  const window = { addEventListener() {}, jspdf: { jsPDF: PdfWriter }, pdfjsLib: {
    GlobalWorkerOptions: {},
    getDocument() {
      assert.equal(input.disabled, true, 'file selection locked during conversion');
      return { promise: Promise.resolve({
        numPages: pageCount,
        async getPage(index) {
          rendered.push(index);
          return { getViewport: ({ scale }) => ({ width: 612 * scale, height: 792 * scale }), render: () => ({ promise: Promise.resolve() }) };
        },
        async destroy() { destroyed = true; }
      }) };
    }
  } };
  const context = vm.createContext({
    window, crypto: require('node:crypto').webcrypto, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    document: { addEventListener() {}, querySelector: selector => nodes[selector] || null,
      createElement: () => ({ getContext: () => ({ fillRect() {} }), toDataURL: () => 'data:image/jpeg;base64,test' }) }
  });
  vm.runInContext(source.replace(/\}\(\)\);\s*$/, 'globalThis.testApi = { validateImageFiles, validatePdfFiles, parsePageRanges, initCompressPdf };}());'), context);
  return { ...context.testApi, input, output, status, handlers, formats, images, rendered, get destroyed() { return destroyed; } };
}
test('batch validation rejects unsupported, empty, oversized and excess files without silently dropping any', () => {
  const api = suite();
  assert.equal(api.validatePdfFiles([pdfFile(), pdfFile()], { min: 2 }).length, 2);
  assert.throws(() => api.validatePdfFiles([pdfFile(), pdfFile({ name: 'wrong.txt' })]), /only PDF/);
  assert.throws(() => api.validatePdfFiles([pdfFile({ size: 0 })]), /contain data/);
  assert.throws(() => api.validatePdfFiles([pdfFile({ size: 31 * 1024 * 1024 })]), /30 MB/);
  assert.throws(() => api.validatePdfFiles([pdfFile(), pdfFile()], { max: 1 }), /no more than 1/);
  assert.throws(() => api.validatePdfFiles([pdfFile()], { min: 2 }), /at least 2/);
  assert.throws(() => api.validateImageFiles([{ name: 'a.png', type: 'image/png', size: 10 }, { name: 'bad.gif', type: 'image/gif', size: 10 }]), /No files were selected/);
});
test('split page ranges retain requested order, deduplicate, and reject invalid ranges', () => {
  const api = suite();
  assert.deepEqual(Array.from(api.parsePageRanges('3,1-2,2', 3)), [3, 1, 2]);
  for (const range of ['', '0', '2-1', '4', 'one', '1.5']) assert.throws(() => api.parsePageRanges(range, 3));
});
test('compression refuses 41 pages before rendering; never exports only first 40', async () => {
  const api = suite(41);
  api.initCompressPdf();
  api.input.files = [pdfFile()];
  api.handlers['input:change']();
  await api.handlers['action:click']();
  assert.equal(api.rendered.length, 0);
  assert.match(api.output.innerHTML, /no pages were exported/);
  assert.equal(api.input.disabled, false);
  assert.equal(api.destroyed, true);
});
test('compression includes all pages and preserves page dimensions at 2x render scale', async () => {
  const api = suite(2, 2);
  api.initCompressPdf();
  api.input.files = [pdfFile()];
  api.handlers['input:change']();
  await api.handlers['action:click']();
  assert.deepEqual(api.rendered, [1, 2]);
  assert.deepEqual(api.formats.map(format => Array.from(format)), [[612, 792], [612, 792]]);
  assert.equal(api.images[0][4], 612);
  assert.equal(api.images[0][5], 792);
  assert.match(api.output.innerHTML, /All 2 pages are included/);
  assert.equal(api.input.disabled, false);
});
