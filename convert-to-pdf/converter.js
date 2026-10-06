(() => {
    'use strict';
    const input = document.getElementById('source-file');
    const prepare = document.getElementById('prepare-file');
    const save = document.getElementById('save-pdf');
    const status = document.getElementById('conversion-status');
    const preview = document.getElementById('document-preview');
    const section = document.getElementById('preview-section');
    const supported = /\.(docx|xlsx|pptx|jpe?g|png|webp|txt|md|csv|json|html?)$/i;
    let revision = 0;
    let imageUrl;
    let zipPromise;
    const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function reset() {
        revision++;
        save.disabled = true;
        section.hidden = true;
        preview.removeAttribute('srcdoc');
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        imageUrl = null;
    }
    function validate(file) {
        if (!file) throw new Error('Choose a file first.');
        if (!supported.test(file.name)) throw new Error('Unsupported format. Use DOCX, XLSX, PPTX, an image or a listed text format.');
        if (!file.size) throw new Error('The file is empty.');
        if (file.size > 10 * 1024 * 1024) throw new Error('Choose a file smaller than 10 MB.');
    }
    input.addEventListener('change', () => {
        reset();
        try { validate(input.files[0]); prepare.disabled = false; status.textContent = 'Ready to prepare: ' + input.files[0].name; }
        catch (error) { prepare.disabled = true; status.textContent = error.message; }
    });
    document.getElementById('clear-file').addEventListener('click', () => {
        reset(); input.value = ''; prepare.disabled = true; input.disabled = false;
        status.textContent = 'Choose a supported file to begin.';
    });
    function loadZip() {
        if (!zipPromise) zipPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => window.JSZip ? resolve(window.JSZip) : reject(new Error('Office parser unavailable.'));
            script.onerror = () => reject(new Error('Cannot load the Office parser. Check your connection and try again.'));
            document.head.append(script);
        }).catch(error => { zipPromise = null; throw error; });
        return zipPromise;
    }
    function xml(text) {
        const doc = new DOMParser().parseFromString(text, 'application/xml');
        if (doc.getElementsByTagName('parsererror').length) throw new Error('The document contains invalid XML.');
        return doc;
    }
    const nodes = (doc, name) => [...doc.getElementsByTagNameNS('*', name)];
    const texts = node => nodes(node, 't').map(n => n.textContent).join('');
    async function office(file, extension) {
        const Zip = await loadZip();
        let zip;
        try { zip = await Zip.loadAsync(file); }
        catch { throw new Error('The Office file is damaged, encrypted or not a supported document.'); }
        const entries = Object.values(zip.files);
        if (entries.length > 2000 || entries.reduce((sum, entry) => sum + (entry._data?.uncompressedSize || 0), 0) > 30 * 1024 * 1024) throw new Error('This document is too complex to preview safely. Export it from its original application.');
        async function read(name) {
            const entry = zip.file(name);
            if (!entry) throw new Error('Missing document content. The file may be damaged or use a different format.');
            return xml(await entry.async('string'));
        }
        if (extension === 'docx') return nodes(await read('word/document.xml'), 'p').map(p => '<p>' + escape(texts(p)) + '</p>').join('');
        if (extension === 'pptx') {
            const presentation = await read('ppt/presentation.xml');
            const relations = nodes(await read('ppt/_rels/presentation.xml.rels'), 'Relationship');
            let output = '';
            for (const [i, slide] of nodes(presentation, 'sldId').entries()) {
                if (i >= 100) throw new Error('Limit: 100 slides.');
                const relation = relations.find(r => r.getAttribute('Id') === slide.getAttribute('r:id'));
                const target = relation?.getAttribute('Target');
                if (!target || !/^slides\/slide\d+\.xml$/.test(target)) throw new Error('Unsupported slide reference.');
                output += '<section class="page"><h2>Slide ' + (i + 1) + '</h2>' + nodes(await read('ppt/' + target), 'p').map(p => '<p>' + escape(texts(p)) + '</p>').join('') + '</section>';
            }
            return output;
        }
        const shared = zip.file('xl/sharedStrings.xml') ? nodes(await read('xl/sharedStrings.xml'), 'si').map(texts) : [];
        const workbook = await read('xl/workbook.xml');
        const relations = nodes(await read('xl/_rels/workbook.xml.rels'), 'Relationship');
        let output = '';
        for (const [index, sheet] of nodes(workbook, 'sheet').entries()) {
            if (index >= 30) throw new Error('Limit: 30 worksheets.');
            const relation = relations.find(r => r.getAttribute('Id') === sheet.getAttribute('r:id'));
            const target = relation?.getAttribute('Target')?.replace(/^\/xl\//, '');
            if (!target || !/^worksheets\/sheet\d+\.xml$/.test(target)) throw new Error('Unsupported worksheet reference.');
            const rows = nodes(await read('xl/' + target), 'row');
            if (rows.length > 2000) throw new Error('Limit: 2,000 rows per worksheet.');
            output += '<section class="page"><h2>' + escape(sheet.getAttribute('name')) + '</h2><table>';
            for (const row of rows) {
                const cells = nodes(row, 'c');
                output += '<tr>';
                let column = 0;
                for (const cell of cells) {
                    const letters = cell.getAttribute('r')?.match(/^[A-Z]+/)?.[0] || 'A';
                    const position = [...letters].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
                    if (position > 50) throw new Error('Limit: 50 columns. Export wide sheets from Excel.');
                    while (++column < position) output += '<td></td>';
                    const value = nodes(cell, 'v')[0]?.textContent || '';
                    const type = cell.getAttribute('t');
                    const content = type === 's' ? shared[Number(value)] || '' : type === 'inlineStr' ? texts(cell) : value;
                    output += '<td>' + escape(content) + '</td>';
                }
                output += '</tr>';
            }
            output += '</table></section>';
        }
        return output;
    }
    prepare.addEventListener('click', async () => {
        reset(); const current = revision;
        prepare.disabled = true; input.disabled = true; status.textContent = 'Preparing preview…';
        try {
            const file = input.files[0]; validate(file);
            const extension = file.name.split('.').pop().toLowerCase();
            let content;
            if (/^(docx|xlsx|pptx)$/.test(extension)) content = await office(file, extension);
            else if (/^(jpg|jpeg|png|webp)$/.test(extension)) {
                imageUrl = URL.createObjectURL(file);
                content = '<img alt="Selected image" src="' + imageUrl + '">';
            } else {
                let text = await file.text();
                if (text.length > 1000000) throw new Error('Text preview limit: one million characters. Split the file into smaller documents.');
                if (/^html?$/.test(extension)) {
                    const parsed = new DOMParser().parseFromString(text, 'text/html');
                    parsed.querySelectorAll('script,style,noscript').forEach(n => n.remove());
                    text = parsed.body.textContent;
                }
                content = '<pre>' + escape(text) + '</pre>';
            }
            if (current !== revision) return;
            if (!content.trim()) throw new Error('No readable content found. Export from the original application.');
            preview.onload = () => {
                if (current !== revision) return;
                const images = [...preview.contentDocument.images];
                Promise.all(images.map(img => img.decode())).then(() => {
                    if (current !== revision) return;
                    save.disabled = false; status.textContent = 'Preview ready. Review it, then choose Print / Save as PDF.';
                }).catch(() => { status.textContent = 'The image cannot be decoded. Choose a valid JPG, PNG or WebP.'; });
            };
            preview.srcdoc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + escape(file.name) + '</title><style>body{font:16px/1.5 Arial,sans-serif;color:#222;padding:24px}p,pre{white-space:pre-wrap;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;table-layout:fixed}td{border:1px solid #bbb;padding:5px;overflow-wrap:anywhere}img{max-width:100%;max-height:90vh;object-fit:contain}.page+.page{break-before:page}@media print{body{padding:0}img{max-height:250mm}@page{margin:15mm}}</style></head><body>' + content + '</body></html>';
            section.hidden = false;
        } catch (error) { if (current === revision) status.textContent = 'Unable to convert: ' + error.message; }
        finally { if (current === revision) { prepare.disabled = false; input.disabled = false; } }
    });
    save.addEventListener('click', () => { preview.contentWindow.focus(); preview.contentWindow.print(); });
})();
