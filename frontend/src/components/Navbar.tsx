'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mic, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/', label: 'Overview' },
    { href: '/screen', label: 'Screen' },
    { href: '/history', label: 'Ledger' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/methodology', label: 'Methodology' },
    { href: '/privacy', label: 'Privacy' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#EBF4F1]/90 backdrop-blur-md border-b border-[#2C3531]/10 py-3 shadow-xs'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 bg-white/80 backdrop-blur-xs px-6 py-2.5 rounded-full border border-[#2C3531]/10 shadow-xs">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium tracking-wide transition-colors relative ${
                  isActive
                    ? 'text-[#116466] font-semibold'
                    : 'text-[#2C3531]/75 hover:text-[#116466]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#116466] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Center Logo Wordmark */}
        <div className="flex-1 lg:flex-none text-left lg:text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group"
            aria-label="Synapse Voice Home"
          >
            <div className="w-8 h-8 rounded-xl bg-[#116466] text-[#D1E8E2] flex items-center justify-center font-serif text-lg font-semibold group-hover:bg-[#2C3531] transition-colors shadow-xs">
              &psi;
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-normal tracking-tight text-[#2C3531]">
                synapse
              </span>
              <span className="text-[#116466] text-xl font-bold font-serif">.</span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#2C3531]/60 font-medium">
                voice
              </span>
            </div>
          </Link>
        </div>

        {/* Right CTAs (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/screen"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#116466] text-white font-medium text-xs tracking-wide hover:bg-[#2C3531] transition-all duration-200 shadow-xs hover:shadow-sm"
          >
            <Mic className="w-3.5 h-3.5 text-[#FFCB9A]" />
            <span>Record Voice</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-white border border-[#2C3531]/10 text-[#2C3531] hover:bg-[#D1E8E2]/50 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#EBF4F1] border-b border-[#2C3531]/10 px-6 py-6 space-y-4 shadow-md">
          <div className="grid grid-cols-2 gap-2.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-2xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#116466] text-white font-semibold'
                      : 'bg-white/80 text-[#2C3531] border border-[#2C3531]/10 hover:bg-[#D1E8E2]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/screen"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#116466] text-white text-xs font-semibold hover:bg-[#2C3531] transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-[#FFCB9A]" />
              <span>Record Voice Screening</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
