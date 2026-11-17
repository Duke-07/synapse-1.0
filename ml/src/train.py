"""
Synapse-Voice Machine Learning Training & Evaluation Pipeline.

Implements rigorous subject-independent StratifiedGroupKFold (k=5) evaluation across
6 model architectures:
- Logistic Regression
- SVM-RBF
- KNN
- Random Forest
- XGBoost
- MLP (Neural Network)

Compares full features vs. feature selection, applies probability calibration,
fits SHAP explainability, saves artifacts, and computes metrics with 95% confidence intervals.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from xgboost import XGBClassifier

from sklearn.preprocessing import StandardScaler
from sklearn.base import clone
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, auc, confusion_matrix, roc_curve
)
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.over_sampling import SMOTE
import shap
import warnings
warnings.filterwarnings('ignore')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from reproduction.common import load_data
from ml.src.features import REFERENCE_RANGES, CANONICAL_FEATURES

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

def train_and_evaluate():
    print("=" * 75)
    print("SYNAPSE-VOICE ML PIPELINE: SUBJECT-INDEPENDENT GROUPED CV TRAINING")
    print("=" * 75)
    
    X, y, groups, feature_names = load_data()
    n_samples, n_features = X.shape
    n_subjects = groups.nunique()
    n_pd = int(np.sum(y == 1))
    n_hc = int(np.sum(y == 0))
    
    print(f"Dataset: {n_samples} recordings from {n_subjects} subjects.")
    print(f"Class Balance: {n_pd} PD ({n_pd/n_samples*100:.1f}%), {n_hc} Controls ({n_hc/n_samples*100:.1f}%)")
    
    # Define candidate models
    # Calculate scale_pos_weight for XGBoost (~ 48 / 147 = 0.33 or inverse = 3.0)
    pos_weight = n_hc / float(n_pd)
    
    models = {
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=1000, class_weight='balanced', random_state=RANDOM_SEED),
        "SVM-RBF": SVC(C=3.0, gamma='scale', kernel='rbf', probability=True, class_weight='balanced', random_state=RANDOM_SEED),
        "KNN": KNeighborsClassifier(n_neighbors=5, weights='distance'),
        "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=5, class_weight='balanced', random_state=RANDOM_SEED),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.05, scale_pos_weight=pos_weight, eval_metric='logloss', random_state=RANDOM_SEED),
        "MLP (Neural Net)": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=1000, early_stopping=False, random_state=RANDOM_SEED)
    }
    
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    
    benchmark_results = {}
    
    print("\nEvaluating Models under 5-Fold StratifiedGroupKFold...")
    print("-" * 75)
    
    for name, clf in models.items():
        # Evaluate Full Features vs SelectKBest(k=12)
        for use_fs in [False, True]:
            config_name = f"{name} ('FS-12')" if use_fs else name
            
            fold_accs, fold_precs, fold_recs, fold_f1s, fold_aucs, fold_praucs = [], [], [], [], [], []
            all_y_true, all_y_prob = [], []
            
            for fold, (train_idx, test_idx) in enumerate(sgkf.split(X, y, groups=groups)):
                X_tr, X_te = X.iloc[train_idx], X.iloc[test_idx]
                y_tr, y_te = y.iloc[train_idx], y.iloc[test_idx]
                
                # Verify zero subject leakage
                tr_sub = set(groups.iloc[train_idx])
                te_sub = set(groups.iloc[test_idx])
                assert len(tr_sub.intersection(te_sub)) == 0, f"Leakage detected in fold {fold}!"
                
                # Scaler fitted strictly on train fold
                scaler = StandardScaler()
                X_tr_s = scaler.fit_transform(X_tr)
                X_te_s = scaler.transform(X_te)
                
                # SMOTE applied inside train fold
                smote = SMOTE(random_state=RANDOM_SEED)
                X_tr_sm, y_tr_sm = smote.fit_resample(X_tr_s, y_tr)
                
                if use_fs:
                    selector = SelectKBest(f_classif, k=12)
                    X_tr_sm = selector.fit_transform(X_tr_sm, y_tr_sm)
                    X_te_s = selector.transform(X_te_s)
                    
                # Fit model
                model_inst = clone(clf)
                model_inst.fit(X_tr_sm, y_tr_sm)
                
                preds = model_inst.predict(X_te_s)
                if hasattr(model_inst, "predict_proba"):
                    probs = model_inst.predict_proba(X_te_s)[:, 1]
                else:
                    d_vals = model_inst.decision_function(X_te_s)
                    probs = 1.0 / (1.0 + np.exp(-d_vals))
                    
                fold_accs.append(accuracy_score(y_te, preds))
                fold_precs.append(precision_score(y_te, preds, zero_division=0))
                fold_recs.append(recall_score(y_te, preds, zero_division=0))
                fold_f1s.append(f1_score(y_te, preds, zero_division=0))
                fold_aucs.append(roc_auc_score(y_te, probs))
                
                p_prec, p_rec, _ = precision_recall_curve(y_te, probs)
                fold_praucs.append(auc(p_rec, p_prec))
                
                all_y_true.extend(y_te.tolist())
                all_y_prob.extend(probs.tolist())
                
            mean_acc = np.mean(fold_accs)
            std_acc = np.std(fold_accs)
            mean_f1 = np.mean(fold_f1s)
            mean_auc = np.mean(fold_aucs)
            mean_prauc = np.mean(fold_praucs)
            
            # 95% Confidence Interval for Accuracy: ± 1.96 * (std / sqrt(k))
            ci_acc = 1.96 * (std_acc / np.sqrt(5))
            
            benchmark_results[config_name] = {
                "accuracy": round(float(mean_acc), 4),
                "accuracy_std": round(float(std_acc), 4),
                "accuracy_ci95": round(float(ci_acc), 4),
                "precision": round(float(np.mean(fold_precs)), 4),
                "recall": round(float(np.mean(fold_recs)), 4),
                "f1": round(float(mean_f1), 4),
                "roc_auc": round(float(mean_auc), 4),
                "pr_auc": round(float(mean_prauc), 4),
                "all_y_true": all_y_true,
                "all_y_prob": all_y_prob
            }
            
            print(f"{config_name:25s} | Acc: {mean_acc*100:5.2f}% ± {std_acc*100:4.2f}% (CI: ±{ci_acc*100:4.2f}%) | F1: {mean_f1:6.4f} | ROC-AUC: {mean_auc:6.4f}")
            
    # Select Best Model based on composite score: 0.5 * ROC-AUC + 0.5 * F1
    best_config = max(benchmark_results.keys(), key=lambda k: 0.5 * benchmark_results[k]["roc_auc"] + 0.5 * benchmark_results[k]["f1"])
    print("\n" + "=" * 75)
    print(f"CHOSEN CHAMPION MODEL: {best_config}")
    print(f"  Accuracy:  {benchmark_results[best_config]['accuracy']*100:.2f}% ± {benchmark_results[best_config]['accuracy_std']*100:.2f}% (95% CI: ±{benchmark_results[best_config]['accuracy_ci95']*100:.2f}%)")
    print(f"  F1-Score:  {benchmark_results[best_config]['f1']:.4f}")
    print(f"  ROC-AUC:   {benchmark_results[best_config]['roc_auc']:.4f}")
    print(f"  PR-AUC:    {benchmark_results[best_config]['pr_auc']:.4f}")
    print("=" * 75)
    
    # Train Final Full Pipeline on Entire Dataset with Probability Calibration
    use_fs_best = "FS-12" in best_config
    base_name = best_config.replace(" ('FS-12')", "")
    base_model = models[base_name]
    
    full_scaler = StandardScaler()
    X_scaled = full_scaler.fit_transform(X)
    smote = SMOTE(random_state=RANDOM_SEED)
    X_resampled, y_resampled = smote.fit_resample(X_scaled, y)
    
    if use_fs_best:
        selector = SelectKBest(f_classif, k=12)
        X_resampled = selector.fit_transform(X_resampled, y_resampled)
    else:
        selector = None
        
    base_model.fit(X_resampled, y_resampled)
    
    # Calibrate Probabilities
    calibrated_model = CalibratedClassifierCV(estimator=base_model, method='sigmoid', cv=5)
    calibrated_model.fit(X_resampled, y_resampled)
    
    # Fit SHAP Explainer
    print("\nFitting SHAP Explainer...")
    try:
        background = X_resampled[:25]
        explainer = shap.Explainer(calibrated_model.predict_proba, background)
        print("SHAP explainer fitted successfully.")
    except Exception as e:
        print(f"SHAP Explainer fallback: {e}")
        background = X_resampled[:15]
        explainer = shap.KernelExplainer(calibrated_model.predict_proba, background)
        
    # Create output directories
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    backend_models_dir = os.path.join(os.path.dirname(__file__), "..", "..", "backend", "app", "models_store")
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(backend_models_dir, exist_ok=True)
    
    # Save Pipeline and Components
    pipeline_bundle = {
        "model": calibrated_model,
        "base_model": base_model,
        "scaler": full_scaler,
        "selector": selector,
        "explainer": explainer,
        "feature_names": feature_names,
        "use_fs": use_fs_best,
        "best_config": best_config,
        "metrics": benchmark_results[best_config],
        "all_benchmarks": {k: {m: v for m, v in vals.items() if m not in ("all_y_true", "all_y_prob")} for k, vals in benchmark_results.items()}
    }
    
    model_path = os.path.join(models_dir, "best_model.joblib")
    joblib.dump(pipeline_bundle, model_path)
    print(f"Saved best model bundle to: {model_path}")
    
    # Also save to backend
    backend_model_path = os.path.join(backend_models_dir, "best_model.joblib")
    joblib.dump(pipeline_bundle, backend_model_path)
    print(f"Saved bundle to backend store: {backend_model_path}")
    
    # Save reference ranges
    ref_path = os.path.join(models_dir, "reference_ranges.json")
    with open(ref_path, "w") as f:
        json.dump(REFERENCE_RANGES, f, indent=2)
    with open(os.path.join(backend_models_dir, "reference_ranges.json"), "w") as f:
        json.dump(REFERENCE_RANGES, f, indent=2)
        
    # Save metrics summary
    metrics_path = os.path.join(models_dir, "metrics_summary.json")
    with open(metrics_path, "w") as f:
        json.dump(pipeline_bundle["all_benchmarks"], f, indent=2)
    with open(os.path.join(backend_models_dir, "metrics_summary.json"), "w") as f:
        json.dump(pipeline_bundle["all_benchmarks"], f, indent=2)
        
    # Generate Evaluation Visualizations
    generate_evaluation_figures(benchmark_results[best_config], models_dir)
    print("\nTraining and artifact generation complete!")

def generate_evaluation_figures(best_metrics: dict, out_dir: str):
    """Generates ROC Curve and Confusion Matrix figures."""
    y_true = np.array(best_metrics["all_y_true"])
    y_prob = np.array(best_metrics["all_y_prob"])
    y_pred = (y_prob >= 0.5).astype(int)
    
    # 1. ROC Curve
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    roc_auc = auc(fpr, tpr)
    
    plt.figure(figsize=(7, 6))
    plt.plot(fpr, tpr, color='#0284c7', lw=2.5, label=f'Grouped-CV ROC (AUC = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='#94a3b8', lw=1.5, linestyle='--', label='Chance')
    plt.xlim([-0.02, 1.02])
    plt.ylim([-0.02, 1.02])
    plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=12)
    plt.ylabel('True Positive Rate (Sensitivity / Recall)', fontsize=12)
    plt.title("Subject-Independent Grouped-CV ROC Curve", fontsize=14, fontweight='bold', pad=12)
    plt.legend(loc="lower right", fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, "roc_curve.png"), dpi=300)
    plt.close()
    
    # 2. Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues', cbar=False,
        xticklabels=['Healthy Control', 'Parkinson\'s (PD)'],
        yticklabels=['Healthy Control', 'Parkinson\'s (PD)'],
        annot_kws={'size': 14, 'fontweight': 'bold'}
    )
    plt.xlabel('Predicted Label', fontsize=12, labelpad=8)
    plt.ylabel('Ground Truth Label', fontsize=12, labelpad=8)
    plt.title('Subject-Grouped Confusion Matrix', fontsize=14, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, "confusion_matrix.png"), dpi=300)
    plt.close()

if __name__ == '__main__':
    train_and_evaluate()
