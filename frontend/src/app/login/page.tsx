'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Shield,
  KeyRound,
  Send,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { requestPasswordReset } from '@/lib/api';
import { PillButton } from '@/components/ui/PillButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unverifiedWarning, setUnverifiedWarning] = useState<string | null>(null);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUnverifiedWarning(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your registered email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      router.push('/screen');
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify your credentials.';
      if (msg.toLowerCase().includes('verify') || msg.toLowerCase().includes('verification')) {
        setUnverifiedWarning(msg);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    try {
      setForgotSending(true);
      setForgotMessage(null);
      const res = await requestPasswordReset(forgotEmail);
      setForgotMessage(res.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setForgotMessage(err.message || 'Failed to send reset link.');
    } finally {
      setForgotSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 craft-card p-8 sm:p-10 space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3.5 py-1 rounded-full bg-[#D1E8E2] text-[#116466] border border-[#116466]/20 text-xs font-semibold uppercase tracking-wider">
          Researcher Sign In
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#2C3531] uppercase leading-tight">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-[#2C3531]/70 font-sans">
          Sign in to access your screening history and exported Praat acoustic biomarkers.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {unverifiedWarning && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="space-y-1">
            <p>{unverifiedWarning}</p>
            <Link
              href={`/verify-email?email=${encodeURIComponent(email)}`}
              className="text-[#116466] font-semibold underline"
            >
              Click here to verify your email &rarr;
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#2C3531] uppercase tracking-wider mb-1.5 font-display">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#2C3531]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@university.edu"
              required
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#D9B08C]/40 bg-white text-[#2C3531] text-sm focus:outline-none focus:border-[#116466] transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#2C3531] uppercase tracking-wider font-display">
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setShowForgotModal(true);
              }}
              className="text-xs text-[#116466] hover:underline font-medium"
            >
              Forgot?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#2C3531]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-[#D9B08C]/40 bg-white text-[#2C3531] text-sm focus:outline-none focus:border-[#116466] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2C3531]/50 hover:text-[#2C3531]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#2C3531]/80 font-sans">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#D9B08C] accent-[#116466]"
            />
            Remember this session
          </label>
        </div>

        <div className="pt-2">
          <PillButton
            variant="primary"
            onClick={() => {}}
            disabled={isSubmitting}
            className="w-full py-3.5"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In to Synapse'}
          </PillButton>
        </div>
      </form>

      <div className="text-center pt-2 border-t border-[#D9B08C]/30 text-xs text-[#2C3531]/70 font-sans">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#116466] font-semibold hover:underline">
          Create free researcher account &rarr;
        </Link>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm craft-card p-6 space-y-4">
            <h3 className="font-serif text-xl text-[#2C3531] uppercase">
              Reset Your Password
            </h3>
            <p className="text-xs text-[#2C3531]/70 font-sans">
              Enter your email address and we will generate a recovery link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-[#D9B08C]/40 text-xs text-[#2C3531] focus:border-[#116466] focus:outline-none"
              />
              {forgotMessage && (
                <p className="text-xs text-[#116466] font-semibold">{forgotMessage}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#2C3531]/70 hover:text-[#2C3531]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSending}
                  className="px-4 py-2 rounded-full bg-[#116466] text-white text-xs font-semibold hover:bg-[#0c4b4d]"
                >
                  {forgotSending ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#116466] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
