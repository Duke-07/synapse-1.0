'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Trash2,
  Mic,
  ArrowRight,
  Shield,
  Activity,
  User,
  LogIn,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getHistory } from '@/lib/api';

interface HistoryRecord {
  id: string;
  probability: number;
  confidence_band: 'Low Risk' | 'Moderate Concern' | 'Elevated Risk';
  created_at: string;
  top_features?: string[];
}

export default function HistoryPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackendSource, setIsBackendSource] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setLoading(true);

      // If authenticated, fetch from backend
      if (token) {
        try {
          const backendRecords = await getHistory(50, token);
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
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Backend history retrieval failed, falling back to local storage:', e);
        }
      }

      // Fallback: Local Storage
      try {
        const stored = localStorage.getItem('synapse_history');
        if (stored && isMounted) {
          setHistory(JSON.parse(stored));
          setIsBackendSource(false);
        }
      } catch (e) {
        console.warn('Failed to parse local history:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your local screening history?')) {
      localStorage.removeItem('synapse_history');
      setHistory([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-900/60 text-red-400 text-xs font-medium mb-2">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            {isBackendSource ? 'Cloud Account Records' : 'Local Session Records'}
          </div>
          <h1 className="text-3xl font-extrabold text-white">Screening Session History</h1>
          <p className="text-stone-400 text-sm mt-1">
            Review past acoustic phonation screening sessions, confidence bands, and biomarker attributions.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-3">
            {!isBackendSource && (
              <button
                onClick={clearHistory}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-red-950/40 text-stone-300 hover:text-red-400 border border-stone-800 hover:border-red-800 rounded-lg text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Local
              </button>
            )}
            <Link
              href="/screen"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              New Screening
            </Link>
          </div>
        )}
      </div>

      {/* Auth State Banner */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-200">Browsing as Guest</p>
              <p className="text-[11px] text-stone-400">
                Sign in to automatically sync screening records to your verified researcher profile.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" /> Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-400 text-sm">Loading screening history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-stone-800/80 flex items-center justify-center mx-auto mb-4 text-stone-400">
            <Clock className="w-8 h-8 text-red-500/70" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Screenings Recorded Yet</h3>
          <p className="text-stone-400 text-sm mb-6">
            You haven’t completed any voice screenings yet. Perform a 3-5 second sustained vowel phonation to generate an acoustic profile.
          </p>
          <Link
            href="/screen"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-950/40"
          >
            <Mic className="w-4 h-4" />
            Perform First Voice Screening
          </Link>
        </div>
      ) : (
        <div className="bg-stone-900/70 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950/80 text-xs uppercase font-mono text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Screening ID</th>
                  <th className="py-3.5 px-4">Anomaly Probability</th>
                  <th className="py-3.5 px-4">Confidence Band</th>
                  <th className="py-3.5 px-4">Primary Biomarkers</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-800/40 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono text-xs text-stone-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-stone-300">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-stone-200">
                      {(item.probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          item.confidence_band === 'Low Risk'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : item.confidence_band === 'Moderate Concern'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                        }`}
                      >
                        {item.confidence_band}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-400">
                      {item.top_features && item.top_features.length > 0
                        ? item.top_features.join(', ')
                        : 'Acoustic indices'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/results?id=${item.id}`}
                        className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-medium"
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
