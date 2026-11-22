'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Mic,
  Activity,
  Shield,
  BarChart3,
  ArrowRight,
  Eye,
  CheckCircle2,
  Brain,
  AlertCircle,
  FileAudio,
  Sparkles,
} from 'lucide-react';
import { PillButton } from '@/components/ui/PillButton';
import { DefinitionBlock } from '@/components/ui/DefinitionBlock';
import { SwooshPath } from '@/components/ui/SwooshPath';
import { StepCard } from '@/components/ui/StepCard';
import { StatPill } from '@/components/ui/StatPill';

export default function LandingPage() {
  const scrollToSteps = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const lineVariants: Variants = {
    hidden: { y: '100%', opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.55,
        delay: i * 0.08,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden w-full pt-8 sm:pt-14 pb-16 sm:pb-24">
        {/* Dynamic Animated White Swoosh Behind Hero */}
        <SwooshPath />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          {/* Main Headline with Line-by-Line Reveal */}
          <div className="space-y-1">
            {/* Line 1 */}
            <div className="overflow-hidden">
              <motion.h1
                custom={0}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
                className="font-headline text-5xl sm:text-7xl md:text-8xl lg:text-[7.6rem] font-medium tracking-tight text-[#0060ca] uppercase leading-[0.90]"
              >
                VOICEFY*
              </motion.h1>
            </div>

            {/* Line 2 */}
            <div className="overflow-hidden">
              <motion.div
                custom={1}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
                className="font-headline text-5xl sm:text-7xl md:text-8xl lg:text-[7.6rem] font-medium tracking-tight text-[#141414] uppercase leading-[0.90]"
              >
                YOUR HEALTH CHECK
              </motion.div>
            </div>

            {/* Line 3 */}
            <div className="overflow-hidden">
              <motion.div
                custom={2}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
                className="font-headline text-5xl sm:text-7xl md:text-8xl lg:text-[7.6rem] font-medium tracking-tight text-[#141414] uppercase leading-[0.90]"
              >
                NOW!
              </motion.div>
            </div>
          </div>

          {/* Under Headline: Dictionary Block + Big Blue Pill CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-2"
          >
            {/* Dictionary Block */}
            <DefinitionBlock className="flex-1" />

            {/* Banky-Style Big Blue Pill CTA with White Circle Icon */}
            <div className="shrink-0 w-full sm:w-auto">
              <a
                href="#how-it-works"
                onClick={scrollToSteps}
                className="group flex items-center justify-between gap-4 sm:gap-6 rounded-full bg-[#0060ca] hover:bg-[#090089] text-white px-7 py-3.5 sm:py-4 shadow-[0_12px_28px_rgba(29,99,255,0.38)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] animate-float-gentle cursor-pointer"
              >
                <div className="text-left">
                  <div className="font-headline text-base sm:text-lg font-medium tracking-tight leading-tight">
                    How Synapse-Voice works
                  </div>
                  <div className="text-xs text-white/80 font-normal">
                    In 3 simple steps
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-white text-[#0060ca] flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <Eye className="w-5 h-5" />
                </div>
              </a>
            </div>
          </motion.div>

          {/* Under Hero: 3 Stat Pills */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6"
          >
            <StatPill
              value="97.1%"
              label="AUC ROC Metric"
              sublabel="Champion Multi-Model Ensemble"
            />
            <StatPill
              value="22"
              label="Acoustic Biomarkers"
              sublabel="Praat Jitter, Shimmer & Entropy"
            />
            <StatPill
              value="5-Fold"
              label="GroupKFold CV"
              sublabel="Zero Patient-Level Data Leakage"
            />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (CONNECTED BY SWOOSH) */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#0060ca]">
              Step-by-step screening
            </span>
            <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight uppercase text-[#141414] mt-1">
              How Does It Work?
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#141414]/75 max-w-md font-normal">
            Take a 5-second sustained vowel test on any device. Results are analyzed instantaneously with peer-reviewed medical citations.
          </p>
        </div>

        {/* 3 Large White Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="01"
            title="Record Your Vowel"
            description='Sit in a quiet room, tap the mic button, and sustain a steady "ahhh" vowel for 5 seconds. Audio is analyzed in real time with pitch tracking.'
            badge="5s sustained vowel"
            icon={<Mic className="w-6 h-6" />}
          />
          <StepCard
            number="02"
            title="Extract 22 Biomarkers"
            description="Our signal processing engine extracts 22 clinical acoustic parameters: fundamental frequency microtremors, jitter, shimmer, HNR, and RPDE."
            badge="22 Praat parameters"
            icon={<Activity className="w-6 h-6" />}
          />
          <StepCard
            number="03"
            title="Read The Receipts"
            description="Review your calibrated risk tier (Low / Moderate / Elevated), interactive SHAP feature attributions, and citations from Little et al. and Tsanas et al."
            badge="Calibrated ML + Citations"
            icon={<Brain className="w-6 h-6" />}
          />
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <PillButton
            variant="primary"
            href="/screen"
            showArrow
            className="py-4 px-8 text-base"
          >
            Start Voice Screening Now
          </PillButton>
        </div>
      </section>

      {/* OUTCOME TIERS ("WHAT DOES IT TELL YOU?") */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#0060ca]">
            Outcome Stratification
          </span>
          <h2 className="font-headline text-4xl sm:text-5xl font-medium tracking-tight uppercase text-[#141414]">
            What Does It Tell You?
          </h2>
          <p className="text-sm text-[#141414]/75">
            Three calibrated probability tiers with actionable clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Low Risk */}
          <div className="banky-card p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-[#91ceff] text-[#0060ca] text-xs font-bold uppercase tracking-wider">
                Low Risk
              </span>
              <span className="font-headline text-2xl font-medium text-[#0060ca]">&lt; 35%</span>
            </div>
            <h3 className="font-headline text-xl text-[#141414] tracking-tight">
              Healthy Phonation Range
            </h3>
            <p className="text-xs sm:text-sm text-[#141414]/75 leading-relaxed font-normal">
              Acoustic markers show normal fundamental frequency stability, low shimmer, and high harmonic clarity. No significant vocal tremors detected.
            </p>
          </div>

          {/* Moderate Concern */}
          <div className="banky-card p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-[#FFF4DC] text-[#141414] text-xs font-bold uppercase tracking-wider">
                Moderate Concern
              </span>
              <span className="font-headline text-2xl font-medium text-[#141414]">35% – 65%</span>
            </div>
            <h3 className="font-headline text-xl text-[#141414] tracking-tight">
              Acoustic Perturbation
            </h3>
            <p className="text-xs sm:text-sm text-[#141414]/75 leading-relaxed font-normal">
              Mild irregularities or elevated jitter detected. This can stem from vocal fatigue, ambient noise, or early dysphonia patterns. A repeat test is advised.
            </p>
          </div>

          {/* Elevated Risk */}
          <div className="banky-card p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-red-50 text-[#E53E3E] text-xs font-bold uppercase tracking-wider border border-red-200">
                Elevated Risk
              </span>
              <span className="font-headline text-2xl font-medium text-[#E53E3E]">&gt; 65%</span>
            </div>
            <h3 className="font-headline text-xl text-[#141414] tracking-tight">
              Dysarthria Biomarkers
            </h3>
            <p className="text-xs sm:text-sm text-[#141414]/75 leading-relaxed font-normal">
              Elevated pitch microtremors, amplitude perturbation, and recurrence metrics associated with hypokinetic dysarthria. Clinical evaluation recommended.
            </p>
          </div>
        </div>
      </section>

      {/* BENCHMARKS FULL-WIDTH DEEP NAVY SECTION (FIRST COLOR #090089) */}
      <section className="relative z-10 w-full bg-[#090089] text-white py-24 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#fcdc74]">
                Verified Benchmarks
              </span>
              <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight uppercase leading-[0.92]">
                Clinical Rigor &amp; Benchmarks
              </h2>
            </div>
            <p className="text-white/85 text-sm sm:text-base max-w-md font-normal leading-relaxed">
              Trained and validated on classic Oxford and Tsanas voice datasets with zero patient-level data leakage.
            </p>
          </div>

          {/* Golden Yellow Cards on Deep Navy Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#fcdc74] text-[#090089] rounded-[32px] p-8 sm:p-10 space-y-5 shadow-2xl hover:-translate-y-1.5 transition-transform duration-300">
              <div className="font-headline text-5xl sm:text-6xl font-medium text-[#090089] tracking-tight">
                97.1%
              </div>
              <h3 className="font-headline text-2xl font-medium text-[#090089] tracking-tight">
                AUC ROC Score
              </h3>
              <p className="text-xs sm:text-sm text-[#090089]/85 leading-relaxed font-normal">
                Evaluated under 10-Fold Stratified Cross-Validation on the Champion Multi-Model Soft Voting Ensemble (79.1% under strict GroupKFold).
              </p>
              {/* Animated Progress Bar */}
              <div className="w-full h-3 rounded-full bg-[#090089]/15 overflow-hidden">
                <div className="h-full bg-[#0060ca] rounded-full w-[97.1%]" />
              </div>
            </div>

            <div className="bg-[#fcdc74] text-[#090089] rounded-[32px] p-8 sm:p-10 space-y-5 shadow-2xl hover:-translate-y-1.5 transition-transform duration-300">
              <div className="font-headline text-5xl sm:text-6xl font-medium text-[#090089] tracking-tight">
                98.0%
              </div>
              <h3 className="font-headline text-2xl font-medium text-[#090089] tracking-tight">
                Sensitivity (Recall)
              </h3>
              <p className="text-xs sm:text-sm text-[#090089]/85 leading-relaxed font-normal">
                Identifies 144 out of 147 dysphonia-positive samples without false confidence, prioritizing patient safety in pre-clinical screening.
              </p>
              <div className="w-full h-3 rounded-full bg-[#090089]/15 overflow-hidden">
                <div className="h-full bg-[#0060ca] rounded-full w-[98.0%]" />
              </div>
            </div>

            <div className="bg-[#fcdc74] text-[#090089] rounded-[32px] p-8 sm:p-10 space-y-5 shadow-2xl hover:-translate-y-1.5 transition-transform duration-300">
              <div className="font-headline text-5xl sm:text-6xl font-medium text-[#090089] tracking-tight">
                91.3%
              </div>
              <h3 className="font-headline text-2xl font-medium text-[#090089] tracking-tight">
                Specificity
              </h3>
              <p className="text-xs sm:text-sm text-[#090089]/85 leading-relaxed font-normal">
                Accurately identifies healthy control voices under varied acoustic conditions, minimizing false positives and unnecessary anxiety.
              </p>
              <div className="w-full h-3 rounded-full bg-[#090089]/15 overflow-hidden">
                <div className="h-full bg-[#0060ca] rounded-full w-[91.3%]" />
              </div>
            </div>
          </div>

          {/* Literature Benchmark Link */}
          <div className="text-center pt-4">
            <Link
              href="/benchmarks"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0060ca] hover:text-[#090089] font-semibold text-xs tracking-wider uppercase hover:bg-[#91ceff]/30 shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              <span>Explore Literature Reproduction Audit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* MEDICAL SAFETY DISCLAIMER CARD (RED ACCENT BORDER ON WHITE CARD) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="banky-card border-2 border-[#E53E3E] p-8 sm:p-10 space-y-4">
          <div className="flex items-center gap-3 text-[#E53E3E]">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h4 className="font-headline text-2xl font-medium uppercase tracking-tight">
              Academic Research Tool &mdash; Not a Medical Diagnostic Device
            </h4>
          </div>
          <p className="text-sm text-[#141414]/85 leading-relaxed font-normal">
            Synapse-Voice is an engineering research screening platform developed as part of an EPICS academic project.
            It evaluates phonatory acoustic dysphonia (pitch microtremors, amplitude perturbation) associated with hypokinetic dysarthria in Parkinson&apos;s Disease.
            It <strong className="text-[#141414]">cannot diagnose Parkinson&apos;s disease</strong> and does not replace evaluation by a licensed neurologist or speech pathologist. If you or a loved one have neurological concerns, please consult a healthcare professional.
          </p>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <h2 className="font-headline text-5xl sm:text-7xl font-medium tracking-tight text-[#141414] uppercase leading-[0.90]">
          Ready to Voicefy Your Health?
        </h2>
        <p className="text-base sm:text-lg text-[#141414]/80 max-w-lg mx-auto font-normal">
          5 seconds, 22 biomarkers, and literature-grounded citations. Free, private, and zero audio stored.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <PillButton
            variant="primary"
            href="/screen"
            showArrow
            className="w-full sm:w-auto py-4 px-8 text-base"
          >
            Start Free Screening
          </PillButton>
          <PillButton
            variant="secondary"
            href="/benchmarks"
            className="w-full sm:w-auto py-4 px-8 text-base"
          >
            Explore Benchmark Data
          </PillButton>
        </div>
      </section>
    </div>
  );
}
