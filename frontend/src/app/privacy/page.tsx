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
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/40 border border-cyan-700/60 text-cyan-300 text-xs font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Data Governance & Ethical Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Privacy Policy & Consent
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          How Synapse-Voice protects user privacy, eliminates acoustic surveillance, and enforces strict zero-retention defaults.
        </p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <ServerOff className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Zero-Retention Mode</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Raw voice recordings are never permanently stored on servers. Audio buffers are discarded immediately once the 22 acoustic features are computed.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mx-auto mb-3">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No Account Required</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Anyone can screen anonymously. We collect no email addresses, IP addresses, full names, or Protected Health Information (PHI).
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 mx-auto mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Client-Side Control</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Screening history is preserved solely in your local browser’s localStorage. You can erase all records instantly with one click.
          </p>
        </div>
      </div>

      {/* Detailed Provisions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-300">
        <div>
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            1. Collection and Use of Voice Data
          </h2>
          <p className="leading-relaxed">
            Synapse-Voice captures sustained vowel vocalizations (e.g., “a-a-a-h”) through your device’s microphone or via uploaded audio files.
            The audio data is processed strictly for extracting acoustic features: fundamental frequency perturbation (Jitter), amplitude perturbation (Shimmer), harmonic ratios (HNR/NHR), and nonlinear complexity parameters (RPDE, DFA, PPE).
            When zero-retention mode is selected (enabled by default), the audio file is securely deleted from temporary system memory immediately after feature extraction.
          </p>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            2. Research and Educational Scope (EPICS)
          </h2>
          <p className="leading-relaxed">
            This platform is an academic research engineering project developed under the EPICS (Engineering Projects in Community Service) curriculum.
            It is designed to demonstrate how signal processing, machine learning, and retrieval-augmented generation (RAG) can create transparent, explainable screening aids.
            It does not constitute a certified medical device under FDA or CE regulations and is not intended for primary clinical diagnosis.
          </p>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            3. Transmission and Security
          </h2>
          <p className="leading-relaxed">
            All network communication between your browser and the Synapse-Voice backend occurs over encrypted TLS/HTTPS protocols.
            Cross-Origin Resource Sharing (CORS) is restricted to verified domains and authorized local development environments.
          </p>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-cyan-400" />
            4. User Data Deletion
          </h2>
          <p className="leading-relaxed">
            You maintain full sovereignty over your data.
            To delete screening history stored on your device, navigate to the{' '}
            <Link href="/history" className="text-cyan-400 underline hover:text-cyan-300">
              Session History page
            </Link>{' '}
            and select “Clear Local History”, or clear your browser cache and cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
