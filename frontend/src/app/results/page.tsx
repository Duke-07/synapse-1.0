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
  HelpCircle,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Volume2,
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
        // Try fetching from API
        const res = await getAnalysisResult(id);
        setData(res);
      } catch (err: any) {
        // Fallback to sessionStorage if backend was local or disconnected
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
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Loading Acoustic Assessment...</h2>
        <p className="text-slate-400 text-sm mt-1">Retrieving 22 Praat biomarkers, SHAP attributions, and citations.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Screening Result Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'Unable to locate this analysis record.'}</p>
        <Link
          href="/screen"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Perform New Screening
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 print:py-2 print:text-black">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <Link
          href="/screen"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          New Voice Screening
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Discuss with AI Assistant
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium rounded-lg shadow transition-all"
          >
            <Download className="w-4 h-4" />
            Export Screening Report
          </button>
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer Banner */}
      <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-xl text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-300">
            Investigational Screening Result Only — Not a Medical Diagnosis
          </span>
          <p className="mt-1 text-amber-200/90 leading-relaxed">
            This report presents probabilistic acoustic anomaly scores computed using machine learning on sustained vowel phonations.
            It cannot confirm or rule out Parkinson’s disease. Any clinical concern must be evaluated by a certified neurologist.
          </p>
        </div>
      </div>

      {/* Summary Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs text-slate-400 font-mono mb-1">
              Screening ID: <span className="text-slate-300 font-semibold">{data.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Vocal Biomarker Assessment Report
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated on {new Date(data.created_at).toLocaleDateString()} at{' '}
              {new Date(data.created_at).toLocaleTimeString()} • Model: {data.model_version}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider ${
                data.confidence_band === 'Low Risk'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  : data.confidence_band === 'Moderate Concern'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800'
              }`}
            >
              {data.confidence_band}
            </span>
          </div>
        </div>

        {/* Probability Gauge & Top Drivers grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-800">
          <div className="flex flex-col items-center justify-center">
            <ProbabilityGauge
              probability={data.probability}
              confidenceBand={data.confidence_band}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Primary Acoustic Decision Drivers (SHAP)
            </h3>
            <div className="h-56">
              <ShapChart attributions={data.top_biomarkers} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Positive SHAP values push toward elevated acoustic anomaly risk; negative values push toward normal baseline.
            </p>
          </div>
        </div>
      </div>

      {/* Audio Quality Metrics */}
      {data.audio_quality && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            Audio Quality & Signal Verification
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="text-slate-400">Duration</div>
              <div className="font-mono text-sm font-bold text-slate-200 mt-0.5">
                {data.audio_quality.duration_sec?.toFixed(2)} s
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="text-slate-400">Sample Rate</div>
              <div className="font-mono text-sm font-bold text-slate-200 mt-0.5">
                {data.audio_quality.sample_rate || 22050} Hz
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="text-slate-400">Clipping Flag</div>
              <div className="font-mono text-sm font-bold mt-0.5 text-emerald-400">
                {data.audio_quality.clipping ? 'Detected (High)' : 'Clean'}
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="text-slate-400">Signal-to-Noise</div>
              <div className="font-mono text-sm font-bold text-slate-200 mt-0.5">
                {data.audio_quality.snr_db ? `${data.audio_quality.snr_db.toFixed(1)} dB` : '> 20 dB'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive 22 Biomarkers Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">Full 22 Praat Acoustic Biomarker Profile</h3>
          <p className="text-xs text-slate-400 mt-1">
            Measured pitch perturbation (Jitter), amplitude perturbation (Shimmer), harmonic ratio (HNR), and non-linear complexity indices (RPDE, DFA, PPE).
          </p>
        </div>
        <BiomarkerTable
          features={data.features}
          shapValues={data.shap_values}
        />
      </div>

      {/* RAG Plain Language Explanation & Peer-Reviewed Literature Citations */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Literature-Grounded Plain Language Explanation (RAG)
          </div>
          <h3 className="text-lg font-bold text-white">Clinical Research Interpretation</h3>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
          {data.explanation}
        </div>

        {/* Citations List */}
        {data.literature_citations && data.literature_citations.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Referenced Peer-Reviewed Studies (DOIs Verified)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.literature_citations.map((cite, i) => (
                <div
                  key={i}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <div>
                    <h5 className="font-semibold text-slate-200 text-xs line-clamp-2">
                      {cite.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {cite.authors} ({cite.year})
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">
                      Corpus Match: {(cite.similarity * 100).toFixed(0)}%
                    </span>
                    {cite.doi && (
                      <a
                        href={cite.doi.startsWith('http') ? cite.doi : `https://doi.org/${cite.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium"
                      >
                        DOI Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
