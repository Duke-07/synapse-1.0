"""
Main FastAPI Application Entrypoint for Synapse-Voice.
"""

import logging
import os
import sys
import time

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

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from backend.app.api.endpoints import router as api_router
    from backend.app.api.auth_endpoints import router as auth_router
    from backend.app.core.config import settings
except ModuleNotFoundError:
    from app.api.endpoints import router as api_router
    from app.api.auth_endpoints import router as auth_router
    from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("synapse_voice")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=(
        "Synapse-Voice: Academic Research & Pre-Clinical Screening Aid for Parkinson's Disease Voice Biomarkers. "
        "Extracts 22 clinical acoustic biomarkers, executes calibrated ML inference under subject-independent grouped CV, "
        "and provides literature-grounded RAG explanations."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_origin_regex=r"https?://.*(localhost|127\.0\.0\.1|vercel\.app|onrender\.com).*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Logging Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    logger.info(f"{request.method} {request.url.path} completed in {process_time:.4f}s [status: {response.status_code}]")
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal server error occurred. Please try again or upload a valid uncompressed WAV file."}
    )

# Include API Routers under /api/v1
app.include_router(api_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": "/api/v1",
        "disclaimer": "Academic screening aid only. Not a medical diagnostic device."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
