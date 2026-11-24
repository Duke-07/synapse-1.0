'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Trash2,
  EyeOff,
  ServerOff,
  FileText,
  ArrowRight,
} from 'lucide-react';
import PillButton from '@/components/ui/PillButton';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D1E8E2] text-[#116466] border border-[#116466]/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#116466]" />
          Data Governance &amp; Ethical Privacy
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-normal uppercase text-[#2C3531] tracking-tight">
          Privacy Policy &amp; Consent
        </h1>
        <p className="mt-4 text-[#2C3531]/75 text-base font-sans leading-relaxed">
          How Synapse-Voice protects user privacy, eliminates acoustic surveillance, and enforces strict zero-retention defaults.
        </p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="craft-card p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466] mx-auto mb-4 shadow-xs">
            <ServerOff className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-normal uppercase text-lg text-[#2C3531]">Zero-Retention Mode</h3>
          <p className="text-xs text-[#2C3531]/75 mt-2 leading-relaxed font-sans">
            Raw voice recordings are never permanently stored on servers. Audio buffers are discarded immediately once the 22 acoustic features are computed.
          </p>
        </div>

        <div className="craft-card p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466] mx-auto mb-4 shadow-xs">
            <EyeOff className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-normal uppercase text-lg text-[#2C3531]">No Account Required</h3>
          <p className="text-xs text-[#2C3531]/75 mt-2 leading-relaxed font-sans">
            Anyone can screen anonymously. We collect no email addresses, IP addresses, full names, or Protected Health Information (PHI).
          </p>
        </div>

        <div className="craft-card p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D1E8E2] flex items-center justify-center text-[#116466] mx-auto mb-4 shadow-xs">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-normal uppercase text-lg text-[#2C3531]">Client-Side Control</h3>
          <p className="text-xs text-[#2C3531]/75 mt-2 leading-relaxed font-sans">
            Screening history is preserved solely in your local browser’s localStorage. You can erase all records instantly with one click.
          </p>
        </div>
      </div>

      {/* Detailed Provisions */}
      <div className="craft-card p-8 sm:p-10 space-y-8 text-sm text-[#2C3531]/80 font-sans">
        <div>
          <h2 className="text-xl font-serif font-normal uppercase text-[#2C3531] mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#116466]" />
            1. Collection and Use of Voice Data
          </h2>
          <p className="leading-relaxed">
            Synapse-Voice captures sustained vowel vocalizations (e.g., “a-a-a-h”) through your device’s microphone or via uploaded audio files.
            The audio data is processed strictly for extracting acoustic features: fundamental frequency perturbation (Jitter), amplitude perturbation (Shimmer), harmonic ratios (HNR/NHR), and nonlinear complexity parameters (RPDE, DFA, PPE).
            When zero-retention mode is selected (enabled by default), the audio file is securely deleted from temporary system memory immediately after feature extraction.
          </p>
        </div>

        <div className="border-t border-[#D9B08C]/30 pt-6">
          <h2 className="text-xl font-serif font-normal uppercase text-[#2C3531] mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#116466]" />
            2. Research and Educational Scope (EPICS)
          </h2>
          <p className="leading-relaxed">
            This platform is an academic research engineering project developed under the EPICS (Engineering Projects in Community Service) curriculum.
            It is designed to demonstrate how signal processing, machine learning, and retrieval-augmented generation (RAG) can create transparent, explainable screening aids.
            It does not constitute a certified medical device under FDA or CE regulations and is not intended for primary clinical diagnosis.
          </p>
        </div>

        <div className="border-t border-[#D9B08C]/30 pt-6">
          <h2 className="text-xl font-serif font-normal uppercase text-[#2C3531] mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#116466]" />
            3. Transmission and Security
          </h2>
          <p className="leading-relaxed">
            All network communication between your browser and the Synapse-Voice backend occurs over encrypted TLS/HTTPS protocols.
            Cross-Origin Resource Sharing (CORS) is restricted to verified domains and authorized local development environments.
          </p>
        </div>

        <div className="border-t border-[#D9B08C]/30 pt-6">
          <h2 className="text-xl font-serif font-normal uppercase text-[#2C3531] mb-3 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#116466]" />
            4. User Data Deletion
          </h2>
          <p className="leading-relaxed">
            You maintain full sovereignty over your data.
            To delete screening history stored on your device, navigate to the{' '}
            <Link href="/history" className="text-[#116466] underline font-semibold">
              Session History page
            </Link>{' '}
            and select “Clear Local”, or clear your browser cache and cookies.
          </p>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link href="/screen">
          <PillButton variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
            Proceed to Screening
          </PillButton>
        </Link>
      </div>
    </div>
  );
}
