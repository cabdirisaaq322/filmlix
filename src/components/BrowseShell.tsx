import type { ReactNode } from 'react';
import { MediaGrid } from './MediaGrid';
import { FilterBar } from './FilterBar';
import { Pagination } from './Pagination';
import { BackButton } from './BackButton';
import { SearchX, Sparkles } from 'lucide-react';
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
  mobileScrollableGrid?: boolean;
  showCatalogueLabel?: boolean;
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
  mobileScrollableGrid = false,
  showCatalogueLabel = true,
}: BrowseShellProps) {
  const hasFilters = showFilters && genres && sorts && years && active;

  return (
    <div className="nf-row-pad w-full space-y-8 py-8 pt-24 md:pt-28">
      <div className="space-y-4">
        <BackButton className="w-fit" />
        <header className="space-y-3">
          <div className="flex items-center gap-2">
            {showCatalogueLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-600/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-red-400" />
                Catalogue
              </span>
            )}
            {typeof totalResults === 'number' && totalResults > 0 && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                {totalResults.toLocaleString()} titles
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
            {description}
          </p>
        </header>
      </div>

      {tabs && <div className="flex flex-wrap gap-2 pt-1">{tabs}</div>}

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
        <MediaGrid title={gridTitle || title} items={items} mobileScrollable={mobileScrollableGrid} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-24 text-center backdrop-blur-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-400 ring-1 ring-white/10">
            <SearchX className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-1 text-xl font-bold text-white">No titles match your selection</h2>
          <p className="max-w-md text-sm text-slate-400">
            Try adjusting your active genre, release year, or sorting order to discover more titles.
          </p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
