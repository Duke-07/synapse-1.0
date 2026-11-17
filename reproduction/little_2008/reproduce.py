"""
Reproduction of Little et al. (2008 / 2009 IEEE TBME):
'Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease'
DOI: 10.1109/TBME.2008.2005954

Reported: 91.4% classification accuracy with 4 selected features (PPE, spread1, RPDE, DFA) + RBF SVM.
Evaluated under:
  (a) Paper's own protocol: 4-feature subset with SVM on sample-level evaluation / bootstrap resampling.
  (b) Subject-grouped protocol: 5-fold StratifiedGroupKFold isolated by patient.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import StratifiedKFold, StratifiedGroupKFold, cross_validate
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# Ensure root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from reproduction.common import load_data

def run_little_2008():
    X, y, groups, feats = load_data()
    
    # 4 features selected by Little et al.
    selected_features = ['PPE', 'spread1', 'RPDE', 'DFA']
    X_sub = X[selected_features].copy()
    
    print("=" * 60)
    print("REPRODUCTION: Little et al. (2008 / 2009 IEEE TBME)")
    print(f"Target features: {selected_features}")
    print(f"Reported Metric: 91.4% accuracy (RBF SVM)")
    print("=" * 60)
    
    # -------------------------------------------------------------
    # (a) Paper's own protocol (Sample-level evaluation without patient grouping)
    # -------------------------------------------------------------
    pipe_sample = Pipeline([
        ('scaler', StandardScaler()),
        ('svm', SVC(C=5.0, gamma='scale', kernel='rbf', probability=True, random_state=42))
    ])
    
    # Standard 10-fold CV (sample-level, common interpretation of bootstrap validation)
    skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    scores_sample = cross_validate(
        pipe_sample, X_sub, y, cv=skf,
        scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
    )
    
    acc_sample_mean = np.mean(scores_sample['test_accuracy'])
    acc_sample_std = np.std(scores_sample['test_accuracy'])
    f1_sample_mean = np.mean(scores_sample['test_f1'])
    auc_sample_mean = np.mean(scores_sample['test_roc_auc'])
    
    print("\n(a) Own Protocol (Sample-level 10-Fold CV):")
    print(f"  Accuracy: {acc_sample_mean * 100:.2f}% ± {acc_sample_std * 100:.2f}%")
    print(f"  F1-Score: {f1_sample_mean:.4f}")
    print(f"  ROC-AUC:  {auc_sample_mean:.4f}")
    
    # -------------------------------------------------------------
    # (b) Subject-Grouped Protocol (StratifiedGroupKFold, zero patient leakage)
    # -------------------------------------------------------------
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    
    accuracies, precisions, recalls, f1s, aucs = [], [], [], [], []
    
    for fold, (train_idx, test_idx) in enumerate(sgkf.split(X_sub, y, groups=groups)):
        X_train, X_test = X_sub.iloc[train_idx], X_sub.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        
        # Verify strict subject separation
        train_sub = set(groups.iloc[train_idx])
        test_sub = set(groups.iloc[test_idx])
        assert len(train_sub.intersection(test_sub)) == 0, "Patient leakage detected!"
        
        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)
        
        clf = SVC(C=5.0, gamma='scale', kernel='rbf', probability=True, random_state=42)
        clf.fit(X_train_s, y_train)
        
        preds = clf.predict(X_test_s)
        probs = clf.predict_proba(X_test_s)[:, 1]
        
        accuracies.append(accuracy_score(y_test, preds))
        precisions.append(precision_score(y_test, preds, zero_division=0))
        recalls.append(recall_score(y_test, preds, zero_division=0))
        f1s.append(f1_score(y_test, preds, zero_division=0))
        aucs.append(roc_auc_score(y_test, probs))
    
    acc_grp_mean = np.mean(accuracies)
    acc_grp_std = np.std(accuracies)
    f1_grp_mean = np.mean(f1s)
    auc_grp_mean = np.mean(aucs)
    
    print("\n(b) Subject-Grouped Protocol (StratifiedGroupKFold, 5 Folds):")
    print(f"  Accuracy: {acc_grp_mean * 100:.2f}% ± {acc_grp_std * 100:.2f}%")
    print(f"  F1-Score: {f1_grp_mean:.4f}")
    print(f"  ROC-AUC:  {auc_grp_mean:.4f}")
    
    diff = (acc_sample_mean - acc_grp_mean) * 100
    print(f"\nDiscrepancy (Sample vs. Grouped Accuracy Drop): -{diff:.2f}%")
    
    return {
        "work": "Little et al. (2008)",
        "reported_metric": "91.4% Accuracy",
        "reproduced_own": f"{acc_sample_mean * 100:.2f}% ± {acc_sample_std * 100:.2f}%",
        "reproduced_grouped": f"{acc_grp_mean * 100:.2f}% ± {acc_grp_std * 100:.2f}%",
        "diff_pct": diff,
        "auc_grouped": auc_grp_mean,
        "f1_grouped": f1_grp_mean,
        "leakage_risk": "Moderate (repetitive phonations across bootstrap resamples in original study)",
        "notes": "Using 4-feature subset (PPE, spread1, RPDE, DFA) + RBF SVM. Performance drops when patients are isolated."
    }

if __name__ == '__main__':
    run_little_2008()
