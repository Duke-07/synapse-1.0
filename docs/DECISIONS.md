# Architectural and Engineering Decisions (ADR)

This document tracks key engineering, modeling, and architectural decisions made for **Synapse-Voice**, including evaluated alternatives, rationale, and consequences.

---

## ADR-001: Machine Learning Classifier Architecture & Subject-Grouped CV

- **Status**: Accepted
- **Context**: 
  The primary Oxford Parkinson's Disease Detection dataset (UCI ID 174) contains 195 voice recordings from 31 distinct subjects (23 PD patients, 8 healthy controls). Because each subject contributed ~6 recordings, standard random train/test splits or random K-fold cross-validation will cause severe data leakage (recordings from the same subject appearing in both train and test splits).
- **Decision**: 
  Extract the unique subject identifier from the `name` column (e.g. `phon_R01_S01_1` -> subject `R01_S01`) and evaluate all models using `StratifiedGroupKFold` / `GroupKFold` (5 folds). Use an `imblearn.pipeline.Pipeline` with `StandardScaler`, `SMOTE` (or class weighting) applied strictly within training folds, and train multiple model candidates: Logistic Regression, SVM-RBF, KNN, Random Forest, XGBoost, and MLP. Calibrate final model probabilities using isotonic/sigmoid calibration.
- **Alternatives Considered**:
  - *Standard Stratified K-Fold / Random Split*: Yields deceptively high accuracy (>95-99%) in published literature, but suffers from patient memorization and fails to generalize to new patients.
  - *Subject Averaging*: Reduces dataset to 31 rows, losing intra-subject phonation variance.
- **Consequences**:
  Reported performance metrics will reflect realistic subject-independent generalization. Confidence intervals and fold variance will be honestly reported.

---

## ADR-002: Acoustic Biomarker Extraction Engine

- **Status**: Accepted
- **Context**: 
  The UCI dataset features originate from KayPENTAX Multi-Dimensional Voice Program (MDVP) and proprietary nonlinear dynamics code (Little et al., 2008). Librosa alone does not output MDVP-standard Jitter, Shimmer, NHR, HNR, RPDE, D2, DFA, spread1, spread2, or PPE.
- **Decision**: 
  Construct a dedicated biomarker extraction engine in `backend/app/services/feature_extractor.py` and `ml/src/features.py`:
  1. Use `praat-parselmouth` (Python interface to Praat) to compute exact Praat-based pitch (MDVP:Fo, Fhi, Flo), 5 jitter variants (local, absolute, rap, ppq5, ddp), 6 shimmer variants (local, dB, apq3, apq5, apq11, dda), and NHR / HNR.
  2. Implement nonlinear dynamics via `nolds` and reference algorithms: DFA (Detrended Fluctuation Analysis), D2 (Correlation Dimension), RPDE (Recurrence Period Density Entropy).
  3. Implement spread1, spread2, and PPE (Pitch Period Entropy) according to Little et al. (2008).
  4. Include schema validation and reference ranges from the UCI training distribution.
- **Alternatives Considered**:
  - *MFCC / Spectrogram Deep Learning only*: Disconnects from the 22 clinically validated benchmark features and prevents direct comparison with UCI literature.
  - *Calling external Praat CLI executable*: Unportable across deployment platforms compared to `praat-parselmouth` C-extension wheel.
- **Consequences**:
  Allows full end-to-end inference on user-uploaded audio files directly into the 22-dimensional feature space.

---

## ADR-003: Backend Architecture & Framework

- **Status**: Accepted
- **Context**: 
  Need high-performance, asynchronous REST API with automatic OpenAPI documentation, multipart audio ingestion, streaming RAG support, and modular service separation.
- **Decision**: 
  Use **FastAPI** (Python 3.11/3.14 compatible) running under **Uvicorn**, structured with modular routers under `/api/v1` (`/analyze`, `/results/{id}`, `/history`, `/chat`, `/benchmarks`, `/health`).
- **Alternatives Considered**:
  - *Flask*: Expressly prohibited by project requirements; lacks native async request handling and automatic OpenAPI typing.
  - *Django*: Excessive boilerplate and overhead for an audio microservice.
- **Consequences**:
  Fast asynchronous inference, native Pydantic schema validation, clean error handlers, and easy containerization.

---

## ADR-004: Storage and Database Strategy

- **Status**: Accepted
- **Context**: 
  The app requires persisting user profiles, audio metadata, biomarker feature vectors, model predictions, SHAP values, and vectorized research papers for RAG. Supabase provides Postgres + `pgvector` + Storage + Auth.
