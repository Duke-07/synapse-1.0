"""
FastAPI REST Endpoints for Synapse-Voice API (/api/v1).
"""

import json
import os
import shutil
import tempfile
import uuid
from datetime import UTC, datetime

import pandas as pd
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

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
    consent: bool = Form(True, description="Explicit user consent for processing")
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
        
        # Save to store unless in anonymous "try it" mode
        if not anonymous:
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
async def get_history(limit: int = Query(20, ge=1, le=100)):
    """Retrieves recent screening analysis sessions."""
    return storage_service.get_history(limit=limit)

@router.post("/chat", response_model=ChatResponse)
async def chat_followup(request: ChatRequest):
    """Answers follow-up clinical literature questions about screening results."""
    # Retrieve relevant literature
    docs = retrieve_relevant_passages(request.message, top_k=2)
    
    # Retrieve analysis context if provided
    context_str = ""
    if request.analysis_id:
        record = storage_service.get_analysis(request.analysis_id)
        if record:
            context_str = (
                f"User's screening risk score was {record.get('probability', 0)*100:.1f}% ({record.get('confidence_band')}). "
                f"Top biomarkers were: {', '.join([b.get('feature','') for b in record.get('top_biomarkers', [])])}. "
            )
            
    # Formulate answer
    doc_summary = ""
    if docs:
        doc_summary = f"According to {docs[0]['authors']} ({docs[0]['year']}): {docs[0]['content'][:200]}..."
    else:
        doc_summary = "Based on indexed voice biomarker literature, changes in vocal pitch stability and harmonic noise are key indicators."
        
    reply = (
        f"{context_str}{doc_summary}\n\n"
        "Please remember that vocal screening measures phonatory tremor and does not confirm Parkinson's disease. "
        "We strongly advise consulting a board-certified neurologist for any personal health concerns."
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
