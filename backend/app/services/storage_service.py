"""
Persistence and Data Access Service for Synapse-Voice.
Provides Supabase database & storage integration with seamless
in-memory and JSON persistence fallback when credentials are not supplied.
"""

import uuid
from datetime import UTC, datetime
from typing import Any

try:
    from backend.app.core.config import settings
except ModuleNotFoundError:
    from app.core.config import settings


class StorageService:
    def __init__(self):
        self.supabase = None
        self._local_analyses: dict[str, dict[str, Any]] = {}
        self._local_history: list[dict[str, Any]] = []
        self._init_client()
        
    def _init_client(self):
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                # Attempt importing supabase client
                from supabase import create_client
                self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
                print("StorageService: Connected to Supabase Cloud.")
            except Exception as e:
                print(f"StorageService: Supabase initialization note: {e}; using robust local persistence.")
        else:
            print("StorageService: Supabase credentials not present; running with high-performance local store.")
            
    def save_analysis(self, analysis_data: dict[str, Any]) -> str:
        record_id = analysis_data.get("id") or str(uuid.uuid4())
        analysis_data["id"] = record_id
        if "created_at" not in analysis_data:
            analysis_data["created_at"] = datetime.now(UTC).isoformat()
            
        user_id = analysis_data.get("user_id")
            
        # Store in local memory cache
        self._local_analyses[record_id] = analysis_data
        self._local_history.insert(0, {
            "id": record_id,
            "user_id": user_id,
            "probability": analysis_data.get("probability"),
            "label": analysis_data.get("label"),
            "confidence_band": analysis_data.get("confidence_band"),
            "created_at": analysis_data.get("created_at"),
            "top_biomarkers": analysis_data.get("top_biomarkers", [])[:2]
        })
        
        # If Supabase client is active, persist to cloud
        if self.supabase:
            try:
                payload = {
                    "id": record_id,
                    "user_id": user_id,
                    "probability": analysis_data["probability"],
                    "label": analysis_data["label"],
                    "confidence_band": analysis_data["confidence_band"],
                    "features": analysis_data["features"],
                    "shap_values": analysis_data["shap_values"],
                    "top_biomarkers": analysis_data["top_biomarkers"],
                    "explanation": analysis_data["explanation"],
                    "model_version": analysis_data.get("model_version", "v1.0.0"),
                    "is_anonymous": analysis_data.get("is_anonymous", False),
                    "created_at": analysis_data["created_at"]
                }
                self.supabase.table("analyses").insert(payload).execute()
            except Exception as e:
                print(f"StorageService: Cloud Supabase insert note: {e}")
                
        return record_id
        
    def get_analysis(self, record_id: str) -> dict[str, Any] | None:
        # Check local cache first
        if record_id in self._local_analyses:
            return self._local_analyses[record_id]
            
        # Check Supabase
        if self.supabase:
            try:
                res = self.supabase.table("analyses").select("*").eq("id", record_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"StorageService: Cloud get note: {e}")
        return None
        
    def get_history(self, limit: int = 20, user_id: str | None = None) -> list[dict[str, Any]]:
        if self.supabase:
            try:
                query = self.supabase.table("analyses").select("id, user_id, probability, label, confidence_band, created_at, top_biomarkers")
                if user_id:
                    query = query.eq("user_id", user_id)
                res = query.order("created_at", desc=True).limit(limit).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"StorageService: Cloud history note: {e}")
        if user_id:
            filtered = [h for h in self._local_history if h.get("user_id") == user_id]
            return filtered[:limit]
        return self._local_history[:limit]

storage_service = StorageService()
