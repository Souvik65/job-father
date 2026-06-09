'use client';

import { useState, useTransition, Suspense, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

type Mode = 'login' | 'register';

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(errorParam ?? null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showMockTestRedirectMsg, setShowMockTestRedirectMsg] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const toggle = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Registration failed.');
          return;
        }
        setSuccess('Account created! Signing you in...');
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === 'CredentialsSignin'
            ? 'Invalid email or password.'
            : result.error,
        );
        return;
      }

      const safeUrl = callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/';
      
      if (safeUrl.includes('mock-tests')) {
        setShowMockTestRedirectMsg(true);
        redirectTimeoutRef.current = setTimeout(() => {
          router.push(safeUrl);
          router.refresh();
        }, 2500);
      } else {
        router.push(safeUrl);
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a1120] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background blobs matching modern UI */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ee6f14]/10 dark:bg-[#ee6f14]/20 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#10b981]/10 dark:bg-[#10b981]/20 blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-[#111c2e]/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 relative z-10">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100 dark:border-white/5">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:scale-105 transition-transform duration-300">
            <svg className="w-8 h-8 text-[#ee6f14]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-gray-400 tracking-widest uppercase">
              Jobfather
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            {mode === 'login'
              ? 'Sign in to access your dashboard and mock tests.'
              : 'Join thousands of aspirants preparing for govt jobs.'}
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm animate-fadeUp">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-xl px-4 py-3 text-sm animate-fadeUp">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{success}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee6f14]/50 focus:border-[#ee6f14] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee6f14]/50 focus:border-[#ee6f14] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee6f14]/50 focus:border-[#ee6f14] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none p-1 rounded-md"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#ee6f14] hover:bg-[#d5580e] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-white font-extrabold uppercase tracking-wide py-3.5 rounded-xl transition-all duration-200 text-sm shadow-[0_4px_14px_0_rgba(238,111,20,0.39)] hover:shadow-[0_6px_20px_rgba(238,111,20,0.23)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            {isPending && (
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggle}
              className="text-[#ee6f14] font-bold hover:text-[#d5580e] hover:underline transition-colors focus:outline-none"
            >
              {mode === 'login' ? 'Register now' : 'Sign in instead'}
            </button>
          </p>
        </form>
      </div>

      {/* Mock Test Redirect Popup */}
      {showMockTestRedirectMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeUp">
          <div className="bg-white dark:bg-[#111c2e] rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-200 dark:border-white/10 animate-slideDown">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100 dark:border-green-500/20">
              <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">Success!</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
              You have successfully {mode === 'login' ? 'Logged In' : 'Registered'}.<br/>
              <span className="font-extrabold text-[#ee6f14] text-base mt-2 block tracking-wide">Redirecting to Mock-Test...</span>
            </p>
            <div className="flex justify-center">
              <svg className="w-8 h-8 animate-spin text-[#ee6f14]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0a1120] flex items-center justify-center px-4"><div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-[#ee6f14] rounded-full animate-spin"></div></div>}>
      <AuthPageInner />
    </Suspense>
  );
}
