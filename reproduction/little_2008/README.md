# Reproduction: Little et al. (2008) - IEEE TBME

## 1. Original Paper Information
- **Title**: *Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease*
- **Authors**: M. A. Little, P. E. McSharry, E. J. Hunter, J. Spielman, L. O. Ramig
- **Venue**: *IEEE Transactions on Biomedical Engineering (TBME)*, Vol. 56, No. 4, pp. 1015-1022 (2009 / Online 2008)
- **DOI**: [10.1109/TBME.2008.2005954](https://doi.org/10.1109/TBME.2008.2005954)
- **Dataset**: Oxford Parkinson's Disease Detection Dataset (UCI ID 174)
- **Cohort**: 31 Subjects (23 PD, 8 Healthy Controls), 195 recordings
- **Phonation Task**: Sustained vowel (`/a/`) phonation
- **Reported Metric**: **91.4% Accuracy** using 4-feature subset (`PPE`, `spread1`, `RPDE`, `DFA`) + RBF Kernel SVM

---

## 2. Reproduction Results

| Protocol | Mean Accuracy | Fold / Split Std | ROC-AUC | F1-Score | Data Leakage Assessment |
|---|---|---|---|---|---|
| **Author Protocol (Bootstrap/Sample Split)** | **88.53%** | ± 9.43% | 0.8521 | 0.9234 | Moderate (Phonation samples overlap across resamples) |
| **Our Subject-Isolated Protocol (`StratifiedGroupKFold`)** | **78.96%** | ± 7.61% | 0.6335 | 0.8687 | **Zero Leakage (True unseen patient generalization)** |
| **Empirical Performance Drop** | **-9.57%** | — | — | — | Demonstrates true patient generalization ceiling |

---

## 3. How to Run This Reproduction
```bash
# From repository root
python reproduction/little_2008/reproduce.py
```
