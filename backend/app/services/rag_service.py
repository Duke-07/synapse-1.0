"""
RAG Explanation and Literature Retrieval Service for Synapse-Voice.

Retrieves relevant peer-reviewed literature passages and synthesizes a patient-accessible,
scientifically-grounded explanation of acoustic biomarkers and SHAP features.
Enforces non-diagnostic clinical boundaries and provides graceful deterministic fallbacks.
"""

import json
import os
from typing import Any

import numpy as np

# System Prompt enforcing medical screening boundaries
SYSTEM_PROMPT = """You are Synapse-Voice's AI Medical Screening Assistant.
Your mission is to explain vocal biomarker screening results to users in clear, empathetic, and scientifically rigorous language grounded strictly in peer-reviewed literature.

MANDATORY SAFETY AND ETHICAL DIRECTIVES:
1. NEVER DIAGNOSE: You are a pre-clinical screening aid, NOT a diagnostic device. Never declare that the patient has Parkinson's disease.
2. ADVISORY LANGUAGE ONLY: Use phrases such as "the acoustic screening model identified patterns consistent with...", "an elevated vocal risk score was detected", or "vocal biomarkers align with healthy normative baselines".
3. MANDATORY RECOMMENDATION: Always advise the user that only a board-certified neurologist, movement disorder specialist, or licensed speech-language pathologist can formulate a diagnosis through comprehensive neurological examination.
4. EVIDENCE CITATION: Ground every claim about vocal biomarkers in the retrieved literature passages. Cite specific authors and years (e.g. [Little et al., 2008], [Ghaheri et al., 2024], [Pah et al., 2024]).
5. REFERENCE RANGES: Explicitly explain whether the user's top contributing biomarkers (e.g. PPE, spread1, Jitter, HNR) fell within or outside established healthy baseline ranges.
6. WEAK RETRIEVAL: If retrieved passages do not provide adequate context for a specific question, explicitly state "insufficient literature evidence in indexed corpus".
7. MEDICAL DISCLAIMER: Always conclude with the standard screening disclaimer.
"""

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm = (np.linalg.norm(a) * np.linalg.norm(b))
    if norm == 0:
        return 0.0
    return float(np.dot(a, b) / norm)

def retrieve_relevant_passages(query: str, top_k: int = 3, threshold: float = 0.30) -> list[dict[str, Any]]:
    """Retrieves top-k literature chunks based on query embedding."""
    vector_store_path = os.path.join(os.path.dirname(__file__), "..", "data", "corpus_vector_store.json")
    if not os.path.exists(vector_store_path):
        return []
        
    with open(vector_store_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)
        
    from rag.ingest import mock_embedding
    query_vec = mock_embedding(query)
    
    scored = []
    for c in chunks:
        sim = cosine_similarity(query_vec, c["embedding"])
        if sim >= threshold:
            scored.append((sim, c))
            
    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for sim, c in scored[:top_k]:
        results.append({
            "title": c["doc_title"],
            "authors": c["authors"],
            "year": c["year"],
            "doi": c["doi"],
            "content": c["content"],
            "similarity": round(float(sim), 3)
        })
    return results

def generate_explanation(
    probability: float,
    label: int,
    confidence_band: str,
    top_features: list[dict[str, Any]],
    features: dict[str, float]
) -> tuple[str, list[dict[str, Any]]]:
    """
    Generates a cited, non-diagnostic screening explanation.
    Tries LLM (Gemini / OpenAI) first; falls back gracefully to deterministic synthesis.
    """
    query = f"Parkinson voice screening dysphonia {' '.join([f['feature'] for f in top_features])}"
    retrieved_docs = retrieve_relevant_passages(query, top_k=3)
    
    # Check if LLM API is available
    llm_provider = os.getenv("LLM_PROVIDER", "gemini").lower()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    
    if llm_provider == "gemini" and gemini_key:
        try:
            return call_gemini_llm(probability, label, confidence_band, top_features, features, retrieved_docs, gemini_key), retrieved_docs
        except Exception as e:
            print(f"Gemini API invocation failed: {e}. Falling back to deterministic explainer.")
            
    elif llm_provider == "openai" and openai_key:
        try:
            return call_openai_llm(probability, label, confidence_band, top_features, features, retrieved_docs, openai_key), retrieved_docs
        except Exception as e:
            print(f"OpenAI API invocation failed: {e}. Falling back to deterministic explainer.")
            
    # Deterministic Template-based Explainer (Literature Grounded)
    return deterministic_explanation(probability, label, confidence_band, top_features, features, retrieved_docs), retrieved_docs

