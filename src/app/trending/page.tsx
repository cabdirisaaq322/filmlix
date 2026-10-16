import { Metadata } from 'next';
import Link from 'next/link';
import { BrowseShell } from '@/components/BrowseShell';
import { cn } from '@/lib/utils';
import { fetchTrendingPage, isTMDBConfigured, toMediaItems, type TMDBPaginatedResult } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Trending Titles Today',
  description: 'See what everyone is watching right now — the hottest trending movies and TV series of the day.',
};

interface TrendingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const EMPTY: TMDBPaginatedResult = { page: 1, results: [], total_pages: 0, total_results: 0 };

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV Series' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const sp = await searchParams;
  const read = (key: string): string | undefined => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const rawTab = read('tab');
  const tab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : 'all';
  const page = Math.min(Math.max(parseInt(read('page') || '1', 10) || 1, 1), 500);

  let data: TMDBPaginatedResult = EMPTY;
  if (isTMDBConfigured()) {
    data = await fetchTrendingPage(tab, page).catch(() => EMPTY);
  }

  const fallback: 'movie' | 'tv' = tab === 'tv' ? 'tv' : 'movie';

  const tabs = TABS.map((t) => (
    <Link
      key={t.key}
      href={`/trending?tab=${t.key}`}
      aria-current={t.key === tab ? 'page' : undefined}
      className={cn(
        'px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border',
        t.key === tab
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
      )}
    >
      {t.label}
    </Link>
  ));

  return (
    <BrowseShell
      title="Trending"
      description="What everyone is watching right now."
      items={toMediaItems(data.results, fallback)}
      page={data.page || page}
      totalPages={data.total_pages || 0}
      totalResults={data.total_results}
      tabs={tabs}
      gridTitle="Trending Titles"
      showFilters={false}
    />
  );
}