"""
Synapse-Voice State-of-the-Art Machine Learning Training & Evaluation Pipeline.

Dataset: Oxford Parkinson's Disease Detection Dataset (UCI ML Repository #174)
Located at: data main/parkinsons.data (195 sustained vowels, 31 subjects, 22 Praat acoustic biomarkers)

Evaluates:
- Logistic Regression (L2 regularized)
- Support Vector Classifier (RBF with probability calibration)
- Random Forest Classifier (tuned)
- ExtraTrees Classifier (tuned)
- XGBoost Classifier (tuned gradient boosted trees)
- LightGBM Classifier (tuned)
- Multi-Layer Perceptron (Neural Network)
- Champion Multi-Model Soft Voting Ensemble (ExtraTrees + XGBoost + LightGBM + RandomForest + Calibrated SVC)

Evaluation schemes:
1. 10-Fold Stratified Cross-Validation (Sample Benchmark)
2. 5-Fold StratifiedGroupKFold (Subject-Independent Zero-Leakage Cross-Validation)

Generates:
- best_model.joblib
- metrics_summary.json
- reference_ranges.json
- High-res ROC Curve & Confusion Matrix figures
"""

import json
import os
import sys
import warnings

import joblib
import matplotlib
import numpy as np

matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import shap

from sklearn.base import clone
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    auc,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedGroupKFold, StratifiedKFold
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

warnings.filterwarnings('ignore')

# Set LOKY_MAX_CPU_COUNT to avoid Windows subprocess query bottlenecks
os.environ['LOKY_MAX_CPU_COUNT'] = '4'

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from ml.src.features import REFERENCE_RANGES
from reproduction.common import load_data

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)


def build_candidate_models():
    """Builds tuned candidate model architectures."""
    return {
        "Logistic Regression": CalibratedClassifierCV(
            LogisticRegression(C=1.0, max_iter=1000, class_weight='balanced', random_state=RANDOM_SEED),
            method='sigmoid', cv=3
        ),
        "Calibrated SVC (RBF)": CalibratedClassifierCV(
            SVC(C=3.0, kernel='rbf', gamma='scale', class_weight='balanced', random_state=RANDOM_SEED),
            method='sigmoid', cv=3
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, max_depth=6, min_samples_split=2, min_samples_leaf=1,
            class_weight='balanced', random_state=RANDOM_SEED
        ),
        "ExtraTrees": ExtraTreesClassifier(
            n_estimators=300, max_depth=8, min_samples_split=2, min_samples_leaf=1,
            class_weight='balanced', random_state=RANDOM_SEED
        ),
        "XGBoost": XGBClassifier(
            n_estimators=150, max_depth=3, learning_rate=0.04, subsample=0.85,
            colsample_bytree=0.85, reg_alpha=0.1, reg_lambda=1.0,
            random_state=RANDOM_SEED, eval_metric='logloss'
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=120, max_depth=4, num_leaves=15, learning_rate=0.03,
            subsample=0.8, colsample_bytree=0.8, min_child_samples=5,
            random_state=RANDOM_SEED, verbose=-1
        ),
        "MLP (Neural Net)": MLPClassifier(
            hidden_layer_sizes=(64, 32), max_iter=1000, early_stopping=False,
            random_state=RANDOM_SEED
        ),
    }


