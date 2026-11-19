FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including libsndfile and ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application and bundled models
COPY . /app

# Set PYTHONPATH so ml package and app are importable
ENV PYTHONPATH="/app:${PYTHONPATH}"

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
