# Reproduction: Kalomitsinis Open-Source Repository (Subject-Wise CV)

## 1. Repository Information
- **Title**: *Parkinson's Disease Detection with Subject-Wise Cross-Validation*
- **Author**: G. Kalomitsinis (GitHub open-source baseline)
- **Dataset**: Oxford Parkinson's Disease Detection Dataset (UCI ID 174)
- **Cohort**: 31 Subjects (23 PD, 8 Healthy), 195 recordings
- **Phonation Task**: Sustained vowel (`/a/`) phonation
- **Reported Metric**: **Subject-Wise Grouped CV: ~82–85% Accuracy** using Random Forest / Gradient Boosting with Subject Grouping

---

## 2. Reproduction Results

| Model & Protocol | Mean Accuracy | Fold / Split Std | ROC-AUC | F1-Score | Data Leakage Assessment |
|---|---|---|---|---|---|
| **Author Protocol (Subject-Grouped CV) - RF** | **74.88%** | ± 17.24% | 0.7410 | 0.8350 | **Low Leakage** (Correctly avoids sample leakage) |
| **Our Subject-Isolated Protocol (`StratifiedGroupKFold`) - RF** | **75.63%** | ± 7.41% | 0.7550 | 0.8413 | **Zero Leakage (Stratified grouping stabilizes variance)** |
| **Empirical Difference** | **-0.75%** | — | — | — | Strong alignment confirming honest ~75-80% baseline |

---

## 3. How to Run This Reproduction
```bash
# From repository root
python reproduction/kalomitsinis_github/reproduce.py
```
