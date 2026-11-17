"""
Reproduction of Mayank Yadav / High-Accuracy GitHub Random Forest Baseline:
'Detection of Parkinson's Disease using Random Forest'
Claimed Metric: 99.4% - 99.6% Accuracy on UCI 174 dataset.

Purpose:
Directly demonstrate the catastrophic effect of recording-level data leakage.
Evaluated under:
  (a) Author's own protocol: Naive random train-test split / random 10-fold CV without subject grouping.
  (b) Subject-grouped protocol: 5-fold StratifiedGroupKFold ensuring strict subject isolation.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import StratifiedKFold, StratifiedGroupKFold, cross_validate, train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import warnings
warnings.filterwarnings('ignore')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from reproduction.common import load_data

def run_yadav_rf_leakage():
    X, y, groups, feats = load_data()
    
    print("=" * 60)
    print("REPRODUCTION: High-Accuracy Naive Random Forest (Claimed ~99.6%)")
    print("Focus: The Anatomy of Data Leakage on UCI 174")
    print("=" * 60)
    
    # -------------------------------------------------------------
    # (a) Author's own protocol: Naive random split & 10-fold CV
    # -------------------------------------------------------------
    rf_naive = RandomForestClassifier(n_estimators=100, max_depth=None, random_state=42)
    
    # Test on a specific random split first
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    sc = StandardScaler()
    X_tr_s = sc.fit_transform(X_tr)
    X_te_s = sc.transform(X_te)
    rf_naive.fit(X_tr_s, y_tr)
    split_acc = accuracy_score(y_te, rf_naive.predict(X_te_s))
    split_auc = roc_auc_score(y_te, rf_naive.predict_proba(X_te_s)[:, 1])
    
    # Random 10-fold CV across samples
    skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    scores = cross_validate(
        rf_naive, X, y, cv=skf,
        scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
    )
    acc_sample_mean = np.mean(scores['test_accuracy'])
    acc_sample_std = np.std(scores['test_accuracy'])
    f1_sample_mean = np.mean(scores['test_f1'])
    auc_sample_mean = np.mean(scores['test_roc_auc'])
    
    print("\n(a) Own Protocol (Sample-level Random Partition):")
    print(f"  Random 80:20 Split Accuracy: {split_acc * 100:.2f}% | ROC-AUC: {split_auc:.4f}")
    print(f"  Sample-level 10-Fold CV Acc: {acc_sample_mean * 100:.2f}% ± {acc_sample_std * 100:.2f}%")
    print(f"  F1-Score: {f1_sample_mean:.4f} | ROC-AUC: {auc_sample_mean:.4f}")
    
    # -------------------------------------------------------------
    # (b) Subject-Grouped Protocol (StratifiedGroupKFold, 5 Folds)
    # -------------------------------------------------------------
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    
    accs, precs, recs, f1s, aucs = [], [], [], [], []
    
    for fold, (train_idx, test_idx) in enumerate(sgkf.split(X, y, groups=groups)):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        
        # Verify complete patient independence
        tr_subs = set(groups.iloc[train_idx])
        te_subs = set(groups.iloc[test_idx])
        assert len(tr_subs.intersection(te_subs)) == 0
        
        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)
        
        rf = RandomForestClassifier(n_estimators=100, max_depth=None, random_state=42)
        rf.fit(X_train_s, y_train)
        
        preds = rf.predict(X_test_s)
        probs = rf.predict_proba(X_test_s)[:, 1]
        
        accs.append(accuracy_score(y_test, preds))
        precs.append(precision_score(y_test, preds, zero_division=0))
        recs.append(recall_score(y_test, preds, zero_division=0))
        f1s.append(f1_score(y_test, preds, zero_division=0))
        aucs.append(roc_auc_score(y_test, probs))
    
    acc_grp_mean = np.mean(accs)
    acc_grp_std = np.std(accs)
    f1_grp_mean = np.mean(f1s)
    auc_grp_mean = np.mean(aucs)
    
    print("\n(b) Subject-Grouped Protocol (StratifiedGroupKFold, 5 Folds):")
    print(f"  Accuracy: {acc_grp_mean * 100:.2f}% ± {acc_grp_std * 100:.2f}%")
    print(f"  F1-Score: {f1_grp_mean:.4f}")
    print(f"  ROC-AUC:  {auc_grp_mean:.4f}")
    
    diff = (acc_sample_mean - acc_grp_mean) * 100
    print(f"\nCRITICAL LEAKAGE FINDING:")
    print(f"  Sample-level accuracy: {acc_sample_mean * 100:.2f}%")
    print(f"  Grouped-level accuracy: {acc_grp_mean * 100:.2f}%")
    print(f"  Accuracy Collapse Due to Patient Memorization: -{diff:.2f}%!")
    
    return {
        "work": "Yadav (GitHub RF Baseline)",
        "reported_metric": "99.4% - 99.6% Accuracy",
        "reproduced_own": f"80:20 Split: {split_acc * 100:.2f}%, 10-Fold: {acc_sample_mean * 100:.2f}% ± {acc_sample_std * 100:.2f}%",
        "reproduced_grouped": f"{acc_grp_mean * 100:.2f}% ± {acc_grp_std * 100:.2f}%",
        "diff_pct": diff,
        "auc_grouped": auc_grp_mean,
        "f1_grouped": f1_grp_mean,
        "leakage_risk": "Catastrophic (unpartitioned patient recordings allow tree ensemble to memorize vocal fundamental pitch and anatomy)",
        "notes": "Classic example of recording leakage. Trees memorize patient-specific baseline F0, achieving near-perfect sample accuracy that drops ~15% on unseen patients."
    }

if __name__ == '__main__':
    run_yadav_rf_leakage()
