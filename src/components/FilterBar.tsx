'use client';

import { useCallback } from 'react';
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
  'bg-neutral-900/85 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent cursor-pointer hover:border-white/25 transition-colors';

export function FilterBar({ genres, sorts, years, activeGenre, activeSort, activeYear }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();

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

  const hasFilters = Boolean(activeGenre || activeYear || (activeSort && activeSort !== 'popularity.desc'));

  return (
    <div id="browse-filters" className="scroll-mt-36 flex flex-wrap items-center gap-3 mb-6">
      <span className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <SlidersHorizontal className="w-4 h-4" /> Filters
      </span>

      <select
        value={activeGenre}
        onChange={(e) => applyParams({ genre: e.target.value })}
        className={selectClass}
        aria-label="Filter by genre"
      >
        <option value="">All Genres</option>
        {genres.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

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
          className="flex items-center gap-1.5 rounded-full border border-red-600/30 bg-red-600/10 px-4 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-600/20"
        >
          <X className="w-4 h-4" /> Clear
        </button>
      )}
    </div>
  );
}