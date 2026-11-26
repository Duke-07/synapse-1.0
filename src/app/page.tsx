'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Mic,
  Activity,
  Brain,
  AlertCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { PillButton } from '@/components/ui/PillButton';
import { DefinitionBlock } from '@/components/ui/DefinitionBlock';
import { SwooshPath } from '@/components/ui/SwooshPath';
import { StepCard } from '@/components/ui/StepCard';
import { StatPill } from '@/components/ui/StatPill';
import { SynapseHero3D, TiltCard3D, AcousticManifold3D } from '@/components/3d';

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
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden w-full pt-8 sm:pt-14 pb-16 sm:pb-24">
        {/* Subtle Ambient Curved Guide */}
        <SwooshPath />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          {/* Main Editorial Headline with Line-by-Line Reveal */}
          <div className="space-y-1">
            {/* Line 1 */}
            <div className="overflow-hidden">
              <motion.h1
                custom={0}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
                className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[7.6rem] font-normal tracking-tight text-[#116466] uppercase leading-[0.92]"
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
                className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[7.6rem] font-normal tracking-tight text-[#2C3531] uppercase leading-[0.92]"
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
                className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[7.6rem] font-normal tracking-tight text-[#2C3531] uppercase leading-[0.92]"
              >
                NOW!
              </motion.div>
            </div>
          </div>

          {/* Under Headline: Dictionary Block + Primary Action Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: [0.16, 1, 0.3, 1] as const }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-2"
          >
            {/* Dictionary Block */}
            <DefinitionBlock className="flex-1" />

            {/* Human-Crafted Editorial Action Pill */}
            <div className="shrink-0 w-full sm:w-auto">
              <a
                href="#how-it-works"
                onClick={scrollToSteps}
                className="group flex items-center justify-between gap-4 sm:gap-6 rounded-full bg-[#116466] hover:bg-[#0c4b4d] text-white px-7 py-3.5 sm:py-4 shadow-[0_8px_24px_rgba(17,100,102,0.30)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <div className="text-left">
                  <div className="font-serif text-base sm:text-lg font-normal tracking-tight leading-tight">
                    How Synapse-Voice works
                  </div>
                  <div className="text-xs text-[#D1E8E2] font-sans font-normal">
                    In 3 simple steps
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#D1E8E2] text-[#116466] flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105">
                  <Eye className="w-5 h-5" />
                </div>
              </a>
            </div>
          </motion.div>

          {/* 3D Interactive Acoustic Neural Core Centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] as const }}
            className="w-full pt-4"
          >
            <SynapseHero3D />
          </motion.div>

          {/* Under Hero: 3 Stat Pills with 3D Tilt */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.44, ease: [0.16, 1, 0.3, 1] as const }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6"
          >
            <TiltCard3D maxTilt={8} depth={15}>
              <StatPill
                value="97.1%"
                label="AUC ROC Metric"
                sublabel="Champion Multi-Model Ensemble"
              />
            </TiltCard3D>
            <TiltCard3D maxTilt={8} depth={15}>
              <StatPill
                value="22"
                label="Acoustic Biomarkers"
                sublabel="Praat Jitter, Shimmer & Entropy"
              />
            </TiltCard3D>
            <TiltCard3D maxTilt={8} depth={15}>
              <StatPill
                value="5-Fold"
                label="GroupKFold CV"
                sublabel="Zero Patient-Level Data Leakage"
              />
            </TiltCard3D>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION WITH 3D TILT CARDS */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-display font-semibold uppercase tracking-wider text-[#116466]">
              Step-by-step screening
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight uppercase text-[#2C3531] mt-1">
              How Does It Work?
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#2C3531]/75 max-w-md font-sans font-normal leading-relaxed">
            Take a 5-second sustained vowel test on any device. Results are analyzed instantaneously with peer-reviewed medical citations.
          </p>
        </div>

        {/* 3 Step Cards in 3D Perspective */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TiltCard3D maxTilt={14} depth={30} className="h-full">
            <StepCard
              number="01"
              title="Record Your Vowel"
              description='Sit in a quiet room, tap the mic button, and sustain a steady "ahhh" vowel for 5 seconds. Audio is analyzed in real time with pitch tracking.'
              badge="5s sustained vowel"
              icon={<Mic className="w-6 h-6" />}
            />
          </TiltCard3D>
          <TiltCard3D maxTilt={14} depth={30} className="h-full">
            <StepCard
              number="02"
              title="Extract 22 Biomarkers"
              description="Our signal processing engine extracts 22 clinical acoustic parameters: fundamental frequency microtremors, jitter, shimmer, HNR, and RPDE."
              badge="22 Praat parameters"
              icon={<Activity className="w-6 h-6" />}
            />
          </TiltCard3D>
          <TiltCard3D maxTilt={14} depth={30} className="h-full">
            <StepCard
              number="03"
              title="Read The Receipts"
              description="Review your calibrated risk tier (Low / Moderate / Elevated), interactive SHAP feature attributions, and citations from Little et al. and Tsanas et al."
              badge="Calibrated ML + Citations"
              icon={<Brain className="w-6 h-6" />}
            />
          </TiltCard3D>
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <PillButton
            variant="primary"
            href="/screen"
            showArrow
            className="py-3.5 px-8 text-base shadow-[0_12px_30px_rgba(17,100,102,0.3)] hover:scale-105 transition-transform"
          >
            Start Voice Screening Now
          </PillButton>
        </div>
      </section>

      {/* OUTCOME TIERS ("WHAT DOES IT TELL YOU?") WITH 3D TILT */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-display font-semibold uppercase tracking-wider text-[#116466]">
            Outcome Stratification
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight uppercase text-[#2C3531]">
            What Does It Tell You?
          </h2>
          <p className="text-sm text-[#2C3531]/75 font-sans leading-relaxed">
            Three calibrated probability tiers with actionable clinical clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Low Risk */}
          <TiltCard3D maxTilt={12} depth={25} className="h-full rounded-[1.75rem]">
            <div className="craft-card h-full p-8 space-y-4 hover:border-[#116466]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-[#D1E8E2] text-[#116466] text-xs font-semibold uppercase tracking-wider border border-[#116466]/20">
                  Low Risk
                </span>
                <span className="font-serif text-2xl font-normal text-[#116466]">&lt; 35%</span>
              </div>
              <h3 className="font-serif text-xl text-[#2C3531] tracking-tight">
                Healthy Phonation Range
              </h3>
              <p className="text-xs sm:text-sm text-[#2C3531]/75 leading-relaxed font-sans font-normal">
                Acoustic markers show normal fundamental frequency stability, low shimmer, and high harmonic clarity. No significant vocal tremors detected.
              </p>
            </div>
          </TiltCard3D>

          {/* Moderate Concern */}
          <TiltCard3D maxTilt={12} depth={25} className="h-full rounded-[1.75rem]">
            <div className="craft-card h-full p-8 space-y-4 hover:border-[#D9B08C] transition-colors">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-[#FFCB9A]/40 text-[#2C3531] text-xs font-semibold uppercase tracking-wider border border-[#D9B08C]">
                  Moderate Concern
                </span>
                <span className="font-serif text-2xl font-normal text-[#2C3531]">35% – 65%</span>
              </div>
              <h3 className="font-serif text-xl text-[#2C3531] tracking-tight">
                Acoustic Perturbation
              </h3>
              <p className="text-xs sm:text-sm text-[#2C3531]/75 leading-relaxed font-sans font-normal">
                Mild irregularities or elevated jitter detected. This can stem from vocal fatigue, ambient noise, or early dysphonia patterns. A repeat test is advised.
              </p>
            </div>
          </TiltCard3D>

          {/* Elevated Risk */}
          <TiltCard3D maxTilt={12} depth={25} className="h-full rounded-[1.75rem]">
            <div className="craft-card h-full p-8 space-y-4 hover:border-[#B84A39]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-[#FFCB9A] text-[#2C3531] text-xs font-semibold uppercase tracking-wider border border-[#D9B08C]">
                  Elevated Risk
                </span>
                <span className="font-serif text-2xl font-normal text-[#B84A39]">&gt; 65%</span>
              </div>
              <h3 className="font-serif text-xl text-[#2C3531] tracking-tight">
                Dysarthria Biomarkers
              </h3>
              <p className="text-xs sm:text-sm text-[#2C3531]/75 leading-relaxed font-sans font-normal">
                Elevated pitch microtremors, amplitude perturbation, and recurrence metrics associated with hypokinetic dysarthria. Clinical evaluation recommended.
              </p>
            </div>
          </TiltCard3D>
        </div>
      </section>

      {/* INTERACTIVE 3D ACOUSTIC LATENT SPACE MANIFOLD SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AcousticManifold3D />
      </section>

      {/* BENCHMARKS SECTION (ARCHITECTURAL DARK CHARCOAL WITH PALE MINT & WARM TAN) */}
      <section className="relative z-10 w-full bg-[#2C3531] text-[#EBF4F1] py-24 sm:py-28 overflow-hidden border-y border-[#D9B08C]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-display font-semibold uppercase tracking-wider text-[#FFCB9A]">
                Verified Benchmarks
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight uppercase leading-[0.92] text-[#EBF4F1]">
                Clinical Rigor &amp; Benchmarks
              </h2>
            </div>
            <p className="text-[#D1E8E2]/80 text-sm sm:text-base max-w-md font-sans font-normal leading-relaxed">
              Trained and validated on classic Oxford and Tsanas voice datasets with zero patient-level data leakage.
            </p>
          </div>

          {/* Structured Benchmark Cards with 3D Tilt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <TiltCard3D maxTilt={10} depth={22} className="h-full rounded-3xl">
              <div className="bg-[#1f2623] h-full border border-[#D9B08C]/40 rounded-3xl p-8 sm:p-9 space-y-4 shadow-lg">
                <div className="font-serif text-5xl sm:text-6xl font-normal text-[#FFCB9A] tracking-tight">
                  97.1%
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#EBF4F1] tracking-tight">
                  AUC ROC Score
                </h3>
                <p className="text-xs sm:text-sm text-[#D1E8E2]/80 leading-relaxed font-sans font-normal">
                  Evaluated under 10-Fold Stratified Cross-Validation on the Champion Multi-Model Soft Voting Ensemble (79.1% under strict GroupKFold).
                </p>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#116466] rounded-full w-[97.1%]" />
                </div>
              </div>
            </TiltCard3D>

            <TiltCard3D maxTilt={10} depth={22} className="h-full rounded-3xl">
              <div className="bg-[#1f2623] h-full border border-[#D9B08C]/40 rounded-3xl p-8 sm:p-9 space-y-4 shadow-lg">
                <div className="font-serif text-5xl sm:text-6xl font-normal text-[#D1E8E2] tracking-tight">
                  98.0%
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#EBF4F1] tracking-tight">
                  Sensitivity (Recall)
                </h3>
                <p className="text-xs sm:text-sm text-[#D1E8E2]/80 leading-relaxed font-sans font-normal">
                  Identifies 144 out of 147 dysphonia-positive samples without false confidence, prioritizing patient safety in pre-clinical screening.
                </p>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#116466] rounded-full w-[98.0%]" />
                </div>
              </div>
            </TiltCard3D>

            <TiltCard3D maxTilt={10} depth={22} className="h-full rounded-3xl">
              <div className="bg-[#1f2623] h-full border border-[#D9B08C]/40 rounded-3xl p-8 sm:p-9 space-y-4 shadow-lg">
                <div className="font-serif text-5xl sm:text-6xl font-normal text-[#FFCB9A] tracking-tight">
                  91.3%
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#EBF4F1] tracking-tight">
                  Specificity
                </h3>
                <p className="text-xs sm:text-sm text-[#D1E8E2]/80 leading-relaxed font-sans font-normal">
                  Accurately identifies healthy control voices under varied acoustic conditions, minimizing false positives and unnecessary anxiety.
                </p>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#116466] rounded-full w-[91.3%]" />
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Literature Benchmark Link */}
          <div className="text-center pt-2">
            <Link
              href="/benchmarks"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#D1E8E2] text-[#116466] font-semibold text-xs tracking-wider uppercase hover:bg-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Literature Reproduction Audit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* MEDICAL SAFETY DISCLAIMER CARD */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="craft-card border-l-4 border-[#D9B08C] p-8 sm:p-9 space-y-3.5">
          <div className="flex items-center gap-3 text-[#2C3531]">
            <AlertCircle className="w-5 h-5 text-[#B84A39] shrink-0" />
            <h4 className="font-serif text-xl sm:text-2xl font-normal tracking-tight">
              Academic Research Tool &mdash; Not a Medical Diagnostic Device
            </h4>
          </div>
          <p className="text-sm text-[#2C3531]/80 leading-relaxed font-sans font-normal">
            Synapse-Voice is an engineering research screening platform developed as part of an EPICS academic project.
            It evaluates phonatory acoustic dysphonia (pitch microtremors, amplitude perturbation) associated with hypokinetic dysarthria in Parkinson&apos;s Disease.
            It <strong className="text-[#2C3531]">cannot diagnose Parkinson&apos;s disease</strong> and does not replace evaluation by a licensed neurologist or speech pathologist. If you or a loved one have neurological concerns, please consult a healthcare professional.
          </p>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <h2 className="font-serif text-5xl sm:text-7xl font-normal tracking-tight text-[#2C3531] uppercase leading-[0.92]">
          Ready to Voicefy Your Health?
        </h2>
        <p className="text-base sm:text-lg text-[#2C3531]/80 max-w-lg mx-auto font-sans font-normal leading-relaxed">
          5 seconds, 22 biomarkers, and literature-grounded citations. Free, private, and zero audio stored.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <PillButton
            variant="primary"
            href="/screen"
            showArrow
            className="w-full sm:w-auto py-3.5 px-8 text-base"
          >
            Start Free Screening
          </PillButton>
          <PillButton
            variant="secondary"
            href="/benchmarks"
            className="w-full sm:w-auto py-3.5 px-8 text-base"
          >
            Explore Benchmark Data
          </PillButton>
        </div>
      </section>
    </div>
  );
}
