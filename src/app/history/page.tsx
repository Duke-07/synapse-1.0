'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Trash2,
  Mic,
  ArrowRight,
} from 'lucide-react';
import { getHistory } from '@/lib/api';
import PillButton from '@/components/ui/PillButton';

interface HistoryRecord {
  id: string;
  probability: number;
  confidence_band: 'Low Risk' | 'Moderate Concern' | 'Elevated Risk';
  created_at: string;
  top_features?: string[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackendSource, setIsBackendSource] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setLoading(true);

      // 1. Check local storage first
      try {
        const stored = localStorage.getItem('synapse_history');
        if (stored && isMounted) {
          setHistory(JSON.parse(stored));
          setIsBackendSource(false);
        }
      } catch (e) {
        console.warn('Failed to parse local history:', e);
      }

      // 2. Fetch from backend history store
      try {
        const backendRecords = await getHistory(50);
        if (isMounted && backendRecords && backendRecords.length > 0) {
          const mapped: HistoryRecord[] = backendRecords.map((item: any) => ({
            id: item.id,
            probability: item.probability,
            confidence_band: item.confidence_band,
            created_at: item.created_at,
            top_features: item.top_biomarkers?.slice(0, 3).map((b: any) => b.label) || [],
          }));
          setHistory(mapped);
          setIsBackendSource(true);
        }
      } catch (e) {
        // backend offline
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your local screening history?')) {
      localStorage.removeItem('synapse_history');
      setHistory([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D1E8E2] text-[#116466] border border-[#116466]/20 text-xs font-semibold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5 text-[#116466]" />
            {isBackendSource ? 'Cloud Account Records' : 'Local Session Records'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-normal uppercase text-[#2C3531] tracking-tight">
            Screening History
          </h1>
          <p className="text-[#2C3531]/75 text-base mt-2 max-w-xl font-sans leading-relaxed">
            Review your past acoustic phonation screening sessions, probability scores, and biomarker attributions.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-3">
            {!isBackendSource && (
              <PillButton
                onClick={clearHistory}
                variant="secondary"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Clear Local
              </PillButton>
            )}
            <Link href="/screen">
              <PillButton
                variant="primary"
                size="sm"
                icon={<Mic className="w-3.5 h-3.5" />}
              >
                New Screening
              </PillButton>
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-3 border-[#116466] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#2C3531]/70 font-sans text-sm">Loading screening history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="craft-card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#D1E8E2] flex items-center justify-center mx-auto mb-4 text-[#116466]">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif font-normal uppercase text-[#2C3531] mb-2">No Screenings Recorded</h3>
          <p className="text-[#2C3531]/75 text-sm mb-6 leading-relaxed font-sans">
            You haven’t completed any voice screenings yet. Perform a 5-second sustained vowel phonation to generate an acoustic profile.
          </p>
          <Link href="/screen">
            <PillButton variant="primary" size="lg" icon={<Mic className="w-4 h-4" />}>
              Perform First Voice Screening
            </PillButton>
          </Link>
        </div>
      ) : (
        <div className="craft-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2C3531]">
              <thead className="bg-[#D1E8E2]/60 text-xs uppercase font-mono text-[#116466] border-b border-[#D9B08C]/30">
                <tr>
                  <th className="py-4 px-5">Date &amp; Time</th>
                  <th className="py-4 px-5">Screening ID</th>
                  <th className="py-4 px-5">Anomaly Probability</th>
                  <th className="py-4 px-5">Confidence Band</th>
                  <th className="py-4 px-5">Primary Biomarkers</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9B08C]/20">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#D1E8E2]/25 transition-colors"
                  >
                    <td className="py-4 px-5 font-mono text-xs text-[#2C3531]/70 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-[#2C3531]/80">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-[#116466]">
                      {(item.probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          item.confidence_band === 'Low Risk'
                            ? 'bg-[#D1E8E2] text-[#116466] border border-[#116466]/20'
                            : item.confidence_band === 'Moderate Concern'
                            ? 'bg-[#FFCB9A]/40 text-[#2C3531] border border-[#D9B08C]'
                            : 'bg-[#FFCB9A] text-[#2C3531] border border-[#D9B08C]'
                        }`}
                      >
                        {item.confidence_band}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-[#2C3531]/75 font-sans">
                      {item.top_features && item.top_features.length > 0
                        ? item.top_features.join(', ')
                        : 'Acoustic indices'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/results?id=${item.id}`}
                        className="inline-flex items-center gap-1.5 text-[#116466] hover:underline font-semibold text-xs font-display"
                      >
                        View Report <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
