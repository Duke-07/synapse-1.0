'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  BookOpen,
  GitCompare,
  FileText,
} from 'lucide-react';
import { getBenchmarks } from '@/lib/api';
import { BenchmarksResponse, BenchmarkItem, PaperItem } from '@/lib/types';

// Fallback data if backend offline
const FALLBACK_BENCHMARKS: BenchmarkItem[] = [
  {
    work: 'Little et al. (2008)',
    reported_metric: '91.4% Accuracy',
    reproduced_own: '88.53% ± 9.43%',
    reproduced_grouped: '78.96% ± 7.61%',
    diff_pct: 9.57,
    leakage_risk: 'Moderate (repetitive phonations across bootstrap resamples)',
    notes: 'Using 4-feature subset (PPE, spread1, RPDE, DFA) + RBF SVM. Performance drops ~9.6% when subjects are strictly isolated.',
  },
  {
    work: 'Alshammri et al. (2023)',
    reported_metric: 'MLP: 98.31% Acc, SVM: 95.0% Acc',
    reproduced_own: 'MLP: 91.53%, SVM: 89.83%',
    reproduced_grouped: 'MLP: 80.12% ± 4.34%, SVM: 73.14%',
    diff_pct: 11.41,
    leakage_risk: 'Severe (naive 70:30 random train-test split over 195 recordings from 31 subjects)',
    notes: 'Demonstrates severe data leakage. Subject isolation drops MLP accuracy by 11.41% on unseen subjects.',
  },
  {
    work: 'Srinivasan et al. (2024)',
    reported_metric: 'FNN: ~96.5% Acc, KSVM: ~94.8% Acc',
    reproduced_own: 'FNN: 94.87%, KNN: 92.31%',
    reproduced_grouped: 'FNN: 77.23% ± 5.63%, KNN: 70.07%',
    diff_pct: 17.64,
    leakage_risk: 'High (random 80:20 split allows patient recordings in both partitions)',
    notes: 'FNN performance drops 17.64% when evaluated on isolated patients.',
  },
  {
    work: 'Kalomitsinis (GitHub)',
    reported_metric: 'Subject-wise CV: ~82-85% Acc',
    reproduced_own: 'RF: 74.88% ± 17.24%',
    reproduced_grouped: 'RF: 75.63% ± 7.41%',
    diff_pct: -0.75,
    leakage_risk: 'Low (Correctly utilizes group-aware cross-validation)',
    notes: 'One of the few open-source implementations to properly acknowledge and avoid recording-level leakage.',
  },
  {
    work: 'Yadav (GitHub RF Baseline)',
    reported_metric: '99.4% - 99.6% Accuracy',
    reproduced_own: '80:20 Split: 92.31%, 10-Fold: 91.18% ± 6.71%',
    reproduced_grouped: '78.00% ± 5.51%',
    diff_pct: 13.18,
    leakage_risk: 'Catastrophic (unpartitioned patient recordings allow tree ensemble to memorize vocal fundamental pitch and anatomy)',
    notes: 'Classic example of recording leakage. Trees memorize patient-specific baseline F0, achieving near-perfect sample accuracy that drops ~13.2% on unseen patients.',
  },
];

