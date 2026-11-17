"""
Comprehensive Pytest Test Suite for Synapse-Voice Backend API & Feature Extractor.
"""

import io

import numpy as np
import pytest
import soundfile as sf
from fastapi.testclient import TestClient

from backend.app.main import app
from ml.src.features import extract_features_from_audio, generate_synthetic_vowel

client = TestClient(app)

@pytest.fixture
def synthetic_wav_bytes():
    """Generates synthetic sustained /a/ audio in memory."""
    audio = generate_synthetic_vowel(duration=2.5, sr=44100, f0=155.0)
    buffer = io.BytesIO()
    sf.write(buffer, audio, 44100, format='WAV')
    buffer.seek(0)
    return buffer.read()

@pytest.fixture
def silent_wav_bytes():
    """Generates silent audio in memory to test audio quality check rejection."""
    audio = np.zeros(44100 * 2, dtype=np.float32)
    buffer = io.BytesIO()
    sf.write(buffer, audio, 44100, format='WAV')
    buffer.seek(0)
    return buffer.read()

def test_health_endpoint():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert data["model_loaded"] is True

def test_benchmarks_endpoint():
    res = client.get("/api/v1/benchmarks")
    assert res.status_code == 200
    data = res.json()
    assert "literature_papers" in data
    assert len(data["literature_papers"]) >= 8
    assert "reproduced_works" in data
    assert len(data["reproduced_works"]) >= 4

def test_feature_extractor_synthetic(tmp_path):
    """Verifies that the acoustic extractor outputs exactly 22 clinical biomarkers."""
    wav_file = tmp_path / "test_synth.wav"
    audio = generate_synthetic_vowel(duration=2.0, sr=44100, f0=160.0)
    sf.write(str(wav_file), audio, 44100)
    
    feats = extract_features_from_audio(str(wav_file))
    assert len(feats) == 22
    assert "PPE" in feats
    assert "spread1" in feats
    assert "HNR" in feats
    assert "MDVP:Fo(Hz)" in feats
    assert feats["MDVP:Fo(Hz)"] > 100.0

def test_audio_quality_rejection(silent_wav_bytes):
    """Silent audio should be rejected with HTTP 422."""
    files = {"audio": ("silent.wav", silent_wav_bytes, "audio/wav")}
    res = client.post("/api/v1/analyze", files=files, data={"consent": "true"})
    assert res.status_code == 422
    assert "silent" in res.json()["detail"].lower()

def test_invalid_file_type():
    """Unsupported format (.txt) should be rejected with HTTP 400."""
    files = {"audio": ("test.txt", b"not audio data", "text/plain")}
    res = client.post("/api/v1/analyze", files=files, data={"consent": "true"})
    assert res.status_code == 400
    assert "unsupported" in res.json()["detail"].lower()

def test_analyze_valid_audio(synthetic_wav_bytes):
    """End-to-end inference on valid synthetic speech audio."""
    files = {"audio": ("voice.wav", synthetic_wav_bytes, "audio/wav")}
    res = client.post(
        "/api/v1/analyze",
        files=files,
        data={"consent": "true", "anonymous": "false"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    assert 0.0 <= data["probability"] <= 1.0
    assert data["label"] in (0, 1)
    assert data["confidence_band"] in ("Low Risk", "Moderate Concern", "Elevated Risk")
    assert len(data["features"]) == 22
    assert len(data["top_biomarkers"]) == 3
    assert len(data["explanation"]) > 50
    assert "disclaimer" in data
    
    # Verify retrieval by ID
    res2 = client.get(f"/api/v1/results/{data['id']}")
    assert res2.status_code == 200
    assert res2.json()["id"] == data["id"]

def test_chat_followup():
    """Tests RAG follow-up Q&A endpoint."""
    res = client.post(
        "/api/v1/chat",
        json={"message": "Why does Pitch Period Entropy matter in Parkinson's?"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert "citations" in data