def train_and_evaluate():
    print("=" * 80)
    print("SYNAPSE-VOICE ADVANCED ML RETRAINING & MULTI-MODEL ENSEMBLE SUITE")
    print("=" * 80)

    X, y, groups, feature_names = load_data()
    n_samples, n_features = X.shape
    n_subjects = groups.nunique()
    n_pd = int(np.sum(y == 1))
    n_hc = int(np.sum(y == 0))

    print(f"Dataset Loaded: {n_samples} phonations from {n_subjects} subjects ({n_features} acoustic biomarkers)")
    print(f"Class Balance:  {n_pd} Parkinson's ({n_pd/n_samples*100:.1f}%), {n_hc} Healthy Controls ({n_hc/n_samples*100:.1f}%)")

    # Build Champion Multi-Model Soft Voting Ensemble
    et_champion = ExtraTreesClassifier(n_estimators=300, max_depth=8, min_samples_split=2, random_state=RANDOM_SEED)
    xgb_champion = XGBClassifier(n_estimators=150, max_depth=3, learning_rate=0.04, subsample=0.85, colsample_bytree=0.85, reg_alpha=0.1, reg_lambda=1.0, random_state=RANDOM_SEED, eval_metric='logloss')
    lgb_champion = LGBMClassifier(n_estimators=120, max_depth=4, num_leaves=15, learning_rate=0.03, random_state=RANDOM_SEED, verbose=-1)
    rf_champion = RandomForestClassifier(n_estimators=300, max_depth=6, random_state=RANDOM_SEED)
    svc_champion = CalibratedClassifierCV(SVC(C=3.0, kernel='rbf', gamma='scale', random_state=RANDOM_SEED), method='sigmoid', cv=3)

    champion_ensemble = VotingClassifier(
        estimators=[
            ('et', et_champion),
            ('xgb', xgb_champion),
            ('lgb', lgb_champion),
            ('rf', rf_champion),
            ('svc', svc_champion)
        ],
        voting='soft',
        weights=[3, 2, 2, 2, 1]
    )

    candidate_models = build_candidate_models()
    candidate_models["Champion Ensemble (Multi-Model Soft Voting)"] = champion_ensemble

    # 1. Evaluate on 10-Fold Stratified Cross Validation
    print("\n" + "-" * 80)
    print("PHASE 1: 10-FOLD STRATIFIED CROSS-VALIDATION EVALUATION")
    print("-" * 80)

    skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=RANDOM_SEED)
    benchmark_results = {}

    for name, clf in candidate_models.items():
        fold_accs, fold_f1s, fold_aucs, fold_precs, fold_recs, fold_briers = [], [], [], [], [], []
        all_y_true, all_y_prob = [], []

        for train_idx, test_idx in skf.split(X, y):
            X_tr, X_te = X.iloc[train_idx], X.iloc[test_idx]
            y_tr, y_te = y.iloc[train_idx], y.iloc[test_idx]

            scaler = StandardScaler()
            X_tr_s = scaler.fit_transform(X_tr)
            X_te_s = scaler.transform(X_te)

            model_inst = clone(clf)
            model_inst.fit(X_tr_s, y_tr)

            preds = model_inst.predict(X_te_s)
            probs = model_inst.predict_proba(X_te_s)[:, 1] if hasattr(model_inst, "predict_proba") else preds.astype(float)

            fold_accs.append(accuracy_score(y_te, preds))
            fold_f1s.append(f1_score(y_te, preds, zero_division=0))
            fold_aucs.append(roc_auc_score(y_te, probs))
            fold_precs.append(precision_score(y_te, preds, zero_division=0))
            fold_recs.append(recall_score(y_te, preds, zero_division=0))
            fold_briers.append(brier_score_loss(y_te, probs))

            all_y_true.extend(y_te.tolist())
            all_y_prob.extend(probs.tolist())

        mean_acc = np.mean(fold_accs)
        std_acc = np.std(fold_accs)
        mean_f1 = np.mean(fold_f1s)
        mean_auc = np.mean(fold_aucs)
        mean_prec = np.mean(fold_precs)
        mean_rec = np.mean(fold_recs)
        mean_brier = np.mean(fold_briers)
        ci_acc = 1.96 * (std_acc / np.sqrt(10))

        p_prec, p_rec, _ = precision_recall_curve(all_y_true, all_y_prob)
        pr_auc = auc(p_rec, p_prec)

        benchmark_results[name] = {
            "accuracy": round(float(mean_acc), 4),
            "accuracy_std": round(float(std_acc), 4),
            "accuracy_ci95": round(float(ci_acc), 4),
            "precision": round(float(mean_prec), 4),
            "recall": round(float(mean_rec), 4),
            "f1": round(float(mean_f1), 4),
            "roc_auc": round(float(mean_auc), 4),
            "pr_auc": round(float(pr_auc), 4),
            "brier_score": round(float(mean_brier), 4),
            "all_y_true": all_y_true,
            "all_y_prob": all_y_prob
        }

        print(f"{name:45s} | Acc: {mean_acc*100:5.2f}% ± {std_acc*100:4.2f}% | F1: {mean_f1:6.4f} | ROC-AUC: {mean_auc:6.4f} | Recall: {mean_rec*100:5.2f}%")

    # 2. Evaluate on 5-Fold Subject-Independent StratifiedGroupKFold
    print("\n" + "-" * 80)
    print("PHASE 2: 5-FOLD SUBJECT-INDEPENDENT GROUPED CV EVALUATION (Zero Subject Leakage)")
    print("-" * 80)

    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    group_results = {}

    for name, clf in candidate_models.items():
        g_accs, g_f1s, g_aucs, g_precs, g_recs = [], [], [], [], []

        for train_idx, test_idx in sgkf.split(X, y, groups=groups):
            X_tr, X_te = X.iloc[train_idx], X.iloc[test_idx]
            y_tr, y_te = y.iloc[train_idx], y.iloc[test_idx]

            # Verify zero subject leakage
            assert len(set(groups.iloc[train_idx]).intersection(set(groups.iloc[test_idx]))) == 0

            scaler = StandardScaler()
            X_tr_s = scaler.fit_transform(X_tr)
            X_te_s = scaler.transform(X_te)

            model_inst = clone(clf)
            model_inst.fit(X_tr_s, y_tr)

            preds = model_inst.predict(X_te_s)
            probs = model_inst.predict_proba(X_te_s)[:, 1] if hasattr(model_inst, "predict_proba") else preds.astype(float)

            g_accs.append(accuracy_score(y_te, preds))
            g_f1s.append(f1_score(y_te, preds, zero_division=0))
            g_aucs.append(roc_auc_score(y_te, probs))
            g_precs.append(precision_score(y_te, preds, zero_division=0))
            g_recs.append(recall_score(y_te, preds, zero_division=0))

        group_results[name] = {
            "accuracy": round(float(np.mean(g_accs)), 4),
            "accuracy_std": round(float(np.std(g_accs)), 4),
            "f1": round(float(np.mean(g_f1s)), 4),
            "roc_auc": round(float(np.mean(g_aucs)), 4),
            "recall": round(float(np.mean(g_recs)), 4),
        }
        print(f"{name:45s} | Group Acc: {np.mean(g_accs)*100:5.2f}% | F1: {np.mean(g_f1s):6.4f} | Group ROC-AUC: {np.mean(g_aucs):6.4f}")

    # Select Champion Model
    champion_name = "Champion Ensemble (Multi-Model Soft Voting)"
    champion_metrics = benchmark_results[champion_name]

    print("\n" + "=" * 80)
    print(f"DEPLOYED CHAMPION ARCHITECTURE: {champion_name}")
    print(f"  Accuracy:            {champion_metrics['accuracy']*100:.2f}% ± {champion_metrics['accuracy_std']*100:.2f}% (95% CI: ±{champion_metrics['accuracy_ci95']*100:.2f}%)")
    print(f"  ROC-AUC:             {champion_metrics['roc_auc']:.4f}")
    print(f"  F1-Score:            {champion_metrics['f1']:.4f}")
    print(f"  Recall (Sensitivity):{champion_metrics['recall']*100:.2f}%")
    print(f"  Precision:           {champion_metrics['precision']*100:.2f}%")
    print(f"  Brier Loss:          {champion_metrics['brier_score']:.4f} (Calibrated Posterior Probabilities)")
    print("=" * 80)

    # Train Final Full Pipeline on Entire Dataset
    print("\nTraining Final Full Calibrated Pipeline on 100% of Dataset...")
    full_scaler = StandardScaler()
    X_scaled = full_scaler.fit_transform(X)

    final_model = clone(champion_ensemble)
    final_model.fit(X_scaled, y)

    # Fit SHAP Explainer on Champion Model
    print("Fitting SHAP Explainer...")
    try:
        background = X_scaled[:30]
        explainer = shap.Explainer(final_model.predict_proba, background)
        print("SHAP Explainer fitted successfully.")
    except Exception as e:
        print(f"SHAP Explainer note: {e}; fitting KernelExplainer fallback...")
        background = X_scaled[:15]
        explainer = shap.KernelExplainer(final_model.predict_proba, background)

    # Create model output directories
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    backend_models_dir = os.path.join(os.path.dirname(__file__), "..", "..", "backend", "app", "models_store")
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(backend_models_dir, exist_ok=True)

    # Save Pipeline and Components
    pipeline_bundle = {
        "model": final_model,
        "scaler": full_scaler,
        "selector": None,
        "explainer": explainer,
        "feature_names": feature_names,
        "best_config": champion_name,
        "metrics": champion_metrics,
        "group_metrics": group_results[champion_name],
        "all_benchmarks": {k: {m: v for m, v in vals.items() if m not in ("all_y_true", "all_y_prob")} for k, vals in benchmark_results.items()},
        "all_group_benchmarks": group_results
    }

    model_path = os.path.join(models_dir, "best_model.joblib")
    joblib.dump(pipeline_bundle, model_path)
    print(f"Saved best model bundle to: {model_path}")

    backend_model_path = os.path.join(backend_models_dir, "best_model.joblib")
    joblib.dump(pipeline_bundle, backend_model_path)
    print(f"Saved bundle to backend store: {backend_model_path}")

    # Save reference ranges
    with open(os.path.join(models_dir, "reference_ranges.json"), "w") as f:
        json.dump(REFERENCE_RANGES, f, indent=2)
    with open(os.path.join(backend_models_dir, "reference_ranges.json"), "w") as f:
        json.dump(REFERENCE_RANGES, f, indent=2)

    # Save metrics summary
    with open(os.path.join(models_dir, "metrics_summary.json"), "w") as f:
        json.dump(pipeline_bundle["all_benchmarks"], f, indent=2)
    with open(os.path.join(backend_models_dir, "metrics_summary.json"), "w") as f:
        json.dump(pipeline_bundle["all_benchmarks"], f, indent=2)

    # Generate Evaluation Figures
    generate_evaluation_figures(champion_metrics, models_dir)
    print("\nTraining, evaluation, and artifact generation complete!")


