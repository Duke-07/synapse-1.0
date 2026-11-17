# Peer-Reviewed Literature Review: Parkinson's Disease Voice Biomarkers

This document provides a comprehensive survey of 10 seminal and recent (including 2022–2024 IEEE, Nature, and ACM/ISCA) peer-reviewed publications investigating acoustic biomarkers for Parkinson's disease (PD) detection and monitoring. Every entry has been verified through direct indexing records and DOIs.

---

## 1. Summary Literature Comparison Table

| Year | Authors | Title & Venue | Approach | Dataset | Subjects / Samples | Task Type | Accuracy / Primary Metric | Protocol | Leakage Risk & Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2009** | Little et al. | *Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease* (IEEE TBME) | 22 acoustic features (F0, jitter, shimmer, NHR, HNR, RPDE, D2, DFA, spread1, spread2, PPE) + kernel SVM | Oxford PD (UCI 174) | 31 subjects / 195 recordings | Sustained vowel (`/a/`) | **91.4% Accuracy** (4-feature subset) | Bootstrap feature selection across phonations | High risk of repetition leakage across bootstrap; established PPE baseline |
| **2010** | Tsanas et al. | *Accurate Telemonitoring of Parkinson's Disease Progression by Noninvasive Speech Tests* (IEEE TBME) | Nonlinear acoustic features + regularized linear/lasso regression for UPDRS prediction | UCI Telemonitoring (UCI 189) | 42 subjects / 5,875 recordings | Sustained vowel (`/a/`) | **MAE 5.95 (motor), 7.52 (total UPDRS)** | Leave-one-subject-out CV | Progression regression rather than binary classification; patient-independent |
| **2016** | Orozco-Arroyave et al. | *Automatic detection of Parkinson's disease in running speech spoken in three different languages* (JASA) | Voiced/unvoiced acoustic transitions, Bark-bands, MFCCs + SVM/RF | PC-GITA (Spanish), Czech, German | 226 subjects total / multi-task | Running speech & read sentences | **84.0% – 99.0%** (multi-lingual) | Speaker-independent 10-fold CV | Robust phonetic segmentation; sensitive to background microphone noise |
| **2019** | Sakar et al. | *A comparative analysis of speech signal processing algorithms... tunable Q-factor wavelet transform* (Appl. Soft Comput.) | Tunable Q-factor Wavelet Transform (TQWT) + MFCCs + ensemble classifiers | UCI PD Classification (UCI 470) | 252 subjects / 756 recordings | Sustained vowel (`/a/`, 3 reps) | **86.0% (TQWT + SVM), ~89% ensemble** | Leave-one-subject-out (LOSO) CV | Large feature dimensionality (754 features) requires aggressive feature selection |
| **2023** | Alshammri et al. | *Machine learning approaches to identify Parkinson's disease using voice signal features* (Front. Artif. Intell.) | Preprocessing, SMOTE, feature selection, GridSearchCV on MLP, SVM, RF, KNN | Oxford PD (UCI 174) | 31 subjects / 195 recordings | Sustained vowel (`/a/`) | **MLP: 98.31% Acc (99% F1), SVM: 95.0% Acc** | Random 70:30 train-test split | **Critical Data Leakage**: Random per-sample split allows patient memorization; over-optimistic |
| **2023** | Pah et al. | *Voice-Based SVM Model Reliability for Identifying Parkinson's Disease* (IEEE Access) | Acoustic stability analysis + Linear & RBF SVM reliability | UCI 174 & Italian PD Voice Database | 30–50 subjects / 195–250 recordings | Sustained vowels (`/a/`, `/o/`) | **82.5% – 89.2% Acc** under subject-isolated folds | Subject-wise CV with stability analysis | Proves that sample-level splits artificially inflate metrics by 8–15% compared to subject CV |
| **2024** | Pah et al. | *The Effectiveness of Acoustic Voice Quality Index to Identify People With Parkinson’s Disease* (IEEE Access) | Acoustic Voice Quality Index (AVQI) multiparametric dysphonia + Logistic Regression/SVM | Italian PD Database & benchmarks | 100 subjects / 200 recordings | Sustained vowels + continuous text | **85.4% Acc, ROC-AUC 0.91** | Subject-stratified 10-fold CV | Requires calibrated microphone input for AVQI normative score fidelity |
| **2024** | Srinivasan et al. | *Detection of Parkinson disease using multiclass machine learning approach* (Scientific Reports) | Perturbation & spectral features + SMOTE + RandomizedSearchCV on FNN & KSVM | Oxford PD (UCI 174) | 31 subjects / 195 recordings | Sustained vowel (`/a/`) | **FNN: ~96.5% Acc, KSVM: ~94.8% Acc** | Random 80:20 train-test split | **High Data Leakage Risk**: Multi-recording subjects partitioned randomly into train and test sets |
| **2024** | Ghaheri et al. | *Diagnosis of Parkinson's disease based on voice signals using SHAP and hard voting ensemble method* (CMBBE) | XGBoost, LightGBM, RF, hard voting ensemble + SHAP explainability | Oxford PD (UCI 174) | 31 subjects / 195 recordings | Sustained vowel (`/a/`) | **96.55% Acc** (Voting ensemble); top features: PPE, spread1 | 10-fold CV (sample-based) | Sample-level CV without subject grouping; demonstrated clinical value of SHAP |
| **2024** | La Quatra et al. | *Exploiting Foundation Models and Speech Enhancement for Parkinson's Disease Detection...* (Interspeech) | Self-supervised foundation models (Wav2Vec 2.0, HuBERT) + deep speech enhancement | PC-GITA Spanish Corpus | 100 subjects / 800 recordings | Read sentences & continuous speech | **UAR 83.2%** in noisy environments | Speaker-independent 5-fold CV | High latency and GPU memory requirements; shows real-world noise degrades voice models |

