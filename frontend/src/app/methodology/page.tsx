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
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D1E8E2] text-[#116466] border border-[#116466]/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <Layers className="w-3.5 h-3.5 text-[#116466]" />
          Scientific Architecture &amp; Validation Protocol
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-normal uppercase text-[#2C3531] tracking-tight">
          Acoustic Biomarker Methodology
        </h1>
        <p className="mt-4 text-[#2C3531]/75 text-base leading-relaxed font-sans">
          Comprehensive documentation of the signal processing pipeline, Praat acoustic feature extraction algorithms,
          group-aware cross-validation, and calibrated machine learning models powering Synapse-Voice.
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="craft-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466] mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-normal uppercase text-xl text-[#2C3531]">22 Praat Biomarkers</h3>
            <p className="text-xs text-[#2C3531]/75 mt-2 leading-relaxed font-sans">
              Extracts exact phonatory metrics including micro-perturbations in frequency (Jitter), amplitude (Shimmer), harmonic-to-noise ratios, and nonlinear entropy metrics (RPDE, DFA, PPE).
            </p>
          </div>
        </div>

        <div className="craft-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466] mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-normal uppercase text-xl text-[#2C3531]">Zero Data Leakage</h3>
            <p className="text-xs text-[#2C3531]/75 mt-2 leading-relaxed font-sans">
              Enforces strict speaker-isolated validation via 5-fold <code className="bg-[#D1E8E2]/60 px-1 py-0.5 rounded font-mono text-[#116466]">StratifiedGroupKFold</code>, ensuring no phonations from the same individual span both training and evaluation sets.
            </p>
          </div>
        </div>

        <div className="craft-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466] mb-4">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-normal uppercase text-xl text-[#2C3531]">Platt Calibration</h3>
            <p className="text-xs text-[#2C3531]/75 mt-2 leading-relaxed font-sans">
              Raw classifier margins are calibrated using Platt sigmoid scaling, guaranteeing that predicted probability scores accurately reflect true empirical risk.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Oxford Dataset */}
      <div className="craft-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466]">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal uppercase text-[#2C3531]">
            1. Benchmark Dataset &amp; Subject Cohort
          </h2>
        </div>
        <p className="text-sm text-[#2C3531]/80 leading-relaxed font-sans">
          The baseline model is trained and cross-validated on the landmark <strong>Oxford Parkinson’s Disease Detection Dataset</strong> (UCI Machine Learning Repository ID: 174), collected by Little et al. in collaboration with the National Centre for Voice and Speech (Denver, CO).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#D1E8E2]/35 p-4 rounded-2xl border border-[#116466]/20">
            <div className="text-[#2C3531]/70 font-sans font-medium text-xs">Total Subjects</div>
            <div className="text-xl font-bold text-[#2C3531] mt-1">31 Individuals</div>
          </div>
          <div className="bg-[#D1E8E2]/35 p-4 rounded-2xl border border-[#116466]/20">
            <div className="text-[#2C3531]/70 font-sans font-medium text-xs">Cohort Split</div>
            <div className="text-xl font-bold text-[#116466] mt-1">23 PD / 8 Healthy</div>
          </div>
          <div className="bg-[#D1E8E2]/35 p-4 rounded-2xl border border-[#116466]/20">
            <div className="text-[#2C3531]/70 font-sans font-medium text-xs">Acoustic Samples</div>
            <div className="text-xl font-bold text-[#2C3531] mt-1">195 Recordings</div>
          </div>
          <div className="bg-[#D1E8E2]/35 p-4 rounded-2xl border border-[#116466]/20">
            <div className="text-[#2C3531]/70 font-sans font-medium text-xs">Task Protocol</div>
            <div className="text-xl font-bold text-[#2C3531] mt-1">Sustained /a/ Vowel</div>
          </div>
        </div>
        <p className="text-xs text-[#2C3531]/70 leading-relaxed font-sans">
          Each subject vocalized approximately six sustained phonations of the vowel sound <code className="bg-[#D1E8E2]/60 px-1 py-0.5 rounded font-mono text-[#116466]">“a”</code> under standardized conditions.
          The primary diagnostic label is binary (<code className="bg-[#D1E8E2]/60 px-1 py-0.5 rounded font-mono text-[#116466]">1 = Parkinson&apos;s Disease, 0 = Healthy Control</code>).
        </p>
      </div>

      {/* Section 2: Acoustic Feature Extraction */}
      <div className="craft-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466]">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal uppercase text-[#2C3531]">
            2. Praat Acoustic Feature Extraction Engine
          </h2>
        </div>
        <p className="text-sm text-[#2C3531]/80 leading-relaxed font-sans">
          Synapse-Voice utilizes a native Python bridge to the Praat acoustic engine (<code className="bg-[#D1E8E2]/60 px-1 py-0.5 rounded font-mono text-[#116466]">praat-parselmouth</code>) along with nonlinear dynamics algorithms to compute the 22 dysphonic features:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-[#D1E8E2]/25 p-5 rounded-2xl border border-[#D9B08C]/40 space-y-2">
            <h4 className="font-semibold text-[#2C3531] text-sm font-sans">Fundamental Frequency &amp; Perturbation</h4>
            <ul className="list-disc list-inside text-[#2C3531]/75 space-y-1 font-sans">
              <li><strong>MDVP:Fo, Fhi, Flo:</strong> Average, maximum, and minimum vocal pitch in Hertz using Praat’s autocorrelation method (75 Hz – 500 Hz range).</li>
              <li><strong>Jitter (local, Abs, RAP, PPQ5, DDP):</strong> Micro-instabilities in cycle-to-cycle pitch periods caused by vocal fold rigidity.</li>
              <li><strong>Shimmer (local, dB, APQ3, APQ5, APQ11, DDA):</strong> Cycle-to-cycle amplitude variations reflecting glottal resistance deficits.</li>
            </ul>
          </div>

          <div className="bg-[#D1E8E2]/25 p-5 rounded-2xl border border-[#D9B08C]/40 space-y-2">
            <h4 className="font-semibold text-[#2C3531] text-sm font-sans">Harmonics &amp; Nonlinear Complexity</h4>
            <ul className="list-disc list-inside text-[#2C3531]/75 space-y-1 font-sans">
              <li><strong>NHR &amp; HNR:</strong> Noise-to-harmonics ratio and harmonics-to-noise ratio in decibels, quantifying turbulent breathiness.</li>
              <li><strong>RPDE (Recurrence Period Density):</strong> Measures deviation from strict periodicity in vocal tract trajectories.</li>
              <li><strong>DFA (Detrended Fluctuation Analysis):</strong> Characterizes self-similarity of speech turbulent noise.</li>
              <li><strong>PPE (Pitch Period Entropy):</strong> Quantifies impaired control of fundamental pitch on logarithmic scales.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Signal Pre-verification */}
      <div className="craft-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466]">
            <FileCode className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal uppercase text-[#2C3531]">
            3. Audio Signal Pre-Checks &amp; Quality Gates
          </h2>
        </div>
        <p className="text-sm text-[#2C3531]/80 leading-relaxed font-sans">
          Before feeding any recording into Praat, Synapse-Voice enforces rigorous quality assurance checks:
        </p>
        <ul className="space-y-3 text-xs sm:text-sm text-[#2C3531]/80 font-sans">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#116466] shrink-0 mt-0.5" />
            <span><strong>Duration Check:</strong> Recordings must be at least 1.0 second long (to allow stable pitch tracking) and capped at 90.0 seconds.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#116466] shrink-0 mt-0.5" />
            <span><strong>Silence Threshold:</strong> Root-Mean-Square (RMS) amplitude must exceed 0.004 to reject empty microphone captures or silent files.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#116466] shrink-0 mt-0.5" />
            <span><strong>Clipping Detection:</strong> Flags signals where peak absolute amplitude exceeds 0.98, which causes harmonic distortion and invalidates shimmer calculations.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#116466] shrink-0 mt-0.5" />
            <span><strong>Standardization:</strong> All stereo or multichannel audio is downmixed to mono and resampled to 22,050 Hz 32-bit floating point PCM.</span>
          </li>
        </ul>
      </div>

      {/* Section 4: Preventing Data Leakage */}
      <div className="craft-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal uppercase text-[#2C3531]">
            4. Addressing The Recording-Level Data Leakage Problem
          </h2>
        </div>
        <p className="text-sm text-[#2C3531]/80 leading-relaxed font-sans">
          As documented in our <Link href="/benchmarks" className="text-[#116466] underline font-semibold">benchmark audit</Link>, many published papers report accuracies exceeding 95% on the Oxford dataset by using standard sample-level cross-validation.
          Because each participant supplied approximately six recordings, sample-level splitting allows individual speaker characteristics to leak across train and test partitions.
        </p>
        <div className="bg-[#2C3531] text-[#EBF4F1] p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-[#D9B08C]/30">
          <div className="text-[#FFCB9A] font-bold mb-1"># Subject-Isolated Grouping Protocol</div>
          <div>groups = [record.name.split(&apos;_&apos;)[0] for record in dataset]</div>
          <div>cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)</div>
          <div className="text-[#D1E8E2]/60 mt-1"># Every evaluation fold tests strictly on unseen patient vocal tracts</div>
        </div>
        <p className="text-xs text-[#2C3531]/75 leading-relaxed font-sans">
          This protocol establishes an honest generalizable performance ceiling of <strong>79.41% ± 7.77%</strong> accuracy and <strong>0.7963 ROC-AUC</strong>, eliminating misleading optimism.
        </p>
      </div>

      {/* Section 5: Clinical Ethics Disclaimer */}
      <div className="craft-card p-8 sm:p-10 border-l-4 border-[#D9B08C]">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-[#B84A39] shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-serif font-normal uppercase text-[#2C3531]">
              Clinical Screening vs. Medical Diagnosis
            </h3>
            <p className="text-sm text-[#2C3531]/80 mt-2 leading-relaxed font-sans font-normal">
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
