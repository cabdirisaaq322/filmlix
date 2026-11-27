import { Metadata } from 'next';
import { BrowseShell } from '@/components/BrowseShell';
import {
  discoverMovies,
  isTMDBConfigured,
  MOVIE_GENRES,
  MOVIE_SORTS,
  YEAR_OPTIONS,
  toMediaItems,
  BLOCKLISTED_MOVIE_IDS,
  type TMDBPaginatedResult,
} from '@/lib/tmdb';
import { getBlockedMovieIdsServer } from '@/lib/server-blocklist';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Watch Movies Online Free',
  description:
    'Browse and stream thousands of movies online for free in HD. Filter by genre, year and rating — updated daily.',
};

interface MoviesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const EMPTY: TMDBPaginatedResult = { page: 1, results: [], total_pages: 0, total_results: 0 };
const TMDB_PAGES_PER_PAGE = 3;
const TMDB_MAX_PAGE = 500;
const MAX_PAGE = Math.ceil(TMDB_MAX_PAGE / TMDB_PAGES_PER_PAGE);

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const sp = await searchParams;
  const read = (key: string): string | undefined => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const page = Math.min(Math.max(parseInt(read('page') || '1', 10) || 1, 1), MAX_PAGE);
  const genreRaw = read('genre');
  const genre = genreRaw && /^(?:\d+)(?:,\d+)*$/.test(genreRaw) ? genreRaw : null;
  const sortRaw = read('sort');
  const sort = MOVIE_SORTS.some((s) => s.value === sortRaw) ? (sortRaw as string) : 'popularity.desc';
  const yearRaw = read('year');
  const year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;

  let data: TMDBPaginatedResult = EMPTY;
  if (isTMDBConfigured()) {
    const firstTMDBPage = (page - 1) * TMDB_PAGES_PER_PAGE + 1;
    const pagesToFetch = Math.min(TMDB_PAGES_PER_PAGE, TMDB_MAX_PAGE - firstTMDBPage + 1);
    const [fetchedPages, serverBlocked] = await Promise.all([
      Promise.all(
        Array.from({ length: pagesToFetch }, (_, index) =>
          discoverMovies({ page: firstTMDBPage + index, genre, sort, year }).catch(() => EMPTY)
        )
      ),
      getBlockedMovieIdsServer().catch(() => [] as number[]),
    ]);
    const firstPage = fetchedPages.find((fetched) => fetched.total_pages > 0) || EMPTY;
    data = {
      page,
      total_pages: Math.ceil(firstPage.total_pages / TMDB_PAGES_PER_PAGE),
      total_results: firstPage.total_results,
      results: fetchedPages
        .flatMap((fetched) => fetched.results || [])
        .filter((item) => !BLOCKLISTED_MOVIE_IDS.includes(item.id) && !serverBlocked.includes(item.id)),
    };
  }

  const activeGenre = genre ?? '';
  const activeYear = year ? String(year) : '';

  return (
    <BrowseShell
      title="Movies"
      description="Browse every movie, filtered the way you like."
      items={toMediaItems(data.results, 'movie')}
      page={data.page}
      totalPages={data.total_pages || 0}
      totalResults={data.total_results}
      genres={MOVIE_GENRES}
      sorts={MOVIE_SORTS}
      years={YEAR_OPTIONS}
      active={{ genre: activeGenre, sort, year: activeYear }}
      gridTitle="All Movies"
      mobileScrollableGrid
      showCatalogueLabel={false}
    />
  );
}