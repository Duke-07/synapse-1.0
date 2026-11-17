import React from 'react';
import '../styles/globals.css';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { Navbar } from '../components/Navbar';

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
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p>
              <strong>Synapse-Voice (EPICS Semester Project)</strong> • Developed with Next.js, FastAPI, Praat, and Scikit-Learn.
            </p>
            <p className="text-[11px] text-slate-400">
              Not a medical diagnostic device. Creative Commons CC BY 4.0 benchmark datasets. Citations strictly from verified peer-reviewed literature.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
