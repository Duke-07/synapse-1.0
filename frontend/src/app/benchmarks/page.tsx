'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  AlertCircle,
  ExternalLink,
  Shield,
  CheckCircle,
  TrendingDown,
  BookOpen,
  GitCompare,
  FileText,
} from 'lucide-react';
import { getBenchmarks } from '@/lib/api';
import { BenchmarkItem, PaperItem } from '@/lib/types';
import { PillButton } from '@/components/ui/PillButton';

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
    reported_metric: '94.87% Accuracy',
    reproduced_own: '92.31%',
    reproduced_grouped: '74.36% ± 8.12%',
    diff_pct: 17.95,
    leakage_risk: 'High (random 80:20 split with standard scaler leakage)',
    notes: 'Drops nearly 18% when evaluating on withheld patients.',
  },
  {
    work: 'Ghaheri et al. (2024)',
    reported_metric: '96.55% Accuracy (Ensemble)',
    reproduced_own: '93.10%',
    reproduced_grouped: '81.25% ± 6.20%',
    diff_pct: 11.85,
    leakage_risk: 'Severe (sample-based 10-fold CV without subject grouping)',
    notes: 'SHAP ensemble drops over 11.8% under group-isolated validation.',
  },
];

const FALLBACK_PAPERS: PaperItem[] = [
  {
    year: 2008,
    authors: 'Little, M. A., McSharry, P. E., et al.',
    title: 'Suitability of dysphonia measurements for telemonitoring of Parkinson’s disease',
    venue: 'IEEE Trans. Biomed. Eng.',
    doi: '10.1109/TBME.2008.2005954',
    approach: 'Introduction of Pitch Period Entropy (PPE) & nonlinear vocal metrics',
    dataset: 'Oxford UCI 174',
    metric: '91.4% Accuracy (4 features: PPE, spread1, RPDE, DFA)',
    protocol: 'Bootstrap resample classification',
    leakage: 'Moderate: recording-level repetition',
  },
  {
    year: 2012,
    authors: 'Tsanas, A., Little, M. A., et al.',
    title: 'Novel speech signal processing algorithms for high-accuracy classification of PD',
    venue: 'IEEE Trans. Biomed. Eng.',
    doi: '10.1109/TBME.2012.2183367',
    approach: '132 acoustic features: glottal quotient, tunable Q-factor wavelets',
    dataset: 'Oxford UCI 174',
    metric: '99% Acc (random CV) vs 85% Acc (subject-isolated)',
    protocol: 'First formal paper highlighting cross-validation leakage',
    leakage: 'Directly demonstrated that subject overlap causes 14% drop',
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
    title: "Diagnosis of Parkinson's disease based on voice signals using SHAP and ensemble",
    venue: 'Comp. Methods Biomech. Biomed. Eng.',
    doi: '10.1080/10255842.2023.2263125',
    approach: 'XGBoost, LightGBM, Random Forest + SHAP attribution',
    dataset: 'UCI 174 (31 subjects, 195 recordings)',
    metric: '96.55% Acc (PPE & spread1 top drivers)',
    protocol: 'Sample-based 10-fold CV',
    leakage: 'High: lack of subject grouping allows pitch memorization',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-display font-semibold uppercase tracking-wider text-[#116466]">
          Empirical Reproducibility &amp; Leakage Audit
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#2C3531] uppercase leading-[0.92]">
          Literature Benchmarks
        </h1>
        <p className="text-sm sm:text-base text-[#2C3531]/75 leading-relaxed font-sans font-normal">
          Rigorous re-implementations of published Parkinson&apos;s voice detection models on the Oxford UCI benchmark,
          exposing recording-level data leakage and establishing honest subject-isolated baselines.
        </p>
      </div>

      {/* The Data Leakage Trap Box */}
      <div className="craft-card p-8 sm:p-10 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D1E8E2] text-[#116466] flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-normal text-[#2C3531] uppercase tracking-tight">
              The &ldquo;Data Leakage Trap&rdquo; in Voice Biomarker Literature
            </h3>
            <p className="text-xs sm:text-sm text-[#2C3531]/80 leading-relaxed font-sans">
              The Oxford Parkinson&apos;s Voice Dataset (UCI 174) contains 195 recordings from 31 individuals (~6 recordings per subject).
              When researchers use naive random train-test splits (70:30 or random 10-fold CV), multiple phonations from the same individual appear in both training and testing partitions.
              Classifiers inadvertently memorize speaker anatomy (e.g. baseline pitch floor) rather than dysphonia pathology, artificially inflating reported accuracy to <strong>92%–99%</strong>.
            </p>
            <p className="text-xs sm:text-sm text-[#116466] font-semibold font-sans">
              Under strict subject-grouped cross-validation (StratifiedGroupKFold), all models experience an honest drop of 10% to 18%,
              revealing that the true generalizable screening benchmark on this cohort is approximately <strong>79.4%</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveTab('reproduction')}
          className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            activeTab === 'reproduction'
              ? 'bg-[#116466] text-white shadow-sm scale-[1.02]'
              : 'bg-white text-[#2C3531] border border-[#D9B08C]/40 hover:bg-[#D1E8E2]/30 shadow-xs'
          }`}
        >
          <span className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" /> 5 Reproduced Prior Works
          </span>
        </button>
        <button
          onClick={() => setActiveTab('papers')}
          className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
            activeTab === 'papers'
              ? 'bg-[#116466] text-white shadow-sm scale-[1.02]'
              : 'bg-white text-[#2C3531] border border-[#D9B08C]/40 hover:bg-[#D1E8E2]/30 shadow-xs'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> 10 Indexed Papers
          </span>
        </button>
      </div>

      {/* Tab 1: 5 Reproduced Works Table */}
      {activeTab === 'reproduction' && (
        <div className="craft-card p-6 sm:p-8 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-[#2C3531]">
              <thead className="bg-[#D1E8E2]/60 text-[11px] uppercase font-semibold text-[#116466] border-b border-[#D9B08C]/30">
                <tr>
                  <th className="py-3.5 px-3">Prior Work / Repo</th>
                  <th className="py-3.5 px-3">Reported Metric</th>
                  <th className="py-3.5 px-3">Our Reproduction (Naive)</th>
                  <th className="py-3.5 px-3 text-[#116466]">Our Reproduction (Grouped CV)</th>
                  <th className="py-3.5 px-3 text-[#B84A39]">Leakage Drop</th>
                  <th className="py-3.5 px-3">Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9B08C]/20 text-xs">
                {benchmarks.map((b, idx) => (
                  <tr key={idx} className="hover:bg-[#D1E8E2]/25 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[#2C3531] whitespace-nowrap">
                      {b.work}
                    </td>
                    <td className="py-3.5 px-3 text-[#2C3531]/60 font-mono">
                      {b.reported_metric}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-medium text-[#2C3531]">
                      {b.reproduced_own}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#116466] bg-[#D1E8E2]/30">
                      {b.reproduced_grouped}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#B84A39]">
                      {b.diff_pct > 0 ? `-${b.diff_pct.toFixed(1)}%` : `+${Math.abs(b.diff_pct).toFixed(1)}%`}
                    </td>
                    <td className="py-3.5 px-3 text-xs">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#FFCB9A]/40 text-[#2C3531] border border-[#D9B08C]">
                        {b.leakage_risk.split('(')[0].trim()}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Synapse-Voice Champion Row */}
                <tr className="bg-[#D1E8E2]/50 font-medium border-t-2 border-[#116466]">
                  <td className="py-4 px-3 font-bold text-[#116466] flex items-center gap-1.5 font-serif">
                    <Award className="w-4 h-4 text-[#116466]" />
                    Synapse-Voice (Our Model)
                  </td>
                  <td className="py-4 px-3 text-[#2C3531]/70">Honest screening</td>
                  <td className="py-4 px-3 font-mono text-[#2C3531]/60">&mdash;</td>
                  <td className="py-4 px-3 font-mono font-bold text-[#116466]">
                    79.41% ± 7.77% (AUC 0.941)
                  </td>
                  <td className="py-4 px-3 font-mono font-bold text-[#116466]">0.0% (Zero Leakage)</td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D1E8E2] text-[#116466] border border-[#116466]/20 text-[10px] font-semibold uppercase">
                      Zero Leakage
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: 10 Literature Papers */}
      {activeTab === 'papers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {papers.map((p, idx) => (
            <div key={idx} className="craft-card p-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#116466]">
                  {p.year} &middot; {p.venue}
                </span>
                {p.doi && (
                  <a
                    href={`https://doi.org/${p.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#116466] hover:underline flex items-center gap-0.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <h4 className="font-serif text-lg font-normal text-[#2C3531] leading-snug">
                {p.title}
              </h4>
              <p className="text-xs text-[#2C3531]/70 font-sans">{p.authors}</p>
              <div className="pt-2 border-t border-[#D9B08C]/30 text-xs space-y-1">
                <p>
                  <strong>Reported:</strong> {p.metric}
                </p>
                <p className="text-[#2C3531]/70">
                  <strong>Protocol:</strong> {p.protocol}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
