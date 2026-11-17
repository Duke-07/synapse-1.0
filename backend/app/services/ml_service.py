"""
Machine Learning Inference & Biomarker Attribution Service.
Loads the trained champion model bundle, transforms raw features,
computes calibrated probabilities, and extracts SHAP values.
"""

import os
from typing import Any

import joblib
import numpy as np
import pandas as pd

from ml.src.features import CANONICAL_FEATURES, REFERENCE_RANGES


class MLService:
    def __init__(self):
        self.bundle = None
        self.model = None
        self.scaler = None
        self.selector = None
        self.explainer = None
        self.feature_names = CANONICAL_FEATURES
        self.load_model()
        
    def load_model(self):
        possible_paths = [
            os.path.join(os.path.dirname(__file__), "..", "models_store", "best_model.joblib"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "models", "best_model.joblib")
        ]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    self.bundle = joblib.load(p)
                    self.model = self.bundle["model"]
                    self.scaler = self.bundle["scaler"]
                    self.selector = self.bundle.get("selector")
                    self.explainer = self.bundle.get("explainer")
                    self.feature_names = self.bundle.get("feature_names", CANONICAL_FEATURES)
                    print(f"MLService: Successfully loaded model bundle from {p}")
                    return
                except Exception as e:
                    print(f"MLService: Error loading {p}: {e}")
        print("MLService: Model bundle not found; running in heuristic baseline mode.")
        
    def predict(self, features: dict[str, float]) -> tuple[float, int, str, dict[str, float], list[dict[str, Any]]]:
        """
        Executes prediction on 22 extracted biomarkers.
        Returns: (probability, label, confidence_band, shap_dict, top_biomarkers)
        """
        # Ensure ordered numpy row
        row = [features.get(f, 0.0) for f in self.feature_names]
        X_df = pd.DataFrame([row], columns=self.feature_names)
        
        if self.model is not None and self.scaler is not None:
            # Scale
            X_s = self.scaler.transform(X_df)
            
            # Feature selection if enabled in bundle
            if self.selector is not None:
                X_in = self.selector.transform(X_s)
            else:
                X_in = X_s
                
            # Calibrated probability
            probs = self.model.predict_proba(X_in)[0]
            prob = float(probs[1])
            label = int(prob >= 0.5)
            
            # SHAP Attribution
            shap_dict = self._compute_shap(X_in, X_s, features)
        else:
            # Heuristic baseline fallback
            # Compare key dysphonia indicators: PPE, HNR, Jitter
            ppe = features.get('PPE', 0.15)
            hnr = features.get('HNR', 22.0)
            jitter = features.get('MDVP:Jitter(%)', 0.003)
            risk_score = 0.3
            if ppe > 0.20:
                risk_score += 0.25
            if hnr < 18.0:
                risk_score += 0.25
            if jitter > 0.006:
                risk_score += 0.15
            prob = float(min(0.95, max(0.05, risk_score)))
            label = int(prob >= 0.5)
            shap_dict = {f: 0.01 for f in self.feature_names}
            shap_dict['PPE'] = 0.18 if ppe > 0.20 else -0.05
            shap_dict['HNR'] = 0.14 if hnr < 18.0 else -0.08
            
        # Determine clinical risk band
        if prob < 0.35:
            confidence_band = "Low Risk"
        elif prob <= 0.65:
            confidence_band = "Moderate Concern"
        else:
            confidence_band = "Elevated Risk"
            
        # Extract Top 3 contributing biomarkers
        top_biomarkers = self._extract_top_biomarkers(features, shap_dict)
        return prob, label, confidence_band, shap_dict, top_biomarkers
        
    def _compute_shap(self, X_in: np.ndarray, X_s: np.ndarray, features: dict[str, float]) -> dict[str, float]:
        """Computes or estimates SHAP feature importances."""
        shap_dict = {}
        try:
            if self.explainer is not None:
                sv = self.explainer(X_in)
                values = sv.values[0]
                if values.ndim > 1: # multi-class [n_samples, n_classes]
                    values = values[:, 1]
                # Map back to full feature space
                if self.selector is not None:
                    mask = self.selector.get_support()
                    v_idx = 0
                    for idx, f in enumerate(self.feature_names):
                        if mask[idx]:
                            shap_dict[f] = float(values[v_idx])
                            v_idx += 1
                        else:
                            shap_dict[f] = 0.0
                else:
                    for idx, f in enumerate(self.feature_names):
                        shap_dict[f] = float(values[idx])
                return shap_dict
        except Exception as e:
            print(f"SHAP computation exception: {e}; using analytical gradient approximation.")
            
        # Analytical approximation from standardized distance to healthy mean
        for f in self.feature_names:
            ref = REFERENCE_RANGES.get(f, {'min': 0, 'max': 1})
            mid = (ref['min'] + ref['max']) / 2.0
            span = max(1e-5, (ref['max'] - ref['min']) / 2.0)
            dev = (features.get(f, mid) - mid) / span
            # Negative features (e.g. HNR) where lower means disease
            if f in ('HNR', 'MDVP:Flo(Hz)'):
                dev = -dev
            shap_dict[f] = float(round(dev * 0.08, 4))
        return shap_dict

    def _extract_top_biomarkers(self, features: dict[str, float], shap_dict: dict[str, float]) -> list[dict[str, Any]]:
        # Sort by absolute SHAP value
        sorted_feats = sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)
        top = []
        for feat, val in sorted_feats[:3]:
            ref = REFERENCE_RANGES.get(feat, {'min': 0.0, 'max': 1.0, 'unit': '', 'label': feat})
            top.append({
                "feature": feat,
                "value": float(features.get(feat, 0.0)),
                "shap_value": float(round(val, 4)),
                "ref_min": ref['min'],
                "ref_max": ref['max'],
                "unit": ref['unit'],
                "label": ref['label']
            })
        return top

ml_service = MLService()
