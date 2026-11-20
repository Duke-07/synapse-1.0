FROM python:3.11-slim

WORKDIR /app

# Install system audio and compiler dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code, ML artifacts, and models
COPY backend /app
COPY ml /app/ml

# Set PYTHONPATH so app and ml packages are directly resolvable
ENV PYTHONPATH="/app:${PYTHONPATH}"

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
