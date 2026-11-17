"""
Reproduction of Alshammri et al. (2023 Frontiers in AI):
'Machine learning approaches to identify Parkinson's disease using voice signal features'
DOI: 10.3389/frai.2023.1084001

Reported: MLP 98.31% Accuracy (99% F1-score); SVM 95.0% Accuracy under 70:30 random train-test split with SMOTE.
Evaluated under:
  (a) Paper's own protocol: Naive random 70:30 split + SMOTE on train + MLP and SVM.
  (b) Subject-grouped protocol: 5-fold StratifiedGroupKFold with SMOTE inside train folds only.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, StratifiedGroupKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE
import warnings
warnings.filterwarnings('ignore')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from reproduction.common import load_data

def run_alshammri_2023():
    X, y, groups, feats = load_data()
    
    print("=" * 60)
    print("REPRODUCTION: Alshammri et al. (2023 Frontiers in AI)")
    print("Reported: MLP 98.31% Acc (99% F1), SVM 95.0% Acc under 70:30 split")
    print("=" * 60)
    
    # -------------------------------------------------------------
    # (a) Paper's own protocol: Random 70:30 train-test split + SMOTE
    # -------------------------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)
    
    smote = SMOTE(random_state=42)
    X_train_sm, y_train_sm = smote.fit_resample(X_train_s, y_train)
    
    # MLP Classifier configured as per paper
    mlp = MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=1000, random_state=42, activation='relu')
    mlp.fit(X_train_sm, y_train_sm)
    mlp_preds = mlp.predict(X_test_s)
    mlp_probs = mlp.predict_proba(X_test_s)[:, 1]
    
    mlp_acc_own = accuracy_score(y_test, mlp_preds)
    mlp_f1_own = f1_score(y_test, mlp_preds)
    mlp_auc_own = roc_auc_score(y_test, mlp_probs)
    
    # SVM Classifier
    svm = SVC(C=10.0, kernel='rbf', gamma='scale', probability=True, random_state=42)
    svm.fit(X_train_sm, y_train_sm)
    svm_preds = svm.predict(X_test_s)
    svm_probs = svm.predict_proba(X_test_s)[:, 1]
    svm_acc_own = accuracy_score(y_test, svm_preds)
    svm_f1_own = f1_score(y_test, svm_preds)
    
    print("\n(a) Own Protocol (Random 70:30 Split + SMOTE):")
    print(f"  MLP Accuracy: {mlp_acc_own * 100:.2f}% | F1: {mlp_f1_own:.4f} | ROC-AUC: {mlp_auc_own:.4f}")
    print(f"  SVM Accuracy: {svm_acc_own * 100:.2f}% | F1: {svm_f1_own:.4f}")
    
    # -------------------------------------------------------------
    # (b) Subject-Grouped Protocol (StratifiedGroupKFold, 5 Folds)
    # -------------------------------------------------------------
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    
    mlp_accs, mlp_f1s, mlp_aucs = [], [], []
    svm_accs, svm_f1s, svm_aucs = [], [], []
    
    for fold, (train_idx, test_idx) in enumerate(sgkf.split(X, y, groups=groups)):
        X_tr, X_te = X.iloc[train_idx], X.iloc[test_idx]
        y_tr, y_te = y.iloc[train_idx], y.iloc[test_idx]
        
        # Scaling
        sc = StandardScaler()
        X_tr_s = sc.fit_transform(X_tr)
        X_te_s = sc.transform(X_te)
        
        # SMOTE strictly inside training fold
        sm = SMOTE(random_state=42)
        X_tr_sm, y_tr_sm = sm.fit_resample(X_tr_s, y_tr)
        
        # Fit MLP
        m = MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=1000, random_state=42, activation='relu')
        m.fit(X_tr_sm, y_tr_sm)
        p_mlp = m.predict(X_te_s)
        pr_mlp = m.predict_proba(X_te_s)[:, 1]
        
        mlp_accs.append(accuracy_score(y_te, p_mlp))
        mlp_f1s.append(f1_score(y_te, p_mlp, zero_division=0))
        mlp_aucs.append(roc_auc_score(y_te, pr_mlp))
        
        # Fit SVM
        s = SVC(C=10.0, kernel='rbf', gamma='scale', probability=True, random_state=42)
        s.fit(X_tr_sm, y_tr_sm)
        p_svm = s.predict(X_te_s)
        pr_svm = s.predict_proba(X_te_s)[:, 1]
        
        svm_accs.append(accuracy_score(y_te, p_svm))
        svm_f1s.append(f1_score(y_te, p_svm, zero_division=0))
        svm_aucs.append(roc_auc_score(y_te, pr_svm))
    
    mlp_acc_grp = np.mean(mlp_accs)
    mlp_std_grp = np.std(mlp_accs)
    mlp_f1_grp = np.mean(mlp_f1s)
    mlp_auc_grp = np.mean(mlp_aucs)
    
    svm_acc_grp = np.mean(svm_accs)
    svm_std_grp = np.std(svm_accs)
    svm_f1_grp = np.mean(svm_f1s)
    svm_auc_grp = np.mean(svm_aucs)
    
    print("\n(b) Subject-Grouped Protocol (StratifiedGroupKFold, 5 Folds):")
    print(f"  MLP Accuracy: {mlp_acc_grp * 100:.2f}% ± {mlp_std_grp * 100:.2f}% | F1: {mlp_f1_grp:.4f} | ROC-AUC: {mlp_auc_grp:.4f}")
    print(f"  SVM Accuracy: {svm_acc_grp * 100:.2f}% ± {svm_std_grp * 100:.2f}% | F1: {svm_f1_grp:.4f} | ROC-AUC: {svm_auc_grp:.4f}")
    
    mlp_diff = (mlp_acc_own - mlp_acc_grp) * 100
    print(f"\nLeakage Drop for MLP: -{mlp_diff:.2f}% (from {mlp_acc_own * 100:.2f}% down to {mlp_acc_grp * 100:.2f}%)")
    
    return {
        "work": "Alshammri et al. (2023)",
        "reported_metric": "MLP: 98.31% Acc, SVM: 95.0% Acc",
        "reproduced_own": f"MLP: {mlp_acc_own * 100:.2f}%, SVM: {svm_acc_own * 100:.2f}%",
        "reproduced_grouped": f"MLP: {mlp_acc_grp * 100:.2f}% ± {mlp_std_grp * 100:.2f}%, SVM: {svm_acc_grp * 100:.2f}%",
        "diff_pct": mlp_diff,
        "auc_grouped": mlp_auc_grp,
        "f1_grouped": mlp_f1_grp,
        "leakage_risk": "Severe (naive 70:30 random train-test split over 195 recordings from 31 subjects)",
        "notes": "Demonstrates severe data leakage. Subject isolation drops MLP accuracy significantly."
    }

if __name__ == '__main__':
    run_alshammri_2023()
