'use client';

import { useEffect } from 'react';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 text-center space-y-6 max-w-lg backdrop-blur-2xl shadow-2xl">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-600/15 rounded-3xl flex items-center justify-center ring-1 ring-red-600/30">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">Playback Interrupted</h1>
          <h2 className="text-base font-semibold text-slate-300">An unexpected stream error occurred</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            We encountered an issue loading this media resource. You can retry the request or return to the main catalog.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="nf-focus fx-btn-primary inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Stream</span>
          </button>
          <Link
            href="/"
            className="nf-focus inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-white/10 bg-white/[0.04] text-slate-200 text-sm font-semibold hover:border-white/25 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
