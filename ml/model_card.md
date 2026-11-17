# Model Card: Synapse-Voice Vocal Screening Classifier

Following the framework proposed by Mitchell et al. (*Model Cards for Model Reporting*, 2019).

---

## 1. Model Details

- **Model Name**: Synapse-Voice Neural Classifier (MLP with Feature Selection & Platt Calibration)
- **Model Version**: 1.0.0
- **Model Type**: Multi-Layer Perceptron (Architecture: 64 -> 32 -> 1, ReLU activation, Adam optimizer, early stopping) with `SelectKBest` (ANOVA F-value, $k=12$) and `CalibratedClassifierCV` (Platt Sigmoid scaling).
- **Date**: November 2026
- **License**: MIT License
- **Frameworks**: scikit-learn 1.4+, imbalanced-learn 0.12+, SHAP 0.45+, joblib 1.4+
- **Primary Point of Contact**: Synapse-Voice Development Team (EPICS Project)

---

## 2. Intended Use

- **Primary Intended Use**: Non-invasive, pre-clinical screening and triage aid for vocal dysphonia indicative of Parkinson's disease (hypokinetic dysarthria). Designed for research, educational, and telemedicine risk-triage workflows.
- **Intended Users**: Individuals seeking preliminary voice wellness assessments, telemedicine platforms, academic researchers, and speech-language pathology clinics.
- **Out-of-Scope & Prohibited Uses**:
  - **NEVER** to be used as a standalone diagnostic tool.
  - **NEVER** to formulate a formal medical diagnosis, prescribe pharmaceutical therapies, or override licensed neurological evaluations.
  - Not validated for pediatric populations or acute non-neurological laryngological disorders (e.g., vocal fold polyps, laryngitis, spasmodic dysphonia).

---

## 3. Training & Validation Data

- **Primary Dataset**: Oxford Parkinson's Disease Detection Dataset (UCI Machine Learning Repository ID 174; Little et al., 2007/2008).
- **Dataset Composition**: 195 voice recordings from 31 distinct human participants (23 diagnosed with idiopathic Parkinson's disease, 8 age- and sex-matched healthy controls).
- **Phonation Modality**: Sustained vowel phonation (`/a/`) held for several seconds.
- **Biomarkers**: 22 continuous acoustic features (pitch statistics, 5 jitter variations, 6 shimmer variations, NHR, HNR, RPDE, D2, DFA, spread1, spread2, PPE).
- **Class Balance**: 147 PD samples (75.4%), 48 Healthy Control samples (24.6%). Addressed via SMOTE applied strictly within training partitions.

---

## 4. Evaluation Protocol & Performance Metrics

### 4.1 Strict Subject-Independent Grouped Cross-Validation
To eliminate the severe recording-level data leakage widespread across published literature, evaluation is performed under a **5-Fold StratifiedGroupKFold** protocol:
- Every patient's recordings are held strictly in either the training set or the validation set.
- Zero patient overlap across folds ($\text{train\_subjects} \cap \text{val\_subjects} = \emptyset$).
- Preprocessing (`StandardScaler`) and oversampling (`SMOTE`) are executed strictly within the training folds.

### 4.2 Grouped-CV Performance (5-Fold StratifiedGroupKFold)

| Metric | Grouped-CV Mean | Fold-to-Fold Std Dev (±) | 95% Confidence Interval |
| :--- | :---: | :---: | :---: |
| **Accuracy** | **79.41%** | ± 7.77% | [72.60%, 86.22%] (± 6.81%) |
| **Precision** | **85.32%** | ± 6.42% | [79.69%, 90.95%] |
| **Recall (Sensitivity)** | **89.14%** | ± 8.11% | [82.03%, 96.25%] |
| **F1-Score** | **0.8695** | ± 0.052 | [0.8239, 0.9151] |
| **ROC-AUC** | **0.7963** | ± 0.071 | [0.7341, 0.8585] |
| **PR-AUC** | **0.9348** | ± 0.038 | [0.9015, 0.9681] |

---

## 5. Comparison Against Reproduced Baselines

| Model / Work | Evaluation Protocol | Accuracy | ROC-AUC | F1-Score | Data Leakage Risk |
| :--- | :--- | :---: | :---: | :---: | :--- |
| Alshammri et al. (2023) MLP | Random 70:30 Split (Leaked) | 91.53% | 0.9848 | 0.9438 | Severe (Recordings in both splits) |
| Srinivasan et al. (2024) FNN | Random 80:20 Split (Leaked) | 94.87% | 0.9897 | 0.9655 | Severe (Patient memorization) |
| Yadav Baseline (Random Forest) | Random 10-Fold CV (Leaked) | 91.18% | 0.9685 | 0.9433 | Severe (Unpartitioned patients) |
| Little et al. (2008) RBF-SVM | Subject-Grouped CV | 78.96% | 0.6335 | 0.8687 | Low (Grouped evaluation) |
| Kalomitsinis (GitHub) Random Forest | Subject-Grouped CV | 75.63% | 0.7550 | 0.8413 | Low (Grouped evaluation) |
| **Synapse-Voice Champion (MLP 'FS-12')** | **Subject-Grouped CV** | **79.41%** | **0.7963** | **0.8695** | **Zero Leakage (StratifiedGroupKFold)** |

*Takeaway*: While naive random splits falsely suggest >95% accuracy, our subject-grouped evaluation demonstrates that **79.41% accuracy and 0.7963 ROC-AUC** represent honest, generalizable performance on unseen individuals.

---

## 6. Explainability & Interpretability

- **SHAP (Shapley Additive exPlanations)**: The pipeline computes individualized Shapley attributions for each inference.
- **Top Biomarker Drivers**: In concordance with Ghaheri et al. (2024) and Little et al. (2008), the model's highest-magnitude decision drivers are:
  1. `PPE` (Pitch Period Entropy)
  2. `spread1` (Nonlinear fundamental frequency variation)
  3. `MDVP:Fo(Hz)` (Average vocal fundamental pitch)
  4. `RPDE` (Recurrence Period Density Entropy)
  5. `HNR` (Harmonics-to-Noise Ratio)
- **Reference Range Validation**: Outputs are accompanied by a normative comparison against healthy control 5th–95th percentile intervals.

---

## 7. Ethical Considerations & Limitations

1. **Cohort Diversity**: The training cohort consists of 31 predominantly elderly individuals (mean age 65.8). Generalization to younger patients, non-English native speakers, or specific gender minorities has not been empirically verified.
2. **Acoustic Environment**: The model was trained on high-fidelity, sound-booth recordings. Ambient room reverberation and smartphone microphone compression may alter fine-grained perturbation metrics. Front-end SNR filtering mitigates this risk.
3. **Medical Disclaimer**: Every user interface view and API response carries a non-negotiable screening disclaimer advising users to consult licensed medical specialists.
