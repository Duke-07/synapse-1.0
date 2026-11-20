"""
End-to-End System Smoke Test.
Validates live HTTP API endpoints under real server execution.
"""

import io
import sys
import time
import numpy as np
import httpx
import soundfile as sf
import subprocess

def create_synthetic_vowel_wav() -> bytes:
    """Creates a 3.0-second 22,050 Hz synthetic sustained vowel /a/ waveform."""
    sr = 22050
    duration = 3.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Fundamental frequency ~180 Hz with slight natural jitter
    f0 = 180.0
    jitter = 0.003 * np.sin(2 * np.pi * 5 * t)
    phase = 2 * np.pi * f0 * t + jitter
    # Formants for /a/ vowel: F1=730Hz, F2=1090Hz, F3=2440Hz
    signal = 0.6 * np.sin(phase) + 0.3 * np.sin(2 * phase) + 0.15 * np.sin(3 * phase)
    # Normalize amplitude
    signal = signal / (np.max(np.abs(signal)) + 1e-6) * 0.75
    
    bio = io.BytesIO()
    sf.write(bio, signal.astype(np.float32), sr, format='WAV')
    bio.seek(0)
    return bio.read()

def main():
    print("=== SYNAPSE-VOICE END-TO-END SMOKE TEST ===")
    
    # 1. Start backend process
    print("[1/5] Launching FastAPI backend server...")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8008"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    base_url = "http://127.0.0.1:8008/api/v1"
    
    try:
        # Wait for server to bind
        ready = False
        client = httpx.Client(timeout=10.0)
        for _ in range(25):
            if proc.poll() is not None:
                stdout, stderr = proc.communicate()
                print("Backend process exited prematurely!")
                print(f"STDOUT:\n{stdout}")
                print(f"STDERR:\n{stderr}")
                sys.exit(1)
            try:
                r = client.get(f"{base_url}/health")
                if r.status_code == 200:
                    ready = True
                    break
            except Exception:
                time.sleep(0.5)
                
        if not ready:
            stdout, stderr = proc.communicate(timeout=2)
            print("ERROR: Backend server failed to start in time.")
            print(f"STDOUT:\n{stdout}")
            print(f"STDERR:\n{stderr}")
            sys.exit(1)
            
        print("[1/5] OK: Backend server online at http://127.0.0.1:8008")
        
        # 2. Health check
        print("[2/5] Testing GET /health...")
        health = client.get(f"{base_url}/health").json()
        assert health["status"] == "healthy", f"Health status invalid: {health}"
        print(f"      Model loaded: {health['model_loaded']}")
        print("      PASS: /health returned 200 OK")
        
        # 3. Benchmarks check
        print("[3/5] Testing GET /benchmarks...")
        bench = client.get(f"{base_url}/benchmarks").json()
        assert len(bench["literature_papers"]) == 10, f"Expected 10 papers, got {len(bench['literature_papers'])}"
        assert len(bench["reproduced_works"]) == 5, f"Expected 5 reproductions, got {len(bench['reproduced_works'])}"
        print("      PASS: 10 papers & 5 benchmark reproductions validated")
        
        # 4. Phonation Screening Analysis (POST /analyze)
        print("[4/5] Testing POST /analyze with synthetic /a/ vowel phonation...")
        wav_bytes = create_synthetic_vowel_wav()
        files = {"audio": ("test_phonation.wav", wav_bytes, "audio/wav")}
        data = {"anonymous": "true", "consent": "true"}
        
        resp = client.post(f"{base_url}/analyze", files=files, data=data)
        assert resp.status_code == 200, f"Analysis failed: {resp.status_code} {resp.text}"
        res = resp.json()
        
        analysis_id = res["id"]
        prob = res["probability"]
        band = res["confidence_band"]
        features = res["features"]
        shap_vals = res["shap_values"]
        assert len(shap_vals) > 0, "SHAP values should not be empty"
        citations = res["literature_citations"]
        explanation = res["explanation"]
        
        print(f"      Assigned Screening ID: {analysis_id}")
        print(f"      Anomaly Probability: {prob * 100:.2f}% ({band})")
        print(f"      Extracted Features Count: {len(features)} biomarkers")
        print(f"      Top Biomarkers Attributed: {len(res['top_biomarkers'])}")
        print(f"      Literature Citations: {len(citations)} papers matched")
        print(f"      Explanation preview: {explanation[:120]}...")
        
        assert len(features) == 22, f"Expected 22 features, got {len(features)}"
        assert "PPE" in features, "PPE feature missing"
        assert "HNR" in features, "HNR feature missing"
        print("      PASS: Full acoustic feature extraction and classification succeeded")
        
        # 5. Chat assistant query (POST /chat)
        print("[5/5] Testing POST /chat scoped to analysis...")
        chat_req = {
            "message": "Why is Pitch Period Entropy (PPE) relevant for Parkinson voice screening?",
            "analysis_id": analysis_id
        }
        chat_resp = client.post(f"{base_url}/chat", json=chat_req)
        assert chat_resp.status_code == 200, f"Chat failed: {chat_resp.text}"
        reply = chat_resp.json()["reply"]
        print(f"      Chat reply preview: {reply[:140]}...")
        assert len(reply) > 20, "Chat response was empty"
        print("      PASS: RAG chat assistant validated")
        
        print("\n==============================================")
        print("ALL END-TO-END SMOKE TESTS PASSED SUCCESSFULLY")
        print("==============================================")
        
    finally:
        print("Shutting down test backend process...")
        proc.terminate()
        proc.wait(timeout=5)

if __name__ == "__main__":
    main()
