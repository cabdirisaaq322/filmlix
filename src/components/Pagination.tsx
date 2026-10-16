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
    <nav className={cn('flex items-center justify-center gap-2 pt-8 flex-wrap', className)} aria-label="Pagination">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          page <= 1
            ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
            : 'bg-slate-900 text-slate-300 hover:bg-indigo-600 hover:text-white'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" /> Prev
      </button>

      {items.map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-slate-500" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => goTo(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              item === page
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
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
          'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          page >= totalPages
            ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
            : 'bg-slate-900 text-slate-300 hover:bg-indigo-600 hover:text-white'
        )}
        aria-label="Next page"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}