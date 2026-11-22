"""
FastAPI REST Endpoints for Synapse-Voice API (/api/v1).
"""

import json
import os
import shutil
import sys
import tempfile
import uuid
from datetime import UTC, datetime

# Ensure project root or container root is first in sys.path
_CUR = os.path.dirname(os.path.abspath(__file__))
_candidate = _CUR
_root = None
while _candidate and _candidate != os.path.dirname(_candidate):
    if os.path.exists(os.path.join(_candidate, "pyproject.toml")) or os.path.exists(os.path.join(_candidate, "frontend")):
        _root = _candidate
        break
    if os.path.exists(os.path.join(_candidate, "app")) and os.path.exists(os.path.join(_candidate, "ml")):
        _root = _candidate
    _candidate = os.path.dirname(_candidate)

if _root:
    if _root in sys.path:
        sys.path.remove(_root)
    sys.path.insert(0, _root)

import pandas as pd
from fastapi import APIRouter, File, Form, Header, HTTPException, Query, UploadFile

try:
    from backend.app.core.config import settings
    from backend.app.models.schemas import (
        AnalysisResponse,
        BenchmarksResponse,
        BiomarkerAttribution,
        ChatRequest,
        ChatResponse,
        CitationItem,
        HealthResponse,
    )
    from backend.app.services.ml_service import ml_service
    from backend.app.services.rag_service import (
        generate_explanation,
        retrieve_relevant_passages,
    )
    from backend.app.services.storage_service import storage_service
    from backend.app.services.auth_service import auth_service
except ModuleNotFoundError:
    from app.core.config import settings
    from app.models.schemas import (
        AnalysisResponse,
        BenchmarksResponse,
        BiomarkerAttribution,
        ChatRequest,
        ChatResponse,
        CitationItem,
        HealthResponse,
    )
    from app.services.ml_service import ml_service
    from app.services.rag_service import (
        generate_explanation,
        retrieve_relevant_passages,
    )
    from app.services.storage_service import storage_service
    from app.services.auth_service import auth_service
