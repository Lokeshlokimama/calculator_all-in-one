# PDF processing backend

No AI features or API keys are used. The static site remains on GitHub Pages. This separate container needs an HTTPS host before online tools become available to visitors.

Build from the repository root: `docker build -f backend/Dockerfile -t calculator-pdf-service .`

Run with a 1 GB memory limit, two CPUs, no writable application volume, and `ALLOWED_ORIGIN=https://calculatorsallinone.com`. Expose container port 8080 behind HTTPS. Set `PORT` if the hosting provider supplies another port. Temporary request directories are removed after processing; request bodies, filenames and passwords are not logged. Configure provider-side request-size limits, per-client rate limiting and concurrency caps before public traffic. No persistent document storage is required.

After deploying, verify `/health`, then set `pdf-service-config.js` endpoint to the HTTPS service URL and rebuild the static site. No secret belongs in that file. Both the frontend hostname and `ALLOWED_ORIGIN` must agree. The frontend obtains explicit file-upload consent before calling the service.

Tests: `python -m unittest discover -s backend -p "test_*.py"`. The local Python tests cover encryption, unlocking, text exports, comparison and file rejection. LibreOffice, Ghostscript, qpdf and Poppler conversions require the Docker image and integration testing on the chosen host. A Docker engine is not installed on the current development machine, so these CLI integrations have not been verified here.

Review fonts and layout after Office conversion. PDF-to-Office exports are text-based, not layout reconstruction. PDF/A requires external conformance validation (for example veraPDF); this service does not certify archival compliance. Repair may fail. Raster redaction applies one rectangle to every page, discards original text and forms, and requires review of all output pages. Digital certificate signing is not implemented; the browser editor offers a clearly labelled typed signature stamp.

Dependencies retain their licenses. Ghostscript and LibreOffice are installed as separate system programs in the container; review redistribution requirements if distributing the image. Keep dependencies and system packages patched.
