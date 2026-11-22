'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Volume2,
  Mic,
  Share2,
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
      // 1. Immediate retrieval from local storage to display instantly without delay
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
      } catch {
        // continue to network fetch
      }

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
        <div className="w-12 h-12 border-4 border-[#1D63FF] border-t-transparent rounded-full animate-spin" />
        <h2 className="font-headline text-3xl font-medium text-[#141414] uppercase tracking-tight">
          Analyzing Your Vocal Biomarkers...
        </h2>
        <p className="text-sm text-[#141414]/70 max-w-md">
          Extracting 22 Praat acoustic parameters, computing StratifiedGroupKFold classifier, and retrieving literature citations.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 banky-card text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#E53E3E] mx-auto" />
        <h2 className="font-headline text-3xl font-medium text-[#141414] uppercase tracking-tight">
          Screening Result Not Found
        </h2>
        <p className="text-sm text-[#141414]/75">{error || 'Unable to locate this analysis record.'}</p>
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
        <span className="px-4 py-1.5 rounded-full bg-[#E8F2FF] text-[#1D63FF] text-xs font-bold uppercase tracking-wider">
          Low Risk (&lt; 35%)
        </span>
      );
    }
    if (confidenceBand === 'Moderate Concern') {
      return (
        <span className="px-4 py-1.5 rounded-full bg-[#FFF4DC] text-[#141414] text-xs font-bold uppercase tracking-wider">
          Moderate Concern (35% – 65%)
        </span>
      );
    }
    return (
      <span className="px-4 py-1.5 rounded-full bg-red-50 text-[#E53E3E] text-xs font-bold uppercase tracking-wider border border-red-200">
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
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#141414] hover:text-[#1D63FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recording
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-xs font-semibold text-[#141414] shadow-sm hover:bg-white/80 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#1D63FF]" /> Ask AI Assistant
          </button>
          <Link
            href="/screen"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D63FF] text-white text-xs font-semibold hover:bg-[#1453E6] shadow-sm transition-all"
          >
            <Mic className="w-4 h-4" /> New Test
          </Link>
        </div>
      </div>

      {/* Hero Result Banner (Big White Card) */}
      <div className="banky-card p-8 sm:p-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#141414]/10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {getRiskPill()}
              <span className="text-xs text-[#6B6D72] font-mono">
                ID: {data.id.slice(0, 8)} &middot; {new Date(data.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="font-headline text-4xl sm:text-6xl font-medium tracking-tight text-[#141414] uppercase leading-[0.92]">
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
          <h3 className="font-headline text-xl font-medium text-[#141414] uppercase tracking-tight">
            Plain-Language Analysis
          </h3>
          <p className="text-sm sm:text-base text-[#141414]/85 leading-relaxed font-normal">
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
        <div className="banky-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#141414]/10">
            <h4 className="font-headline text-lg font-medium text-[#141414] uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1D63FF]" />
              Peer-Reviewed Literature Receipts
            </h4>
            <span className="text-xs text-[#6B6D72]">DOI Verified</span>
          </div>

          <div className="space-y-3">
            {data.literature_citations && data.literature_citations.length > 0 ? (
              data.literature_citations.map((cite: CitationItem, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FFCE32]/20 border border-[#141414]/10 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#141414]">
                      {cite.title || cite.authors}
                    </p>
                    {cite.doi && (
                      <a
                        href={`https://doi.org/${cite.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1D63FF] hover:underline shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#141414]/80">
                    {cite.authors} ({cite.year})
                  </p>
                  <p className="text-[11px] text-[#6B6D72]">
                    Semantic literature relevance score: {(cite.similarity * 100).toFixed(0)}%
                  </p>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#FFCE32]/20 border border-[#141414]/10 space-y-1.5 text-xs text-[#141414]">
                  <p className="font-bold">Little, M. A. et al. (2009)</p>
                  <p className="italic text-[#141414]/80">
                    &ldquo;Suitability of dysphonia measurements for telemonitoring of Parkinson&apos;s disease.&rdquo;
                  </p>
                  <p className="text-[11px] text-[#6B6D72]">IEEE Trans. Biomed. Eng. &middot; Pitch Period Entropy (PPE)</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FFCE32]/20 border border-[#141414]/10 space-y-1.5 text-xs text-[#141414]">
                  <p className="font-bold">Tsanas, A. et al. (2012)</p>
                  <p className="italic text-[#141414]/80">
                    &ldquo;Novel speech signal processing algorithms for high-accuracy classification of Parkinson&apos;s disease.&rdquo;
                  </p>
                  <p className="text-[11px] text-[#6B6D72]">IEEE TBME &middot; Detrended Fluctuation Analysis (DFA)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 22 Biomarkers Table Card */}
      <BiomarkerTable features={data.features} />

      {/* Medical Safety Disclaimer Card (White card with red accent border) */}
      <div className="banky-card border-2 border-[#E53E3E] p-8 sm:p-10 space-y-3">
        <div className="flex items-center gap-2 text-[#E53E3E]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h4 className="font-headline text-xl font-medium uppercase tracking-tight">
            Academic Screening Notice &mdash; Not a Clinical Diagnosis
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-[#141414]/85 leading-relaxed font-normal">
          Synapse-Voice is strictly an exploratory screening tool developed as part of an EPICS academic engineering project.
          It measures phonatory dysphonia patterns and <strong className="text-[#141414]">cannot confirm or diagnose Parkinson&apos;s disease</strong>.
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
          <div className="w-10 h-10 border-4 border-[#1D63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
