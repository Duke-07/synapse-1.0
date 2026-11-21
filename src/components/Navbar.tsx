'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

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

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFCE32]/95 backdrop-blur-sm shadow-[0_2px_12px_rgba(20,20,20,0.06)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold tracking-[0.08em] transition-colors nav-link-underline ${
                  isActive ? 'text-[#1D63FF] font-bold' : 'text-[#141414] hover:text-[#1D63FF]'
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
            <span className="text-[#1D63FF]">.</span>
            <span className="text-[#141414]/75 text-sm font-sans uppercase tracking-wider font-semibold">
              voice
            </span>
          </Link>
        </div>

        {/* Right CTAs (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 mr-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-[#141414] shadow-sm">
                <span className="w-5 h-5 rounded-full bg-[#1D63FF] text-white flex items-center justify-center text-[10px]">
                  {getInitials(user.full_name)}
                </span>
                <span className="max-w-[100px] truncate">{user.full_name}</span>
                {user.is_verified ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`}>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  </Link>
                )}
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-[#141414]/70 hover:text-[#1D63FF] transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full border-2 border-[#1D63FF] text-[#1D63FF] font-semibold text-xs tracking-wide hover:bg-[#1D63FF] hover:text-white transition-all duration-200"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/screen"
            className="px-5 py-2 rounded-full bg-[#1D63FF] text-white font-semibold text-xs tracking-wide hover:bg-[#1453E6] shadow-[0_4px_14px_rgba(29,99,255,0.3)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            Get Started
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
        <div className="lg:hidden bg-[#FFCE32] border-t border-[#141414]/10 px-6 py-6 space-y-4 shadow-lg">
          {isAuthenticated && user && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white shadow-sm mb-3">
              <span className="text-xs font-semibold text-[#141414] truncate">{user.full_name}</span>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-[#1D63FF]"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wider ${
                    isActive ? 'bg-[#1D63FF] text-white' : 'text-[#141414] hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-full border-2 border-[#1D63FF] text-xs font-semibold text-[#1D63FF] bg-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-full bg-[#1D63FF] text-xs font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
            <Link
              href="/screen"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-full bg-[#1D63FF] text-white font-semibold text-xs tracking-wider shadow-md"
            >
              Get Started &middot; Screen Voice
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
