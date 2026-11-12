import { Metadata } from 'next';
import Link from 'next/link';
import { BrowseShell } from '@/components/BrowseShell';
import { cn } from '@/lib/utils';
import { fetchTopRatedPage, isTMDBConfigured, toMediaItems, type TMDBPaginatedResult } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Top Rated Movies & Series',
  description: 'The highest rated movies and TV series of all time.',
};

interface TopRatedPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const EMPTY: TMDBPaginatedResult = { page: 1, results: [], total_pages: 0, total_results: 0 };

const TABS = [
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'Series' },
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

  const tabs = TABS.map((t) => (
    <Link
      key={t.key}
      href={`/top-rated?tab=${t.key}`}
      aria-current={t.key === tab ? 'page' : undefined}
      className={cn(
        'nf-focus rounded-full px-4 py-2 text-sm font-medium transition-colors border',
        t.key === tab
          ? 'border-white/30 bg-white/15 text-white'
          : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
      )}
    >
      {t.label}
    </Link>
  ));

  return (
    <BrowseShell
      title="Top Rated"
      description="The highest rated titles of all time."
      items={toMediaItems(data.results, tab)}
      page={data.page || page}
      totalPages={data.total_pages || 0}
      totalResults={data.total_results}
      tabs={tabs}
      gridTitle={tab === 'movie' ? 'Top Rated Movies' : 'Top Rated Series'}
      showFilters={false}
    />
  );
}