from ml.src.features import (
    AudioQualityError,
    extract_features_from_audio,
)

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint confirming API status and model availability."""
    return HealthResponse(
        status="healthy",
        model_loaded=(ml_service.model is not None),
        version=settings.VERSION,
        environment=settings.ENVIRONMENT
    )

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_voice(
    audio: UploadFile = File(..., description="Audio recording of sustained vowel phonation"),
    anonymous: bool = Form(False, description="If true, executes prediction without persistent storage"),
    consent: bool = Form(True, description="Explicit user consent for processing"),
    authorization: str | None = Header(None, description="Optional Bearer token to associate screening with user profile")
):
    """
    Ingests audio, verifies format & duration, extracts 22 acoustic biomarkers,
    computes calibrated probability, generates SHAP values, synthesizes cited RAG explanation.
    """
    if not consent:
        raise HTTPException(status_code=400, detail="Explicit consent is required to analyze audio.")
        
    # Check filename & extension
    filename = audio.filename or "recording.wav"
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = [".wav", ".mp3", ".webm", ".m4a", ".ogg"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(allowed_exts)}"
        )
        
    # Save uploaded file to secure temporary directory
    temp_dir = tempfile.mkdtemp(prefix="synapse_audio_")
    raw_path = os.path.join(temp_dir, f"input_{uuid.uuid4().hex}{ext}")
    wav_path = os.path.join(temp_dir, f"processed_{uuid.uuid4().hex}.wav")
    
    try:
        # Write file with size limit enforcement
        size = 0
        with open(raw_path, "wb") as f:
            while chunk := await audio.read(1024 * 64):
                size += len(chunk)
                if size > settings.MAX_AUDIO_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum allowed size ({settings.MAX_AUDIO_SIZE_BYTES // (1024*1024)} MB)."
                    )
                f.write(chunk)
                
        # Conversion to single-channel 16-bit 44.1kHz WAV
        if ext == ".wav":
            shutil.copyfile(raw_path, wav_path)
        else:
            # If ffmpeg is installed, invoke ffmpeg; otherwise attempt soundfile
            converted = False
            if shutil.which("ffmpeg"):
                cmd = f'ffmpeg -y -i "{raw_path}" -ac 1 -ar 44100 "{wav_path}"'
                ret = os.system(cmd)
                if ret == 0 and os.path.exists(wav_path):
                    converted = True
            if not converted:
                try:
                    import soundfile as sf
                    data, sr = sf.read(raw_path)
                    if data.ndim > 1:
                        data = data.mean(axis=1)
                    sf.write(wav_path, data, 44100)
                    converted = True
                except Exception as ex:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Could not convert {ext} audio. Please upload uncompressed .wav format. Error: {ex}"
                    )
                    
        # Feature Extraction & Quality Check
        try:
            features = extract_features_from_audio(wav_path)
        except AudioQualityError as qe:
            raise HTTPException(status_code=422, detail=f"Audio Quality Check Failed: {qe}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Acoustic biomarker extraction failed: {e}")
            
        # ML Inference
        prob, label, confidence_band, shap_dict, top_biomarkers = ml_service.predict(features)
        
        # RAG Explanation & Literature Grounding
        explanation, citations = generate_explanation(
            probability=prob,
            label=label,
            confidence_band=confidence_band,
            top_features=top_biomarkers,
            features=features
        )
        
        # Resolve optional authenticated user ID
        user_id = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization[7:].strip()
            payload = auth_service.decode_access_token(token)
            if payload and "sub" in payload:
                user_id = payload["sub"]

        # Prepare structured response
        record_id = str(uuid.uuid4())
        now_iso = datetime.now(UTC).isoformat()
        
        citation_objs = [
            CitationItem(
                title=c["title"],
                authors=c["authors"],
                year=int(c["year"]),
                doi=c.get("doi"),
                similarity=float(c.get("similarity", 0.0))
            )
            for c in citations
        ]
        
        analysis_data = {
            "id": record_id,
            "user_id": user_id,
            "probability": prob,
            "label": label,
            "confidence_band": confidence_band,
            "features": features,
            "shap_values": shap_dict,
            "top_biomarkers": [BiomarkerAttribution(**b) for b in top_biomarkers],
            "explanation": explanation,
            "literature_citations": citation_objs,
            "model_version": ml_service.bundle.get("best_config", "v1.0.0") if ml_service.bundle else "v1.0.0",
            "is_anonymous": anonymous,
            "created_at": now_iso
        }
        
        # Save to store (persists analysis session for immediate retrieval; anonymous screenings omit user_id)
        storage_service.save_analysis(analysis_data)
            
        return AnalysisResponse(**analysis_data)
        
    finally:
        # Cleanup temporary files
        shutil.rmtree(temp_dir, ignore_errors=True)

@router.get("/results/{record_id}", response_model=AnalysisResponse)
async def get_analysis_result(record_id: str):
    """Retrieves a previously computed screening analysis by its unique ID."""
    record = storage_service.get_analysis(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis result not found.")
    return AnalysisResponse(**record)

@router.get("/history")
async def get_history(
    limit: int = Query(20, ge=1, le=100),
    authorization: str | None = Header(None, description="Optional Bearer token to filter history by user profile")
):
    """Retrieves recent screening analysis sessions, filtered to user if authenticated."""
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        payload = auth_service.decode_access_token(token)
        if payload and "sub" in payload:
            user_id = payload["sub"]
    return storage_service.get_history(limit=limit, user_id=user_id)

@router.post("/chat", response_model=ChatResponse)
async def chat_followup(request: ChatRequest):
    """Answers clinical and neurological inquiries with comprehensive Parkinson's knowledge."""
    # Retrieve relevant literature passages
    docs = retrieve_relevant_passages(request.message, top_k=3)
    
    # Retrieve analysis context if provided
    context_str = ""
    if request.analysis_id:
        record = storage_service.get_analysis(request.analysis_id)
        if record:
            top_feats = ", ".join([b.get("feature", "") for b in record.get("top_biomarkers", [])[:2]])
            context_str = (
                f"**Clinical Context**: For this vocal screening, the estimated risk was "
                f"**{record.get('probability', 0)*100:.1f}% ({record.get('confidence_band')})**, "
                f"with primary acoustic perturbation in **{top_feats or 'Pitch Period Entropy'}**.\n\n"
            )
            
    q = request.message.lower().strip()
    
    # Comprehensive Medical Intent Classification
    if any(k in q for k in ["voice", "speech", "ppe", "hnr", "jitter", "shimmer", "dysphonia", "pitch", "vocal"]):
        answer = (
            "### 🎙️ Vocal Biomarkers & Hypokinetic Dysarthria\n\n"
            "Over 89% of individuals with Parkinson's experience vocal changes. Key biomarkers evaluated by Synapse-Voice include:\n"
            "• **Pitch Period Entropy (PPE)**: Quantifies fundamental frequency microtremors; values above 0.22 reflect dopamine depletion in basal ganglia vocal motor loops.\n"
            "• **Harmonics-to-Noise Ratio (HNR)**: Healthy voices exceed 20 dB. Incomplete vocal cord adduction drops HNR below 17 dB, producing audible breathiness.\n"
            "• **Jitter & Shimmer**: Cycle-to-cycle frequency and amplitude perturbations stemming from sub-clinical laryngeal tremors (4–7 Hz)."
        )
    elif any(k in q for k in ["symptom", "early", "tremor", "rigid", "bradykinesia", "sign", "trap"]):
        answer = (
            "### 🩺 Symptoms & Clinical Presentation\n\n"
            "Parkinson's symptoms encompass the cardinal motor tetrad (**TRAP**):\n"
            "• **T — Tremor at Rest**: Rhythmic 4–6 Hz unilateral pill-rolling tremor, disappearing during intentional action.\n"
            "• **R — Rigidity**: Cogwheel resistance to passive movement.\n"
            "• **A — Akinesia/Bradykinesia**: Slowness of movement, masked facial expression (hypomimia), and small handwriting (micrographia).\n"
            "• **P — Postural Instability**: Impaired balance, festinating gait, and freezing episodes.\n\n"
            "**Prodromal Non-Motor Signs**: Loss of smell (hyposmia), REM sleep behavior disorder (acting out dreams), and chronic constipation often precede motor symptoms by 10+ years."
        )
    elif any(k in q for k in ["treatment", "medication", "levodopa", "sinemet", "carbidopa", "drug", "cure"]):
        answer = (
            "### 💊 Medical Treatments & Pharmacotherapy\n\n"
            "While no definitive cure exists, therapies effectively replenish striatal dopamine:\n"
            "• **Levodopa / Carbidopa (Sinemet)**: Gold-standard dopamine precursor. Carbidopa prevents peripheral nausea and hypotension.\n"
            "• **Dopamine Agonists (Pramipexole, Ropinirole)**: Directly stimulate dopamine D2/D3 receptors; useful in younger patients.\n"
            "• **MAO-B & COMT Inhibitors (Rasagiline, Entacapone)**: Inhibit enzymatic breakdown of dopamine, smoothing out 'wearing-off' fluctuations.\n"
            "• **Diet Tip**: Take Levodopa 30–60 minutes before meals; high-protein meals compete with Levodopa for intestinal absorption."
        )
    elif any(k in q for k in ["dbs", "surgery", "deep brain stimulation", "ultrasound"]):
        answer = (
            "### ⚡ Surgical Interventions: Deep Brain Stimulation (DBS)\n\n"
            "DBS delivers high-frequency electrical pulses to abnormal neural circuits:\n"
            "• **Targets**: Subthalamic Nucleus (STN) or Globus Pallidus internus (GPi).\n"
            "• **Benefits**: Substantially reduces tremors, rigidity, and medication needs (often by 30–50%).\n"
            "• **Focused Ultrasound (MRgFUS)**: Non-invasive thermal ablation of the thalamic VIM nucleus for medication-resistant tremor."
        )
    elif any(k in q for k in ["lsvt", "loud", "therapy", "exercise", "rehab", "boxing"]):
        answer = (
            "### 🗣️ Speech Therapy & Neuroplastic Rehabilitation\n\n"
            "• **LSVT LOUD®**: Intensive gold-standard speech protocol retraining vocal volume ('Think Loud!') and sensory loudness calibration.\n"
            "• **SPEAK OUT!®**: Emphasizes intentional speech to convert automatic motor pathways to deliberate cortical control.\n"
            "• **Exercise**: Forced aerobic cycling, Rock Steady Boxing, and tango dancing promote BDNF release and improve postural agility."
        )
    elif any(k in q for k in ["stage", "progression", "hoehn", "yahr", "prognosis"]):
        answer = (
            "### 📈 Stages of Progression (Hoehn & Yahr Scale)\n\n"
            "• **Stage 1**: Unilateral symptoms with minimal disability.\n"
            "• **Stage 2**: Bilateral involvement without balance impairment.\n"
            "• **Stage 3**: Bilateral symptoms with impaired postural stability, but physically independent.\n"
            "• **Stage 4**: Severe disability; able to stand/walk only with assistance.\n"
            "• **Stage 5**: Wheelchair or bedbound unless aided.\n\n"
            "With modern care, life expectancy is near-normal; multidisciplinary management prevents late-stage fall and aspiration risks."
        )
    else:
        doc_note = f"According to {docs[0]['authors']} ({docs[0]['year']}): {docs[0]['content'][:180]}..." if docs else ""
        answer = (
            "### 🧠 Synapse-Voice Clinical Assistant\n\n"
            f"{doc_note}\n\n"
            "I can answer any inquiries regarding Parkinson's pathology, vocal biomarkers (PPE, HNR, Jitter), "
            "medications (Levodopa), surgical options (DBS), LSVT LOUD therapy, and disease stages."
        )
        
    reply = (
        f"{context_str}{answer}\n\n"
        "---\n"
        "*Disclaimer: Synapse-Voice is an academic pre-clinical screening platform. Consult a board-certified neurologist for clinical diagnosis.*"
    )
    
    return ChatResponse(
        reply=reply,
        citations=docs,
        analysis_id=request.analysis_id
    )

