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

  // Password strength calculation
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
    'bg-stone-700',
    'bg-red-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-emerald-500',
    'bg-emerald-400',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid academic or professional email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please acknowledge the pre-clinical research screening disclaimer.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register(email, password, fullName);
      setSuccessInfo({
        message: response.message,
        previewCode: response.verification_code_preview,
      });

      // Redirect after brief acknowledgement
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1500);
    } catch (err: unknown) {
      const errDetail = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMessage(errDetail);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-stone-950 text-stone-100">
      {/* Atom Red background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[200px] bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3 shadow-inner">
            <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Researcher & Participant Access
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Create Your Account
          </h1>
          <p className="text-stone-400 text-sm mt-2">
            Sign up to securely record, track, and review longitudinal voice screening biomarker reports.
          </p>
        </div>

        {/* Card */}
        <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/20">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Registration Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successInfo && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
                <CheckCircle className="w-4 h-4" /> Account Created Successfully
              </div>
              <p>{successInfo.message}</p>
              {successInfo.previewCode && (
                <div className="mt-2.5 p-2 bg-stone-900/90 border border-emerald-700/60 rounded-lg text-center font-mono font-bold text-emerald-400 text-sm">
                  Simulated OTP Code: {successInfo.previewCode}
                </div>
              )}
              <p className="mt-2 text-[11px] text-emerald-400/80">Redirecting to email verification...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all"
                />
              </div>
            </div>

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
              <label className="block text-xs font-medium text-stone-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strengthScore >= lvl ? strengthColors[strengthScore] : 'bg-stone-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Strength: {strengthLabels[strengthScore]}</span>
                    <span>Min 8 chars, mixed case & numbers</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Academic Pre-Clinical Screening Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-stone-700 bg-stone-950 text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-stone-400 group-hover:text-stone-300 leading-relaxed">
                  I understand Synapse-Voice is strictly an{' '}
                  <span className="text-red-400 font-medium">academic pre-clinical screening aid</span> and research tool,
                  not an FDA/CE-cleared diagnostic device.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !!successInfo}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-red-950/50 hover:shadow-red-900/60 transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-red-200" />
                  <span>Create Account & Verify</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-6 border-t border-stone-800/80 text-center text-xs text-stone-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-red-400 hover:text-red-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        {/* Security & Disclaimer Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <Shield className="w-3.5 h-3.5 text-stone-500" />
          <span>PBKDF2-HMAC-SHA256 • Cryptographic JWT Session • TLS Transmission</span>
        </div>
      </div>
    </div>
  );
}