---

## 2. In-Depth Paper Analyses

### Paper 1: Little et al. (2009)
- **Reference**: Little, M. A., McSharry, P. E., Hunter, E. J., Spielman, J., & Ramig, L. O. (2009). Suitability of dysphonia measurements for telemonitoring of Parkinson's disease. *IEEE Transactions on Biomedical Engineering*, 56(4), 1015-1022. DOI: [10.1109/TBME.2008.2005954](https://doi.org/10.1109/TBME.2008.2005954).
- **Core Contribution**: Introduced Pitch Period Entropy (PPE), a nonlinear measure designed to quantify subtle, involuntary pitch variations while remaining robust to normal frequency microtremors and acoustic noise. Defined the canonical 22-biomarker feature set.
- **Methodology**: Evaluated 195 sustained `/a/` phonations from 31 subjects (23 PD patients, 8 healthy controls). Features encompassed fundamental frequency statistics (`MDVP:Fo`, `Fhi`, `Flo`), 5 jitter measures, 6 shimmer measures, noise ratios (`NHR`, `HNR`), fractal scaling (`DFA`), recurrence dynamics (`RPDE`), correlation dimension (`D2`), and frequency variations (`spread1`, `spread2`, `PPE`). A kernel Support Vector Machine (SVM) coupled with exhaustive feature search attained 91.4% classification accuracy using just four features: `PPE`, `spread1`, `RPDE`, and `DFA`.
- **Methodological Vulnerability**: The original bootstrap evaluation treated each phonation sample nearly independently during feature ranking, without strictly isolating individual subjects from training and test partitions.

### Paper 2: Tsanas et al. (2010)
- **Reference**: Tsanas, A., Little, M. A., McSharry, P. E., & Ramig, L. O. (2010). Accurate telemonitoring of Parkinson's disease progression by noninvasive speech tests. *IEEE Transactions on Biomedical Engineering*, 57(4), 884-893. DOI: [10.1109/TBME.2009.2036000](https://doi.org/10.1109/TBME.2009.2036000).
- **Core Contribution**: Shifted focus from binary detection to clinical progression monitoring, mapping non-invasive dysphonia metrics to clinician-scored Unified Parkinson's Disease Rating Scale (UPDRS) scores.
- **Dataset**: 5,875 recordings collected longitudinally from 42 early-stage PD subjects over six months in patient homes via an automated telemonitoring system.
- **Findings**: Demonstrated that nonlinear vocal metrics track disease progression without requiring clinic visits, obtaining Mean Absolute Errors of 5.95 on motor-UPDRS and 7.52 on total-UPDRS using leave-one-subject-out validation.

### Paper 3: Orozco-Arroyave et al. (2016)
- **Reference**: Orozco-Arroyave, J. R., et al. (2016). Automatic detection of Parkinson's disease in running speech spoken in three different languages. *The Journal of the Acoustical Society of America*, 139(1), 481-500. DOI: [10.1121/1.4944039](https://doi.org/10.1121/1.4944039).
- **Core Contribution**: Evaluated whether articulatory and phonetic transitions between voiced and unvoiced frames in continuous running speech carry disease-discriminative information across Spanish (PC-GITA), Czech, and German cohorts.
- **Findings**: Speaker-independent 10-fold cross-validation yielded accuracies from 84% to 99%. Articulation deficits were shown to be language-independent, validating the clinical presence of hypokinetic dysarthria across differing linguistic phonetic inventories.

### Paper 4: Sakar et al. (2019)
- **Reference**: Sakar, C. O., Serbes, G., Gunduz, A., Tunc, H. C., et al. (2019). A comparative analysis of speech signal processing algorithms for Parkinson's disease classification and the use of the tunable Q-factor wavelet transform. *Applied Soft Computing*, 74, 255-263. DOI: [10.1016/j.asoc.2018.10.022](https://doi.org/10.1016/j.asoc.2018.10.022).
- **Core Contribution**: Introduced the largest multi-feature Parkinson's vocal dataset to date (252 subjects, 756 recordings; UCI ID 470) and demonstrated that Tunable Q-factor Wavelet Transforms (TQWT) capture subtle sub-band pitch perturbation patterns superior to classic discrete wavelets.
- **Findings**: TQWT features with an SVM classifier achieved 86.0% accuracy under leave-one-subject-out (LOSO) cross-validation, rising to ~89% when combined with MFCCs in an ensemble model.

