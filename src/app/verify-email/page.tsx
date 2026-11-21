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
import PillButton from '@/components/ui/PillButton';

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

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-ink text-xs font-bold uppercase tracking-wider shadow-sm mb-3">
            <KeyRound className="w-3.5 h-3.5 text-blue" />
            Two-Factor Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium uppercase tracking-tight text-ink">
            Verify Your Email
          </h1>
          <p className="text-ink/75 text-sm mt-2">
            Enter the 6-digit confirmation code dispatched to{' '}
            <span className="text-ink font-bold">{email || 'your email'}</span>.
          </p>
        </div>

        {/* Card */}
        <div className="banky-card p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">Verification Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Verified!</p>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {/* Dev/Demo Quick Fill Banner if code preview available */}
          {devCodePreview && (
            <div className="mb-6 p-3 rounded-2xl bg-yellow/30 border border-yellow/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-ink">
                <Sparkles className="w-4 h-4 text-blue" />
                <span>Simulated Code: <strong className="font-mono text-blue font-bold">{devCodePreview}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handlePastedCode(devCodePreview)}
                className="px-2.5 py-1 rounded-full bg-blue text-white font-medium text-[11px] hover:bg-blue/90 transition-colors"
              >
                Auto Fill
              </button>
            </div>
          )}

          <div className="space-y-5">
            {/* Registered Email confirmation/edit */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Target Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-ink/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-yellow/10 border border-ink/15 rounded-2xl text-ink placeholder-ink/40 focus:outline-none focus:border-blue text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* 6-box OTP entry */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2 text-center">
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
                    className={`w-11 h-14 sm:w-12 sm:h-14 text-center font-mono font-bold text-xl sm:text-2xl rounded-2xl border transition-all focus:outline-none ${
                      digit
                        ? 'border-blue text-blue bg-blue/5'
                        : 'border-ink/20 text-ink bg-white focus:border-blue focus:ring-1 focus:ring-blue'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Manual Submit Button */}
            <div className="pt-2">
              <PillButton
                onClick={() => performVerification(digits.join(''))}
                disabled={isVerifying || !!successMessage || digits.join('').length !== 6}
                variant="primary"
                size="lg"
                className="w-full justify-center"
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                {isVerifying ? 'Verifying Code...' : 'Verify Account'}
              </PillButton>
            </div>

            {/* Resend Code Section */}
            <div className="pt-4 border-t border-ink/10 flex items-center justify-between text-xs text-ink/75">
              <span>Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="inline-flex items-center gap-1.5 font-bold text-blue hover:underline disabled:text-ink/40 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center text-xs text-ink/70">
          Want to use a different account?{' '}
          <Link href="/login" className="text-blue font-bold hover:underline">
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
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-ink/70 text-sm">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
