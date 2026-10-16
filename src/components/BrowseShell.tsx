import type { ReactNode } from 'react';
import { MediaGrid } from './MediaGrid';
import { FilterBar } from './FilterBar';
import { Pagination } from './Pagination';
import { BackButton } from './BackButton';
import { SearchX } from 'lucide-react';
import type { MediaItem, GenreOption, SortOption } from '@/lib/tmdb';

interface BrowseShellProps {
  title: string;
  description: string;
  items: MediaItem[];
  page: number;
  totalPages: number;
  totalResults?: number;
  genres?: GenreOption[];
  sorts?: SortOption[];
  years?: number[];
  active?: { genre: string; sort: string; year: string };
  tabs?: ReactNode;
  gridTitle?: string;
  showFilters?: boolean;
}

export function BrowseShell({
  title,
  description,
  items,
  page,
  totalPages,
  totalResults,
  genres,
  sorts,
  years,
  active,
  tabs,
  gridTitle,
  showFilters = true,
}: BrowseShellProps) {
  const hasFilters = showFilters && genres && sorts && years && active;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <BackButton className="mb-4" />
        <header>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-400">Explore FilmFlix</p>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="max-w-3xl text-sm text-slate-400 sm:text-base">
            {description}
            {typeof totalResults === 'number' && totalResults > 0 && (
              <span className="text-slate-500"> • {totalResults.toLocaleString()} titles</span>
            )}
          </p>
        </header>
      </div>

      {tabs && <div className="flex flex-wrap gap-2">{tabs}</div>}

      {hasFilters && (
        <FilterBar
          genres={genres}
          sorts={sorts}
          years={years}
          activeGenre={active.genre}
          activeSort={active.sort}
          activeYear={active.year}
        />
      )}

      {items.length > 0 ? (
        <MediaGrid title={gridTitle || title} items={items} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <SearchX className="w-12 h-12 text-slate-600 mb-4" />
          <h2 className="text-lg font-semibold text-white mb-1">Nothing here yet</h2>
          <p className="text-slate-400 text-sm max-w-md">
            No titles matched your filters. Try changing the genre, sort or year — or check that your TMDB API key is
            set in <code className="bg-slate-800 px-1.5 py-0.5 rounded">.env.local</code>.
          </p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}