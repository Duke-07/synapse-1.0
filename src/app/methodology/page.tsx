'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileCode,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/40 border border-cyan-700/60 text-cyan-300 text-xs font-medium mb-3">
          <Layers className="w-3.5 h-3.5" />
          Scientific Architecture & Validation Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Acoustic Biomarker Methodology
        </h1>
        <p className="mt-3 text-slate-400 text-sm leading-relaxed">
          Comprehensive documentation of the signal processing pipeline, Praat acoustic feature extraction algorithms,
          group-aware cross-validation, and calibrated machine learning models powering Synapse-Voice.
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">22 Praat Biomarkers</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Extracts exact phonatory metrics including micro-perturbations in frequency (Jitter), amplitude (Shimmer), harmonic-to-noise ratios, and nonlinear entropy metrics (RPDE, DFA, PPE).
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Zero Data Leakage</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Enforces strict speaker-isolated validation via 5-fold <code className="text-cyan-300">StratifiedGroupKFold</code>, ensuring no phonations from the same individual span both training and evaluation sets.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 mb-3">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Platt-Calibrated Probabilities</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Raw classifier margins are calibrated using Platt sigmoid scaling, guaranteeing that predicted probability scores accurately reflect true empirical risk.
          </p>
        </div>
      </div>

      {/* Section 1: Oxford Dataset */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">1. Benchmark Dataset & Subject Cohort</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          The baseline model is trained and cross-validated on the landmark <strong>Oxford Parkinson’s Disease Detection Dataset</strong> (UCI Machine Learning Repository ID: 174), collected by Little et al. in collaboration with the National Centre for Voice and Speech (Denver, CO).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 font-sans">Total Subjects</div>
            <div className="text-lg font-bold text-white mt-1">31 Individuals</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 font-sans">Cohort Split</div>
            <div className="text-lg font-bold text-cyan-400 mt-1">23 PD / 8 Healthy</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 font-sans">Acoustic Samples</div>
            <div className="text-lg font-bold text-white mt-1">195 Recordings</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 font-sans">Task Protocol</div>
            <div className="text-lg font-bold text-white mt-1">Sustained /a/ Vowel</div>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Each subject vocalized approximately six sustained phonations of the vowel sound <code className="text-cyan-300">“a”</code> under standardized conditions.
          The primary diagnostic label is binary (<code className="text-cyan-300">1 = Parkinson's Disease, 0 = Healthy Control</code>).
        </p>
      </div>

      {/* Section 2: Acoustic Feature Extraction */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">2. Praat Acoustic Feature Extraction Engine</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Synapse-Voice utilizes a native Python bridge to the Praat acoustic engine (<code className="text-cyan-300">praat-parselmouth</code>) along with nonlinear dynamics libraries (<code className="text-cyan-300">nolds</code>) to compute the standard 22 dysphonic features:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 text-sm">Fundamental Frequency & Perturbation</h4>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li><strong>MDVP:Fo, Fhi, Flo:</strong> Average, maximum, and minimum vocal pitch in Hertz using Praat’s pitch autocorrelation method (75 Hz – 500 Hz range).</li>
              <li><strong>Jitter (local, Abs, RAP, PPQ5, DDP):</strong> Micro-instabilities in cycle-to-cycle pitch periods caused by vocal fold rigidity and subglottal pressure fluctuations.</li>
              <li><strong>Shimmer (local, dB, APQ3, APQ5, APQ11, DDA):</strong> Cycle-to-cycle amplitude variations reflecting glottal resistance deficits.</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 text-sm">Harmonics & Nonlinear Complexity</h4>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li><strong>NHR & HNR:</strong> Noise-to-harmonics ratio and harmonics-to-noise ratio in decibels, quantifying turbulent breathiness in phonation.</li>
              <li><strong>RPDE (Recurrence Period Density Entropy):</strong> Measures deviation from strict periodicity in vocal tract trajectories.</li>
              <li><strong>DFA (Detrended Fluctuation Analysis):</strong> Characterizes self-similarity and scaling exponents of speech turbulent noise.</li>
              <li><strong>PPE (Pitch Period Entropy) & Spreads:</strong> Quantifies impaired control of fundamental pitch on logarithmic scales, sensitive to early dysdiadochokinesia.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Signal Pre-verification */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">3. Audio Signal Pre-Checks & Quality Gates</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Before feeding any recording into Praat, Synapse-Voice enforces rigorous quality assurance checks:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Duration Check:</strong> Recordings must be at least 1.0 second long (to allow stable pitch tracking) and capped at 90.0 seconds.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Silence Threshold:</strong> Root-Mean-Square (RMS) amplitude must exceed 0.004 to reject empty microphone captures or silent files.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Clipping Detection:</strong> Flags signals where peak absolute amplitude exceeds 0.98, which causes harmonic distortion and invalidates shimmer calculations.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Standardization:</strong> All stereo or multichannel audio is downmixed to mono and resampled to 22,050 Hz 32-bit floating point PCM.</span>
          </li>
        </ul>
      </div>

      {/* Section 4: Preventing Data Leakage */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">4. Addressing The Recording-Level Data Leakage Problem</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          As documented in our <Link href="/benchmarks" className="text-cyan-400 underline hover:text-cyan-300">benchmark audit</Link>, many published papers report accuracies exceeding 95% on the Oxford dataset by using standard sample-level cross-validation or naive train/test splits.
          Because each participant supplied approximately six recordings, sample-level splitting allows individual speaker characteristics (anatomical vocal pitch, vocal tract geometry) to leak across train and test partitions.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          To enforce true clinical realism, Synapse-Voice strictly implements:
        </p>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
          <div className="text-cyan-400 font-bold mb-1"># Subject-Isolated Grouping Protocol</div>
          <div>groups = [record.name.split('_')[0] for record in dataset]</div>
          <div>cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)</div>
          <div># Every evaluation fold tests strictly on unseen patient vocal tracts</div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          This protocol establishes an honest generalizable performance ceiling of <strong>79.41% ± 7.77%</strong> accuracy and <strong>0.7963 ROC-AUC</strong>, eliminating misleading optimism.
        </p>
      </div>

      {/* Section 5: Clinical Ethics Disclaimer */}
      <div className="bg-amber-950/30 border border-amber-800/60 rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-amber-300">Clinical Screening vs. Medical Diagnosis</h3>
            <p className="text-sm text-amber-200/90 mt-2 leading-relaxed">
              Parkinson’s disease diagnosis requires comprehensive in-person neurological examination evaluating cardinal motor symptoms (bradykinesia, tremor, rigidity, postural instability) alongside clinical history.
              Acoustic screening highlights micro-anomalies in vocal fold closure and phonatory stability that can be influenced by laryngitis, fatigue, respiratory conditions, or aging.
              Consequently, Synapse-Voice outputs probabilistic risk bands and explainability charts solely to support proactive specialist consultation.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <Link
          href="/screen"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          Try Live Phonation Screening <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
