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
  'bg-[#232323] border border-white/25 rounded-[4px] px-3 py-2 text-[13px] text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 cursor-pointer hover:border-white/50 transition-colors';

const genreButtonClass = (active: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
    active
      ? 'border-white bg-white text-black'
      : 'border-white/20 bg-[#232323] text-[#e5e5e5] hover:border-white/50 hover:text-white'
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
      qs.delete('page'); // reset pagination when filters change
      const query = qs.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname]
  );

  const toggleGenre = (id: string) => {
    const next = new Set(selectedGenreIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const value = [...next].join(',');
    applyParams({ genre: value || '' });
  };

  const hasFilters = Boolean(activeGenre || activeYear || (activeSort && activeSort !== 'popularity.desc'));

  return (
    <div id="browse-filters" className="scroll-mt-36 flex flex-wrap items-center gap-3 mb-6">
      <span className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <SlidersHorizontal className="w-4 h-4" /> Filters
      </span>

      {/* Multi-select genre chips */}
      <div className="flex flex-wrap gap-1.5 min-w-[120px]">
        <button
          type="button"
          onClick={() => applyParams({ genre: '' })}
          className={genreButtonClass(!activeGenre)}
          aria-pressed={!activeGenre}
          aria-label="All Genres"
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
              aria-label={g.name}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      <select
        value={activeSort}
        onChange={(e) => applyParams({ sort: e.target.value })}
        className={selectClass}
        aria-label="Sort results"
      >
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={activeYear}
        onChange={(e) => applyParams({ year: e.target.value })}
        className={selectClass}
        aria-label="Filter by year"
      >
        <option value="">Any Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => applyParams({ genre: '', sort: '', year: '' })}
          className="flex items-center gap-1.5 rounded-full border border-white/30 bg-transparent px-4 py-1.5 text-[12px] font-medium text-[#e5e5e5] transition-colors hover:border-white hover:text-white"
        >
          <X className="w-4 h-4" /> Clear
        </button>
      )}
    </div>
  );
}