const FALLBACK_PAPERS: PaperItem[] = [
  {
    year: 2009,
    authors: 'Little, M. A., McSharry, P. E., et al.',
    title: "Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease",
    venue: 'IEEE Trans. Biomed. Eng.',
    doi: '10.1109/TBME.2008.2005954',
    approach: '22 acoustic features (F0, Jitter, Shimmer, HNR, RPDE, DFA, PPE) + RBF SVM',
    dataset: 'UCI 174 (31 subjects, 195 recordings)',
    metric: '91.4% Accuracy (PPE, spread1, RPDE, DFA)',
    protocol: 'Bootstrap feature selection across phonations',
    leakage: 'Moderate: recordings split without speaker grouping',
  },
  {
    year: 2010,
    authors: 'Tsanas, A., Little, M. A., et al.',
    title: "Accurate Telemonitoring of Parkinson's Disease Progression by Noninvasive Speech Tests",
    venue: 'IEEE Trans. Biomed. Eng.',
    doi: '10.1109/TBME.2009.2036000',
    approach: 'Nonlinear speech metrics + Random Forest / LASSO UPDRS regression',
    dataset: 'UCI 189 (42 subjects, 5,875 recordings)',
    metric: 'MAE 5.95 (motor-UPDRS), 7.52 (total-UPDRS)',
    protocol: 'Leave-one-individual-out cross-validation',
    leakage: 'Low: strictly speaker-isolated cross validation',
  },
  {
    year: 2016,
    authors: 'Orozco-Arroyave, J. R., et al.',
    title: "Automatic detection of Parkinson's disease in running speech spoken in three different languages",
    venue: 'J. Acoust. Soc. Am. (JASA)',
    doi: '10.1121/1.4944039',
    approach: 'Acoustic transitions, MFCCs, Bark energies + SVM / Random Forest',
    dataset: 'PC-GITA (Spanish, Czech, German; 226 subjects)',
    metric: '84% to 99% depending on language/task',
    protocol: 'Subject-independent 10-fold CV',
    leakage: 'Low: speaker-isolated',
  },
  {
    year: 2019,
    authors: 'Sakar, C. O., Serbes, G., et al.',
    title: "A comparative analysis of speech signal processing algorithms for Parkinson's disease classification...",
    venue: 'Applied Soft Computing',
    doi: '10.1016/j.asoc.2018.10.022',
    approach: 'Tunable Q-factor Wavelet Transform (TQWT) + SVM / Ensembles',
    dataset: 'UCI 470 (252 subjects, 756 recordings)',
    metric: '86.0% Acc (TQWT-SVM), ~89% Ensemble',
    protocol: 'Leave-one-subject-out (LOSO)',
    leakage: 'Low: speaker-isolated (754 features)',
  },
  {
    year: 2023,
    authors: 'Alshammri, R., Alharbi, G., et al.',
    title: "Machine learning approaches to identify Parkinson's disease using voice signal features",
    venue: 'Frontiers in Artificial Intelligence',
    doi: '10.3389/frai.2023.1084001',
    approach: 'SMOTE + feature selection + SVM, Random Forest, KNN, MLP',
    dataset: 'UCI 174 (31 subjects, 195 recordings)',
    metric: 'MLP: 98.31% Acc; SVM: 95.0% Acc',
    protocol: 'Random 70:30 train-test split',
    leakage: 'Severe: patient overlap across splits',
  },
  {
    year: 2023,
    authors: 'Pah, N. D., Indrawati, V., Kumar, D. K.',
    title: 'Voice-Based SVM Model Reliability for Identifying Parkinson’s Disease',
    venue: 'IEEE Access',
    doi: '10.1109/ACCESS.2023.3344464',
    approach: 'Feature stability variance + Linear & RBF SVM',
    dataset: 'UCI 174 + Italian PD Voice Database',
    metric: '82.5% to 89.2% Acc (subject-isolated)',
    protocol: 'Subject-wise cross-validation with stability analysis',
    leakage: 'Low: shows sample-level splits drop subject-wise',
  },
  {
    year: 2024,
    authors: 'Pah, N. D., Indrawati, V., et al.',
    title: 'The Effectiveness of Acoustic Voice Quality Index to Identify People With Parkinson’s Disease',
    venue: 'IEEE Access',
    doi: '10.1109/ACCESS.2024.3498836',
    approach: 'Acoustic Voice Quality Index (AVQI) + Logistic Regression / SVM',
    dataset: 'Italian PD Voice Database (100 subjects)',
    metric: '85.4% Accuracy, ROC-AUC 0.91',
    protocol: 'Subject-stratified 10-fold CV',
    leakage: 'Low: speaker-isolated',
  },
  {
    year: 2024,
    authors: 'Srinivasan, S., Rajasekar, R., et al.',
    title: 'Detection of Parkinson disease using multiclass machine learning approach',
    venue: 'Scientific Reports (Nature Portfolio)',
    doi: '10.1038/s41598-024-64004-9',
    approach: 'Dysphonia parameters + SMOTE + FNN, KNN, KSVM',
    dataset: 'UCI 174 (31 subjects, 195 recordings)',
    metric: 'FNN: ~96.5% Acc, KSVM: ~94.8% Acc',
    protocol: 'Random 80:20 train-test split',
    leakage: 'High: patient overlap across splits',
  },
  {
    year: 2024,
    authors: 'Ghaheri, P., Nasiri, H., et al.',
    title: "Diagnosis of Parkinson's disease based on voice signals using SHAP and hard voting ensemble",
    venue: 'Comp. Methods Biomech. Biomed. Eng.',
    doi: '10.1080/10255842.2023.2263125',
    approach: 'XGBoost, LightGBM, Random Forest + SHAP attribution',
    dataset: 'UCI 174 (31 subjects, 195 recordings)',
    metric: '96.55% Acc (PPE & spread1 top drivers)',
    protocol: 'Sample-based 10-fold CV',
    leakage: 'High: lack of subject grouping allows pitch memorization',
  },
  {
    year: 2024,
    authors: 'La Quatra, M., Turco, M. F., et al.',
    title: 'Exploiting Foundation Models and Speech Enhancement for PD Detection...',
    venue: 'Interspeech 2024',
    doi: '10.21437/Interspeech.2024-522',
    approach: 'Wav2Vec 2.0 / HuBERT + Speech Enhancement pre-processing',
    dataset: 'PC-GITA Spanish Corpus (100 subjects)',
    metric: '83.2% Unweighted Average Recall in noisy conditions',
    protocol: 'Speaker-independent 5-fold CV',
    leakage: 'Low: speaker-independent',
  },
];

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>(FALLBACK_BENCHMARKS);
  const [papers, setPapers] = useState<PaperItem[]>(FALLBACK_PAPERS);
  const [activeTab, setActiveTab] = useState<'reproduction' | 'papers'>('reproduction');

  useEffect(() => {
    getBenchmarks()
      .then((data) => {
        if (data.reproduced_works && data.reproduced_works.length > 0) {
          setBenchmarks(data.reproduced_works);
        }
        if (data.literature_papers && data.literature_papers.length > 0) {
          setPapers(data.literature_papers);
        }
      })
      .catch((err) => {
        console.warn('Using bundled benchmarks fallback:', err);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/40 border border-cyan-700/60 text-cyan-300 text-xs font-medium mb-3">
          <GitCompare className="w-3.5 h-3.5" />
          Empirical Reproducibility & Benchmark Comparison
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Literature Benchmarks & Reproductions
        </h1>
        <p className="mt-3 text-slate-400 text-sm leading-relaxed">
          Rigorous re-implementations of published Parkinson’s voice detection models on the Oxford UCI benchmark,
          exposing recording-level data leakage and establishing honest subject-isolated baselines.
        </p>
      </div>

      {/* The Data Leakage Trap Box */}
      <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-800/50 rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-900/40 border border-amber-700 flex items-center justify-center shrink-0 text-amber-400">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-200">
              The "Data Leakage Trap" in Voice Biomarker Literature
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              The Oxford Parkinson’s Voice Dataset (UCI 174) contains 195 recordings from 31 individuals (~6 recordings per subject).
              When researchers use standard random train-test splits (70:30 or random 10-fold CV), multiple phonations from the same person appear in both training and test partitions.
              Classifiers inadvertently memorize speaker anatomy (e.g., baseline vocal pitch <code className="text-amber-300">MDVP:Fo</code>) rather than dysphonia pathology,
              artificially inflating reported accuracy to <strong>92%–99%</strong>.
            </p>
            <p className="text-sm text-amber-300 mt-2 font-medium">
              Under strict subject-grouped cross-validation (<code className="text-cyan-300">StratifiedGroupKFold</code>), all models experience an honest drop of 10% to 18%,
              revealing that the true generalizable screening benchmark on this cohort is approximately <strong>79.4%</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('reproduction')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'reproduction'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          5 Reproduced Prior Works (Leakage Audit)
        </button>
        <button
          onClick={() => setActiveTab('papers')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'papers'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          10 Peer-Reviewed Literature Papers
        </button>
      </div>

      {/* Tab 1: 5 Reproduced Works */}
      {activeTab === 'reproduction' && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 font-bold">Prior Work / Repo</th>
                    <th className="py-4 px-4">Author's Claimed Metric</th>
                    <th className="py-4 px-4">Our Reproduction (Author Protocol)</th>
                    <th className="py-4 px-4 text-cyan-400">Our Reproduction (Grouped CV)</th>
                    <th className="py-4 px-4 text-rose-400">Leakage Drop</th>
                    <th className="py-4 px-4">Leakage Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {benchmarks.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
                        {b.work}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                        {b.reported_metric}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-amber-300">
                        {b.reproduced_own}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs font-bold text-cyan-300 bg-cyan-950/20">
                        {b.reproduced_grouped}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-rose-400">
                        {b.diff_pct > 0 ? `-${b.diff_pct.toFixed(1)}%` : `+${Math.abs(b.diff_pct).toFixed(1)}%`}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            b.leakage_risk.includes('Catastrophic') || b.leakage_risk.includes('Severe')
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : b.leakage_risk.includes('High')
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : b.leakage_risk.includes('Low')
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                          }`}
                        >
                          {b.leakage_risk.split('(')[0].trim()}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{b.notes}</p>
                      </td>
                    </tr>
                  ))}
                  {/* Synapse-Voice Champion Row */}
                  <tr className="bg-cyan-950/40 border-t-2 border-cyan-500/60 font-medium">
                    <td className="py-4 px-4 font-bold text-cyan-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-cyan-400" />
                      Synapse-Voice (Our Model)
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">Target: Honest screening</td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">—</td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-cyan-300">
                      79.41% ± 7.77% (AUC: 0.7963)
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-emerald-400">0.0% (Zero Leakage)</td>
                    <td className="py-4 px-4 text-xs text-emerald-300">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                        Zero Leakage
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        5-fold StratifiedGroupKFold, 12 ANOVA features, Platt-calibrated MLP probabilities.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 10 Literature Papers */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {papers.map((p, i) => (
              <div
                key={i}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span>{p.venue}</span>
                    <span className="text-cyan-400 font-bold">{p.year}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm leading-snug">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{p.authors}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400">Dataset:</span>{' '}
                      <span className="text-slate-200">{p.dataset}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Approach:</span>{' '}
                      <span className="text-slate-200">{p.approach}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Reported Metric:</span>{' '}
                      <span className="font-mono font-semibold text-emerald-400">{p.metric}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Validation Protocol:</span>{' '}
                      <span className="text-slate-300">{p.protocol}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Leakage Audit:</span>{' '}
                      <span
                        className={`font-semibold ${
                          p.leakage.toLowerCase().includes('severe') || p.leakage.toLowerCase().includes('high')
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {p.leakage}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
                  <a
                    href={p.doi.startsWith('http') ? p.doi : `https://doi.org/${p.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    View Original Study (DOI) <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
