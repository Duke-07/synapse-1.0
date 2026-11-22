import React from 'react';
import '../styles/globals.css';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { Navbar } from '../components/Navbar';
import { FloatingChatBubble } from '../components/ui/FloatingChatBubble';
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
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen bg-[#fcdc74] text-[#141414] font-body selection:bg-[#0060ca] selection:text-white">
        <AuthProvider>
          <DisclaimerBanner />
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          
          {/* Academic High-Contrast Deep Navy Footer (First Color #090089) */}
          <footer className="w-full bg-[#090089] text-white py-16 sm:py-20 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-10 border-b border-white/20">
                <div className="space-y-4">
                  <div className="font-headline text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight uppercase leading-[0.88]">
                    SYNAPSE-VOICE
                  </div>
                  <p className="text-white/80 text-sm sm:text-base max-w-md font-normal">
                    Pre-clinical acoustic screening for Parkinson&apos;s disease. 22 Praat biomarkers, calibrated machine learning, literature-grounded explanations.
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/90">
                  <Link href="/" className="hover:text-[#91ceff] hover:underline underline-offset-4 transition-colors">Overview</Link>
                  <Link href="/screen" className="hover:text-[#91ceff] hover:underline underline-offset-4 transition-colors">Screen</Link>
                  <Link href="/history" className="hover:text-[#91ceff] hover:underline underline-offset-4 transition-colors">History</Link>
                  <Link href="/benchmarks" className="hover:text-[#91ceff] hover:underline underline-offset-4 transition-colors">Benchmarks</Link>
                  <Link href="/methodology" className="hover:text-[#91ceff] hover:underline underline-offset-4 transition-colors">Methodology</Link>
                  <Link href="/privacy" className="hover:text-[#91ceff] hover:underline underline-offset-4 transition-colors">Privacy</Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/70">
                <p>
                  EPICS Semester Research Project &middot; Open Academic Platform
                </p>
                <p>
                  &copy; {new Date().getFullYear()} Synapse-Voice Research. Not a medical diagnostic device.
                </p>
              </div>
            </div>
          </footer>

          {/* Floating Blue Chat Bubble */}
          <FloatingChatBubble />
        </AuthProvider>
      </body>
    </html>
  );
}
