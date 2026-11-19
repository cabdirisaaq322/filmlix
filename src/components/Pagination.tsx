'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  className?: string;
}

function buildPages(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const output: (number | 'gap')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) output.push('gap');
    output.push(p);
    prev = p;
  }
  return output;
}

export function Pagination({ page, totalPages, className }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const goTo = useCallback(
    (target: number) => {
      if (target < 1 || target > totalPages || target === page) return;
      const qs = new URLSearchParams(window.location.search);
      if (target <= 1) qs.delete('page');
      else qs.set('page', String(target));
      const query = qs.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, pathname, page, totalPages]
  );

  if (totalPages <= 1) return null;

  const items = buildPages(page, totalPages);

  return (
    <nav className={cn('flex flex-wrap items-center justify-center gap-2 pt-10 pb-6', className)} aria-label="Pagination">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className={cn(
          'nf-focus inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200',
          page <= 1
            ? 'cursor-not-allowed border border-white/5 bg-white/[0.02] text-slate-600'
            : 'border border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white cursor-pointer active:scale-95'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>

      {items.map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className="px-1.5 text-slate-500 font-semibold" aria-hidden="true">…</span>
        ) : (
          <button
            key={item}
            onClick={() => goTo(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'nf-focus min-w-[42px] h-10 rounded-full px-3 text-[13px] font-semibold transition-all duration-200 cursor-pointer',
              item === page
                ? 'bg-gradient-to-r from-[#e50914] to-[#ff2d3b] text-white shadow-[0_2px_12px_rgba(229,9,20,0.5)] scale-105'
                : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95'
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          'nf-focus inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200',
          page >= totalPages
            ? 'cursor-not-allowed border border-white/5 bg-white/[0.02] text-slate-600'
            : 'border border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white cursor-pointer active:scale-95'
        )}
        aria-label="Next page"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
