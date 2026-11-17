# Synapse-Voice: Parkinson's Disease Voice Screening Platform

> **CRITICAL MEDICAL DISCLAIMER**:  
> Synapse-Voice is an academic research and engineering screening aid developed for an EPICS semester project. It is **NOT** a certified medical diagnostic device and cannot diagnose Parkinson's disease or any neurological condition. Results must be interpreted strictly in consultation with a licensed medical professional (such as a board-certified neurologist or speech-language pathologist).

---

## 🎙️ Project Overview
Synapse-Voice is an end-to-end web platform and research suite designed for non-invasive Parkinson's disease (PD) vocal biomarker screening. Users can record sustained vowel phonation (`/a/`) directly in the browser (up to 90 seconds) or upload an audio file. The FastAPI backend extracts 22 clinical acoustic biomarkers (F0 variations, 5 jitter variants, 6 shimmer variants, noise ratios, and nonlinear dynamical entropy measures), executes a machine learning ensemble trained under subject-independent grouped cross-validation, computes SHAP explainability metrics, and utilizes a literature-grounded RAG layer to explain findings with peer-reviewed citations.

---

## 🏛️ System Architecture

```
synapse-1.0/
├── frontend/             # Next.js 14+ (React, TypeScript, Tailwind CSS, Web Audio API)
├── backend/              # FastAPI application, audio pipeline, REST endpoints, RAG service
│   ├── app/
│   │   ├── api/          # /analyze, /results, /history, /chat, /benchmarks, /health
│   │   ├── core/         # Config, logging, security
│   │   ├── models/       # Pydantic schemas and database models
│   │   └── services/     # Feature extraction, ML inference, RAG explainer
│   └── tests/            # Pytest suite for API and feature extraction
├── ml/                   # Machine Learning pipeline & research artifacts
│   ├── data/             # Benchmark UCI dataset (ID 174 & ID 189)
│   ├── notebooks/        # EDA and statistical analysis notebooks
│   ├── src/              # Feature extractor, grouped CV training, model evaluation
│   └── models/           # Exported joblib pipelines and metadata
├── rag/                  # Literature ingestion, vector storage, and retrieval
├── reproduction/         # Independent reproduction of prior published works
├── docs/                 # Literature review, architecture, ADRs, known issues
│   ├── literature/       # papers.csv, papers.md, datasets.md, gap_analysis.md, PPTX
│   ├── DECISIONS.md      # Architecture Decision Records (ADRs)
│   └── KNOWN_ISSUES.md   # Limitations and fallback strategies
└── supabase/migrations/  # SQL migrations for PostgreSQL + pgvector + RLS
```

---

## ⚡ Quickstart (Under 15 Minutes)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

### 1. Clone & Setup Backend
```bash
git clone https://github.com/Duke-07/synapse-1.0.git
cd synapse-1.0

# Copy environment template
cp .env.example .env

# Install Python requirements
pip install -r backend/requirements.txt
pip install -r ml/requirements.txt

# Run ML training and evaluation (Subject-Grouped CV)
python ml/src/train.py

# Start Backend Server
python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend API docs will be live at: `http://localhost:8000/docs`

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend web app will be live at: `http://localhost:3000`

---

## 🧪 Testing & Validation
```bash
# Run backend tests
python -m pytest backend/tests ml/tests -v

# Run linter & typechecker
python -m ruff check backend ml
python -m mypy backend/app ml/src --ignore-missing-imports
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
