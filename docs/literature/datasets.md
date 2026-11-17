# Systematic Dataset Analysis: Parkinson's Disease Voice Corpora

This document analyzes public and research datasets utilized across the literature on voice-based Parkinson's disease (PD) screening, identifying recurring benchmarks, accessibility, licensing, task protocols, and structural constraints.

---

## 1. Frequency of Dataset Occurrence in Surveyed Literature

Based on the 10 surveyed peer-reviewed studies and broader literature indexing:

| Dataset Identifier | Common Name | Frequency Count | Primary Use Case | Task Modality | Status & Access |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **UCI ID 174** | **Oxford Parkinson's Disease Detection** | **6 / 10 (60%)** | Binary Classification (PD vs. Healthy) | Sustained vowel (`/a/`) | **Open Access (CC BY 4.0)** |
| **UCI ID 189** | **Parkinson's Telemonitoring Dataset** | **2 / 10 (20%)** | Clinical Progression (Motor & Total UPDRS) | Sustained vowel (`/a/`) | **Open Access (CC BY 4.0)** |
| **PC-GITA** | **Parkinson's Colombian-German Corpus** | **2 / 10 (20%)** | Phonetic & Articulatory Running Speech | Vowels, DDK, Words, Sentences, Text | Restricted Research License |
| **UCI ID 470** | **Parkinson's Disease Classification (Sakar)** | **2 / 10 (20%)** | Binary Classification (Wavelet / TQWT) | Sustained vowel (`/a/`, 3 reps) | **Open Access (CC BY 4.0)** |
| **Italian PD Voice** | **Italian Parkinson's Speech Database** | **2 / 10 (20%)** | Acoustic Quality & AVQI Validation | Vowels (`/a/`, `/o/`) + Sentences | IEEE DataPort / Request |

---

## 2. The De-Facto Benchmark: Oxford Parkinson's Dataset (UCI ID 174)

The **Oxford Parkinson's Disease Detection Dataset** (UCI Repository ID 174; created by Max A. Little, Patrick E. McSharry, et al., 2007/2008) is the **undisputed de-facto benchmark** in computer science and biomedical engineering literature for binary voice-based PD classification.

### Benchmark Profile
- **Repository DOI**: [10.24432/C59C74](https://doi.org/10.24432/C59C74)
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Cohort Size**: 31 human participants (23 diagnosed with idiopathic Parkinson's disease, 8 age- and sex-matched healthy controls).
- **Acoustic Samples**: 195 voice recordings in total (~6 sustained `/a/` phonations per subject).
- **Participant Age Range**: 46 to 82 years (mean: 65.8 ± 9.8 years).
- **Recording Conditions**: Professional acoustically treated, sound-attenuated booth; calibrated head-mounted microphone (AKG C420); direct 44.1 kHz, 16-bit digitization.
- **Biomarkers Provided (22 continuous features)**:
  1. `MDVP:Fo(Hz)`: Average vocal fundamental frequency
  2. `MDVP:Fhi(Hz)`: Maximum vocal fundamental frequency
  3. `MDVP:Flo(Hz)`: Minimum vocal fundamental frequency
  4. `MDVP:Jitter(%)`: Percentage variation in cycle-to-cycle frequency
  5. `MDVP:Jitter(Abs)`: Absolute cycle-to-cycle pitch perturbation (μs)
  6. `MDVP:RAP`: Relative Average Perturbation (3-cycle average)
  7. `MDVP:PPQ`: Five-point Period Perturbation Quotient
  8. `Jitter:DDP`: Average absolute difference of differences between consecutive cycles
  9. `MDVP:Shimmer`: Relative variation in cycle-to-cycle amplitude
  10. `MDVP:Shimmer(dB)`: Shimmer expressed in decibels
  11. `Shimmer:APQ3`: Three-point Amplitude Perturbation Quotient
  12. `Shimmer:APQ5`: Five-point Amplitude Perturbation Quotient
  13. `MDVP:APQ`: 11-point Amplitude Perturbation Quotient
  14. `Shimmer:DDA`: Average absolute difference of differences between consecutive amplitudes
  15. `NHR`: Noise-to-Harmonics Ratio
  16. `HNR`: Harmonics-to-Noise Ratio (dB)
  17. `RPDE`: Recurrence Period Density Entropy (vocal tract periodicity regularity)
  18. `D2`: Correlation Dimension (fractal attractor dimension of vocal fold vibration)
  19. `DFA`: Detrended Fluctuation Analysis (signal fractal self-similarity scaling)
  20. `spread1`: Nonlinear frequency variation measure 1
  21. `spread2`: Nonlinear frequency variation measure 2
  22. `PPE`: Pitch Period Entropy (logarithmic pitch variation entropy)

---

## 3. Secondary Benchmarks and Comparative Analysis

### 3.1 UCI Telemonitoring Dataset (UCI ID 189)
- **Authors**: A. Tsanas, M. Little, P. McSharry, L. Ramig (2009/2010).
- **Scope**: 5,875 recordings across 42 subjects tracked over 6 months at home.
- **Purpose**: Regression targeting `motor_UPDRS` and `total_UPDRS` scores rather than binary healthy/PD classification.
- **Role in Synapse-Voice**: Used to evaluate feature distribution consistency across large-scale remote telemonitoring cohorts.

### 3.2 PC-GITA Spanish Speech Corpus
- **Authors**: J. R. Orozco-Arroyave et al. (Universidad de Antioquia, Colombia).
- **Scope**: 100 participants (50 PD, 50 Healthy Controls).
- **Advantages**: Captures continuous running speech, diadochokinetic (DDK) syllables (`/pa-ta-ka/`), and text reading, proving articulatory deficits beyond phonation.
- **Constraints**: Non-commercial academic research agreement; proprietary raw audio distribution.

### 3.3 Sakar PD Classification Dataset (UCI ID 470)
- **Authors**: C. O. Sakar et al. (2019).
- **Scope**: 252 subjects (188 PD, 64 controls), 756 phonations.
- **Features**: 754 engineered features spanning TQWT, MFCCs, time-frequency distributions.
- **Tradeoff**: Very wide feature space ($p=754 \gg n=252$) posing severe risk of dimensionality curse unless heavy regularization is applied.

---

## 4. Key Takeaway & Selection Rationale for Synapse-Voice

Synapse-Voice selects **UCI ID 174** as its primary training benchmark because:
1. It is public, open-access, and ethically licensed under CC BY 4.0.
2. The 22 acoustic biomarkers represent the gold standard in phonatory dysphonia research.
3. Every baseline in the literature can be directly reproduced and compared against it.
4. Its 31-subject grouping creates a rigorous testbed for demonstrating subject-independent generalization.
