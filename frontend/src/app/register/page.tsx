'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PillButton } from '@/components/ui/PillButton';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; previewCode?: string } | null>(null);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-[#D1E8E2]/50',
    'bg-[#B84A39]',
    'bg-[#D9B08C]',
    'bg-[#FFCB9A]',
    'bg-[#116466]',
    'bg-[#116466]',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please agree to the research screening terms and privacy protocol.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register(email, password, fullName);
      setSuccessInfo({
        message: res.message || 'Account created successfully! Verification email dispatched.',
        previewCode: res.verification_code_preview,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 craft-card p-8 sm:p-10 space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3.5 py-1 rounded-full bg-[#D1E8E2] text-[#116466] border border-[#116466]/20 text-xs font-semibold uppercase tracking-wider">
          Researcher Enrollment
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#2C3531] uppercase leading-tight">
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-[#2C3531]/70 font-sans">
          Join the academic cohort to store long-term longitudinal voice analyses.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successInfo ? (
        <div className="p-6 bg-[#D1E8E2]/40 border border-[#116466]/30 rounded-2xl text-center space-y-4">
          <CheckCircle className="w-10 h-10 text-[#116466] mx-auto" />
          <h3 className="font-serif text-xl text-[#2C3531] uppercase">
            Account Created
          </h3>
          <p className="text-xs text-[#2C3531]/80 font-sans">{successInfo.message}</p>
          {successInfo.previewCode && (
            <div className="p-3 bg-white rounded-xl border border-[#116466]/20">
              <span className="text-[11px] text-[#2C3531]/60 block font-sans">Preview Verification Code:</span>
              <span className="font-mono text-xl font-bold tracking-widest text-[#116466]">
                {successInfo.previewCode}
              </span>
            </div>
          )}
          <Link
            href={`/verify-email?email=${encodeURIComponent(email)}`}
            className="block w-full py-3 rounded-full bg-[#116466] text-white font-semibold text-xs text-center hover:bg-[#0c4b4d]"
          >
            Proceed to Verification &rarr;
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2C3531] uppercase tracking-wider mb-1.5 font-display">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#2C3531]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Jane Doe"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#D9B08C]/40 bg-white text-[#2C3531] text-sm focus:outline-none focus:border-[#116466] transition-colors"
              />
            </div>
          </div>

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
                placeholder="jane@clinic.org"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#D9B08C]/40 bg-white text-[#2C3531] text-sm focus:outline-none focus:border-[#116466] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C3531] uppercase tracking-wider mb-1.5 font-display">
              Password
            </label>
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
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#2C3531]/60">
                  <span>Strength: {strengthLabels[strengthScore]}</span>
                </div>
                <div className="w-full h-1.5 bg-[#D1E8E2]/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColors[strengthScore]}`}
                    style={{ width: `${(strengthScore / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C3531] uppercase tracking-wider mb-1.5 font-display">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#2C3531]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#D9B08C]/40 bg-white text-[#2C3531] text-sm focus:outline-none focus:border-[#116466] transition-colors"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#2C3531]/80 pt-1 font-sans">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#D9B08C] accent-[#116466]"
            />
            <span>
              I understand Synapse-Voice is strictly an exploratory screening tool and not a clinical diagnostic device.
            </span>
          </label>

          <div className="pt-2">
            <PillButton
              variant="primary"
              onClick={() => {}}
              disabled={isSubmitting}
              className="w-full py-3.5"
            >
              {isSubmitting ? 'Registering...' : 'Complete Enrollment'}
            </PillButton>
          </div>
        </form>
      )}

      <div className="text-center pt-2 border-t border-[#D9B08C]/30 text-xs text-[#2C3531]/70 font-sans">
        Already enrolled?{' '}
        <Link href="/login" className="text-[#116466] font-semibold hover:underline">
          Sign In here &rarr;
        </Link>
      </div>
    </div>
  );
}
