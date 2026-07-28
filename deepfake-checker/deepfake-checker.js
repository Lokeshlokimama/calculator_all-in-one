(() => {
    'use strict';

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
    const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const MIME_BY_EXTENSION = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp'
    };
    const VERDICTS = {
        likely_real: { label: 'Likely Real', tone: 'real', color: 'var(--color-positive)' },
        likely_ai_generated: { label: 'Likely AI-Generated', tone: 'ai', color: 'var(--color-warning)' },
        uncertain: { label: 'Uncertain', tone: 'uncertain', color: 'var(--color-accent)' }
    };

    const form = document.getElementById('deepfake-form');
    if (!form) return;

    const fileInput = document.getElementById('image-file');
    const dropzone = document.getElementById('upload-dropzone');
    const previewPanel = document.getElementById('preview-panel');
    const previewImage = document.getElementById('image-preview');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const analyzeButton = document.getElementById('analyze-button');
    const analyzeLabel = document.getElementById('analyze-label');
    const buttonSpinner = document.getElementById('button-spinner');
    const removeButton = document.getElementById('remove-button');
    const formStatus = document.getElementById('form-status');
    const resultCard = document.getElementById('result-card');
    const resultLabel = document.getElementById('result-label');
    const resultVerdict = document.getElementById('result-verdict');
    const resultExplanation = document.getElementById('result-explanation');
    const confidenceGroup = document.getElementById('confidence-group');
    const confidenceValue = document.getElementById('confidence-value');
    const confidenceMeter = document.getElementById('confidence-meter');
    const confidenceFill = document.getElementById('confidence-fill');

    let selectedFile = null;
    let previewUrl = '';
    let activeRequest = null;

    function getExtension(name) {
        return name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    }

    function getMimeType(file) {
        return file.type || MIME_BY_EXTENSION[getExtension(file.name)] || '';
    }

    function validateFile(file) {
        if (!file) return 'Choose an image before starting analysis.';
        const extension = getExtension(file.name);
        const mimeType = getMimeType(file);
        if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(mimeType)) {
            return 'That file format is not supported. Choose a JPG, JPEG, PNG, or WebP image.';
        }
        if (file.size === 0) return 'That image is empty. Choose a file containing image data.';
        if (file.size > MAX_FILE_SIZE) return 'That image is larger than 5 MB. Choose a smaller file and try again.';
        return '';
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    function setStatus(message, tone = 'default') {
        formStatus.textContent = message;
        formStatus.dataset.tone = tone;
    }

    function clearResult() {
        resultCard.hidden = true;
        resultCard.removeAttribute('data-tone');
        resultVerdict.textContent = '';
        resultExplanation.textContent = '';
        confidenceValue.textContent = '';
        confidenceMeter.setAttribute('aria-valuenow', '0');
        confidenceFill.style.setProperty('--confidence-scale', '0');
        confidenceFill.style.removeProperty('--meter-color');
    }

    function setLoading(isLoading) {
        form.setAttribute('aria-busy', String(isLoading));
        analyzeButton.disabled = isLoading || !selectedFile;
        fileInput.disabled = isLoading;
        removeButton.disabled = isLoading;
        buttonSpinner.hidden = !isLoading;
        analyzeLabel.textContent = isLoading ? 'Analyzing image…' : 'Analyze image';
    }

    function releasePreview() {
        if (!previewUrl) return;
        URL.revokeObjectURL(previewUrl);
        previewUrl = '';
    }

    function resetSelection() {
        activeRequest?.abort();
        activeRequest = null;
        releasePreview();
        selectedFile = null;
        fileInput.value = '';
        previewImage.removeAttribute('src');
        previewImage.alt = 'Selected image preview';
        previewPanel.hidden = true;
        removeButton.hidden = true;
        dropzone.hidden = false;
        dropzone.dataset.state = 'default';
        analyzeButton.disabled = true;
        clearResult();
        setStatus('Select an image to begin.');
    }

    function selectFile(file) {
        const validationError = validateFile(file);
        if (validationError) {
            resetSelection();
            dropzone.dataset.state = 'error';
            fileInput.setAttribute('aria-invalid', 'true');
            setStatus(validationError, 'error');
            return;
        }

        releasePreview();
        selectedFile = file;
        previewUrl = URL.createObjectURL(file);
        previewImage.src = previewUrl;
        previewImage.alt = `Preview of ${file.name}`;
        fileName.textContent = file.name;
        fileSize.textContent = `${formatBytes(file.size)} · ${getMimeType(file)}`;
        previewPanel.hidden = false;
        removeButton.hidden = false;
        dropzone.hidden = true;
        dropzone.dataset.state = 'success';
        fileInput.removeAttribute('aria-invalid');
        analyzeButton.disabled = false;
        clearResult();
        setStatus('Image ready. Start analysis when you are ready.', 'success');
    }

    function showError(error) {
        const providerMissing = error?.code === 'PROVIDER_NOT_CONFIGURED';
        resultCard.hidden = false;
        resultCard.dataset.tone = 'error';
        resultLabel.textContent = providerMissing ? 'Configuration required' : 'Analysis unavailable';
        resultVerdict.textContent = providerMissing ? 'Provider not configured' : 'Image could not be analyzed';
        resultExplanation.textContent = error?.message || 'The analysis request failed. Check the image and try again.';
        confidenceGroup.hidden = true;
        confidenceValue.textContent = '';
        setStatus(providerMissing ? 'The server needs a detection provider before it can return results.' : 'Analysis failed. Review the message beside the result.', 'error');
        resultCard.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    }

    function showResult(result) {
        const verdict = VERDICTS[result.verdict] || VERDICTS.uncertain;
        const confidence = Math.max(0, Math.min(100, Math.round(Number(result.confidence) * 100)));
        resultCard.hidden = false;
        resultCard.dataset.tone = verdict.tone;
        resultLabel.textContent = 'Provider assessment';
        resultVerdict.textContent = verdict.label;
        resultExplanation.textContent = result.explanation;
        confidenceGroup.hidden = false;
        confidenceValue.textContent = `${confidence}% confidence`;
        confidenceMeter.setAttribute('aria-valuenow', String(confidence));
        confidenceFill.style.setProperty('--confidence-scale', String(confidence / 100));
        confidenceFill.style.setProperty('--meter-color', verdict.color);
        setStatus('Analysis complete. Read the result and disclaimer together.', 'success');
        resultCard.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    }

    async function analyzeSelectedFile() {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setStatus(validationError, 'error');
            return;
        }

        activeRequest?.abort();
        activeRequest = new AbortController();
        clearResult();
        setLoading(true);
        setStatus('Sending the image to the configured detection provider.');

        try {
            const response = await fetch('/api/deepfake-checker', {
                method: 'POST',
                headers: {
                    'Content-Type': getMimeType(selectedFile),
                    'X-File-Name': encodeURIComponent(selectedFile.name)
                },
                body: selectedFile,
                signal: activeRequest.signal
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw payload?.error || { message: `The server returned status ${response.status}. Try again later.` };
            }
            showResult(payload.result);
        } catch (error) {
            if (error?.name !== 'AbortError') showError(error);
        } finally {
            activeRequest = null;
            setLoading(false);
        }
    }

    fileInput.addEventListener('change', () => selectFile(fileInput.files?.[0]));
    removeButton.addEventListener('click', resetSelection);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        analyzeSelectedFile();
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropzone.dataset.dragging = 'true';
        });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropzone.dataset.dragging = 'false';
        });
    });

    dropzone.addEventListener('drop', (event) => selectFile(event.dataTransfer?.files?.[0]));
    window.addEventListener('beforeunload', releasePreview);
})();
