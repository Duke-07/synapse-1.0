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

  // Forgot password modal state
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

    setIsSubmitting(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);

      // Check if user email is unverified
      if (!user.is_verified) {
        setUnverifiedWarning(
          'Your account is active, but your email address has not been verified yet.'
        );
      } else {
        router.push('/screen');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSending(true);
    try {
      const res = await requestPasswordReset(forgotEmail.trim().toLowerCase());
      setForgotMessage(res.message || 'If registered, a reset link has been dispatched.');
    } catch {
      setForgotMessage('If registered, a reset link has been dispatched.');
    } finally {
      setForgotSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-stone-950 text-stone-100">
      {/* Background radial crimson glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <LogIn className="w-3.5 h-3.5 text-red-500" />
            Clinical Screening Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Sign In to Synapse-Voice
          </h1>
          <p className="text-stone-400 text-sm mt-2">
            Access pre-clinical acoustic screening analysis, longitudinal records, and SHAP explanations.
          </p>
        </div>

        {/* Card */}
        <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/20">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Authentication Failed</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {unverifiedWarning && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Unverified Email Address
              </div>
              <p>{unverifiedWarning}</p>
              <div className="mt-3">
                <Link
                  href={`/verify-email?email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Verify Email Now
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-stone-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-500 hover:text-stone-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-400 hover:text-stone-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-700 bg-stone-950 text-red-600 focus:ring-red-500"
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-red-950/50 hover:shadow-red-900/60 transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-red-200" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-6 border-t border-stone-800/80 text-center text-xs text-stone-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-red-400 hover:text-red-300 transition-colors">
              Register Here
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <Shield className="w-3.5 h-3.5 text-stone-500" />
          <span>Encrypted Authentication • Zero Plaintext Storage • Academic Compliance</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-stone-400 mb-4">
              Enter your registered email address and we will dispatch a secure reset link.
            </p>

            {forgotMessage ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl mb-4">
                <CheckCircle className="w-4 h-4 inline mr-1.5" />
                {forgotMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@institution.edu"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotSending}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {forgotSending ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-3 h-3" /> Send Reset Link
                    </>
                  )}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotMessage(null);
              }}
              className="mt-3 w-full py-1.5 text-center text-xs text-stone-400 hover:text-stone-200"
            >
              Close
            </button>
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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-stone-950 text-stone-400 text-sm">
          Loading sign-in portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