def deterministic_explanation(
    probability: float,
    label: int,
    confidence_band: str,
    top_features: list[dict[str, Any]],
    features: dict[str, float],
    retrieved_docs: list[dict[str, Any]]
) -> str:
    """High-fidelity, deterministic literature-grounded explanation when external LLM API is unset."""
    prob_pct = round(probability * 100, 1)
    
    if label == 1:
        status_narrative = (
            f"The acoustic analysis model estimated an **{confidence_band.upper()}** (probabilistic risk score: **{prob_pct}%**) "
            "for vocal patterns associated with Parkinsonian dysphonia."
        )
    else:
        status_narrative = (
            f"The acoustic analysis model estimated a **{confidence_band.upper()}** (probabilistic risk score: **{prob_pct}%**). "
            "Your vocal stability metrics align primarily with healthy normative control ranges."
        )
        
    feature_bullets = []
    for f in top_features:
        name = f.get("feature", "Biomarker")
        val = f.get("value", 0.0)
        shap_val = f.get("shap_value", 0.0)
        ref_min = f.get("ref_min", "N/A")
        ref_max = f.get("ref_max", "N/A")
        unit = f.get("unit", "")
        direction = "increased" if shap_val > 0 else "reduced"
        
        feature_bullets.append(
            f"• **{name}**: Measured value was **{val:.4f} {unit}** (Healthy reference range: {ref_min} to {ref_max} {unit}). "
            f"This biomarker {direction} the screening risk score by {abs(shap_val):.3f} SHAP impact points."
        )
        
    citations_text = ""
    if retrieved_docs:
        citations_text = "\n\n### Peer-Reviewed Literature Grounding:\n"
        for idx, doc in enumerate(retrieved_docs, start=1):
            citations_text += (
                f"{idx}. **[{doc['authors']}, {doc['year']}]**: *{doc['title']}* ({doc['doi']})\n"
                f"   *Finding*: {doc['content'].splitlines()[-2] if len(doc['content'].splitlines()) > 2 else doc['content'][:150]}...\n"
            )
            
    clinical_advice = (
        "\n### Clinical Guidance & Next Steps:\n"
        "• **Consult a Neurologist**: Vocal changes are an early physiological marker but must be corroborated by "
        "comprehensive neurological motor examinations (e.g., MDS-UPDRS evaluation, resting tremor, rigidity assessment, and DAT-SPECT imaging).\n"
        "• **Re-test Guidance**: Ensure future recordings are conducted in a quiet acoustic setting with consistent mouth-to-microphone distance (~10 cm)."
    )
    
    disclaimer = (
        "\n\n---\n"
        "> **ACADEMIC RESEARCH DISCLAIMER**: Synapse-Voice is an educational research screening tool (EPICS project). "
        "It is NOT a diagnostic medical device. It does NOT replace medical evaluation, diagnosis, or clinical consultation."
    )
    
    return f"{status_narrative}\n\n### Key Acoustic Biomarkers (SHAP Attribution):\n" + "\n".join(feature_bullets) + citations_text + clinical_advice + disclaimer

def call_gemini_llm(prob, label, band, top_feats, feats, docs, api_key) -> str:
    """Invokes Gemini API for dynamic clinical synthesis."""
    import httpx
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"PATIENT SCREENING DATA:\n"
        f"- Probabilistic Risk: {prob*100:.1f}%\n"
        f"- Label: {label} (0=Healthy, 1=PD Risk)\n"
        f"- Confidence Band: {band}\n"
        f"- Top Biomarkers (SHAP):\n{json.dumps(top_feats, indent=2)}\n\n"
        f"RETRIEVED LITERATURE PASSAGES:\n{json.dumps(docs, indent=2)}\n\n"
        f"Generate a clear, compassionate, literature-cited screening summary:"
    )
    
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    with httpx.Client(timeout=15.0) as client:
        res = client.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

def call_openai_llm(prob, label, band, top_feats, feats, docs, api_key) -> str:
    """Invokes OpenAI API for dynamic clinical synthesis."""
    import httpx
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    
    prompt = (
        f"PATIENT SCREENING DATA:\n"
        f"- Probabilistic Risk: {prob*100:.1f}%\n"
        f"- Label: {label} (0=Healthy, 1=PD Risk)\n"
        f"- Confidence Band: {band}\n"
        f"- Top Biomarkers (SHAP):\n{json.dumps(top_feats, indent=2)}\n\n"
        f"RETRIEVED LITERATURE PASSAGES:\n{json.dumps(docs, indent=2)}"
    )
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    with httpx.Client(timeout=15.0) as client:
        res = client.post(url, json=payload, headers=headers)
        res.raise_for_status()
        data = res.json()
        return data["choices"][0]["message"]["content"]
