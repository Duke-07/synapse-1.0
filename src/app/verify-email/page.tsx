'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verify, resendCode } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devCodePreview, setDevCodePreview] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update email if query param changes
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Handle direct URL token verification (?email=...&token=...)
  useEffect(() => {
    if (emailParam && tokenParam) {
      setIsVerifying(true);
      setErrorMessage(null);
      verify(emailParam, tokenParam)
        .then(() => {
          setSuccessMessage('Email verified successfully via direct link! Redirecting to vocal screening...');
          setTimeout(() => router.push('/screen'), 1600);
        })
        .catch((err: unknown) => {
          setErrorMessage(err instanceof Error ? err.message : 'Invalid or expired verification link.');
          setIsVerifying(false);
        });
    }
  }, [emailParam, tokenParam, verify, router]);

  // Focus first input box on mount
  useEffect(() => {
    if (!tokenParam && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [tokenParam]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newDigits = [...digits];

    if (clean.length > 1) {
      // User pasted multiple characters into a single input box
      handlePastedCode(clean);
      return;
    }

    newDigits[index] = clean;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (clean && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        performVerification(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePastedCode = (pasted: string) => {
    const cleanDigits = pasted.replace(/[^0-9]/g, '').slice(0, 6).split('');
    const newDigits = ['', '', '', '', '', ''];
    cleanDigits.forEach((d, i) => {
      newDigits[i] = d;
    });
    setDigits(newDigits);
    setErrorMessage(null);

    const focusIdx = Math.min(cleanDigits.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (cleanDigits.length === 6) {
      performVerification(cleanDigits.join(''));
    }
  };

  const performVerification = async (codeToVerify: string) => {
    if (!email.trim()) {
      setErrorMessage('Please provide the registered email address.');
      return;
    }
    if (codeToVerify.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      await verify(email.trim().toLowerCase(), codeToVerify);
      setSuccessMessage('Email verified successfully! Session authenticated.');
      setTimeout(() => {
        router.push('/screen');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please check the code.';
      setErrorMessage(msg);
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMessage('Please specify your registered email address to resend the code.');
      return;
    }
    setIsResending(true);
    setErrorMessage(null);

    try {
      const res = await resendCode(email.trim().toLowerCase());
      setResendCooldown(60);
      setSuccessMessage('A fresh verification code has been dispatched to your inbox.');
      if (res.verification_code_preview) {
        setDevCodePreview(res.verification_code_preview);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const fillQuickCode = (code: string) => {
    handlePastedCode(code);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-stone-950 text-stone-100">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5 text-red-500" />
            Two-Factor Verification
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Verify Your Email
          </h1>
          <p className="text-stone-400 text-sm mt-2">
            Enter the 6-digit confirmation code dispatched to{' '}
            <span className="text-stone-200 font-medium">{email || 'your email'}</span>.
          </p>
        </div>

        {/* Card */}
        <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/20">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Verification Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-300">Verified!</p>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {/* Dev/Demo Quick Fill Banner if code preview available */}
          {devCodePreview && (
            <div className="mb-6 p-3 rounded-xl bg-stone-950 border border-red-900/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>Simulated Code: <strong className="font-mono text-red-400">{devCodePreview}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => fillQuickCode(devCodePreview)}
                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] transition-colors"
              >
                Auto Fill
              </button>
            </div>
          )}

          <div className="space-y-5">
            {/* Registered Email confirmation/edit */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 uppercase tracking-wider">
                Target Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* 6-box OTP entry */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2 uppercase tracking-wider text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-between gap-2 sm:gap-3">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text');
                      handlePastedCode(pasted);
                    }}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-xl sm:text-2xl rounded-xl bg-stone-950 border transition-all focus:outline-none ${
                      digit
                        ? 'border-red-500 text-red-400 bg-red-950/20 shadow-inner'
                        : 'border-stone-800 text-stone-100 focus:border-red-500/80 focus:ring-1 focus:ring-red-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Manual Submit Button */}
            <button
              type="button"
              onClick={() => performVerification(digits.join(''))}
              disabled={isVerifying || !!successMessage || digits.join('').length !== 6}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-red-950/50 hover:shadow-red-900/60 transition-all flex items-center justify-center gap-2 group"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-red-200" />
                  <span>Verify Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Resend Code Section */}
            <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="inline-flex items-center gap-1.5 font-semibold text-red-400 hover:text-red-300 disabled:text-stone-600 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center text-xs text-stone-500">
          Want to use a different account?{' '}
          <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-stone-950 text-stone-400 text-sm">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
