"""
Reproduction of Srinivasan et al. (Scientific Reports, 2024):
'Detection of Parkinson disease using multiclass machine learning approach'
DOI: 10.1038/s41598-024-64004-9

Reported: FNN ~96.5% Accuracy, KSVM ~94.8% Accuracy under 80:20 random train-test split with SMOTE.
Evaluated under:
  (a) Paper's own protocol: Naive random 80:20 split + SMOTE + FNN (MLP) & KNN.
  (b) Subject-grouped protocol: 5-fold StratifiedGroupKFold with SMOTE inside train folds only.
"""

import os
import sys
import warnings

import numpy as np
from imblearn.over_sampling import SMOTE
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedGroupKFold, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from reproduction.common import load_data


def run_srinivasan_2024():
    X, y, groups, feats = load_data()
    
    print("=" * 60)
    print("REPRODUCTION: Srinivasan et al. (Scientific Reports, 2024)")
    print("Reported: FNN ~96.5% Acc, KSVM ~94.8% Acc under 80:20 split with SMOTE")
    print("=" * 60)
    
    # -------------------------------------------------------------
    # (a) Paper's own protocol: 80:20 random split + SMOTE + FNN / KNN
    # -------------------------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)
    
    smote = SMOTE(random_state=42)
    X_train_sm, y_train_sm = smote.fit_resample(X_train_s, y_train)
    
    # FNN (Feed-forward Neural Network / MLP)
    fnn = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=800, activation='relu', random_state=42)
    fnn.fit(X_train_sm, y_train_sm)
    fnn_preds = fnn.predict(X_test_s)
    fnn_probs = fnn.predict_proba(X_test_s)[:, 1]
    
    fnn_acc_own = accuracy_score(y_test, fnn_preds)
    fnn_f1_own = f1_score(y_test, fnn_preds)
    fnn_auc_own = roc_auc_score(y_test, fnn_probs)
    
    # KNN
    knn = KNeighborsClassifier(n_neighbors=5, metric='minkowski', p=2)
    knn.fit(X_train_sm, y_train_sm)
    knn_preds = knn.predict(X_test_s)
    knn_acc_own = accuracy_score(y_test, knn_preds)
    knn_f1_own = f1_score(y_test, knn_preds)
    
    print("\n(a) Own Protocol (Random 80:20 Split + SMOTE):")
    print(f"  FNN Accuracy: {fnn_acc_own * 100:.2f}% | F1: {fnn_f1_own:.4f} | ROC-AUC: {fnn_auc_own:.4f}")
    print(f"  KNN Accuracy: {knn_acc_own * 100:.2f}% | F1: {knn_f1_own:.4f}")
    
    # -------------------------------------------------------------
    # (b) Subject-Grouped Protocol (StratifiedGroupKFold, 5 Folds)
    # -------------------------------------------------------------
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    
    fnn_accs, fnn_f1s, fnn_aucs = [], [], []
    knn_accs, knn_f1s, knn_aucs = [], [], []
    
    for fold, (train_idx, test_idx) in enumerate(sgkf.split(X, y, groups=groups)):
        X_tr, X_te = X.iloc[train_idx], X.iloc[test_idx]
        y_tr, y_te = y.iloc[train_idx], y.iloc[test_idx]
        
        sc = StandardScaler()
        X_tr_s = sc.fit_transform(X_tr)
        X_te_s = sc.transform(X_te)
        
        sm = SMOTE(random_state=42)
        X_tr_sm, y_tr_sm = sm.fit_resample(X_tr_s, y_tr)
        
        # FNN
        m = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=800, activation='relu', random_state=42)
        m.fit(X_tr_sm, y_tr_sm)
        p_fnn = m.predict(X_te_s)
        pr_fnn = m.predict_proba(X_te_s)[:, 1]
        
        fnn_accs.append(accuracy_score(y_te, p_fnn))
        fnn_f1s.append(f1_score(y_te, p_fnn, zero_division=0))
        fnn_aucs.append(roc_auc_score(y_te, pr_fnn))
        
        # KNN
        k = KNeighborsClassifier(n_neighbors=5, metric='minkowski', p=2)
        k.fit(X_tr_sm, y_tr_sm)
        p_knn = k.predict(X_te_s)
        pr_knn = k.predict_proba(X_te_s)[:, 1]
        
        knn_accs.append(accuracy_score(y_te, p_knn))
        knn_f1s.append(f1_score(y_te, p_knn, zero_division=0))
        knn_aucs.append(roc_auc_score(y_te, pr_knn))
    
    fnn_acc_grp = np.mean(fnn_accs)
    fnn_std_grp = np.std(fnn_accs)
    fnn_f1_grp = np.mean(fnn_f1s)
    fnn_auc_grp = np.mean(fnn_aucs)
    
    knn_acc_grp = np.mean(knn_accs)
    knn_std_grp = np.std(knn_accs)
    knn_f1_grp = np.mean(knn_f1s)
    knn_auc_grp = np.mean(knn_aucs)
    
    print("\n(b) Subject-Grouped Protocol (StratifiedGroupKFold, 5 Folds):")
    print(f"  FNN Accuracy: {fnn_acc_grp * 100:.2f}% ± {fnn_std_grp * 100:.2f}% | F1: {fnn_f1_grp:.4f} | ROC-AUC: {fnn_auc_grp:.4f}")
    print(f"  KNN Accuracy: {knn_acc_grp * 100:.2f}% ± {knn_std_grp * 100:.2f}% | F1: {knn_f1_grp:.4f} | ROC-AUC: {knn_auc_grp:.4f}")
    
    fnn_diff = (fnn_acc_own - fnn_acc_grp) * 100
    print(f"\nLeakage Drop for FNN: -{fnn_diff:.2f}%")
    
    return {
        "work": "Srinivasan et al. (2024)",
        "reported_metric": "FNN: ~96.5% Acc, KSVM: ~94.8% Acc",
        "reproduced_own": f"FNN: {fnn_acc_own * 100:.2f}%, KNN: {knn_acc_own * 100:.2f}%",
        "reproduced_grouped": f"FNN: {fnn_acc_grp * 100:.2f}% ± {fnn_std_grp * 100:.2f}%, KNN: {knn_acc_grp * 100:.2f}%",
        "diff_pct": fnn_diff,
        "auc_grouped": fnn_auc_grp,
        "f1_grouped": fnn_f1_grp,
        "leakage_risk": "High (random 80:20 split allows patient recordings in both partitions)",
        "notes": "FNN performance drops significantly when evaluated on unseen patients."
    }

if __name__ == '__main__':
    run_srinivasan_2024()