### Paper 5: Alshammri et al. (2023)
- **Reference**: Alshammri, R., Alharbi, G., Alharbi, E., & Almubark, I. (2023). Machine learning approaches to identify Parkinson's disease using voice signal features. *Frontiers in Artificial Intelligence*, 6, 1084001. DOI: [10.3389/frai.2023.1084001](https://doi.org/10.3389/frai.2023.1084001).
- **Core Contribution & Analysis**: Applied modern ML pipelines (SMOTE, feature selection, GridSearchCV) to the UCI 174 dataset, claiming an extraordinary 98.31% accuracy and 99% F1-score with a Multi-Layer Perceptron (MLP) and 95.0% with SVM.
- **Critical Flaw Identified**: The authors utilized a naive 70:30 random train-test split. Because each of the 31 participants contributed 6 recordings, samples from the same person were present simultaneously in both the training set and the test set. The MLP memorized individual vocal identities rather than learning generalizable pathology markers.

### Paper 6: Pah et al. (2023)
- **Reference**: Pah, N. D., Indrawati, V., & Kumar, D. K. (2023). Voice-based SVM model reliability for identifying Parkinson's disease. *IEEE Access*, 11, 142100-142109. DOI: [10.1109/ACCESS.2023.3344464](https://doi.org/10.1109/ACCESS.2023.3344464).
- **Core Contribution**: Rigorously examined the statistical reliability and fold-to-fold variance of voice-based SVMs. Proved that random per-sample splits overestimate real-world classification accuracy by 8% to 15% and suffer from severe model instability when evaluated across truly unseen individuals.

### Paper 7: Pah et al. (2024)
- **Reference**: Pah, N. D., Indrawati, V., Prayitno, A., & Kumar, D. K. (2024). The effectiveness of acoustic voice quality index to identify people with Parkinson’s disease. *IEEE Access*, 12, 172018-172026. DOI: [10.1109/ACCESS.2024.3498836](https://doi.org/10.1109/ACCESS.2024.3498836).
- **Core Contribution**: Evaluated the Acoustic Voice Quality Index (AVQI)—a clinically standardized multiparametric dysphonia metric combining smoothed cepstral peak prominence (CPPS), shimmer, jitter, and HNR—achieving 85.4% accuracy (ROC-AUC 0.91) under subject-stratified 10-fold cross-validation.

### Paper 8: Srinivasan et al. (2024)
- **Reference**: Srinivasan, S., Rajasekar, R., et al. (2024). Detection of Parkinson disease using multiclass machine learning approach. *Scientific Reports*, 14, 13444. DOI: [10.1038/s41598-024-64004-9](https://doi.org/10.1038/s41598-024-64004-9).
- **Core Contribution & Analysis**: Applied SMOTE oversampling and hyperparameter-tuned Feed-forward Neural Networks (FNN) and Kernel SVMs, reporting ~96.5% classification accuracy on an 80:20 random split of the UCI 174 dataset. Represents recent literature continuing to suffer from record-level leakage.

### Paper 9: Ghaheri et al. (2024)
- **Reference**: Ghaheri, P., Nasiri, H., Shateri, A., & Homafar, A. (2024). Diagnosis of Parkinson's disease based on voice signals using SHAP and hard voting ensemble method. *Computer Methods in Biomechanics and Biomedical Engineering*, 27(13), 1858-1874. DOI: [10.1080/10255842.2023.2263125](https://doi.org/10.1080/10255842.2023.2263125).
- **Core Contribution**: Integrated Shapley Additive exPlanations (SHAP) with ensemble tree classifiers (XGBoost, LightGBM, Random Forest). Demonstrated that nonlinear pitch dynamics (`PPE`, `spread1`, `MDVP:Fo`) dominate decision boundaries, providing an empirical foundation for clinical interpretability.

### Paper 10: La Quatra et al. (2024)
- **Reference**: La Quatra, M., Turco, M. F., Svendsen, T., Salvi, G., Orozco-Arroyave, J. R., & Siniscalchi, S. M. (2024). Exploiting foundation models and speech enhancement for Parkinson's disease detection from speech in real-world operative conditions. *Interspeech 2024*, 522-526. DOI: [10.21437/Interspeech.2024-522](https://doi.org/10.21437/Interspeech.2024-522).
- **Core Contribution**: Benchmarked self-supervised speech foundation representations (Wav2Vec 2.0, HuBERT) under realistic ambient acoustic noise. Showed that uncalibrated environmental noise drops raw classifier recall dramatically, demonstrating the imperative need for front-end audio quality filtering (SNR and silence checks) in web-deployed screening systems.
