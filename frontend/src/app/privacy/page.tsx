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
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider shadow-sm mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-blue" />
          Data Governance & Ethical Privacy
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-medium uppercase text-ink tracking-tight">
          Privacy Policy & Consent
        </h1>
        <p className="mt-4 text-ink/75 text-base">
          How Synapse-Voice protects user privacy, eliminates acoustic surveillance, and enforces strict zero-retention defaults.
        </p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="banky-card p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow/40 flex items-center justify-center text-blue mx-auto mb-4">
            <ServerOff className="w-7 h-7" />
          </div>
          <h3 className="font-display font-medium uppercase text-lg text-ink">Zero-Retention Mode</h3>
          <p className="text-xs text-ink/75 mt-2 leading-relaxed">
            Raw voice recordings are never permanently stored on servers. Audio buffers are discarded immediately once the 22 acoustic features are computed.
          </p>
        </div>

        <div className="banky-card p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow/40 flex items-center justify-center text-blue mx-auto mb-4">
            <EyeOff className="w-7 h-7" />
          </div>
          <h3 className="font-display font-medium uppercase text-lg text-ink">No Account Required</h3>
          <p className="text-xs text-ink/75 mt-2 leading-relaxed">
            Anyone can screen anonymously. We collect no email addresses, IP addresses, full names, or Protected Health Information (PHI).
          </p>
        </div>

        <div className="banky-card p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow/40 flex items-center justify-center text-blue mx-auto mb-4">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="font-display font-medium uppercase text-lg text-ink">Client-Side Control</h3>
          <p className="text-xs text-ink/75 mt-2 leading-relaxed">
            Screening history is preserved solely in your local browser’s localStorage. You can erase all records instantly with one click.
          </p>
        </div>
      </div>

      {/* Detailed Provisions */}
      <div className="banky-card p-8 sm:p-10 space-y-8 text-sm text-ink/80">
        <div>
          <h2 className="text-xl font-display font-medium uppercase text-ink mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue" />
            1. Collection and Use of Voice Data
          </h2>
          <p className="leading-relaxed">
            Synapse-Voice captures sustained vowel vocalizations (e.g., “a-a-a-h”) through your device’s microphone or via uploaded audio files.
            The audio data is processed strictly for extracting acoustic features: fundamental frequency perturbation (Jitter), amplitude perturbation (Shimmer), harmonic ratios (HNR/NHR), and nonlinear complexity parameters (RPDE, DFA, PPE).
            When zero-retention mode is selected (enabled by default), the audio file is securely deleted from temporary system memory immediately after feature extraction.
          </p>
        </div>

        <div className="border-t border-ink/10 pt-6">
          <h2 className="text-xl font-display font-medium uppercase text-ink mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue" />
            2. Research and Educational Scope (EPICS)
          </h2>
          <p className="leading-relaxed">
            This platform is an academic research engineering project developed under the EPICS (Engineering Projects in Community Service) curriculum.
            It is designed to demonstrate how signal processing, machine learning, and retrieval-augmented generation (RAG) can create transparent, explainable screening aids.
            It does not constitute a certified medical device under FDA or CE regulations and is not intended for primary clinical diagnosis.
          </p>
        </div>

        <div className="border-t border-ink/10 pt-6">
          <h2 className="text-xl font-display font-medium uppercase text-ink mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue" />
            3. Transmission and Security
          </h2>
          <p className="leading-relaxed">
            All network communication between your browser and the Synapse-Voice backend occurs over encrypted TLS/HTTPS protocols.
            Cross-Origin Resource Sharing (CORS) is restricted to verified domains and authorized local development environments.
          </p>
        </div>

        <div className="border-t border-ink/10 pt-6">
          <h2 className="text-xl font-display font-medium uppercase text-ink mb-3 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-blue" />
            4. User Data Deletion
          </h2>
          <p className="leading-relaxed">
            You maintain full sovereignty over your data.
            To delete screening history stored on your device, navigate to the{' '}
            <Link href="/history" className="text-blue underline font-bold">
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
