"""Pydantic schemas for request and response validation."""

from typing import Any

from pydantic import BaseModel, Field


class BiomarkerAttribution(BaseModel):
    feature: str
    value: float
    shap_value: float
    ref_min: float
    ref_max: float
    unit: str
    label: str

class CitationItem(BaseModel):
    title: str
    authors: str
    year: int
    doi: str | None = None
    similarity: float

class AnalysisResponse(BaseModel):
    id: str
    probability: float = Field(..., description="Calibrated posterior probability between 0.0 and 1.0")
    label: int = Field(..., description="0 = Healthy Control, 1 = Elevated Parkinson's screening risk")
    confidence_band: str = Field(..., description="'Low Risk', 'Moderate Concern', or 'Elevated Risk'")
    features: dict[str, float] = Field(..., description="22 canonical acoustic biomarkers")
    shap_values: dict[str, float] = Field(..., description="Full SHAP feature attribution dictionary")
    top_biomarkers: list[BiomarkerAttribution] = Field(..., description="Top 3 contributing biomarkers")
    explanation: str = Field(..., description="Literature-grounded plain-language summary")
    literature_citations: list[CitationItem] = Field(default_factory=list)
    model_version: str = "v1.0.0-mlp-fs12"
    audio_quality: dict[str, Any] = Field(default_factory=dict)
    user_id: str | None = Field(default=None, description="Optional authenticated user ID")
    disclaimer: str = (
        "Synapse-Voice is an academic research screening aid (EPICS project) and NOT a certified medical diagnostic device. "
        "Consult a board-certified neurologist or licensed medical professional for clinical diagnosis."
    )
    created_at: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    analysis_id: str | None = None
    message: str
    history: list[ChatMessage] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str
    citations: list[dict[str, Any]] = Field(default_factory=list)
    analysis_id: str | None = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
    environment: str

class BenchmarkItem(BaseModel):
    work: str
    reported_metric: str
    reproduced_own: str
    reproduced_grouped: str
    diff_pct: float
    leakage_risk: str
    notes: str

class PaperItem(BaseModel):
    year: int
    authors: str
    title: str
    venue: str
    doi: str
    approach: str
    dataset: str
    metric: str
    protocol: str
    leakage: str

class BenchmarksResponse(BaseModel):
    literature_papers: list[PaperItem]
    reproduced_works: list[BenchmarkItem]
    model_summary: dict[str, Any]

# ==========================================
# Authentication & Email Verification Schemas
# ==========================================

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    is_verified: bool = False
    created_at: str

class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="Valid user email address")
    password: str = Field(..., min_length=8, description="Minimum 8 characters password")
    full_name: str = Field(..., min_length=2, description="User's full name")

class UserLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_sec: int = 86400 * 7 # 7 days
    user: UserProfile

class EmailVerificationRequest(BaseModel):
    email: str
    code: str = Field(..., description="6-digit verification code or token")

class ResendVerificationRequest(BaseModel):
    email: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class AuthMessageResponse(BaseModel):
    success: bool
    message: str
    detail: str | None = None
    verification_code_preview: str | None = None # Exposed in development/test mode for seamless verification
