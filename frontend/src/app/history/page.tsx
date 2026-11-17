'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  ExternalLink,
  Trash2,
  Mic,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Activity,
} from 'lucide-react';

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('synapse_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse history:', e);
    } finally {
      setLoading(false);
    }
  }, []);

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium mb-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Client Session Records
          </div>
          <h1 className="text-3xl font-extrabold text-white">Screening Session History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review past acoustic phonation screening sessions stored in your browser session.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-800 rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Local History
            </button>
            <Link
              href="/screen"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              New Screening
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading screening history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Screenings Recorded Yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            You haven’t completed any voice screenings in this browser yet. Try recording a sustained vowel phonation now.
          </p>
          <Link
            href="/screen"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all"
          >
            <Mic className="w-4 h-4" />
            Perform First Voice Screening
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Screening ID</th>
                  <th className="py-3.5 px-4">Anomaly Probability</th>
                  <th className="py-3.5 px-4">Confidence Band</th>
                  <th className="py-3.5 px-4">Primary Biomarkers</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-300">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-slate-200">
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
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {item.top_features && item.top_features.length > 0
                        ? item.top_features.join(', ')
                        : 'Acoustic indices'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/results?id=${item.id}`}
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-medium"
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
