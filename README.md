# Synapse-Voice: Vocal Biomarker Screening for Parkinson's Disease

[![CI](https://github.com/Duke-07/synapse-1.0/actions/workflows/ci.yml/badge.svg)](https://github.com/Duke-07/synapse-1.0/actions)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **CRITICAL CLINICAL & REGULATORY DISCLAIMER**:  
> **Synapse-Voice is strictly an investigational screening aid and academic research system (EPICS).**  
> It is **NOT** a certified diagnostic medical device under FDA or CE regulations. It does **NOT** provide a definitive medical diagnosis, nor can it rule out Parkinson's disease or other movement disorders. Screening results represent statistical acoustic anomalies on sustained vowel phonations and must be evaluated in person by a board-certified neurologist or speech-language pathologist.

---

## 🎙️ Project Overview

**Synapse-Voice** is an end-to-end, privacy-preserving web screening platform and academic research suite for detecting early vocal dysphonia associated with Parkinson's disease (PD).

Users vocalize a continuous, steady sustained vowel sound (`/a/` like in *father*) into their browser microphone (or upload an audio file). The system:
1. **Verifies audio signal quality** (duration check 1.0s–90s, RMS silence rejection < 0.004, and clipping detection > 0.98).
2. **Extracts 22 clinical acoustic biomarkers** via native Praat (`praat-parselmouth`) and nonlinear dynamical entropy algorithms (`nolds`).
3. **Executes a Platt-calibrated neural network classifier** trained strictly under **subject-isolated cross-validation** (`StratifiedGroupKFold`), eliminating data leakage.
4. **Calculates SHAP (Shapley Additive exPlanations)** values identifying the top phonatory features shifting risk.
5. **Generates literature-grounded plain-language explanations** via a Retrieval-Augmented Generation (RAG) layer citing indexed peer-reviewed studies with verified DOIs.
6. **Enforces zero-retention privacy defaults**, destroying raw audio immediately after biomarker extraction.

---

## 🏛️ System Architecture

```
                                    +-----------------------------------------+
                                    |        Client Browser (Next.js 14)       |
                                    | - HTML5 Web Audio API / MediaRecorder   |
                                    | - Real-time Canvas Waveform Visualizer  |
                                    | - Probability Gauge & SHAP Attributions |
                                    | - 22 Biomarkers vs. Healthy References  |
                                    | - Literature-Grounded RAG Chat Modal    |
                                    +--------------------+--------------------+
                                                         |  HTTP Multipart / JSON
                                                         v
                                    +-----------------------------------------+
                                    |          FastAPI Backend (8000)          |
                                    | - CORS & API Security Headers           |
                                    | - Pre-Analysis Quality Gates            |
                                    +--------------------+--------------------+
                                                         |
                          +------------------------------+------------------------------+
                          |                                                             |
                          v                                                             v
+--------------------------------------------------+          +--------------------------------------------------+
|      Acoustic Biomarker Engine (ml/src/features) |          |      RAG Literature Engine (backend/rag_service) |
| - Praat/Parselmouth: F0, Jitter, Shimmer, HNR    |          | - Vectorized Corpus: 10 Verified Studies        |
| - Nonlinear Dynamics (nolds): RPDE, DFA, PPE, D2 |          | - LLM: Gemini 1.5 / OpenAI / Fallback Explainer |
+-------------------------+------------------------+          +-------------------------+------------------------+
                          |                                                             |
                          v                                                             v
+--------------------------------------------------+          +--------------------------------------------------+
|        Calibrated Classifier (ml/models)         |          |       Persistence & Audit (storage_service)      |
| - Champion: MLP FS-12 (Platt Sigmoid Calibrated) |          | - Supabase pgvector + PostgreSQL Schema          |
| - Validation: 5-Fold StratifiedGroupKFold        |          | - Ephemeral Local SQLite / JSON Zero-Retention   |
| - Accuracy: 79.41% ± 7.77% (ROC-AUC: 0.7963)     |          | - Client-side LocalStorage Session Audit         |
+--------------------------------------------------+          +--------------------------------------------------+
```

---

## 🔬 Benchmark Comparison & The "Data Leakage Trap" Audit

A cornerstone deliverable of this research is our empirical audit of published machine learning literature on the **Oxford Parkinson's Disease Dataset (UCI 174)**.

### The Data Leakage Problem
The Oxford benchmark contains **195 recordings from 31 individuals** (~6 phonations per subject). When researchers use standard random splits (e.g. 70:30 or random 10-fold CV), recordings from the same individual appear in both training and test sets. Classifiers memorize individual vocal tract anatomy (e.g. fundamental frequency `MDVP:Fo`) rather than pathology, artificially inflating reported accuracies to **92%–99%**.

### Independent Reproduction Results (Identical Benchmark: UCI 174)

| Prior Work / Repository | Author's Claimed Metric | Our Reproduction (Author Protocol) | Our Reproduction (Grouped CV: StratifiedGroupKFold) | Leakage Drop | Leakage Risk Classification |
|---|---|---|---|---|---|
| **Little et al. (2008)** (Foundational SVM) | 91.4% Accuracy | 88.53% ± 9.43% | **78.96% ± 7.61%** | **-9.57%** | Moderate (Phonation bootstrap overlap) |
| **Alshammri et al. (2023)** (Frontiers in AI) | MLP: 98.31%, SVM: 95.0% | MLP: 91.53%, SVM: 89.83% | **MLP: 80.12% ± 4.34%**, SVM: 73.14% | **-11.41%** | Severe (Random 70:30 sample split) |
| **Srinivasan et al. (2024)** (Scientific Reports) | FNN: ~96.5%, KSVM: ~94.8% | FNN: 94.87%, KNN: 92.31% | **FNN: 77.23% ± 5.63%**, KNN: 70.07% | **-17.64%** | High (Random 80:20 sample split) |
| **Kalomitsinis (GitHub)** (Group-Aware Baseline) | Subject-wise: ~82–85% | RF: 74.88% ± 17.24% | **RF: 75.63% ± 7.41%** | -0.75% | Low (Proper group-aware cross-validation) |
| **Yadav (GitHub)** (Random Forest Baseline) | 99.4% – 99.6% Accuracy | 10-Fold: 91.18% ± 6.71% | **78.00% ± 5.51%** | **-13.18%** | Catastrophic (Ensemble memorizes patient F0) |
| **Synapse-Voice (Our Champion)** | **Honest Screening Target** | — | **79.41% ± 7.77%** (F1: 0.8695, AUC: 0.7963) | **0.0%** | **Zero Leakage (StratifiedGroupKFold)** |

*All reproduction code and raw outputs are documented in [`reproduction/`](reproduction/) and [`reproduction/RESULTS.md`](reproduction/RESULTS.md).*

---

## 📊 Champion Model Performance

Our model training evaluated 6 candidate architectures under 5-fold `StratifiedGroupKFold` with ANOVA feature selection:

| Model Architecture | Feature Selection | Mean Accuracy (± Std) | 95% Confidence Interval | Mean F1-Score | ROC-AUC | PR-AUC |
|---|---|---|---|---|---|---|
| **MLP (Neural Net) [Champion]** | **ANOVA-12 (`FS-12`)** | **79.41% ± 7.77%** | **[72.60%, 86.22%]** | **0.8695** | **0.7963** | **0.9348** |
| Random Forest | Full (22) | 77.90% ± 4.41% | [74.03%, 81.76%] | 0.8559 | 0.7954 | 0.9320 |
| XGBoost | ANOVA-12 (`FS-12`) | 76.90% ± 6.35% | [71.33%, 82.46%] | 0.8519 | 0.7607 | 0.9080 |
| SVM (RBF Kernel) | ANOVA-12 (`FS-12`) | 78.41% ± 6.38% | [72.82%, 84.00%] | 0.8647 | 0.7713 | 0.9168 |
| Logistic Regression | ANOVA-12 (`FS-12`) | 77.41% ± 8.16% | [70.26%, 84.57%] | 0.8569 | 0.7844 | 0.9174 |
| K-Nearest Neighbors | ANOVA-12 (`FS-12`) | 72.82% ± 7.91% | [65.89%, 79.75%] | 0.8202 | 0.7183 | 0.8649 |

---

## 📚 Peer-Reviewed Literature Review (10 Verified Studies)

All 10 papers indexed in our RAG corpus and benchmark review are verified with active DOIs:

1. **Little, M. A. et al. (2009)**. *Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease*. **IEEE Trans. Biomed. Eng.** [DOI: 10.1109/TBME.2008.2005954](https://doi.org/10.1109/TBME.2008.2005954)
2. **Tsanas, A. et al. (2010)**. *Accurate Telemonitoring of Parkinson's Disease Progression by Noninvasive Speech Tests*. **IEEE Trans. Biomed. Eng.** [DOI: 10.1109/TBME.2009.2036000](https://doi.org/10.1109/TBME.2009.2036000)
3. **Orozco-Arroyave, J. R. et al. (2016)**. *Automatic detection of Parkinson's disease in running speech spoken in three different languages*. **J. Acoust. Soc. Am. (JASA)**. [DOI: 10.1121/1.4944039](https://doi.org/10.1121/1.4944039)
4. **Sakar, C. O. et al. (2019)**. *A comparative analysis of speech signal processing algorithms for Parkinson's disease classification*. **Applied Soft Computing**. [DOI: 10.1016/j.asoc.2018.10.022](https://doi.org/10.1016/j.asoc.2018.10.022)
5. **Alshammri, R. et al. (2023)**. *Machine learning approaches to identify Parkinson's disease using voice signal features*. **Frontiers in AI**. [DOI: 10.3389/frai.2023.1084001](https://doi.org/10.3389/frai.2023.1084001)
6. **Pah, N. D. et al. (2023)**. *Voice-Based SVM Model Reliability for Identifying Parkinson's Disease*. **IEEE Access**. [DOI: 10.1109/ACCESS.2023.3344464](https://doi.org/10.1109/ACCESS.2023.3344464)
7. **Pah, N. D. et al. (2024)**. *The Effectiveness of Acoustic Voice Quality Index to Identify People With Parkinson's Disease*. **IEEE Access**. [DOI: 10.1109/ACCESS.2024.3498836](https://doi.org/10.1109/ACCESS.2024.3498836)
8. **Srinivasan, S. et al. (2024)**. *Detection of Parkinson disease using multiclass machine learning approach*. **Scientific Reports (Nature Portfolio)**. [DOI: 10.1038/s41598-024-64004-9](https://doi.org/10.1038/s41598-024-64004-9)
9. **Ghaheri, P. et al. (2024)**. *Diagnosis of Parkinson's disease based on voice signals using SHAP and hard voting ensemble*. **Comp. Methods Biomech. Biomed. Eng.** [DOI: 10.1080/10255842.2023.2263125](https://doi.org/10.1080/10255842.2023.2263125)
10. **La Quatra, M. et al. (2024)**. *Exploiting Foundation Models and Speech Enhancement for PD Detection from Speech in Real-World Conditions*. **Interspeech 2024**. [DOI: 10.21437/Interspeech.2024-522](https://doi.org/10.21437/Interspeech.2024-522)

*Full literature documentation and academic presentation slides are located in [`docs/literature/`](docs/literature/).*

---

## 📁 Repository Structure

```
synapse-1.0/
├── frontend/                     # Next.js 14 App Router, TypeScript, Tailwind
│   ├── src/app/
│   │   ├── page.tsx              # Landing page with interactive screening CTA
│   │   ├── screen/page.tsx       # Live mic recording, HTML5 AudioContext, upload
│   │   ├── results/page.tsx      # Risk gauge, SHAP bar chart, 22 biomarkers, RAG
│   │   ├── history/page.tsx      # Client-side session screening history
│   │   ├── benchmarks/page.tsx   # Interactive 10 papers & 5 reproductions table
│   │   ├── methodology/page.tsx  # Signal processing & cross-validation docs
│   │   └── privacy/page.tsx      # Zero-retention privacy policy & consent
│   ├── src/components/           # Reusable UI components (Gauge, SHAP, Table, Modal)
│   ├── vercel.json               # Vercel deployment configuration
│   └── package.json
├── backend/                      # FastAPI Python 3.11/3.14 backend service
│   ├── app/
│   │   ├── api/endpoints.py      # /analyze, /results/{id}, /history, /chat, /benchmarks
│   │   ├── core/config.py        # Environment settings & CORS policy
│   │   ├── services/
│   │   │   ├── ml_service.py     # Champion model inference & SHAP explainability
│   │   │   ├── rag_service.py    # Vector corpus retrieval & Gemini/OpenAI caller
│   │   │   └── storage_service.py# Supabase / SQLite zero-retention storage
│   │   ├── models_store/         # Bundled trained model pipeline & figures
│   │   └── data/                 # Vector corpus & benchmark reproduction data
│   ├── Dockerfile                # Production containerfile
│   └── requirements.txt
├── ml/                           # ML research & reproducibility pipeline
│   ├── data/                     # UCI 174 & UCI 189 datasets
│   ├── src/features.py           # 22 Praat biomarkers + signal quality gates
│   ├── src/train.py              # 5-fold StratifiedGroupKFold training script
│   ├── notebooks/                # Exploratory Data Analysis Jupyter notebook
│   └── models/                   # Best model joblib bundle & EDA plots
├── reproduction/                 # Reproduction of Little, Alshammri, Srinivasan, etc.
│   ├── evaluate_prior_works.py   # Empirical replication script
│   ├── RESULTS.md                # Detailed audit report on data leakage
│   └── results.csv
├── docs/                         # Faculty EPICS deliverables & architecture
│   ├── literature/               # papers.csv, papers.md, datasets.md, PPTX presentation
│   ├── DECISIONS.md              # ADR-001 through ADR-009
│   ├── KNOWN_ISSUES.md           # Fallback strategies and limitations
│   └── model_card.md             # Standard ML Model Card
├── supabase/migrations/          # SQL migrations (pgvector, tables, RLS)
├── .github/workflows/ci.yml      # CI workflow for lint, typecheck, pytest & build
├── docker-compose.yml            # Turnkey multi-container local stack
├── render.yaml                   # 1-click Render blueprint
└── railway.json                  # Railway deployment configuration
```

---

## 🚀 Running Locally

### Option A: Turnkey Multi-Container Docker Stack
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

### Option B: Native Development Setup

#### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Duke-07/synapse-1.0.git
cd synapse-1.0

# Install Python requirements
pip install -r backend/requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in any modern desktop or mobile browser.

---

## ☁️ Deployment Guide

### 1. Frontend on Vercel (1-Click)
1. Fork or push to your GitHub account (`https://github.com/Duke-07/synapse-1.0`).
2. Go to [Vercel](https://vercel.com) -> **Add New Project** -> Select `synapse-1.0`.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api/v1` (or your deployed backend URL).
5. Click **Deploy**.

### 2. Backend on Render (1-Click Blueprint)
1. Go to [Render](https://render.com) -> **New** -> **Blueprint**.
2. Connect your repo `synapse-1.0`. Render will automatically detect [`render.yaml`](render.yaml).
3. Optionally add your `GEMINI_API_KEY` or `OPENAI_API_KEY` for live generative responses (otherwise, the built-in deterministic literature explainer activates automatically).
4. Click **Apply**.

### 3. Railway / Fly.io / Hugging Face Spaces
- **Railway**: Uses [`railway.json`](railway.json) targeting `backend/Dockerfile`.
- **Fly.io**: Run `fly launch` using the included [`fly.toml`](fly.toml).

---

## 🧪 Verification & Test Suite

Run all verification suites:
```bash
# Run backend integration tests (100% passing)
python -m pytest backend/tests ml/tests -v

# Run Python linter & typechecker
python -m ruff check backend/ ml/
python -m mypy backend/ ml/

# Run frontend tests & build check
cd frontend
npm test
npm run build
```

---

## 👥 EPICS Academic Deliverables

- **Literature Review & Gap Analysis**: [`docs/literature/gap_analysis.md`](docs/literature/gap_analysis.md)
- **10 Annotated Papers Catalog**: [`docs/literature/papers.md`](docs/literature/papers.md) & [`docs/literature/papers.csv`](docs/literature/papers.csv)
- **Faculty PowerPoint Deck**: [`docs/literature/literature_review.pptx`](docs/literature/literature_review.pptx)
- **Leakage Reproduction Study**: [`reproduction/RESULTS.md`](reproduction/RESULTS.md)
- **Architecture Decision Records**: [`docs/DECISIONS.md`](docs/DECISIONS.md)
- **Model Card**: [`docs/model_card.md`](docs/model_card.md)

---

## 📄 License
This project is released under the **MIT License**. See [LICENSE](LICENSE) for details.
