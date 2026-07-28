(function () {
    'use strict';

    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    const MAX_IMAGE_PAGES = 30;
    const PDFJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    const PDFJS_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const JSZIP_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    const IMAGE_EXTENSIONS = new Map([
        ['image/png', 'png'],
        ['image/jpeg', 'jpg'],
        ['image/webp', 'webp']
    ]);

    let selectedFile = null;
    let pdfLibraryPromise = null;
    let zipLibraryPromise = null;
    let imageOutputs = [];
    let wordOutputUrl = null;
    let currentJob = 0;

    const dom = {};

    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('beforeunload', revokeOutputs);

    function init() {
        initPdfToolsMenu();

        dom.form = document.getElementById('pdf-form');
        dom.input = document.getElementById('pdf-file');
        dom.dropzone = document.getElementById('pdf-dropzone');
        dom.previewPanel = document.getElementById('pdf-preview-panel');
        dom.previewCanvas = document.getElementById('pdf-preview-canvas');
        dom.fileName = document.getElementById('pdf-file-name');
        dom.fileSize = document.getElementById('pdf-file-size');
        dom.pageCount = document.getElementById('pdf-page-count');
        dom.wordButton = document.getElementById('pdf-word-button');
        dom.imageButton = document.getElementById('pdf-image-button');
        dom.clearButton = document.getElementById('pdf-clear-button');
        dom.downloadAllButton = document.getElementById('pdf-download-all-button');
        dom.status = document.getElementById('pdf-status');
        dom.progressFill = document.getElementById('pdf-progress-fill');
        dom.outputCard = document.getElementById('pdf-output-card');
        dom.outputLabel = document.getElementById('pdf-output-label');
        dom.outputCount = document.getElementById('pdf-output-count');
        dom.outputTitle = document.getElementById('pdf-output-title');
        dom.outputBody = document.getElementById('pdf-output-body');
        dom.imageFormat = document.getElementById('pdf-image-format');
        dom.imageScale = document.getElementById('pdf-image-scale');

        if (!dom.form || !dom.input || !dom.dropzone) return;

        dom.input.addEventListener('change', () => handleFile(dom.input.files?.[0] || null));
        dom.wordButton.addEventListener('click', convertToWord);
        dom.imageButton.addEventListener('click', convertToImages);
        dom.clearButton.addEventListener('click', clearSelection);
        dom.downloadAllButton.addEventListener('click', downloadImagesZip);

        for (const eventName of ['dragenter', 'dragover']) {
            dom.dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                dom.dropzone.dataset.dragging = 'true';
            });
        }

        for (const eventName of ['dragleave', 'drop']) {
            dom.dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                dom.dropzone.dataset.dragging = 'false';
            });
        }

        dom.dropzone.addEventListener('drop', (event) => {
            const file = event.dataTransfer?.files?.[0] || null;
            if (!file) return;
            dom.input.files = event.dataTransfer.files;
            handleFile(file);
        });
    }

    function initPdfToolsMenu() {
        const menu = document.querySelector('.pdf-nav-tools');
        if (!menu) return;

        document.addEventListener('pointerdown', (event) => {
            if (menu.open && !menu.contains(event.target)) {
                menu.open = false;
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.open) {
                menu.open = false;
                menu.querySelector('summary')?.focus();
            }
        });
    }

    async function handleFile(file) {
        const validationError = validatePdf(file);
        revokeOutputs();
        resetOutput();
        setProgress(0);

        if (validationError) {
            selectedFile = null;
            setReady(false);
            setStatus(validationError, 'error');
            dom.dropzone.dataset.state = 'error';
            return;
        }

        selectedFile = file;
        setReady(true);
        dom.clearButton.hidden = false;
        dom.dropzone.dataset.state = 'success';
        dom.fileName.textContent = file.name;
        dom.fileSize.textContent = `${formatBytes(file.size)} - local browser processing`;
        dom.pageCount.textContent = 'Reading...';
        dom.previewPanel.hidden = false;
        setStatus('PDF selected. Reading first-page preview...', 'success');

        try {
            const pdf = await openPdf(file);
            dom.pageCount.textContent = `${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'}`;
            await renderPreview(pdf);
            await destroyPdf(pdf);
            setStatus('PDF is ready. Choose Word text export or page images.', 'success');
        } catch (error) {
            dom.pageCount.textContent = 'Preview unavailable';
            clearPreviewCanvas();
            setStatus(messageFromError(error, 'The PDF preview could not be rendered. You can still try conversion.'), 'error');
        }
    }

    function validatePdf(file) {
        if (!file) return 'Choose a PDF file to begin.';
        const hasPdfExtension = /\.pdf$/i.test(file.name || '');
        const hasPdfType = !file.type || file.type === 'application/pdf' || file.type === 'application/x-pdf';
        if (!hasPdfExtension || !hasPdfType) return 'Please choose a valid PDF file.';
        if (file.size > MAX_FILE_SIZE) return `Choose a PDF under ${formatBytes(MAX_FILE_SIZE)}.`;
        return '';
    }

    async function convertToWord() {
        if (!selectedFile) {
            setStatus('Choose a PDF first.', 'error');
            return;
        }

        const jobId = beginJob();
        revokeOutputs();
        resetOutput();
        setBusy(true);
        setOutputShell('PDF to Word', '', 'Extracting text...');
        setStatus('Extracting selectable text from the PDF...', 'success');

        let pdf = null;
        try {
            pdf = await openPdf(selectedFile);
            const pages = [];

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                if (jobId !== currentJob) return;
                const page = await pdf.getPage(pageNumber);
                const textContent = await page.getTextContent();
                pages.push({
                    pageNumber,
                    lines: extractLines(textContent.items || [])
                });
                setProgress(pageNumber / pdf.numPages);
                setStatus(`Extracted page ${pageNumber} of ${pdf.numPages}...`, 'success');
            }

            const html = buildWordDocument(pages, selectedFile.name);
            const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
            const filename = `${safeBaseName(selectedFile.name)}-text.doc`;
            wordOutputUrl = URL.createObjectURL(blob);

            setOutputShell('PDF to Word', `${pages.length} page${pages.length === 1 ? '' : 's'}`, 'Word-compatible document ready');
            dom.outputBody.innerHTML = '';
            const card = document.createElement('div');
            card.className = 'pdf-download-card';
            card.innerHTML = `
                <p>The file contains extracted editable text with page breaks. It is not a pixel-perfect reconstruction of the original PDF.</p>
                <a class="ai-button" href="${wordOutputUrl}" download="${escapeAttribute(filename)}">Download Word file</a>
            `;
            dom.outputBody.append(card);
            setStatus('Word-compatible text document is ready to download.', 'success');
        } catch (error) {
            showOutputError(messageFromError(error, 'PDF to Word conversion failed.'));
        } finally {
            await destroyPdf(pdf);
            setBusy(false);
            setProgress(0);
        }
    }

    async function convertToImages() {
        if (!selectedFile) {
            setStatus('Choose a PDF first.', 'error');
            return;
        }

        const jobId = beginJob();
        revokeOutputs();
        resetOutput();
        setBusy(true);
        setOutputShell('PDF to Image', '', 'Rendering pages...');
        setStatus('Rendering PDF pages as images...', 'success');

        let pdf = null;
        try {
            pdf = await openPdf(selectedFile);
            const mimeType = IMAGE_EXTENSIONS.has(dom.imageFormat.value) ? dom.imageFormat.value : 'image/png';
            const extension = IMAGE_EXTENSIONS.get(mimeType) || 'png';
            const scale = Number(dom.imageScale.value) || 1.5;
            const totalPages = Math.min(pdf.numPages, MAX_IMAGE_PAGES);
            imageOutputs = [];

            dom.outputBody.innerHTML = '';
            const list = document.createElement('div');
            list.className = 'pdf-image-grid';
            dom.outputBody.append(list);

            if (pdf.numPages > MAX_IMAGE_PAGES) {
                const note = document.createElement('p');
                note.className = 'pdf-output-note';
                note.textContent = `This browser tool rendered the first ${MAX_IMAGE_PAGES} pages to protect device performance.`;
                dom.outputBody.prepend(note);
            }

            for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
                if (jobId !== currentJob) return;
                const page = await pdf.getPage(pageNumber);
                const output = await renderPageImage(page, pageNumber, scale, mimeType, extension);
                imageOutputs.push(output);
                list.append(createImageCard(output, pageNumber));
                setProgress(pageNumber / totalPages);
                setOutputShell('PDF to Image', `${pageNumber}/${totalPages}`, 'Rendering pages...');
                setStatus(`Rendered page ${pageNumber} of ${totalPages}...`, 'success');
            }

            setOutputShell('PDF to Image', `${imageOutputs.length} image${imageOutputs.length === 1 ? '' : 's'}`, 'Images ready');
            dom.downloadAllButton.hidden = imageOutputs.length === 0;
            setStatus('PDF page images are ready. Download individually or as a ZIP.', 'success');
        } catch (error) {
            showOutputError(messageFromError(error, 'PDF to image conversion failed.'));
        } finally {
            await destroyPdf(pdf);
            setBusy(false);
            setProgress(0);
        }
    }

    async function renderPreview(pdf) {
        const page = await pdf.getPage(1);
        const originalViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(1.4, 520 / Math.max(originalViewport.width, 1));
        const viewport = page.getViewport({ scale: Math.max(0.45, scale) });
        const canvas = dom.previewCanvas;
        const context = canvas.getContext('2d', { alpha: false });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.hidden = false;
        await page.render({ canvasContext: context, viewport }).promise;
    }

    async function renderPageImage(page, pageNumber, scale, mimeType, extension) {
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: mimeType !== 'image/jpeg' });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        if (mimeType === 'image/jpeg') {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvasContext: context, viewport }).promise;
        const blob = await canvasToBlob(canvas, mimeType, 0.92);
        const url = URL.createObjectURL(blob);
        const filename = `${safeBaseName(selectedFile.name)}-page-${String(pageNumber).padStart(2, '0')}.${extension}`;
        return { blob, filename, url, width: canvas.width, height: canvas.height };
    }

    function createImageCard(output, pageNumber) {
        const article = document.createElement('article');
        article.className = 'pdf-page-card';

        const image = document.createElement('img');
        image.src = output.url;
        image.alt = `Rendered PDF page ${pageNumber}`;

        const meta = document.createElement('div');
        meta.className = 'pdf-page-meta';
        meta.innerHTML = `
            <strong>Page ${pageNumber}</strong>
            <span>${output.width} x ${output.height}</span>
        `;

        const link = document.createElement('a');
        link.className = 'ai-button ai-button--secondary';
        link.href = output.url;
        link.download = output.filename;
        link.textContent = 'Download';

        article.append(image, meta, link);
        return article;
    }

    async function downloadImagesZip() {
        if (!imageOutputs.length) {
            setStatus('Convert a PDF to images first.', 'error');
            return;
        }

        setBusy(true);
        setStatus('Preparing image ZIP...', 'success');
        try {
            await loadZipLibrary();
            const zip = new window.JSZip();
            for (const output of imageOutputs) {
                zip.file(output.filename, output.blob);
            }
            const blob = await zip.generateAsync({ type: 'blob' });
            const filename = `${safeBaseName(selectedFile?.name || 'converted-pdf')}-images.zip`;
            const url = URL.createObjectURL(blob);
            triggerDownload(url, filename);
            setTimeout(() => URL.revokeObjectURL(url), 3000);
            setStatus('ZIP download started.', 'success');
        } catch (error) {
            setStatus(messageFromError(error, 'ZIP packaging could not load. Use the individual image download buttons.'), 'error');
        } finally {
            setBusy(false);
        }
    }

    async function openPdf(file) {
        await loadPdfLibrary();
        const buffer = await file.arrayBuffer();
        const task = window.pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            isEvalSupported: false
        });
        return task.promise;
    }

    function loadPdfLibrary() {
        if (window.pdfjsLib?.getDocument) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
            return Promise.resolve(window.pdfjsLib);
        }

        if (!pdfLibraryPromise) {
            pdfLibraryPromise = loadScript(PDFJS_SRC).then(() => {
                if (!window.pdfjsLib?.getDocument) {
                    throw new Error('PDF library loaded without the expected API.');
                }
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
                return window.pdfjsLib;
            });
        }

        return pdfLibraryPromise;
    }

    function loadZipLibrary() {
        if (window.JSZip) return Promise.resolve(window.JSZip);
        if (!zipLibraryPromise) {
            zipLibraryPromise = loadScript(JSZIP_SRC).then(() => {
                if (!window.JSZip) throw new Error('ZIP library loaded without the expected API.');
                return window.JSZip;
            });
        }
        return zipLibraryPromise;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Could not load ${src}`));
            document.head.append(script);
        });
    }

    function extractLines(items) {
        const positioned = items
            .map((item) => ({
                text: String(item.str || '').trim(),
                x: Number(item.transform?.[4] || 0),
                y: Number(item.transform?.[5] || 0)
            }))
            .filter((item) => item.text);

        positioned.sort((a, b) => {
            if (Math.abs(b.y - a.y) > 3) return b.y - a.y;
            return a.x - b.x;
        });

        const lines = [];
        for (const item of positioned) {
            const current = lines[lines.length - 1];
            if (!current || Math.abs(current.y - item.y) > 3) {
                lines.push({ y: item.y, parts: [item.text] });
            } else {
                current.parts.push(item.text);
            }
        }

        return lines.map((line) => line.parts.join(' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
    }

    function buildWordDocument(pages, sourceName) {
        const body = pages.map((page) => {
            const paragraphs = page.lines.length
                ? page.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('\n')
                : '<p><em>No selectable text was found on this page.</em></p>';
            return `
                <section class="pdf-page-break">
                    <h2>Page ${page.pageNumber}</h2>
                    ${paragraphs}
                </section>
            `;
        }).join('\n');

        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(sourceName)} text export</title>
<style>
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.45; color: #111111; }
h1, h2 { color: #111111; }
.pdf-page-break { page-break-before: always; }
.pdf-page-break:first-of-type { page-break-before: auto; }
p { margin: 0 0 8pt; }
</style>
</head>
<body>
<h1>${escapeHtml(sourceName)} - extracted text</h1>
<p>This Word-compatible file was generated from selectable PDF text. Review formatting, tables, symbols, and page flow before using it.</p>
${body}
</body>
</html>`;
    }

    function canvasToBlob(canvas, mimeType, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }
                if (mimeType !== 'image/png') {
                    canvas.toBlob((fallbackBlob) => {
                        if (fallbackBlob) resolve(fallbackBlob);
                        else reject(new Error('The browser could not export this canvas.'));
                    }, 'image/png');
                    return;
                }
                reject(new Error('The browser could not export this canvas.'));
            }, mimeType, quality);
        });
    }

    async function destroyPdf(pdf) {
        if (!pdf) return;
        try {
            await pdf.destroy();
        } catch {
            // PDF.js cleanup should not block the user's converted output.
        }
    }

    function clearSelection() {
        currentJob += 1;
        selectedFile = null;
        dom.input.value = '';
        dom.previewPanel.hidden = true;
        dom.clearButton.hidden = true;
        dom.dropzone.dataset.state = 'default';
        clearPreviewCanvas();
        revokeOutputs();
        resetOutput();
        setReady(false);
        setBusy(false);
        setProgress(0);
        setStatus('Select a PDF to begin.');
    }

    function beginJob() {
        currentJob += 1;
        return currentJob;
    }

    function setReady(isReady) {
        dom.wordButton.disabled = !isReady;
        dom.imageButton.disabled = !isReady;
    }

    function setBusy(isBusy) {
        dom.wordButton.disabled = isBusy || !selectedFile;
        dom.imageButton.disabled = isBusy || !selectedFile;
        dom.clearButton.disabled = isBusy;
        dom.downloadAllButton.disabled = isBusy || imageOutputs.length === 0;
    }

    function setProgress(value) {
        dom.progressFill.style.setProperty('--pdf-progress', String(Math.max(0, Math.min(1, value))));
    }

    function setStatus(message, tone) {
        dom.status.textContent = message;
        if (tone) dom.status.dataset.tone = tone;
        else delete dom.status.dataset.tone;
    }

    function setOutputShell(label, count, title) {
        dom.outputCard.hidden = false;
        dom.outputCard.dataset.tone = 'uncertain';
        dom.outputLabel.textContent = label;
        dom.outputCount.textContent = count;
        dom.outputTitle.textContent = title;
    }

    function resetOutput() {
        dom.outputCard.hidden = true;
        dom.outputCard.dataset.tone = '';
        dom.outputLabel.textContent = 'Output';
        dom.outputCount.textContent = '';
        dom.outputTitle.textContent = 'Ready';
        dom.outputBody.innerHTML = '';
        dom.downloadAllButton.hidden = true;
    }

    function showOutputError(message) {
        dom.outputCard.hidden = false;
        dom.outputCard.dataset.tone = 'error';
        dom.outputLabel.textContent = 'Conversion error';
        dom.outputCount.textContent = '';
        dom.outputTitle.textContent = 'Could not convert this PDF';
        dom.outputBody.innerHTML = `<p>${escapeHtml(message)}</p>`;
        setStatus(message, 'error');
    }

    function clearPreviewCanvas() {
        const context = dom.previewCanvas.getContext('2d');
        context.clearRect(0, 0, dom.previewCanvas.width, dom.previewCanvas.height);
        dom.previewCanvas.width = 0;
        dom.previewCanvas.height = 0;
    }

    function revokeOutputs() {
        if (wordOutputUrl) URL.revokeObjectURL(wordOutputUrl);
        for (const output of imageOutputs) {
            URL.revokeObjectURL(output.url);
        }
        wordOutputUrl = null;
        imageOutputs = [];
    }

    function triggerDownload(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();
    }

    function formatBytes(bytes) {
        if (!Number.isFinite(bytes)) return '0 B';
        if (bytes < 1024) return `${bytes} B`;
        const units = ['KB', 'MB', 'GB'];
        let value = bytes / 1024;
        let index = 0;
        while (value >= 1024 && index < units.length - 1) {
            value /= 1024;
            index += 1;
        }
        return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
    }

    function safeBaseName(filename) {
        return String(filename || 'converted-pdf')
            .replace(/\.[^.]+$/, '')
            .replace(/[^a-z0-9_-]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || 'converted-pdf';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, '&#96;');
    }

    function messageFromError(error, fallback) {
        if (error?.message && /Could not load https:\/\/cdnjs\.cloudflare\.com/i.test(error.message)) {
            return 'The PDF converter library could not load. Check your connection and try again.';
        }
        return error?.message ? `${fallback} ${error.message}` : fallback;
    }
}());
