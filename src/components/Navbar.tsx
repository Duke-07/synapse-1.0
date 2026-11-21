'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic,
  Activity,
  BarChart2,
  BookOpen,
  Shield,
  History,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const links = [
    { href: '/', label: 'Overview', icon: Activity },
    { href: '/screen', label: 'Screen Voice', icon: Mic },
    { href: '/history', label: 'History', icon: History },
    { href: '/benchmarks', label: 'Benchmarks', icon: BarChart2 },
    { href: '/methodology', label: 'Methodology', icon: BookOpen },
    { href: '/privacy', label: 'Privacy', icon: Shield },
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
    <nav className="sticky top-0 z-50 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80 text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-900/40 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-red-400 via-rose-300 to-stone-100 bg-clip-text text-transparent">
                Synapse-Voice
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold text-red-400 uppercase tracking-wider ml-1.5 px-1.5 py-0.5 rounded bg-red-950/80 border border-red-900/60">
                EPICS Screening
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-950/60 text-red-400 border border-red-900/50'
                      : 'text-stone-300 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-stone-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth & Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* User Profile Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
                  <div className="w-6 h-6 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-300 font-bold text-[10px]">
                    {getInitials(user.full_name)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-stone-200 truncate max-w-[120px]">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      {user.is_verified ? (
                        <>
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> Verified
                        </>
                      ) : (
                        <Link
                          href={`/verify-email?email=${encodeURIComponent(user.email)}`}
                          className="text-amber-400 hover:underline flex items-center gap-0.5"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" /> Verify Email
                        </Link>
                      )}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-900 transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-900 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-200 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              href="/screen"
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              Start Screening
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-800 bg-stone-950 px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated && user && (
            <div className="mb-3 p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-red-300 font-bold text-xs">
                  {getInitials(user.full_name)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-200">{user.full_name}</p>
                  <p className="text-[11px] text-stone-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          )}

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-red-950/60 text-red-400 border border-red-900/50'
                    : 'text-stone-300 hover:bg-stone-900'
                }`}
              >
                <Icon className="w-4 h-4 text-stone-400" />
                {link.label}
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-200"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white"
              >
                <User className="w-3.5 h-3.5" /> Register
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/screen"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-center text-sm"
            >
              <Mic className="w-4 h-4" />
              Start Screening
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
