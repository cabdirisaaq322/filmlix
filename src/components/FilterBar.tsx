'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { GenreOption, SortOption } from '@/lib/tmdb';

interface FilterBarProps {
  genres: GenreOption[];
  sorts: SortOption[];
  years: number[];
  activeGenre: string;
  activeSort: string;
  activeYear: string;
}

const selectClass =
  'nf-focus h-10 appearance-none rounded-xl border border-white/10 bg-[#12131e] px-4 pr-9 text-[13px] font-medium text-slate-200 transition-all hover:border-white/20 hover:bg-[#181a28] cursor-pointer shadow-sm';

const genreButtonClass = (active: boolean) =>
  `nf-focus rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
    active
      ? 'bg-gradient-to-r from-[#e50914] to-[#ff2d3b] text-white shadow-[0_2px_12px_rgba(229,9,20,0.45)]'
      : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white'
  }`;

export function FilterBar({ genres, sorts, years, activeGenre, activeSort, activeYear }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const selectedGenreIds = useMemo(() => new Set(activeGenre.split(',').filter(Boolean)), [activeGenre]);

  const applyParams = useCallback(
    (updates: Record<string, string>) => {
      const qs = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) qs.delete(key);
        else qs.set(key, value);
      });
      qs.delete('page');
      const query = qs.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname]
  );

  const toggleGenre = (id: string) => {
    const next = new Set(selectedGenreIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    applyParams({ genre: [...next].join(',') || '' });
  };

  const hasFilters = Boolean(activeGenre || activeYear || (activeSort && activeSort !== 'popularity.desc'));

  return (
    <div id="browse-filters" className="scroll-mt-36 space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl md:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <SlidersHorizontal className="h-4 w-4 text-[#e50914]" /> Filter & Sort
        </span>

        {/* Sort Select */}
        <div className="relative">
          <select
            value={activeSort}
            onChange={(e) => applyParams({ sort: e.target.value })}
            className={selectClass}
            aria-label="Sort results"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#12131e] text-slate-100">
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Year Select */}
        <div className="relative">
          <select
            value={activeYear}
            onChange={(e) => applyParams({ year: e.target.value })}
            className={selectClass}
            aria-label="Filter by year"
          >
            <option value="" className="bg-[#12131e] text-slate-100">Any Year</option>
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#12131e] text-slate-100">
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Reset Filter Button */}
        {hasFilters && (
          <button
            onClick={() => applyParams({ genre: '', sort: '', year: '' })}
            className="nf-focus inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-600/10 px-3.5 py-1.5 text-[12px] font-semibold text-red-300 transition-all hover:bg-red-600/20 hover:text-white"
          >
            <X className="h-3.5 w-3.5" /> Reset Filters
          </button>
        )}
      </div>

      {/* Genre pills list */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => applyParams({ genre: '' })}
          className={genreButtonClass(!activeGenre)}
          aria-pressed={!activeGenre}
        >
          All Genres
        </button>
        {genres.map((g) => {
          const active = selectedGenreIds.has(String(g.id));
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGenre(String(g.id))}
              className={genreButtonClass(active)}
              aria-pressed={active}
            >
              {g.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
