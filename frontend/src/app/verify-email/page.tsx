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
  KeyRound,
  Sparkles,
  Info,
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

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

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

  useEffect(() => {
    if (!tokenParam && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [tokenParam]);

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

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

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
      setSuccessMessage('A fresh verification code has been dispatched to your email inbox.');
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
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D1E8E2] text-[#116466] border border-[#116466]/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <KeyRound className="w-3.5 h-3.5 text-[#116466]" />
            Two-Factor Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal uppercase tracking-tight text-[#2C3531]">
            Verify Your Email
          </h1>
          <p className="text-[#2C3531]/75 text-sm font-sans">
            Enter the 6-digit confirmation code dispatched to{' '}
            <span className="text-[#2C3531] font-semibold">{email || 'your email'}</span>.
          </p>
        </div>

        {/* Card */}
        <div className="craft-card p-6 sm:p-8 space-y-6">
          {/* Email dispatch notice */}
          <div className="p-3.5 rounded-2xl bg-[#D1E8E2]/40 border border-[#116466]/20 flex items-start gap-2.5 text-[#2C3531] text-xs">
            <Info className="w-4 h-4 text-[#116466] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#116466]">Check Your Inbox &amp; Spam Folder</p>
              <p className="text-[#2C3531]/75 mt-0.5 font-sans">
                We sent a 6-digit OTP code to <strong className="text-[#2C3531]">{email || 'your email'}</strong>. Code expires in 15 minutes.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Verification Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Verified!</p>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {devCodePreview && (
            <div className="p-3 rounded-2xl bg-[#D1E8E2]/35 border border-[#116466]/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#2C3531]">
                <Sparkles className="w-4 h-4 text-[#116466]" />
                <span>Simulated Code: <strong className="font-mono text-[#116466] font-bold">{devCodePreview}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handlePastedCode(devCodePreview)}
                className="px-2.5 py-1 rounded-full bg-[#116466] text-white font-medium text-[11px] hover:bg-[#0c4b4d] transition-colors"
              >
                Auto Fill
              </button>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#2C3531] uppercase tracking-wider mb-1.5 font-display">
                Target Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#2C3531]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D9B08C]/40 rounded-2xl text-[#2C3531] placeholder-[#2C3531]/40 focus:outline-none focus:border-[#116466] text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C3531] uppercase tracking-wider mb-2 text-center font-display">
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
                        ? 'border-[#116466] text-[#116466] bg-[#D1E8E2]/30'
                        : 'border-[#D9B08C]/40 text-[#2C3531] bg-white focus:border-[#116466]'
                    }`}
                  />
                ))}
              </div>
            </div>

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

            <div className="pt-4 border-t border-[#D9B08C]/30 flex items-center justify-between text-xs text-[#2C3531]/75">
              <span>Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="inline-flex items-center gap-1.5 font-semibold text-[#116466] hover:underline disabled:text-[#2C3531]/40 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#2C3531]/70 font-sans">
          Want to use a different account?{' '}
          <Link href="/login" className="text-[#116466] font-semibold hover:underline">
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
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-[#2C3531]/70 text-sm font-sans">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
