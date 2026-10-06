FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends libreoffice-writer libreoffice-calc libreoffice-impress ghostscript qpdf poppler-utils fonts-dejavu fonts-liberation && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/server.py .
RUN useradd --create-home pdfservice
USER pdfservice
ENV PORT=8080
EXPOSE 8080
CMD ["python", "server.py"]
