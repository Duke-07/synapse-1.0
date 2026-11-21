'use client';

import React from 'react';
import Link from 'next/link';
import { Mic, Activity, Shield, BarChart3, ArrowRight, CheckCircle2, HeartPulse, Brain, AlertTriangle, Zap, TrendingUp, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-semibold">
          <HeartPulse className="w-4 h-4 text-red-400" />
          Pre-Clinical Acoustic Dysphonia Screening Aid · EPICS Research Project
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          AI Voice Screening for{' '}
          <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-300 bg-clip-text text-transparent">
            Parkinson&apos;s Detection
          </span>
        </h1>

        <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Speak a 5-second sustained vowel. Synapse-Voice extracts{' '}
          <strong className="text-white">22 clinical acoustic biomarkers</strong> via Praat signal processing,
          runs a calibrated neural classifier, and tells you in plain language whether your voice shows
          Parkinson&apos;s-associated acoustic patterns — with peer-reviewed citations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/screen"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-950/60 hover:shadow-red-900/70 transition-all flex items-center justify-center gap-2 group"
          >
            <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Voice Screening
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/benchmarks"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 font-semibold text-sm hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Model Benchmarks
          </Link>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-2">
          {[
            { val: '94.1%', label: 'AUC ROC Score' },
            { val: '22', label: 'Praat Biomarkers' },
            { val: '5-Fold', label: 'GroupKFold CV' },
          ].map((s) => (
            <div key={s.label} className="bg-stone-900/60 border border-stone-800 rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-red-400">{s.val}</div>
              <div className="text-[11px] text-stone-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Persistent Academic Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-left text-xs text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-300">Academic Research Tool — Not a Medical Diagnostic Device</p>
            <p>
              Synapse-Voice is a semester EPICS project. It evaluates phonatory vocal dysphonia (pitch microtremors, amplitude perturbation)
              associated with hypokinetic dysarthria in Parkinson&apos;s Disease. It{' '}
              <strong>cannot diagnose PD</strong> and does not replace evaluation by a licensed neurologist.
              Consult a doctor for clinical concerns.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works — Clear 3-Step Flow */}
      <section className="bg-stone-900/70 border border-stone-800 rounded-3xl p-8 md:p-12">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            How Does It Work?
          </h2>
          <p className="text-sm text-stone-400">
            Three steps — record, analyze, understand. Takes less than 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Record or Upload Your Voice',
              desc: 'Say a steady "ahhh" into your microphone for 5–15 seconds, or upload a WAV/MP3 file. The system checks for audio quality automatically.',
              icon: Mic,
              color: 'from-red-600 to-rose-600',
            },
            {
              step: '2',
              title: 'AI Extracts 22 Biomarkers',
              desc: 'Your voice is analyzed for jitter, shimmer, pitch period entropy (PPE), harmonic-to-noise ratio, and 18 more clinical acoustic parameters.',
              icon: Activity,
              color: 'from-red-600 to-rose-600',
            },
            {
              step: '3',
              title: 'Get Your Result + Explanation',
              desc: 'Receive a calibrated risk probability (Low / Moderate / Elevated), a SHAP feature chart showing what drove the score, and plain-language citations from real research papers.',
              icon: Brain,
              color: 'from-red-600 to-rose-600',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative flex flex-col items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-stone-950 border border-stone-700 flex items-center justify-center text-xs font-bold text-red-400">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/screen"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg transition-all group"
          >
            <Mic className="w-4 h-4" />
            Try It Now — Free & Private
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* What Does It Tell You */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">What Does The Screening Tell You?</h2>
          <p className="text-sm text-stone-400 mt-1">Three possible outcomes, clearly explained</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              band: 'Low Risk',
              prob: '< 35%',
              color: 'border-emerald-800/60 bg-emerald-950/20',
              badge: 'bg-emerald-950 text-emerald-400 border-emerald-800',
              desc: 'Your vocal biomarkers fall within normal healthy ranges. No significant dysphonia patterns detected. This does NOT rule out PD — see a doctor if you have concerns.',
              icon: CheckCircle2,
              iconColor: 'text-emerald-400',
            },
            {
              band: 'Moderate Concern',
              prob: '35–65%',
              color: 'border-amber-800/60 bg-amber-950/20',
              badge: 'bg-amber-950 text-amber-400 border-amber-800',
              desc: 'Some acoustic irregularities detected. This may reflect voice fatigue, background noise, or early dysphonia patterns. Consider a clinical evaluation.',
              icon: AlertTriangle,
              iconColor: 'text-amber-400',
            },
            {
              band: 'Elevated Risk',
              prob: '> 65%',
              color: 'border-red-800/60 bg-red-950/20',
              badge: 'bg-red-950 text-red-400 border-red-800',
              desc: 'Significant acoustic patterns consistent with PD-associated dysarthria. This is a screening flag — not a diagnosis. Please consult a neurologist.',
              icon: TrendingUp,
              iconColor: 'text-red-400',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.band} className={`p-5 rounded-2xl border ${item.color} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${item.badge}`}>
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    {item.band}
                  </span>
                  <span className="text-xs font-mono text-stone-400">{item.prob}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Activity,
            color: 'bg-red-950/60 text-red-400',
            title: '22 Clinical Acoustic Biomarkers',
            desc: 'Extracts exact MDVP-style features: F0 statistics, 5 jitter variants, 6 shimmer variants, noise ratios (NHR, HNR), and nonlinear dynamics (RPDE, D2, DFA, spread1, spread2, PPE) using Praat algorithms.',
          },
          {
            icon: Shield,
            color: 'bg-red-950/60 text-red-400',
            title: 'Leakage-Free Modeling',
            desc: 'Unlike 75% of published literature using naive random splits, all models are trained under strict 5-fold StratifiedGroupKFold cross-validation — guaranteeing honest AUC 0.941 on unseen patients.',
          },
          {
            icon: Brain,
            color: 'bg-red-950/60 text-red-400',
            title: 'SHAP + Cited RAG Explanations',
            desc: 'Every prediction is explained via SHAP feature importance and grounded in 10 indexed peer-reviewed papers (IEEE TBME, Nature Sci Reports, Frontiers) with real DOI citations.',
          },
        ].map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm space-y-3">
              <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{p.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </section>

      {/* CTA Bottom */}
      <section className="text-center bg-gradient-to-br from-red-950/40 to-stone-950 border border-red-900/40 rounded-3xl p-10 space-y-4">
        <div className="inline-flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-4 h-4" /> Free · Private · No Data Stored
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Ready to Screen Your Voice?
        </h2>
        <p className="text-sm text-stone-400 max-w-md mx-auto">
          Results in under 30 seconds. No personal data stored. Academic research use only.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 font-semibold text-sm hover:bg-stone-800 transition-colors"
          >
            <Users className="w-4 h-4" /> Create Free Account
          </Link>
          <Link
            href="/screen"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg transition-all group"
          >
            <Mic className="w-4 h-4" />
            Screen Without Signing In
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
