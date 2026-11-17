# Reproduction: Alshammri et al. (2023) - Frontiers in AI

## 1. Original Paper Information
- **Title**: *Machine Learning Approaches to Identify Parkinson's Disease Using Voice Signal Features*
- **Authors**: R. Alshammri, G. Alharbi, E. Alharbi, I. Almubark
- **Venue**: *Frontiers in Artificial Intelligence*, Vol. 6, Article 1084001 (2023)
- **DOI**: [10.3389/frai.2023.1084001](https://doi.org/10.3389/frai.2023.1084001)
- **Dataset**: Oxford Parkinson's Disease Detection Dataset (UCI ID 174)
- **Cohort**: 31 Subjects (23 PD, 8 Healthy), 195 recordings
- **Phonation Task**: Sustained vowel (`/a/`) phonation
- **Reported Metric**: **MLP: 98.31% Accuracy (99% F1)**, **SVM: 95.0% Accuracy (97% F1)** using SMOTE + Random 70:30 Split

---

## 2. Reproduction Results

| Model & Protocol | Mean Accuracy | Fold / Split Std | ROC-AUC | F1-Score | Data Leakage Assessment |
|---|---|---|---|---|---|
| **Author Protocol (Random 70:30 Sample Split) - MLP** | **91.53%** | — | 0.9412 | 0.9474 | **Severe Leakage** (recordings from same subject in train & test) |
| **Author Protocol (Random 70:30 Sample Split) - SVM** | **89.83%** | — | 0.8920 | 0.9362 | **Severe Leakage** |
| **Our Subject-Isolated Protocol (`StratifiedGroupKFold`) - MLP** | **80.12%** | ± 4.34% | 0.7885 | 0.8731 | **Zero Leakage (Evaluated on unseen patients)** |
| **Our Subject-Isolated Protocol (`StratifiedGroupKFold`) - SVM** | **73.14%** | ± 8.12% | 0.7102 | 0.8190 | **Zero Leakage** |
| **Empirical Performance Drop (MLP)** | **-11.41%** | — | — | — | Memorization of speaker anatomy eliminated |

---

## 3. How to Run This Reproduction
```bash
# From repository root
python reproduction/alshammri_2023/reproduce.py
```
