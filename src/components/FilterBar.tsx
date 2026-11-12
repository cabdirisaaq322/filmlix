'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
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
  'nf-focus h-10 rounded-full border border-white/10 bg-white/5 px-4 pr-8 text-[13px] text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer appearance-none';

const genreButtonClass = (active: boolean) =>
  `nf-focus rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all ${
    active
      ? 'border-white/40 bg-white/15 text-white'
      : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-white'
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
    <div id="browse-filters" className="scroll-mt-36 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <SlidersHorizontal className="h-4 w-4 text-[#e50914]" /> Filters
        </span>

        <div className="relative">
          <select
            value={activeSort}
            onChange={(e) => applyParams({ sort: e.target.value })}
            className={selectClass}
            aria-label="Sort results"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0c0c12]">{s.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={activeYear}
            onChange={(e) => applyParams({ year: e.target.value })}
            className={selectClass}
            aria-label="Filter by year"
          >
            <option value="" className="bg-[#0c0c12]">Any Year</option>
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#0c0c12]">{y}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => applyParams({ genre: '', sort: '', year: '' })}
            className="nf-focus inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-transparent px-3.5 py-2 text-[12px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
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
