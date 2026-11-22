'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

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
    { href: '/', label: 'OVERVIEW' },
    { href: '/screen', label: 'SCREEN' },
    { href: '/history', label: 'HISTORY' },
    { href: '/benchmarks', label: 'BENCHMARKS' },
    { href: '/methodology', label: 'METHODOLOGY' },
    { href: '/privacy', label: 'PRIVACY' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#fcdc74]/95 backdrop-blur-sm shadow-[0_2px_12px_rgba(20,20,20,0.06)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold tracking-[0.06em] xl:tracking-[0.08em] transition-colors nav-link-underline ${
                  isActive ? 'text-[#0060ca] font-bold' : 'text-[#141414] hover:text-[#0060ca]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Center Logo Wordmark */}
        <div className="flex-1 lg:flex-none text-left lg:text-center">
          <Link
            href="/"
            className="inline-flex items-baseline gap-1 font-headline text-2xl sm:text-3xl font-medium tracking-tight text-[#141414] hover:opacity-90 transition-opacity"
            aria-label="Synapse Voice Home"
          >
            <span>synapse</span>
            <span className="text-[#0060ca]">.</span>
            <span className="text-[#141414]/75 text-sm font-sans uppercase tracking-wider font-semibold">
              voice
            </span>
          </Link>
        </div>

        {/* Right CTAs (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/screen"
            className="px-6 py-2.5 rounded-full bg-[#0060ca] text-white font-semibold text-xs tracking-wide hover:bg-[#090089] shadow-[0_4px_14px_rgba(29,99,255,0.3)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            Start Screening
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-[#141414] hover:bg-[#141414]/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fcdc74] border-t border-[#141414]/10 px-6 py-6 space-y-4 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wider ${
                    isActive ? 'bg-[#0060ca] text-white' : 'text-[#141414] hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/screen"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-full bg-[#0060ca] text-white font-semibold text-xs tracking-wider shadow-md"
            >
              Start Voice Screening
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
