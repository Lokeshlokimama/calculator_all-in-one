(function () {
    'use strict';

    const MAX_PDF_SIZE = 30 * 1024 * 1024;
    const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
    const MAX_IMAGE_COUNT = 40;
    const MAX_MERGE_FILES = 20;
    const MAX_COMPRESS_PAGES = 40;
    const MAX_OCR_PAGES = 5;
    const PDFLIB_SRC = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    const JSPDF_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    const PDFJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    const PDFJS_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const TESSERACT_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

    const state = {
        files: [],
        file: null,
        pageCount: 0,
        objectUrls: [],
        generatedPassword: ''
    };

    const scriptPromises = new Map();

    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('beforeunload', revokeObjectUrls);

    function init() {
        const tool = document.body?.dataset.pdfTool;
        if (!tool) return;

        const initializers = {
            'images-to-pdf': initImagesToPdf,
            'merge-pdf': initMergePdf,
            'split-pdf': initSplitPdf,
            'compress-pdf': initCompressPdf,
            'pdf-password-helper': initPasswordHelper,
            'ocr-scanned-pdf': initOcrPdf
        };

        initializers[tool]?.();
    }

    function baseDom() {
        return {
            input: document.querySelector('[data-tool-input]'),
            action: document.querySelector('[data-tool-action]'),
            clear: document.querySelector('[data-tool-clear]'),
            status: document.querySelector('[data-tool-status]'),
            progress: document.querySelector('[data-tool-progress]'),
            list: document.querySelector('[data-tool-list]'),
            output: document.querySelector('[data-tool-output]')
        };
    }

    function initImagesToPdf() {
        const dom = baseDom();
        const quality = document.querySelector('[data-image-quality]');
        if (!dom.input || !dom.action) return;

        dom.input.addEventListener('change', () => {
            revokeObjectUrls();
            state.files = validateImageFiles(dom.input.files);
            renderImageFileList(dom.list, state.files);
            dom.action.disabled = state.files.length === 0;
            dom.clear.hidden = state.files.length === 0;
            setStatus(dom, state.files.length ? `${state.files.length} image${state.files.length === 1 ? '' : 's'} ready.` : 'Choose JPG, PNG, or WebP images to begin.', state.files.length ? 'success' : undefined);
        });
        dom.clear?.addEventListener('click', () => clearTool(dom));
        dom.action.addEventListener('click', async () => {
            if (!state.files.length) {
                setStatus(dom, 'Choose at least one supported image.', 'error');
                return;
            }

            setBusy(dom, true);
            setProgress(dom, 0);
            setOutput(dom, 'Creating PDF...', 'Each image becomes one fitted PDF page.');

            try {
                await loadJsPdf();
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 36;
                const chosenQuality = Number(quality?.value || 0.9);

                for (let index = 0; index < state.files.length; index += 1) {
                    if (index > 0) pdf.addPage('a4', 'portrait');
                    const image = await imageFileToJpeg(state.files[index], chosenQuality);
                    const fit = contain(image.width, image.height, pageWidth - (margin * 2), pageHeight - (margin * 2));
                    const x = (pageWidth - fit.width) / 2;
                    const y = (pageHeight - fit.height) / 2;
                    pdf.addImage(image.dataUrl, 'JPEG', x, y, fit.width, fit.height, undefined, 'FAST');
                    setProgress(dom, (index + 1) / state.files.length);
                    setStatus(dom, `Added image ${index + 1} of ${state.files.length}...`, 'success');
                }

                const blob = pdf.output('blob');
                const filename = `${safeBaseName(state.files[0].name)}-images.pdf`;
                showDownload(dom, 'Images to PDF ready', `${state.files.length} image${state.files.length === 1 ? '' : 's'} were combined into one PDF.`, blob, filename);
                setStatus(dom, 'PDF download is ready.', 'success');
            } catch (error) {
                showError(dom, 'Images to PDF failed', error);
            } finally {
                setBusy(dom, false);
                setProgress(dom, 0);
            }
        });
    }

    function initMergePdf() {
        const dom = baseDom();
        if (!dom.input || !dom.action) return;

        dom.input.addEventListener('change', () => {
            state.files = validatePdfFiles(dom.input.files, { min: 2, max: MAX_MERGE_FILES });
            renderFileList(dom.list, state.files);
            dom.action.disabled = state.files.length < 2;
            dom.clear.hidden = state.files.length === 0;
            setStatus(dom, state.files.length >= 2 ? `${state.files.length} PDFs ready to merge.` : 'Choose two or more PDF files.', state.files.length >= 2 ? 'success' : undefined);
        });
        dom.clear?.addEventListener('click', () => clearTool(dom));
        dom.action.addEventListener('click', async () => {
            if (state.files.length < 2) {
                setStatus(dom, 'Choose at least two PDFs to merge.', 'error');
                return;
            }

            setBusy(dom, true);
            setProgress(dom, 0);
            setOutput(dom, 'Merging PDFs...', 'Pages are copied in the same order as the selected files.');

            try {
                await loadPdfLib();
                const outputPdf = await window.PDFLib.PDFDocument.create();
                let copiedPages = 0;

                for (let index = 0; index < state.files.length; index += 1) {
                    const source = await window.PDFLib.PDFDocument.load(await state.files[index].arrayBuffer());
                    const indices = source.getPageIndices();
                    const pages = await outputPdf.copyPages(source, indices);
                    pages.forEach((page) => outputPdf.addPage(page));
                    copiedPages += indices.length;
                    setProgress(dom, (index + 1) / state.files.length);
                    setStatus(dom, `Merged ${index + 1} of ${state.files.length} files...`, 'success');
                }

                const bytes = await outputPdf.save();
                showDownload(dom, 'Merged PDF ready', `${copiedPages} page${copiedPages === 1 ? '' : 's'} copied into one PDF.`, new Blob([bytes], { type: 'application/pdf' }), 'merged-pdf.pdf');
                setStatus(dom, 'Merged PDF is ready to download.', 'success');
            } catch (error) {
                showError(dom, 'Merge failed', error, 'Encrypted or damaged PDFs may need to be unlocked in dedicated PDF software first.');
            } finally {
                setBusy(dom, false);
                setProgress(dom, 0);
            }
        });
    }

    function initSplitPdf() {
        const dom = baseDom();
        const ranges = document.querySelector('[data-page-ranges]');
        if (!dom.input || !dom.action || !ranges) return;

        dom.input.addEventListener('change', async () => {
            state.file = validateSinglePdf(dom.input.files?.[0] || null);
            state.pageCount = 0;
            renderFileList(dom.list, state.file ? [state.file] : []);
            dom.action.disabled = true;
            dom.clear.hidden = !state.file;

            if (!state.file) {
                setStatus(dom, 'Choose one PDF to split.');
                return;
            }

            setStatus(dom, 'Reading page count...', 'success');
            try {
                await loadPdfLib();
                const source = await window.PDFLib.PDFDocument.load(await state.file.arrayBuffer());
                state.pageCount = source.getPageCount();
                ranges.placeholder = state.pageCount > 1 ? `Example: 1-2, ${state.pageCount}` : 'Example: 1';
                dom.action.disabled = false;
                setStatus(dom, `PDF loaded with ${state.pageCount} page${state.pageCount === 1 ? '' : 's'}.`, 'success');
            } catch (error) {
                showError(dom, 'Could not read PDF', error);
            }
        });
        ranges.addEventListener('input', () => {
            dom.action.disabled = !state.file || !ranges.value.trim();
        });
        dom.clear?.addEventListener('click', () => clearTool(dom));
        dom.action.addEventListener('click', async () => {
            if (!state.file) {
                setStatus(dom, 'Choose one PDF first.', 'error');
                return;
            }

            let pageNumbers;
            try {
                pageNumbers = parsePageRanges(ranges.value, state.pageCount);
            } catch (error) {
                setStatus(dom, error.message, 'error');
                return;
            }

            setBusy(dom, true);
            setProgress(dom, 0.25);
            setOutput(dom, 'Splitting PDF...', `Copying ${pageNumbers.length} selected page${pageNumbers.length === 1 ? '' : 's'}.`);

            try {
                await loadPdfLib();
                const source = await window.PDFLib.PDFDocument.load(await state.file.arrayBuffer());
                const outputPdf = await window.PDFLib.PDFDocument.create();
                const copied = await outputPdf.copyPages(source, pageNumbers.map((pageNumber) => pageNumber - 1));
                copied.forEach((page) => outputPdf.addPage(page));
                setProgress(dom, 0.8);
                const bytes = await outputPdf.save();
                showDownload(dom, 'Split PDF ready', `Extracted pages ${pageNumbers.join(', ')}.`, new Blob([bytes], { type: 'application/pdf' }), `${safeBaseName(state.file.name)}-split.pdf`);
                setStatus(dom, 'Split PDF is ready to download.', 'success');
            } catch (error) {
                showError(dom, 'Split failed', error);
            } finally {
                setBusy(dom, false);
                setProgress(dom, 0);
            }
        });
    }

    function initCompressPdf() {
        const dom = baseDom();
        const scaleSelect = document.querySelector('[data-compress-scale]');
        const qualitySelect = document.querySelector('[data-compress-quality]');
        if (!dom.input || !dom.action) return;

        dom.input.addEventListener('change', () => {
            state.file = validateSinglePdf(dom.input.files?.[0] || null);
            renderFileList(dom.list, state.file ? [state.file] : []);
            dom.action.disabled = !state.file;
            dom.clear.hidden = !state.file;
            setStatus(dom, state.file ? 'PDF ready. This compression creates an image-based copy.' : 'Choose one PDF to compress.', state.file ? 'success' : undefined);
        });
        dom.clear?.addEventListener('click', () => clearTool(dom));
        dom.action.addEventListener('click', async () => {
            if (!state.file) {
                setStatus(dom, 'Choose one PDF first.', 'error');
                return;
            }

            setBusy(dom, true);
            setProgress(dom, 0);
            setOutput(dom, 'Compressing PDF...', 'Rendering pages as JPEG images and rebuilding a smaller PDF.');

            let pdf = null;
            try {
                await Promise.all([loadPdfJs(), loadJsPdf()]);
                const buffer = await state.file.arrayBuffer();
                pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false }).promise;
                const totalPages = Math.min(pdf.numPages, MAX_COMPRESS_PAGES);
                const scale = Number(scaleSelect?.value || 1);
                const quality = Number(qualitySelect?.value || 0.65);
                const { jsPDF } = window.jspdf;
                let outputPdf = null;

                for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
                    const page = await pdf.getPage(pageNumber);
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { alpha: false });
                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport }).promise;
                    const image = canvas.toDataURL('image/jpeg', quality);
                    const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';

                    if (!outputPdf) {
                        outputPdf = new jsPDF({ unit: 'pt', format: [canvas.width, canvas.height], orientation });
                    } else {
                        outputPdf.addPage([canvas.width, canvas.height], orientation);
                    }
                    outputPdf.addImage(image, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
                    setProgress(dom, pageNumber / totalPages);
                    setStatus(dom, `Compressed page ${pageNumber} of ${totalPages}...`, 'success');
                }

                if (!outputPdf) throw new Error('No pages were rendered.');
                const blob = outputPdf.output('blob');
                const original = formatBytes(state.file.size);
                const compressed = formatBytes(blob.size);
                const pageNote = pdf.numPages > MAX_COMPRESS_PAGES ? ` Rendered the first ${MAX_COMPRESS_PAGES} pages to protect browser performance.` : '';
                showDownload(dom, 'Compressed PDF ready', `Original: ${original}. New file: ${compressed}.${pageNote} This output is image-based, so selectable text and links may be removed.`, blob, `${safeBaseName(state.file.name)}-compressed.pdf`);
                setStatus(dom, 'Compressed PDF is ready to download.', 'success');
            } catch (error) {
                showError(dom, 'Compression failed', error);
            } finally {
                if (pdf) {
                    try { await pdf.destroy(); } catch { /* ignore cleanup */ }
                }
                setBusy(dom, false);
                setProgress(dom, 0);
            }
        });
    }

    function initPasswordHelper() {
        const dom = baseDom();
        const lengthInput = document.querySelector('[data-password-length]');
        const symbolsInput = document.querySelector('[data-password-symbols]');
        const output = document.querySelector('[data-password-output]');
        const copyButton = document.querySelector('[data-password-copy]');
        const noteButton = document.querySelector('[data-password-note]');
        const fileInput = document.querySelector('[data-password-file]');
        const fileLabel = document.querySelector('[data-password-file-label]');
        if (!dom.action || !output) return;

        fileInput?.addEventListener('change', () => {
            const file = fileInput.files?.[0] || null;
            if (!file) {
                fileLabel.textContent = 'Optional: choose a PDF to include its filename in the safety note.';
                return;
            }
            if (!/\.pdf$/i.test(file.name || '')) {
                fileInput.value = '';
                fileLabel.textContent = 'Choose a PDF file if you want a filename note.';
                setStatus(dom, 'Only PDF filenames can be added to the note.', 'error');
                return;
            }
            fileLabel.textContent = `${file.name} - ${formatBytes(file.size)}. File is not uploaded or modified.`;
            setStatus(dom, 'PDF filename captured for the private note. The file itself is not changed.', 'success');
        });

        dom.action.addEventListener('click', () => {
            const length = clamp(Number(lengthInput?.value || 24), 16, 64);
            const includeSymbols = symbolsInput?.checked !== false;
            state.generatedPassword = generatePassword(length, includeSymbols);
            output.value = state.generatedPassword;
            copyButton.disabled = false;
            noteButton.disabled = false;
            setOutput(dom, 'Password ready', 'Use this with trusted PDF software that supports encryption. Store the password in a password manager; do not email it beside the PDF.');
            setStatus(dom, 'Strong password generated locally in your browser.', 'success');
        });

        copyButton?.addEventListener('click', async () => {
            if (!state.generatedPassword) return;
            try {
                await navigator.clipboard.writeText(state.generatedPassword);
                setStatus(dom, 'Password copied to clipboard.', 'success');
            } catch {
                output.focus();
                output.select();
                setStatus(dom, 'Clipboard access was blocked. Select and copy the password manually.', 'error');
            }
        });

        noteButton?.addEventListener('click', () => {
            if (!state.generatedPassword) return;
            const filename = fileInput?.files?.[0]?.name || 'Not recorded';
            const note = [
                'PDF password safety note',
                '',
                `File: ${filename}`,
                `Generated: ${new Date().toISOString()}`,
                '',
                'Do not store this note beside the PDF unless you intentionally accept that risk.',
                'Use trusted PDF software to add or remove encryption. This browser page does not modify the PDF file.',
                '',
                `Password: ${state.generatedPassword}`
            ].join('\n');
            downloadBlob(new Blob([note], { type: 'text/plain;charset=utf-8' }), 'pdf-password-note.txt');
            setStatus(dom, 'Private note download started.', 'success');
        });
    }

    function initOcrPdf() {
        const dom = baseDom();
        const pageLimitSelect = document.querySelector('[data-ocr-page-limit]');
        const outputText = document.querySelector('[data-ocr-output]');
        const downloadButton = document.querySelector('[data-ocr-download]');
        if (!dom.input || !dom.action || !outputText) return;

        dom.input.addEventListener('change', () => {
            state.file = validateSinglePdf(dom.input.files?.[0] || null);
            renderFileList(dom.list, state.file ? [state.file] : []);
            dom.action.disabled = !state.file;
            dom.clear.hidden = !state.file;
            outputText.value = '';
            downloadButton.disabled = true;
            setStatus(dom, state.file ? 'Scanned PDF ready for OCR.' : 'Choose one scanned PDF to begin.', state.file ? 'success' : undefined);
        });
        dom.clear?.addEventListener('click', () => {
            clearTool(dom);
            outputText.value = '';
            downloadButton.disabled = true;
        });
        dom.action.addEventListener('click', async () => {
            if (!state.file) {
                setStatus(dom, 'Choose one scanned PDF first.', 'error');
                return;
            }

            setBusy(dom, true);
            setProgress(dom, 0);
            outputText.value = '';
            setOutput(dom, 'Running OCR...', 'This can take a while because OCR runs in the browser.');

            let pdf = null;
            try {
                await Promise.all([loadPdfJs(), loadTesseract()]);
                const buffer = await state.file.arrayBuffer();
                pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false }).promise;
                const requestedLimit = Number(pageLimitSelect?.value || 3);
                const totalPages = Math.min(pdf.numPages, requestedLimit, MAX_OCR_PAGES);
                const chunks = [];

                for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
                    const page = await pdf.getPage(pageNumber);
                    const viewport = page.getViewport({ scale: 1.6 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { alpha: false });
                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    await page.render({ canvasContext: context, viewport }).promise;
                    setStatus(dom, `Running OCR on page ${pageNumber} of ${totalPages}...`, 'success');
                    const result = await window.Tesseract.recognize(canvas, 'eng', {
                        logger: (message) => {
                            if (message?.status && Number.isFinite(message.progress)) {
                                const pageProgress = (pageNumber - 1 + message.progress) / totalPages;
                                setProgress(dom, pageProgress);
                            }
                        }
                    });
                    const text = result?.data?.text?.trim() || '[No text detected]';
                    chunks.push(`--- Page ${pageNumber} ---\n${text}`);
                    outputText.value = chunks.join('\n\n');
                    setProgress(dom, pageNumber / totalPages);
                }

                if (pdf.numPages > totalPages) {
                    chunks.push(`--- Note ---\nOCR was limited to ${totalPages} page${totalPages === 1 ? '' : 's'} in this browser tool.`);
                    outputText.value = chunks.join('\n\n');
                }

                downloadButton.disabled = !outputText.value.trim();
                setOutput(dom, 'OCR text ready', `Extracted text from ${totalPages} page${totalPages === 1 ? '' : 's'}. Review it carefully for OCR mistakes.`);
                setStatus(dom, 'OCR text is ready.', 'success');
            } catch (error) {
                showError(dom, 'OCR failed', error, 'Large scans, unusual fonts, or blocked OCR library downloads can cause OCR to fail.');
            } finally {
                if (pdf) {
                    try { await pdf.destroy(); } catch { /* ignore cleanup */ }
                }
                setBusy(dom, false);
                setProgress(dom, 0);
            }
        });
        downloadButton?.addEventListener('click', () => {
            const text = outputText.value.trim();
            if (!text) return;
            downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${safeBaseName(state.file?.name || 'ocr-output')}.txt`);
            setStatus(dom, 'OCR text download started.', 'success');
        });
    }

    function validateImageFiles(fileList) {
        const files = Array.from(fileList || []).slice(0, MAX_IMAGE_COUNT);
        const valid = [];
        for (const file of files) {
            const extensionOk = /\.(jpe?g|png|webp)$/i.test(file.name || '');
            const typeOk = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
            if (extensionOk && typeOk && file.size <= MAX_IMAGE_SIZE) valid.push(file);
        }
        return valid;
    }

    function validatePdfFiles(fileList, options = {}) {
        const max = options.max || 10;
        return Array.from(fileList || [])
            .slice(0, max)
            .filter((file) => /\.pdf$/i.test(file.name || '') && (!file.type || file.type === 'application/pdf' || file.type === 'application/x-pdf') && file.size <= MAX_PDF_SIZE);
    }

    function validateSinglePdf(file) {
        return validatePdfFiles(file ? [file] : [], { max: 1 })[0] || null;
    }

    function renderFileList(container, files) {
        if (!container) return;
        container.innerHTML = '';
        if (!files.length) {
            container.hidden = true;
            return;
        }
        container.hidden = false;
        files.forEach((file, index) => {
            const item = document.createElement('article');
            item.className = 'pdf-mini-file';
            item.innerHTML = `<strong>${index + 1}. ${escapeHtml(file.name)}</strong><span>${formatBytes(file.size)}</span>`;
            container.append(item);
        });
    }

    function renderImageFileList(container, files) {
        if (!container) return;
        revokeObjectUrls();
        container.innerHTML = '';
        if (!files.length) {
            container.hidden = true;
            return;
        }
        container.hidden = false;
        files.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            state.objectUrls.push(url);
            const item = document.createElement('article');
            item.className = 'pdf-page-card';
            item.innerHTML = `
                <img src="${url}" alt="Selected image ${index + 1}">
                <div class="pdf-page-meta"><strong>${escapeHtml(file.name)}</strong><span>${formatBytes(file.size)}</span></div>
            `;
            container.append(item);
        });
    }

    function parsePageRanges(value, pageCount) {
        const pages = [];
        const seen = new Set();
        const parts = String(value || '').split(',').map((part) => part.trim()).filter(Boolean);
        if (!parts.length) throw new Error('Enter a page range such as 1-3 or 2,4,6.');

        for (const part of parts) {
            const match = part.match(/^(\d+)(?:-(\d+))?$/);
            if (!match) throw new Error(`Invalid range "${part}". Use numbers like 1-3,5.`);
            const start = Number(match[1]);
            const end = Number(match[2] || match[1]);
            if (start < 1 || end < start || end > pageCount) {
                throw new Error(`Range "${part}" is outside this PDF's 1-${pageCount} pages.`);
            }
            for (let page = start; page <= end; page += 1) {
                if (!seen.has(page)) {
                    pages.push(page);
                    seen.add(page);
                }
            }
        }

        return pages;
    }

    async function imageFileToJpeg(file, quality) {
        const url = URL.createObjectURL(file);
        state.objectUrls.push(url);
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Could not read ${file.name}.`));
            img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const context = canvas.getContext('2d', { alpha: false });
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        return {
            dataUrl: canvas.toDataURL('image/jpeg', quality),
            width: canvas.width,
            height: canvas.height
        };
    }

    function contain(width, height, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        return { width: width * ratio, height: height * ratio };
    }

    function generatePassword(length, includeSymbols) {
        const lower = 'abcdefghijkmnopqrstuvwxyz';
        const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const numbers = '23456789';
        const symbols = '!@#$%^&*-_=+?';
        const groups = includeSymbols ? [lower, upper, numbers, symbols] : [lower, upper, numbers];
        const all = groups.join('');
        const chars = groups.map((group) => group[randomInt(group.length)]);
        while (chars.length < length) chars.push(all[randomInt(all.length)]);
        for (let index = chars.length - 1; index > 0; index -= 1) {
            const swap = randomInt(index + 1);
            [chars[index], chars[swap]] = [chars[swap], chars[index]];
        }
        return chars.join('');
    }

    function randomInt(max) {
        const values = new Uint32Array(1);
        crypto.getRandomValues(values);
        return values[0] % max;
    }

    function loadPdfLib() {
        return loadScript(PDFLIB_SRC, () => window.PDFLib?.PDFDocument);
    }

    function loadJsPdf() {
        return loadScript(JSPDF_SRC, () => window.jspdf?.jsPDF);
    }

    function loadPdfJs() {
        return loadScript(PDFJS_SRC, () => window.pdfjsLib?.getDocument).then(() => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
        });
    }

    function loadTesseract() {
        return loadScript(TESSERACT_SRC, () => window.Tesseract?.recognize);
    }

    function loadScript(src, ready) {
        if (ready()) return Promise.resolve();
        if (!scriptPromises.has(src)) {
            scriptPromises.set(src, new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => ready() ? resolve() : reject(new Error(`Library loaded without expected API: ${src}`));
                script.onerror = () => reject(new Error(`Could not load library: ${src}`));
                document.head.append(script);
            }));
        }
        return scriptPromises.get(src);
    }

    function clearTool(dom) {
        state.files = [];
        state.file = null;
        state.pageCount = 0;
        revokeObjectUrls();
        if (dom.input) dom.input.value = '';
        if (dom.list) {
            dom.list.innerHTML = '';
            dom.list.hidden = true;
        }
        if (dom.output) {
            dom.output.innerHTML = '';
            dom.output.hidden = true;
        }
        if (dom.action) dom.action.disabled = true;
        if (dom.clear) dom.clear.hidden = true;
        setProgress(dom, 0);
        setStatus(dom, 'Choose files to begin.');
    }

    function setBusy(dom, isBusy) {
        if (dom.action) dom.action.disabled = isBusy;
        if (dom.clear) dom.clear.disabled = isBusy;
    }

    function setStatus(dom, message, tone) {
        if (!dom.status) return;
        dom.status.textContent = message;
        if (tone) dom.status.dataset.tone = tone;
        else delete dom.status.dataset.tone;
    }

    function setProgress(dom, value) {
        dom.progress?.style.setProperty('--pdf-progress', String(Math.max(0, Math.min(1, value))));
    }

    function setOutput(dom, title, message) {
        if (!dom.output) return;
        dom.output.hidden = false;
        dom.output.innerHTML = `
            <div class="result-topline"><span class="result-label">Output</span></div>
            <h2 class="result-verdict">${escapeHtml(title)}</h2>
            <p class="result-explanation">${escapeHtml(message)}</p>
        `;
    }

    function showDownload(dom, title, message, blob, filename) {
        if (!dom.output) return;
        const url = URL.createObjectURL(blob);
        state.objectUrls.push(url);
        dom.output.hidden = false;
        dom.output.innerHTML = `
            <div class="result-topline"><span class="result-label">Output</span><span class="confidence-value">${escapeHtml(formatBytes(blob.size))}</span></div>
            <h2 class="result-verdict">${escapeHtml(title)}</h2>
            <div class="pdf-download-card">
                <p>${escapeHtml(message)}</p>
                <a class="ai-button" href="${url}" download="${escapeAttribute(filename)}">Download file</a>
            </div>
            <p class="result-disclaimer">Open the output and review page order, readability, metadata, and missing content before sharing.</p>
        `;
    }

    function showError(dom, title, error, note = '') {
        const message = [error?.message || 'Something went wrong.', note].filter(Boolean).join(' ');
        if (dom.output) {
            dom.output.hidden = false;
            dom.output.innerHTML = `
                <div class="result-topline"><span class="result-label">Error</span></div>
                <h2 class="result-verdict">${escapeHtml(title)}</h2>
                <p class="result-explanation">${escapeHtml(message)}</p>
            `;
        }
        setStatus(dom, message, 'error');
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    }

    function revokeObjectUrls() {
        for (const url of state.objectUrls) URL.revokeObjectURL(url);
        state.objectUrls = [];
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
        return String(filename || 'pdf-output')
            .replace(/\.[^.]+$/, '')
            .replace(/[^a-z0-9_-]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || 'pdf-output';
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
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
}());
