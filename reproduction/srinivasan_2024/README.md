# Reproduction: Srinivasan et al. (2024) - Nature Scientific Reports

## 1. Original Paper Information
- **Title**: *Detection of Parkinson Disease Using Multiclass Machine Learning Approach*
- **Authors**: S. Srinivasan, R. Rajasekar, et al.
- **Venue**: *Scientific Reports (Nature Portfolio)*, 14:13670 (2024)
- **DOI**: [10.1038/s41598-024-64004-9](https://doi.org/10.1038/s41598-024-64004-9)
- **Dataset**: Oxford Parkinson's Disease Detection Dataset (UCI ID 174)
- **Cohort**: 31 Subjects (23 PD, 8 Healthy), 195 recordings
- **Phonation Task**: Sustained vowel (`/a/`) phonation
- **Reported Metric**: **Feedforward Neural Network (FNN): ~96.5% Accuracy**, **Kernel SVM: ~94.8% Accuracy** using Random 80:20 Split

---

## 2. Reproduction Results

| Model & Protocol | Mean Accuracy | Fold / Split Std | ROC-AUC | F1-Score | Data Leakage Assessment |
|---|---|---|---|---|---|
| **Author Protocol (Random 80:20 Sample Split) - FNN** | **94.87%** | — | 0.9620 | 0.9677 | **High Leakage Risk** (Subject phonations split across train & test) |
| **Author Protocol (Random 80:20 Sample Split) - KNN** | **92.31%** | — | 0.9280 | 0.9524 | **High Leakage Risk** |
| **Our Subject-Isolated Protocol (`StratifiedGroupKFold`) - FNN** | **77.23%** | ± 5.63% | 0.7677 | 0.8522 | **Zero Leakage (Truly unseen individuals)** |
| **Our Subject-Isolated Protocol (`StratifiedGroupKFold`) - KNN** | **70.07%** | ± 7.91% | 0.6840 | 0.8012 | **Zero Leakage** |
| **Empirical Performance Drop (FNN)** | **-17.64%** | — | — | — | Demonstrates severe over-optimism of random splits |

---

## 3. How to Run This Reproduction
```bash
# From repository root
python reproduction/srinivasan_2024/reproduce.py
```
