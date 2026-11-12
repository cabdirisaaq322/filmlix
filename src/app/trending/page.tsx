import { Metadata } from 'next';
import Link from 'next/link';
import { BrowseShell } from '@/components/BrowseShell';
import { cn } from '@/lib/utils';
import { fetchTrendingPage, isTMDBConfigured, toMediaItems, type TMDBPaginatedResult } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Trending Titles',
  description: 'See what everyone is watching right now — trending movies and TV series.',
};

interface TrendingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const EMPTY: TMDBPaginatedResult = { page: 1, results: [], total_pages: 0, total_results: 0 };

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'Series' },
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
