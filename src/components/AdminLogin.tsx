'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Sparkles } from 'lucide-react';
import { signIn } from '@/lib/auth';

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn();
      onSuccess();
    } catch {
      setError('Google sign-in failed or you are not authorized.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--fx-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#e50914] to-[#b20710] text-white"><Sparkles className="h-5 w-5" /></span>
            <span className="text-xl font-extrabold tracking-tight text-white">FilmFlix</span>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Admin Sign In</h2>
          <p className="mb-6 text-sm text-zinc-400">Sign in with your authorized Google account.</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="nf-focus flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in with Google'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="nf-focus text-sm text-zinc-400 transition-colors hover:text-white">
            ← Back to FilmFlix
          </Link>
        </div>
      </div>
    </div>
  );
}