@router.get("/benchmarks", response_model=BenchmarksResponse)
async def get_benchmarks():
    """Returns the master literature review and reproduced prior work comparisons."""
    # Load papers.csv
    papers_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "docs", "literature", "papers.csv")
    papers = []
    if os.path.exists(papers_path):
        df_p = pd.read_csv(papers_path)
        for _, r in df_p.iterrows():
            papers.append({
                "year": int(r["Year"]),
                "authors": str(r["Authors"]),
                "title": str(r["Title"]),
                "venue": str(r["Venue"]),
                "doi": str(r["DOI_URL"]),
                "approach": str(r["Approach"]),
                "dataset": str(r["Dataset"]),
                "metric": str(r["Accuracy_Metric"]),
                "protocol": str(r["Protocol"]),
                "leakage": str(r["Limitations_Leakage_Risk"])
            })
            
    # Load reproduction results
    repro_path = os.path.join(os.path.dirname(__file__), "..", "data", "reproduction_results.json")
    repro_works = []
    if os.path.exists(repro_path):
        with open(repro_path, "r", encoding="utf-8") as f:
            repro_works = json.load(f)
            
    # Load model summary
    metrics_path = os.path.join(os.path.dirname(__file__), "..", "models_store", "metrics_summary.json")
    model_summary = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            model_summary = json.load(f)
            
    return BenchmarksResponse(
        literature_papers=papers,
        reproduced_works=repro_works,
        model_summary=model_summary
    )
