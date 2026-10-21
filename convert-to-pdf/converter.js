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
    let pdfUrl;
    let officeDownload;
    let request;
    const consent = document.getElementById('office-upload-consent');
    const uploadOptions = document.getElementById('office-upload-options');
    const isOffice = file => /\.(docx|xlsx|pptx)$/i.test(file?.name || '');
    const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function reset() {
        revision++;
        request?.abort();
        request = null;
        officeDownload = null;
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        pdfUrl = null;
        preview.removeAttribute('src');
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
        consent.checked = false;
        uploadOptions.hidden = !isOffice(input.files[0]);
        prepare.textContent = isOffice(input.files[0]) ? 'Convert to PDF' : 'Prepare preview';
        save.textContent = isOffice(input.files[0]) ? 'Download PDF' : 'Print / Save as PDF';
        try { validate(input.files[0]); prepare.disabled = false; status.textContent = 'Ready to prepare: ' + input.files[0].name; }
        catch (error) { prepare.disabled = true; status.textContent = error.message; }
    });
    document.getElementById('clear-file').addEventListener('click', () => {
        reset(); uploadOptions.hidden = true; consent.checked = false; prepare.textContent = 'Prepare preview'; save.textContent = 'Print / Save as PDF'; input.value = ''; prepare.disabled = true; input.disabled = false;
        status.textContent = 'Choose a supported file to begin.';
    });
    async function convertOffice(file, current) {
        if (!consent.checked) throw new Error('Confirm upload permission before converting this document.');
        const endpoint = (window.PDFServiceConfig?.endpoint || '').replace(/\/$/, '');
        if (!/^https:\/\//.test(endpoint)) throw new Error('Document conversion is unavailable. Export to PDF from the original application.');
        request = new AbortController();
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(210000)]);
        status.textContent = 'Connecting to document conversion. Free hosting may take about a minute to wake up…';
        const health = await fetch(endpoint + '/health', {signal});
        if (!health.ok || !(await health.json()).tools?.includes('office-to-pdf')) throw new Error('Document conversion is unavailable. Try again later or export from the original application.');
        const encoded = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1]);
            reader.onerror = () => reject(new Error('Cannot read the selected file.'));
            reader.readAsDataURL(file);
        });
        if (current !== revision || signal.aborted) return;
        status.textContent = 'Converting the original document to PDF…';
        const response = await fetch(endpoint + '/process', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, signal,
            body: JSON.stringify({tool: 'office-to-pdf', file: {name: file.name, data: encoded}, options: {}})
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Document conversion failed. No text-only replacement was created.');
        }
        const blob = await response.blob();
        if (!(await blob.slice(0, 5).text()).startsWith('%PDF-')) throw new Error('The service did not return a valid PDF.');
        if (current !== revision) return;
        pdfUrl = URL.createObjectURL(blob);
        officeDownload = file.name.replace(/\.[^.]+$/, '') + '.pdf';
        preview.onload = null;
        preview.src = pdfUrl;
        section.hidden = false;
        save.disabled = false;
        status.textContent = 'PDF ready. Download the converted file directly. Review fonts, tables, images and page breaks; an exact match is not guaranteed.';
    }
    prepare.addEventListener('click', async () => {
        reset(); const current = revision;
        prepare.disabled = true; input.disabled = true; status.textContent = 'Preparing preview…';
        try {
            const file = input.files[0]; validate(file);
            const extension = file.name.split('.').pop().toLowerCase();
            let content;
            if (isOffice(file)) { await convertOffice(file, current); return; }
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
        } catch (error) { if (current === revision) status.textContent = 'Unable to convert: ' + (error.name === 'TimeoutError' ? 'The service timed out. Try again or export from the original application.' : error.message); }
        finally { if (current === revision) { prepare.disabled = false; input.disabled = false; } }
    });
    save.addEventListener('click', () => {
        if (save.disabled) return;
        if (officeDownload && pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl; link.download = officeDownload;
            document.body.append(link); link.click(); link.remove();
        } else { preview.contentWindow.focus(); preview.contentWindow.print(); }
    });
    window.addEventListener('beforeunload', reset);
})();
