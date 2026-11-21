"""
Convenience entrypoint script to launch the Synapse-Voice Python FastAPI backend locally.
Usage: python run_backend.py
"""

import os
import sys

# Ensure repository root is in sys.path
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print("  Synapse-Voice Backend Server (FastAPI + Praat Acoustic Engine)")
    print(f"  Local API URL: http://localhost:8000")
    print(f"  Swagger Docs:  http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
