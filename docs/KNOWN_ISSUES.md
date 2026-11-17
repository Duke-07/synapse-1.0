# Known Issues and Limitations

This document catalogs known constraints, scientific limitations, and environment-dependent fallbacks for **Synapse-Voice**.

---

## 1. Scientific & Clinical Limitations

### 1.1 Non-Diagnostic Screening Instrument
- **Severity**: Critical / Foundational
- **Description**: Synapse-Voice is an academic research screening aid (EPICS project), **NOT** a certified medical diagnostic device. It has not been approved by the FDA, CE-MDR, or CDSCO.
- **Mitigation**: A non-dismissible, persistent warning banner is displayed across all pages. The backend system prompt strictly forbids formulating clinical diagnoses, prescribing medications, or ruling out neurological conditions. All predictions are reported with confidence bands and advise consulting a board-certified neurologist or speech-language pathologist.

### 1.2 Small Dataset Cohort & Demographic Disparity
- **Severity**: High
- **Description**: The primary Oxford Parkinson's dataset (UCI ID 174; Little et al., 2008) comprises only 31 subjects (23 PD patients and 8 healthy controls, 195 total phonations). The cohort has unrecorded racial, ethnic, and dialectal representation, and age spans 46 to 82 years.
- **Mitigation**: Cross-validation uses subject-grouped splitting (`StratifiedGroupKFold`) to prevent patient memorization. Models report confidence intervals. Gaps are explicitly addressed in research deliverables and the `/benchmarks` UI page.

### 1.3 Phonation Task & Acoustic Environment Mismatch
- **Severity**: Medium
- **Description**: The benchmark dataset consists solely of sustained vowel phonation ("/a/"). Natural continuous speech (sentences, reading passages, monologues) cannot be processed by the MDVP sustained-vowel model. Furthermore, real-world smartphone and laptop microphones exhibit varying frequency responses, room reverberations, and environmental ambient noise compared to the acoustically treated sound booth used by Little et al.
- **Mitigation**: An audio pre-validation filter checks signal-to-noise ratio (SNR), clipping, silence, and duration. Clear visual onboarding instructs users to hold a sustained vowel sound ("ahhh") at stable pitch and volume.

### 1.4 Feature Extraction Discrepancy (MDVP vs. Praat/Python)
- **Severity**: Medium
- **Description**: The KayPENTAX Multi-Dimensional Voice Program (MDVP) employs proprietary pitch-tracking and perturbation algorithms. While Praat (`parselmouth`) algorithms are academically standard, numerical jitter and shimmer values differ slightly from KayPENTAX MDVP.
- **Mitigation**: Range and schema unit tests verify feature sanity against the empirical bounds of the UCI dataset. The UI explicitly discloses algorithmic measurement uncertainty.

---

## 2. Infrastructure & Cloud Environment Fallbacks

### 2.1 LLM API Key Availability
- **Condition**: Neither `GEMINI_API_KEY` nor `OPENAI_API_KEY` configured in `.env`.
- **Fallback**: The backend transparently activates `DeterministicTemplateExplainer` in `backend/app/services/rag_service.py`. It dynamically maps computed biomarkers to clinical thresholds and retrieved literature passages without raising an exception.

### 2.2 Cloud Supabase Credentials
- **Condition**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` not configured.
- **Fallback**: The backend persistence service uses an SQLite / in-memory document store with pgvector-compatible cosine similarity search, allowing offline testing and immediate local evaluation.

### 2.3 Audio Conversion (FFmpeg)
- **Condition**: FFmpeg binary absent from system path.
- **Fallback**: Python's native `wave`, `soundfile`, and `scipy.io.wavfile` modules parse standard WAV recordings natively. For compressed formats (`.webm`, `.mp3`), `pydub`/`soundfile` or an advisory error is returned instructing uncompressed PCM upload.


### 2.4 Cloud Platform Automated Deployment & SSO Authentication
- **Condition**: Automated command-line cloud deployment to Vercel/Render requires interactive browser SSO login, card verification, or an authentication token (`VERCEL_TOKEN`, `RENDER_API_KEY`).
- **Mitigation & Turnkey Deployment**: Complete production configurations are provided in `frontend/vercel.json`, `render.yaml`, `railway.json`, and `fly.toml`, plus a turnkey multi-container `docker-compose.yml`. The repository includes 1-click blueprint deployment instructions for Vercel and Render in `README.md`.
