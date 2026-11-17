"""
Reproduction of Georgios Kalomitsinis (GitHub: georgios-kalomitsinis/Parkinson):
'Machine Learning algorithms for the diagnosis of Parkinson's Disease'
Repository: https://github.com/georgios-kalomitsinis/Parkinson

Core Contribution: Emphasizes subject-aware splitting (GroupKFold) to prevent patient memorization.
Evaluated under:
  (a) Own protocol: Standard GroupKFold without class balance adjustment.
  (b) Subject-grouped protocol: 5-fold StratifiedGroupKFold with class balancing and scaling.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GroupKFold, StratifiedGroupKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import warnings
warnings.filterwarnings('ignore')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from reproduction.common import load_data

def run_kalomitsinis():
    X, y, groups, feats = load_data()
    
    print("=" * 60)
    print("REPRODUCTION: Georgios Kalomitsinis (GitHub: Parkinson)")
    print("Core Methodology: Subject-wise GroupKFold splitting")
    print("=" * 60)
    
    # -------------------------------------------------------------
    # (a) Author's own protocol: Standard GroupKFold (k=5) without SMOTE
    # -------------------------------------------------------------
    gkf = GroupKFold(n_splits=5)
    
    rf_accs, rf_f1s, rf_aucs = [], [], []
    svm_accs, svm_f1s, svm_aucs = [], [], []
    lr_accs, lr_f1s, lr_aucs = [], [], []
    
    for train_idx, test_idx in gkf.split(X, y, groups=groups):
        X_tr, X_te = X.iloc[train_idx], X.iloc[test_idx]
        y_tr, y_te = y.iloc[train_idx], y.iloc[test_idx]
        
        sc = StandardScaler()
        X_tr_s = sc.fit_transform(X_tr)
        X_te_s = sc.transform(X_te)
        
        # Random Forest
        rf = RandomForestClassifier(n_estimators=100, random_state=42)
        rf.fit(X_tr_s, y_tr)
        p_rf = rf.predict(X_te_s)
        pr_rf = rf.predict_proba(X_te_s)[:, 1]
        rf_accs.append(accuracy_score(y_te, p_rf))
        rf_f1s.append(f1_score(y_te, p_rf, zero_division=0))
        rf_aucs.append(roc_auc_score(y_te, pr_rf))
        
        # SVM
        svm = SVC(C=1.0, kernel='rbf', probability=True, random_state=42)
        svm.fit(X_tr_s, y_tr)
        p_svm = svm.predict(X_te_s)
        pr_svm = svm.predict_proba(X_te_s)[:, 1]
        svm_accs.append(accuracy_score(y_te, p_svm))
        svm_f1s.append(f1_score(y_te, p_svm, zero_division=0))
        svm_aucs.append(roc_auc_score(y_te, pr_svm))
        
        # Logistic Regression
        lr = LogisticRegression(max_iter=1000, random_state=42)
        lr.fit(X_tr_s, y_tr)
        p_lr = lr.predict(X_te_s)
        pr_lr = lr.predict_proba(X_te_s)[:, 1]
        lr_accs.append(accuracy_score(y_te, p_lr))
        lr_f1s.append(f1_score(y_te, p_lr, zero_division=0))
        lr_aucs.append(roc_auc_score(y_te, pr_lr))
        
    print("\n(a) Own Protocol (Standard GroupKFold, k=5):")
    print(f"  Random Forest: Acc {np.mean(rf_accs)*100:.2f}% ± {np.std(rf_accs)*100:.2f}% | F1: {np.mean(rf_f1s):.4f} | ROC-AUC: {np.mean(rf_aucs):.4f}")
    print(f"  SVM (RBF):     Acc {np.mean(svm_accs)*100:.2f}% ± {np.std(svm_accs)*100:.2f}% | F1: {np.mean(svm_f1s):.4f} | ROC-AUC: {np.mean(svm_aucs):.4f}")
    print(f"  Logistic Reg:  Acc {np.mean(lr_accs)*100:.2f}% ± {np.std(lr_accs)*100:.2f}% | F1: {np.mean(lr_f1s):.4f} | ROC-AUC: {np.mean(lr_aucs):.4f}")
    
    # -------------------------------------------------------------
    # (b) Our StratifiedGroupKFold Protocol (Balanced stratification)
    # -------------------------------------------------------------
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    rf_sg_accs, rf_sg_f1s, rf_sg_aucs = [], [], []
    
    for train_idx, test_idx in sgkf.split(X, y, groups=groups):
        X_tr, X_te = X.iloc[train_idx], X.iloc[test_idx]
        y_tr, y_te = y.iloc[train_idx], y.iloc[test_idx]
        
        sc = StandardScaler()
        X_tr_s = sc.fit_transform(X_tr)
        X_te_s = sc.transform(X_te)
        
        rf = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42)
        rf.fit(X_tr_s, y_tr)
        p_rf = rf.predict(X_te_s)
        pr_rf = rf.predict_proba(X_te_s)[:, 1]
        
        rf_sg_accs.append(accuracy_score(y_te, p_rf))
        rf_sg_f1s.append(f1_score(y_te, p_rf, zero_division=0))
        rf_sg_aucs.append(roc_auc_score(y_te, pr_rf))
        
    print("\n(b) Subject-Grouped Protocol (StratifiedGroupKFold, k=5, Balanced RF):")
    print(f"  Random Forest: Acc {np.mean(rf_sg_accs)*100:.2f}% ± {np.std(rf_sg_accs)*100:.2f}% | F1: {np.mean(rf_sg_f1s):.4f} | ROC-AUC: {np.mean(rf_sg_aucs):.4f}")
    
    return {
        "work": "Kalomitsinis (GitHub)",
        "reported_metric": "Subject-wise CV: ~82-85% Acc",
        "reproduced_own": f"RF: {np.mean(rf_accs)*100:.2f}% ± {np.std(rf_accs)*100:.2f}%",
        "reproduced_grouped": f"RF: {np.mean(rf_sg_accs)*100:.2f}% ± {np.std(rf_sg_accs)*100:.2f}%",
        "diff_pct": (np.mean(rf_accs) - np.mean(rf_sg_accs)) * 100,
        "auc_grouped": np.mean(rf_sg_aucs),
        "f1_grouped": np.mean(rf_sg_f1s),
        "leakage_risk": "Low (Correctly utilizes group-aware cross-validation)",
        "notes": "One of the few open-source implementations to properly acknowledge and avoid recording-level leakage."
    }

if __name__ == '__main__':
    run_kalomitsinis()
