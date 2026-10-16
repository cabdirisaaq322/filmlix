'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Fallback route when there is no history to go back to */
  fallback?: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallback = '/', label = 'Back', className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }, [router, fallback]);

  return (
    <button
      onClick={handleBack}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
        'bg-black/60 backdrop-blur-sm border border-white/15 text-white',
        'hover:bg-black/80 hover:border-white/30 transition-colors',
        className
      )}
      aria-label={`Go back to ${label}`}
      title="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}