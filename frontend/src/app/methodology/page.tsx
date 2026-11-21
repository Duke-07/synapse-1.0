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
import PillButton from '@/components/ui/PillButton';

export default function MethodologyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider shadow-sm mb-4">
          <Layers className="w-3.5 h-3.5 text-blue" />
          Scientific Architecture & Validation Protocol
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-medium uppercase text-ink tracking-tight">
          Acoustic Biomarker Methodology
        </h1>
        <p className="mt-4 text-ink/75 text-base leading-relaxed">
          Comprehensive documentation of the signal processing pipeline, Praat acoustic feature extraction algorithms,
          group-aware cross-validation, and calibrated machine learning models powering Synapse-Voice.
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="banky-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-yellow/40 flex items-center justify-center text-blue mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-display font-medium uppercase text-xl text-ink">22 Praat Biomarkers</h3>
            <p className="text-xs text-ink/75 mt-2 leading-relaxed">
              Extracts exact phonatory metrics including micro-perturbations in frequency (Jitter), amplitude (Shimmer), harmonic-to-noise ratios, and nonlinear entropy metrics (RPDE, DFA, PPE).
            </p>
          </div>
        </div>

        <div className="banky-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-yellow/40 flex items-center justify-center text-blue mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-medium uppercase text-xl text-ink">Zero Data Leakage</h3>
            <p className="text-xs text-ink/75 mt-2 leading-relaxed">
              Enforces strict speaker-isolated validation via 5-fold <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">StratifiedGroupKFold</code>, ensuring no phonations from the same individual span both training and evaluation sets.
            </p>
          </div>
        </div>

        <div className="banky-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-yellow/40 flex items-center justify-center text-blue mb-4">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-display font-medium uppercase text-xl text-ink">Platt Calibration</h3>
            <p className="text-xs text-ink/75 mt-2 leading-relaxed">
              Raw classifier margins are calibrated using Platt sigmoid scaling, guaranteeing that predicted probability scores accurately reflect true empirical risk.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Oxford Dataset */}
      <div className="banky-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow/30 flex items-center justify-center text-blue">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-medium uppercase text-ink">
            1. Benchmark Dataset & Subject Cohort
          </h2>
        </div>
        <p className="text-sm text-ink/80 leading-relaxed">
          The baseline model is trained and cross-validated on the landmark <strong>Oxford Parkinson’s Disease Detection Dataset</strong> (UCI Machine Learning Repository ID: 174), collected by Little et al. in collaboration with the National Centre for Voice and Speech (Denver, CO).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-yellow/20 p-4 rounded-2xl border border-yellow/60">
            <div className="text-ink/70 font-sans font-medium text-xs">Total Subjects</div>
            <div className="text-xl font-bold text-ink mt-1">31 Individuals</div>
          </div>
          <div className="bg-yellow/20 p-4 rounded-2xl border border-yellow/60">
            <div className="text-ink/70 font-sans font-medium text-xs">Cohort Split</div>
            <div className="text-xl font-bold text-blue mt-1">23 PD / 8 Healthy</div>
          </div>
          <div className="bg-yellow/20 p-4 rounded-2xl border border-yellow/60">
            <div className="text-ink/70 font-sans font-medium text-xs">Acoustic Samples</div>
            <div className="text-xl font-bold text-ink mt-1">195 Recordings</div>
          </div>
          <div className="bg-yellow/20 p-4 rounded-2xl border border-yellow/60">
            <div className="text-ink/70 font-sans font-medium text-xs">Task Protocol</div>
            <div className="text-xl font-bold text-ink mt-1">Sustained /a/ Vowel</div>
          </div>
        </div>
        <p className="text-xs text-ink/70 leading-relaxed">
          Each subject vocalized approximately six sustained phonations of the vowel sound <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">“a”</code> under standardized conditions.
          The primary diagnostic label is binary (<code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">1 = Parkinson's Disease, 0 = Healthy Control</code>).
        </p>
      </div>

      {/* Section 2: Acoustic Feature Extraction */}
      <div className="banky-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow/30 flex items-center justify-center text-blue">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-medium uppercase text-ink">
            2. Praat Acoustic Feature Extraction Engine
          </h2>
        </div>
        <p className="text-sm text-ink/80 leading-relaxed">
          Synapse-Voice utilizes a native Python bridge to the Praat acoustic engine (<code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">praat-parselmouth</code>) along with nonlinear dynamics algorithms to compute the 22 dysphonic features:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-yellow/10 p-5 rounded-2xl border border-yellow/40 space-y-2">
            <h4 className="font-bold text-ink text-sm">Fundamental Frequency & Perturbation</h4>
            <ul className="list-disc list-inside text-ink/75 space-y-1">
              <li><strong>MDVP:Fo, Fhi, Flo:</strong> Average, maximum, and minimum vocal pitch in Hertz using Praat’s autocorrelation method (75 Hz – 500 Hz range).</li>
              <li><strong>Jitter (local, Abs, RAP, PPQ5, DDP):</strong> Micro-instabilities in cycle-to-cycle pitch periods caused by vocal fold rigidity.</li>
              <li><strong>Shimmer (local, dB, APQ3, APQ5, APQ11, DDA):</strong> Cycle-to-cycle amplitude variations reflecting glottal resistance deficits.</li>
            </ul>
          </div>

          <div className="bg-yellow/10 p-5 rounded-2xl border border-yellow/40 space-y-2">
            <h4 className="font-bold text-ink text-sm">Harmonics & Nonlinear Complexity</h4>
            <ul className="list-disc list-inside text-ink/75 space-y-1">
              <li><strong>NHR & HNR:</strong> Noise-to-harmonics ratio and harmonics-to-noise ratio in decibels, quantifying turbulent breathiness.</li>
              <li><strong>RPDE (Recurrence Period Density):</strong> Measures deviation from strict periodicity in vocal tract trajectories.</li>
              <li><strong>DFA (Detrended Fluctuation Analysis):</strong> Characterizes self-similarity of speech turbulent noise.</li>
              <li><strong>PPE (Pitch Period Entropy):</strong> Quantifies impaired control of fundamental pitch on logarithmic scales.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Signal Pre-verification */}
      <div className="banky-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow/30 flex items-center justify-center text-blue">
            <FileCode className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-medium uppercase text-ink">
            3. Audio Signal Pre-Checks & Quality Gates
          </h2>
        </div>
        <p className="text-sm text-ink/80 leading-relaxed">
          Before feeding any recording into Praat, Synapse-Voice enforces rigorous quality assurance checks:
        </p>
        <ul className="space-y-3 text-xs sm:text-sm text-ink/80">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Duration Check:</strong> Recordings must be at least 1.0 second long (to allow stable pitch tracking) and capped at 90.0 seconds.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Silence Threshold:</strong> Root-Mean-Square (RMS) amplitude must exceed 0.004 to reject empty microphone captures or silent files.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Clipping Detection:</strong> Flags signals where peak absolute amplitude exceeds 0.98, which causes harmonic distortion and invalidates shimmer calculations.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Standardization:</strong> All stereo or multichannel audio is downmixed to mono and resampled to 22,050 Hz 32-bit floating point PCM.</span>
          </li>
        </ul>
      </div>

      {/* Section 4: Preventing Data Leakage */}
      <div className="banky-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow/30 flex items-center justify-center text-blue">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-medium uppercase text-ink">
            4. Addressing The Recording-Level Data Leakage Problem
          </h2>
        </div>
        <p className="text-sm text-ink/80 leading-relaxed">
          As documented in our <Link href="/benchmarks" className="text-blue underline font-bold">benchmark audit</Link>, many published papers report accuracies exceeding 95% on the Oxford dataset by using standard sample-level cross-validation.
          Because each participant supplied approximately six recordings, sample-level splitting allows individual speaker characteristics to leak across train and test partitions.
        </p>
        <div className="bg-ink text-white p-5 rounded-2xl font-mono text-xs overflow-x-auto">
          <div className="text-yellow font-bold mb-1"># Subject-Isolated Grouping Protocol</div>
          <div>groups = [record.name.split(&apos;_&apos;)[0] for record in dataset]</div>
          <div>cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)</div>
          <div className="text-white/60 mt-1"># Every evaluation fold tests strictly on unseen patient vocal tracts</div>
        </div>
        <p className="text-xs text-ink/75 leading-relaxed">
          This protocol establishes an honest generalizable performance ceiling of <strong>79.41% ± 7.77%</strong> accuracy and <strong>0.7963 ROC-AUC</strong>, eliminating misleading optimism.
        </p>
      </div>

      {/* Section 5: Clinical Ethics Disclaimer */}
      <div className="banky-card p-8 sm:p-10 border-2 border-warning-red/30">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-warning-red shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-display font-medium uppercase text-ink">
              Clinical Screening vs. Medical Diagnosis
            </h3>
            <p className="text-sm text-ink/80 mt-2 leading-relaxed">
              Parkinson’s disease diagnosis requires comprehensive in-person neurological examination evaluating cardinal motor symptoms (bradykinesia, tremor, rigidity, postural instability) alongside clinical history.
              Acoustic screening highlights micro-anomalies in vocal fold closure and phonatory stability that can be influenced by laryngitis, fatigue, respiratory conditions, or aging.
              Consequently, Synapse-Voice outputs probabilistic risk bands and explainability charts solely to support proactive specialist consultation.
            </p>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="text-center pt-4">
        <Link href="/screen">
          <PillButton variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
            Test Phonation Screening Now
          </PillButton>
        </Link>
      </div>
    </div>
  );
}
