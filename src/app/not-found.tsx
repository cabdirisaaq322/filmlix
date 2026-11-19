import Link from 'next/link';
import { Home, Film } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 text-center space-y-6 max-w-lg backdrop-blur-2xl shadow-2xl">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-600/15 rounded-3xl flex items-center justify-center ring-1 ring-red-600/30">
            <Film className="w-10 h-10 text-[#e50914]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(229,9,20,0.4)]">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-200">Scene Not Found</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            The title or page you are trying to view doesn't exist, has been retired, or moved to another premiere.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="nf-focus fx-btn-primary inline-flex items-center gap-2 px-7 py-3 text-sm font-bold shadow-xl"
          >
            <Home className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
