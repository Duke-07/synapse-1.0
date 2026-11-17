import React from 'react';
import Link from 'next/link';
import { Mic, Activity, Shield, BarChart3, ArrowRight, CheckCircle2, HeartPulse, Brain, AlertTriangle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-semibold">
          <HeartPulse className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Pre-Clinical Acoustic Dysphonia Screening Aid
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Acoustic Voice Biomarkers for{' '}
          <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Parkinson&apos;s Screening
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Record a sustained vowel sound (up to 90 seconds). Synapse-Voice validates audio quality,
          extracts 22 clinical acoustic biomarkers via Praat signal processing, runs a subject-independent
          neural classifier, and provides plain-language explanations cited from peer-reviewed research.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/screen"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Voice Screening Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/benchmarks"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Literature & Reproduction
          </Link>
        </div>

        {/* Persistent Academic Disclaimer Box */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Important Clinical and Ethical Boundaries:</p>
            <p>
              Synapse-Voice is a semester-long academic research project (EPICS). It evaluates vocal dysphonia
              (subtle pitch and amplitude microtremors) indicative of hypokinetic dysarthria. It is <strong>NEVER a diagnostic device</strong>,
              cannot diagnose Parkinson&apos;s disease, and does not replace examination by a licensed neurologist.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">22 Acoustic Biomarkers</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Extracts exact MDVP-style features: F0 statistics, 5 jitter variations, 6 shimmer variations,
            noise ratios (NHR, HNR), and nonlinear dynamics (RPDE, D2, DFA, spread1, spread2, PPE) using Praat algorithms.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Leakage-Free Modeling</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Unlike 75% of published literature using naive random splits, Synapse-Voice models are strictly trained under
            5-fold StratifiedGroupKFold cross-validation, guaranteeing honest generalization to unseen patients.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cited RAG Explanations</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every prediction is explained via SHAP feature importance and grounded in 10 indexed peer-reviewed papers
            (IEEE TBME, Nature Scientific Reports, Frontiers), citing empirical literature in plain language.
          </p>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            How The Screening Protocol Works
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            A 3-step non-invasive acoustic pipeline designed for clinic or home triage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Sustained Vowel Recording</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hold a steady, comfortable &quot;ahhh&quot; vowel for at least 3 seconds. The Web Audio visualizer checks for silence, clipping, and audio duration.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Acoustic Signal Processing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              The backend converts audio to 44.1 kHz WAV and measures vocal cord microtremors (jitter, shimmer), pitch period entropy (PPE), and noise harmonicity.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">SHAP Attribution & RAG</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive a calibrated probability score, view which biomarkers shifted your score, and review evidence-based explanations cited from peer-reviewed papers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
