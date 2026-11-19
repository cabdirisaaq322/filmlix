import { Metadata } from 'next';
import Link from 'next/link';
import { BrowseShell } from '@/components/BrowseShell';
import { cn } from '@/lib/utils';
import { fetchTopRatedPage, isTMDBConfigured, toMediaItems, type TMDBPaginatedResult } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Top Rated Movies & Series — FilmFlix',
  description: 'The highest rated and critically acclaimed movies and TV series of all time.',
};

interface TopRatedPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const EMPTY: TMDBPaginatedResult = { page: 1, results: [], total_pages: 0, total_results: 0 };

const TABS = [
  { key: 'movie', label: 'Top Rated Movies' },
  { key: 'tv', label: 'Top Rated Series' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default async function TopRatedPage({ searchParams }: TopRatedPageProps) {
  const sp = await searchParams;
  const read = (key: string): string | undefined => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const rawTab = read('tab');
  const tab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : 'movie';
  const page = Math.min(Math.max(parseInt(read('page') || '1', 10) || 1, 1), 500);

  let data: TMDBPaginatedResult = EMPTY;
  if (isTMDBConfigured()) {
    data = await fetchTopRatedPage(tab, page).catch(() => EMPTY);
  }

  const tabs = (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={`/top-rated?tab=${t.key}`}
          aria-current={t.key === tab ? 'page' : undefined}
          className={cn(
            'nf-focus rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200',
            t.key === tab
              ? 'bg-gradient-to-r from-[#e50914] to-[#ff2d3b] text-white shadow-md'
              : 'text-slate-300 hover:text-white'
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );

  return (
    <BrowseShell
      title="All-Time Critically Acclaimed"
      description="The highest audience and critical scores in cinema history, streaming without restrictions."
      items={toMediaItems(data.results, tab)}
      page={data.page || page}
      totalPages={data.total_pages || 0}
      totalResults={data.total_results}
      tabs={tabs}
      gridTitle={tab === 'movie' ? 'All-Time Top Rated Movies' : 'All-Time Top Rated Series'}
      showFilters={false}
    />
  );
}
