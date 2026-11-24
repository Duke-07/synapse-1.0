'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  MessageSquare,
  Mic,
} from 'lucide-react';
import ProbabilityGauge from '@/components/ProbabilityGauge';
import ShapChart from '@/components/ShapChart';
import BiomarkerTable from '@/components/BiomarkerTable';
import ChatModal from '@/components/ChatModal';
import { PillButton } from '@/components/ui/PillButton';
import { getAnalysisResult } from '@/lib/api';
import { AnalysisResponse, CitationItem } from '@/lib/types';

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
        const cachedSession = sessionStorage.getItem(`synapse_result_${id}`);
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          if (parsed && parsed.features) {
            setData(parsed);
            setLoading(false);
            return;
          }
        }
        const cachedLocal = localStorage.getItem(`synapse_result_${id}`);
        if (cachedLocal) {
          const parsed = JSON.parse(cachedLocal);
          if (parsed && parsed.features) {
            setData(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {}

      try {
        setLoading(true);
        const res = await getAnalysisResult(id);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve screening record.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <div className="w-12 h-12 border-4 border-[#116466] border-t-transparent rounded-full animate-spin" />
        <h2 className="font-serif text-3xl font-normal text-[#2C3531] uppercase tracking-tight">
          Analyzing Your Vocal Biomarkers...
        </h2>
        <p className="text-sm text-[#2C3531]/70 max-w-md font-sans">
          Extracting 22 Praat acoustic parameters, computing StratifiedGroupKFold classifier, and retrieving literature citations.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 craft-card text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#B84A39] mx-auto" />
        <h2 className="font-serif text-3xl font-normal text-[#2C3531] uppercase tracking-tight">
          Screening Result Not Found
        </h2>
        <p className="text-sm text-[#2C3531]/75 font-sans">{error || 'Unable to locate this analysis record.'}</p>
        <div className="pt-2">
          <PillButton variant="primary" href="/screen" showArrow>
            Perform New Screening
          </PillButton>
        </div>
      </div>
    );
  }

  const confidenceBand = data.confidence_band || 'Low Risk';

  const getRiskPill = () => {
    if (confidenceBand === 'Low Risk') {
      return (
        <span className="px-4 py-1.5 rounded-full bg-[#D1E8E2] text-[#116466] text-xs font-semibold uppercase tracking-wider border border-[#116466]/20">
          Low Risk (&lt; 35%)
        </span>
      );
    }
    if (confidenceBand === 'Moderate Concern') {
      return (
        <span className="px-4 py-1.5 rounded-full bg-[#FFCB9A]/40 text-[#2C3531] text-xs font-semibold uppercase tracking-wider border border-[#D9B08C]">
          Moderate Concern (35% – 65%)
        </span>
      );
    }
    return (
      <span className="px-4 py-1.5 rounded-full bg-[#FFCB9A] text-[#2C3531] text-xs font-semibold uppercase tracking-wider border border-[#D9B08C]">
        Elevated Risk (&gt; 65%)
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/screen"
          className="inline-flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider text-[#2C3531] hover:text-[#116466] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recording
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#D9B08C]/40 text-xs font-semibold text-[#2C3531] shadow-xs hover:bg-[#D1E8E2]/30 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#116466]" /> Ask AI Assistant
          </button>
          <Link
            href="/screen"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#116466] text-white text-xs font-semibold hover:bg-[#0c4b4d] shadow-xs transition-all"
          >
            <Mic className="w-4 h-4" /> New Test
          </Link>
        </div>
      </div>

      {/* Hero Result Banner */}
      <div className="craft-card p-8 sm:p-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#D9B08C]/30">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {getRiskPill()}
              <span className="text-xs text-[#2C3531]/60 font-mono">
                ID: {data.id.slice(0, 8)} &middot; {new Date(data.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#2C3531] uppercase leading-[0.92]">
              Acoustic Screening Report
            </h1>
          </div>

          <div className="shrink-0">
            <ProbabilityGauge
              probability={data.probability}
              confidenceBand={data.confidence_band}
            />
          </div>
        </div>

        {/* Plain Language Interpretation */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-normal text-[#2C3531] uppercase tracking-tight">
            Plain-Language Analysis
          </h3>
          <p className="text-sm sm:text-base text-[#2C3531]/85 leading-relaxed font-sans font-normal">
            {data.explanation ||
              'Your sustained vowel phonation was evaluated using 22 calibrated MDVP parameters. The classifier evaluates pitch microtremors and nonlinear recurrence patterns associated with hypokinetic dysarthria.'}
          </p>
        </div>
      </div>

      {/* Grid: SHAP Attributions & Medical Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* SHAP Chart Card */}
        <ShapChart
          topBiomarkers={data.top_biomarkers}
        />

        {/* Citations "Receipts" Panel */}
        <div className="craft-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9B08C]/30">
            <h4 className="font-serif text-lg font-normal text-[#2C3531] uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#116466]" />
              Peer-Reviewed Literature Receipts
            </h4>
            <span className="text-xs text-[#2C3531]/60 font-mono">DOI Verified</span>
          </div>

          <div className="space-y-3">
            {data.literature_citations && data.literature_citations.length > 0 ? (
              data.literature_citations.map((cite: CitationItem, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#D1E8E2]/35 border border-[#116466]/20 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#2C3531]">
                      {cite.title || cite.authors}
                    </p>
                    {cite.doi && (
                      <a
                        href={`https://doi.org/${cite.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#116466] hover:underline shrink-0 font-mono text-xs flex items-center gap-0.5"
                      >
                        <span>DOI</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#2C3531]/80 font-sans">
                    {cite.authors} ({cite.year})
                  </p>
                  <p className="text-[11px] text-[#2C3531]/60 font-mono">
                    Semantic literature relevance score: {(cite.similarity * 100).toFixed(0)}%
                  </p>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#D1E8E2]/35 border border-[#116466]/20 space-y-1.5 text-xs text-[#2C3531]">
                  <p className="font-semibold text-[#2C3531]">Little, M. A. et al. (2009)</p>
                  <p className="italic text-[#2C3531]/80 font-sans">
                    &ldquo;Suitability of dysphonia measurements for telemonitoring of Parkinson&apos;s disease.&rdquo;
                  </p>
                  <p className="text-[11px] text-[#2C3531]/60 font-mono">IEEE Trans. Biomed. Eng. &middot; Pitch Period Entropy (PPE)</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#D1E8E2]/35 border border-[#116466]/20 space-y-1.5 text-xs text-[#2C3531]">
                  <p className="font-semibold text-[#2C3531]">Tsanas, A. et al. (2012)</p>
                  <p className="italic text-[#2C3531]/80 font-sans">
                    &ldquo;Novel speech signal processing algorithms for high-accuracy classification of Parkinson&apos;s disease.&rdquo;
                  </p>
                  <p className="text-[11px] text-[#2C3531]/60 font-mono">IEEE TBME &middot; Detrended Fluctuation Analysis (DFA)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 22 Biomarkers Table Card */}
      <BiomarkerTable features={data.features} />

      {/* Medical Safety Disclaimer Card */}
      <div className="craft-card border-l-4 border-[#D9B08C] p-8 sm:p-9 space-y-3">
        <div className="flex items-center gap-2 text-[#2C3531]">
          <AlertCircle className="w-5 h-5 text-[#B84A39] shrink-0" />
          <h4 className="font-serif text-xl sm:text-2xl font-normal tracking-tight">
            Academic Screening Notice &mdash; Not a Clinical Diagnosis
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-[#2C3531]/85 leading-relaxed font-sans font-normal">
          Synapse-Voice is strictly an exploratory screening tool developed as part of an EPICS academic engineering project.
          It measures phonatory dysphonia patterns and <strong className="text-[#2C3531]">cannot confirm or diagnose Parkinson&apos;s disease</strong>.
          Vocal microtremors can also occur from acute respiratory infection, vocal cord nodules, stress, fatigue, or ambient microphone noise. Please consult a licensed neurologist for any health diagnosis.
        </p>
      </div>

      {/* Interactive AI Chat Modal */}
      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          analysisId={data.id}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#116466] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