def generate_evaluation_figures(best_metrics: dict, out_dir: str):
    """Generates high-resolution publication-quality ROC Curve and Confusion Matrix figures."""
    y_true = np.array(best_metrics["all_y_true"])
    y_prob = np.array(best_metrics["all_y_prob"])
    y_pred = (y_prob >= 0.5).astype(int)

    # 1. ROC Curve
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    roc_auc = auc(fpr, tpr)

    plt.figure(figsize=(7, 6))
    plt.plot(fpr, tpr, color='#1D63FF', lw=2.5, label=f'Ensemble ROC (AUC = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='#94a3b8', lw=1.5, linestyle='--', label='Random Chance')
    plt.xlim([-0.02, 1.02])
    plt.ylim([-0.02, 1.02])
    plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=12, fontweight='bold')
    plt.ylabel('True Positive Rate (Sensitivity / Recall)', fontsize=12, fontweight='bold')
    plt.title("Multi-Model Champion Ensemble ROC Curve", fontsize=14, fontweight='bold', pad=12)
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
        xticklabels=['Healthy Control', "Parkinson's (PD)"],
        yticklabels=['Healthy Control', "Parkinson's (PD)"],
        annot_kws={'size': 14, 'fontweight': 'bold'}
    )
    plt.xlabel('Predicted Label', fontsize=12, labelpad=8, fontweight='bold')
    plt.ylabel('Ground Truth Label', fontsize=12, labelpad=8, fontweight='bold')
    plt.title('Calibrated Ensemble Confusion Matrix', fontsize=14, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, "confusion_matrix.png"), dpi=300)
    plt.close()


if __name__ == '__main__':
    train_and_evaluate()
