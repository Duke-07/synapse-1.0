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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider shadow-sm mb-3">
            <Clock className="w-3.5 h-3.5 text-blue" />
            {isBackendSource ? 'Cloud Account Records' : 'Local Session Records'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-medium uppercase text-ink tracking-tight">
            Screening History
          </h1>
          <p className="text-ink/75 text-base mt-2 max-w-xl">
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
          <div className="w-9 h-9 border-3 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-ink/70 font-medium text-sm">Loading screening history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="banky-card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-yellow/30 flex items-center justify-center mx-auto mb-4 text-blue">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-display font-medium uppercase text-ink mb-2">No Screenings Recorded</h3>
          <p className="text-ink/75 text-sm mb-6 leading-relaxed">
            You haven’t completed any voice screenings yet. Perform a 5-second sustained vowel phonation to generate an acoustic profile.
          </p>
          <Link href="/screen">
            <PillButton variant="primary" size="lg" icon={<Mic className="w-4 h-4" />}>
              Perform First Voice Screening
            </PillButton>
          </Link>
        </div>
      ) : (
        <div className="banky-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead className="bg-ink/5 text-xs uppercase font-mono text-ink/70 border-b border-ink/10">
                <tr>
                  <th className="py-4 px-5">Date & Time</th>
                  <th className="py-4 px-5">Screening ID</th>
                  <th className="py-4 px-5">Anomaly Probability</th>
                  <th className="py-4 px-5">Confidence Band</th>
                  <th className="py-4 px-5">Primary Biomarkers</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-yellow/20 transition-colors"
                  >
                    <td className="py-4 px-5 font-mono text-xs text-ink/70 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-ink/80">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-ink">
                      {(item.probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          item.confidence_band === 'Low Risk'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.confidence_band === 'Moderate Concern'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {item.confidence_band}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-ink/75">
                      {item.top_features && item.top_features.length > 0
                        ? item.top_features.join(', ')
                        : 'Acoustic indices'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/results?id=${item.id}`}
                        className="inline-flex items-center gap-1.5 text-blue hover:underline font-bold text-xs"
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
