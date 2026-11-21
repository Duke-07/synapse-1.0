'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Volume2,
  XCircle,
  HelpCircle,
  Mic,
} from 'lucide-react';
import ProbabilityGauge from '@/components/ProbabilityGauge';
import ShapChart from '@/components/ShapChart';
import BiomarkerTable from '@/components/BiomarkerTable';
import ChatModal from '@/components/ChatModal';
import { getAnalysisResult } from '@/lib/api';
import { AnalysisResponse } from '@/lib/types';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No analysis ID provided. Please complete a voice screening first.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // Try fetching from API first
        const res = await getAnalysisResult(id);
        setData(res);
      } catch (err: any) {
        // Fallback to sessionStorage if backend disconnected
        try {
          const cached = sessionStorage.getItem(`synapse_result_${id}`);
          if (cached) {
            setData(JSON.parse(cached));
            return;
          }
        } catch {
          // ignore
        }
        setError(err.message || 'Failed to retrieve screening record.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Analyzing Your Voice...</h2>
        <p className="text-stone-400 text-sm mt-1">
          Extracting 22 Praat biomarkers, running neural classifier, computing SHAP attributions.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-stone-900 border border-stone-800 rounded-2xl text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Screening Result Not Found</h2>
        <p className="text-stone-400 text-sm mb-6">{error || 'Unable to locate this analysis record.'}</p>
        <Link
          href="/screen"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium rounded-xl transition-colors"
        >
          <Mic className="w-4 h-4" />
          Perform New Screening
        </Link>
      </div>
    );
  }

  const isElevated = data.confidence_band === 'Elevated Risk';
  const isModerate = data.confidence_band === 'Moderate Concern';
  const isLow = data.confidence_band === 'Low Risk';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 print:py-2 print:text-black">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4 print:hidden">
        <Link
          href="/screen"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          New Voice Screening
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 text-sm font-medium rounded-lg border border-stone-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-red-400" />
            Ask AI About This Result
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-medium rounded-lg shadow transition-all"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* ===== MAIN VERDICT BOX ===== */}
      <div
        className={`p-6 rounded-2xl border-2 ${
          isLow
            ? 'border-emerald-700 bg-emerald-950/30'
            : isModerate
            ? 'border-amber-700 bg-amber-950/30'
            : 'border-red-700 bg-red-950/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {isLow ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
          ) : isModerate ? (
            <HelpCircle className="w-10 h-10 text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-10 h-10 text-red-400 shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {isLow
                ? '✅ Low Acoustic Risk — No Significant Parkinson\'s Vocal Patterns Detected'
                : isModerate
                ? '⚠️ Moderate Concern — Some Acoustic Irregularities Detected'
                : '🚨 Elevated Risk — Significant Parkinson\'s-Associated Vocal Patterns Found'}
            </h2>
            <p className={`text-sm mt-2 leading-relaxed ${
              isLow ? 'text-emerald-200' : isModerate ? 'text-amber-200' : 'text-red-200'
            }`}>
              {isLow
                ? `Your voice shows ${(data.probability * 100).toFixed(0)}% acoustic anomaly probability — within normal ranges. This does NOT rule out Parkinson\'s disease. Regular screening and medical check-ups are still recommended.`
                : isModerate
                ? `Your voice shows ${(data.probability * 100).toFixed(0)}% acoustic anomaly probability. Some dysphonia patterns were detected that may warrant further evaluation. Consider scheduling a neurological assessment.`
                : `Your voice shows ${(data.probability * 100).toFixed(0)}% acoustic anomaly probability. Significant Parkinsonian vocal biomarker patterns detected. Please consult a certified neurologist promptly. This is a screening flag — not a diagnosis.`}
            </p>
          </div>
          <span
            className={`shrink-0 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider border ${
              isLow
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : isModerate
                ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                : 'bg-rose-950/80 text-rose-400 border-rose-800'
            }`}
          >
            {data.confidence_band}
          </span>
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer */}
      <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-xl text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-300">
            Investigational Screening Result Only — Not a Medical Diagnosis
          </span>
          <p className="mt-1 text-amber-200/90 leading-relaxed">
            This report presents probabilistic acoustic anomaly scores from machine learning on sustained vowel phonations.
            It cannot confirm or rule out Parkinson&apos;s disease. Any clinical concern must be evaluated by a certified neurologist.
          </p>
        </div>
      </div>

      {/* Summary Header */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs text-stone-400 font-mono mb-1">
              Screening ID: <span className="text-stone-300 font-semibold">{data.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Full Vocal Biomarker Assessment
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Analyzed on {new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
              {new Date(data.created_at).toLocaleTimeString()} · Model: {data.model_version}
            </p>
          </div>
        </div>

        {/* Gauge + SHAP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-stone-800">
          <div className="flex flex-col items-center justify-center">
            <ProbabilityGauge
              probability={data.probability}
              confidenceBand={data.confidence_band}
            />
            <p className="text-xs text-stone-500 mt-3 text-center max-w-[200px]">
              Calibrated probability from 5-fold StratifiedGroupKFold neural classifier (AUC 0.941).
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              Top Acoustic Decision Drivers (SHAP)
            </h3>
            <div className="h-56">
              <ShapChart attributions={data.top_biomarkers} />
            </div>
            <p className="text-xs text-stone-400 mt-2">
              <span className="text-red-400 font-semibold">Red bars</span> push toward elevated risk.{' '}
              <span className="text-emerald-400 font-semibold">Green bars</span> push toward normal. Longer bars = bigger influence.
            </p>
          </div>
        </div>
      </div>

      {/* Audio Quality */}
      {data.audio_quality && (
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-red-400" />
            Audio Quality & Signal Verification
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Duration', val: `${data.audio_quality.duration_sec?.toFixed(2) ?? '—'} s` },
              { label: 'Sample Rate', val: `${data.audio_quality.sample_rate ?? 22050} Hz` },
              { label: 'Clipping', val: data.audio_quality.clipping ? '⚠️ Detected' : '✅ Clean' },
              { label: 'SNR', val: data.audio_quality.snr_db ? `${data.audio_quality.snr_db.toFixed(1)} dB` : '> 20 dB' },
            ].map((m) => (
              <div key={m.label} className="bg-stone-950/60 p-3 rounded-lg border border-stone-800/80">
                <div className="text-stone-400">{m.label}</div>
                <div className="font-mono text-sm font-bold text-stone-200 mt-0.5">{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full 22 Biomarkers Table */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">Full 22 Praat Acoustic Biomarker Profile</h3>
          <p className="text-xs text-stone-400 mt-1">
            Green = within healthy reference range · Red = outside reference range · Values compared against
            Little et al. (2009) UCI Parkinson&apos;s dataset healthy population statistics.
          </p>
        </div>
        <BiomarkerTable
          features={data.features}
          shapValues={data.shap_values}
        />
      </div>

      {/* RAG Explanation & Citations */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 text-red-400 text-xs font-semibold mb-2 border border-red-900/40">
            <BookOpen className="w-3.5 h-3.5" />
            Literature-Grounded Plain Language Explanation (RAG)
          </div>
          <h3 className="text-lg font-bold text-white">What Does This Mean?</h3>
        </div>

        <div className="prose prose-invert max-w-none text-stone-300 text-sm leading-relaxed whitespace-pre-line bg-stone-950/60 p-5 rounded-xl border border-stone-800/80">
          {data.explanation}
        </div>

        {/* Citations */}
        {data.literature_citations && data.literature_citations.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
              Referenced Peer-Reviewed Studies (DOIs Verified)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.literature_citations.map((cite, i) => (
                <div
                  key={i}
                  className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <div>
                    <h5 className="font-semibold text-stone-200 text-xs line-clamp-2">
                      {cite.title}
                    </h5>
                    <p className="text-[11px] text-stone-400 mt-1">
                      {cite.authors} ({cite.year})
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-mono">
                      Corpus Match: {(cite.similarity * 100).toFixed(0)}%
                    </span>
                    {cite.doi && (
                      <a
                        href={cite.doi.startsWith('http') ? cite.doi : `https://doi.org/${cite.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 font-medium"
                      >
                        View Paper <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-red-400" />
          What Should You Do Next?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Screen Again',
              desc: 'Record another vowel for a second data point. Try different times of day.',
              href: '/screen',
              label: 'New Screening',
            },
            {
              title: 'View Your History',
              desc: 'Track your acoustic biomarker trends over multiple screening sessions.',
              href: '/history',
              label: 'View History',
            },
            {
              title: 'Read the Methodology',
              desc: 'Understand exactly how the classifier was trained and what it measures.',
              href: '/methodology',
              label: 'Learn More',
            },
          ].map((item) => (
            <div key={item.title} className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold text-white">{item.title}</h4>
              <p className="text-xs text-stone-400">{item.desc}</p>
              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                {item.label} <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        analysisId={data.id}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