- **Decision**: 
  Provide native Supabase integration with SQL migrations in `supabase/migrations/` implementing Row Level Security (RLS) and pgvector embeddings. In local and disconnected environments where cloud Supabase credentials are not yet configured, automatically fall back to an integrated SQLite/JSON mock persistence layer and local vectorized memory store, with zero crash or startup penalty.
- **Alternatives Considered**:
  - *Mandating live Supabase cloud keys at build time*: Would block local testing and offline CI execution.
  - *Plain relational Postgres without vector store*: Would require separate external vector database (e.g. Pinecone).
- **Consequences**:
  Production-ready for Supabase migration while remaining fully testable and runnable standalone out of the box.

---

## ADR-005: RAG & LLM Explanation Pipeline

- **Status**: Accepted
- **Context**: 
  Acoustic classifier output must be explained in clear, accessible language referencing peer-reviewed literature, with a strict medical disclaimer. The LLM must NEVER make a diagnostic claim.
- **Decision**: 
  Use LangChain with configurable provider (`LLM_PROVIDER`: `gemini` or `openai`). If neither API key is configured in the environment, fallback gracefully to a deterministic, literature-grounded template explainer that dynamically compares the extracted biomarkers to reference ranges (e.g., jitter threshold >1.04%, HNR < 20 dB, PPE elevations) and cites the indexed corpus.
- **Alternatives Considered**:
  - *Letting LLM predict diagnosis directly from raw audio*: Dangerous, hallucination-prone, and violates medical ethics.
  - *Hardcoded static text explanation*: Fails to contextualize patient-specific SHAP feature contributions and reference ranges.
- **Consequences**:
  Adheres strictly to the screening-only safety boundary while providing transparent, evidence-based insights.

---

## ADR-006: Frontend Stack and UX

- **Status**: Accepted
- **Context**: 
  Users need to record sustained vowel phonation ("/a/") in browser or upload files, view live audio waveforms, review probability gauges, biomarker tables, and SHAP charts, with mobile-first responsiveness and dark mode.
- **Decision**: 
  Next.js 14+ (React 18/19, TypeScript, Tailwind CSS) with Web Audio API / MediaRecorder, HTML5 AudioContext for live waveform visualizer, Lucide React icons, and accessible ARIA attributes.
- **Alternatives Considered**:
  - *Vite + React SPA*: Excellent, but Next.js provides superior SSR, API routing capabilities, and turnkey Vercel deployment.
  - *Plain HTML/JS*: Difficult to maintain complex reactive state (live recording, SHAP charts, interactive chat).
- **Consequences**:
  Modern, responsive, accessible frontend with effortless static/hybrid export and deployment.

---

## ADR-007: Deployment Targets

- **Status**: Accepted
- **Context**: 
  A public URL reachable from anywhere on mobile/desktop is required.
- **Decision**: 
  Deploy Frontend on **Vercel** (or unified container/Render/Railway) and Backend on **Render / Railway / Hugging Face Spaces / Docker**. For static or edge deployment, package frontend with turnkey proxy or direct CORS to backend URL.
- **Alternatives Considered**:
  - *AWS ECS / EKS*: High operational cost and setup complexity for a student EPICS project.
  - *Localhost only with ngrok*: Fragile and temporary.
- **Consequences**:
  Reliable, cost-free public deployment with SSL and continuous deployment from GitHub.


---

## ADR-008: Frontend Phonation Protocol, Local Session Fallback, and Screening UX

- **Status**: Accepted
- **Context**: 
  Users require a frictionless voice recording flow on mobile and desktop without mandatory account creation or cloud data leakage. Real-time visual feedback is necessary during vocalization to ensure the user sustains a steady tone.
- **Decision**: 
  1. Build a specialized HTML5 Web Audio API capture pipeline in `frontend/src/app/screen/page.tsx` utilizing `MediaRecorder` with dynamic MIME type negotiation (`audio/webm;codecs=opus`, `audio/ogg`, `audio/mp4`, `audio/wav`).
  2. Implement `WaveformVisualizer` driving a continuous 2D HTML5 Canvas oscillogram via `AudioContext` and `AnalyserNode`.
  3. Support drag-and-drop file upload fallback (`.wav`, `.mp3`, `.m4a`, `.webm`, `.ogg`) capped at 25 MB.
  4. Store session results locally in `sessionStorage` and `localStorage` so results and history pages render reliably even if the backend uses ephemeral persistence.
  5. Enforce non-diagnostic disclaimers on every view and require explicit user consent checkbox before audio analysis.
- **Alternatives Considered**:
  - *Server-side WebSocket streaming*: Unnecessary network overhead and latency for 3-5 second vowel phonations.
  - *Mandatory OAuth login*: Degrades user privacy and introduces onboarding friction for anonymous screening.
- **Consequences**:
  Privacy-preserving, responsive client interface with zero-retention compliance and client-side history control.
