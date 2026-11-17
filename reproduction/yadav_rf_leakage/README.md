# Reproduction: Yadav GitHub Baseline (Catastrophic Random Forest Leakage)

## 1. Repository Information
- **Title**: *Parkinson's Disease Detection using Random Forest and Decision Trees*
- **Author**: Popular GitHub Open-Source Parkinson's Classifier
- **Dataset**: Oxford Parkinson's Disease Detection Dataset (UCI ID 174)
- **Cohort**: 31 Subjects (23 PD, 8 Healthy), 195 recordings
- **Phonation Task**: Sustained vowel (`/a/`) phonation
- **Reported Metric**: **99.4% – 99.6% Accuracy** using Random Forest with unpartitioned recordings

---

## 2. Reproduction Results

| Protocol | Mean Accuracy | Fold / Split Std | ROC-AUC | F1-Score | Data Leakage Assessment |
|---|---|---|---|---|---|
| **Author Protocol (Random 80:20 Sample Split)** | **92.31%** | — | 0.9333 | 0.9524 | **Catastrophic Leakage** (Tree ensemble memorizes patient F0) |
| **Author Protocol (Random 10-Fold CV)** | **91.18%** | ± 6.71% | 0.9120 | 0.9412 | **Catastrophic Leakage** |
| **Our Subject-Isolated Protocol (`StratifiedGroupKFold`)** | **78.00%** | ± 5.51% | 0.7987 | 0.8599 | **Zero Leakage (Truly unseen individuals)** |
| **Empirical Performance Drop** | **-13.18%** | — | — | — | Eliminates misleading over-optimism |

---

## 3. How to Run This Reproduction
```bash
# From repository root
python reproduction/yadav_rf_leakage/reproduce.py
```
