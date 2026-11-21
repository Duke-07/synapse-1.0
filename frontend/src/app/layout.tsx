import React from 'react';
import '../styles/globals.css';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { Navbar } from '../components/Navbar';
import { AuthProvider } from '../lib/auth-context';
import Link from 'next/link';

export const metadata = {
  title: "Synapse-Voice | Parkinson's Disease Vocal Screening",
  description:
    "An academic pre-clinical voice screening platform extracting 22 clinical acoustic biomarkers for Parkinson's disease with literature-grounded RAG explanations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased flex flex-col min-h-screen bg-stone-950 text-stone-100">
        <AuthProvider>
          <DisclaimerBanner />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-stone-800/80 bg-stone-950/80 py-8 mt-8">
            <div className="max-w-7xl mx-auto px-4 space-y-3 text-center">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-400">
                <Link href="/" className="hover:text-stone-200 transition-colors">Overview</Link>
                <Link href="/screen" className="hover:text-stone-200 transition-colors">Screen Voice</Link>
                <Link href="/benchmarks" className="hover:text-stone-200 transition-colors">Benchmarks</Link>
                <Link href="/methodology" className="hover:text-stone-200 transition-colors">Methodology</Link>
                <Link href="/privacy" className="hover:text-stone-200 transition-colors">Privacy Policy</Link>
              </div>
              <p className="text-xs text-stone-500">
                <strong className="text-stone-400">Synapse-Voice</strong> (EPICS Semester Project) ·
                Built with Next.js 14, FastAPI, Praat, Scikit-Learn, and SHAP.
              </p>
              <p className="text-[11px] text-stone-600">
                Not a medical diagnostic device. All benchmark datasets are CC BY 4.0.
                Citations are strictly from peer-reviewed literature.
                © 2026 Synapse-Voice Research Team.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
