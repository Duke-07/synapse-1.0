import React from 'react';
import '../styles/globals.css';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { Navbar } from '../components/Navbar';
import { FloatingChatBubble } from '../components/ui/FloatingChatBubble';
import { NeuralBackground3D } from '../components/3d/NeuralBackground3D';
import { AuthProvider } from '../lib/auth-context';
import Link from 'next/link';

export const metadata = {
  title: "Synapse-Voice | Parkinson's Disease Acoustic Screening",
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
      <body className="antialiased flex flex-col min-h-screen bg-[#EBF4F1] text-[#2C3531] font-sans selection:bg-[#116466] selection:text-white relative">
        <NeuralBackground3D />
        <AuthProvider>
          <DisclaimerBanner />
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          
          {/* Architectural Dark Charcoal Structural Footer */}
          <footer className="w-full bg-[#2C3531] text-[#D1E8E2] py-16 sm:py-20 mt-20 border-t border-[#2C3531]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-10 border-b border-[#D1E8E2]/15">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFCB9A]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#FFCB9A]">
                      Pre-Clinical Screening Framework
                    </span>
                  </div>
                  <div className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[0.92] text-white">
                    SYNAPSE<span className="text-[#D9B08C]">.</span>VOICE
                  </div>
                  <p className="text-[#D1E8E2]/75 text-xs sm:text-sm max-w-md font-sans leading-relaxed">
                    Acoustic phonation screening platform for Parkinson&apos;s disease. 22 calibrated Praat MDVP biomarkers, StratifiedGroupKFold validation, and peer-reviewed literature attribution.
                  </p>
                </div>

                <div className="flex flex-wrap gap-5 text-xs font-mono uppercase tracking-wider text-[#D1E8E2]/80">
                  <Link href="/" className="hover:text-white hover:underline underline-offset-4 transition-colors">Overview</Link>
                  <Link href="/screen" className="hover:text-white hover:underline underline-offset-4 transition-colors">Screen</Link>
                  <Link href="/history" className="hover:text-white hover:underline underline-offset-4 transition-colors">Ledger</Link>
                  <Link href="/benchmarks" className="hover:text-white hover:underline underline-offset-4 transition-colors">Benchmarks</Link>
                  <Link href="/methodology" className="hover:text-white hover:underline underline-offset-4 transition-colors">Methodology</Link>
                  <Link href="/privacy" className="hover:text-white hover:underline underline-offset-4 transition-colors">Privacy</Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#D1E8E2]/50">
                <p>
                  EPICS Engineering Projects in Community Service &middot; Open Academic Platform
                </p>
                <p>
                  &copy; {new Date().getFullYear()} Synapse-Voice. Investigational research tool &mdash; not a certified medical device.
                </p>
              </div>
            </div>
          </footer>

          {/* Floating Clinical Assistant Bubble */}
          <FloatingChatBubble />
        </AuthProvider>
      </body>
    </html>
  );
}
