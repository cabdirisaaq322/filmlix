'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
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
        'nf-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-zinc-200 backdrop-blur-sm',
        'hover:bg-white/10 hover:text-white transition-colors',
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
