import { Metadata } from 'next';
import { BrowseShell } from '@/components/BrowseShell';
import {
  discoverMovies,
  isTMDBConfigured,
  MOVIE_GENRES,
  MOVIE_SORTS,
  YEAR_OPTIONS,
  toMediaItems,
  type TMDBPaginatedResult,
} from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Watch Movies Online Free',
  description:
    'Browse and stream thousands of movies online for free in HD. Filter by genre, year and rating — updated daily.',
};

interface MoviesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const EMPTY: TMDBPaginatedResult = { page: 1, results: [], total_pages: 0, total_results: 0 };

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const sp = await searchParams;
  const read = (key: string): string | undefined => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const page = Math.min(Math.max(parseInt(read('page') || '1', 10) || 1, 1), 500);
  const genreRaw = read('genre');
  const genre = genreRaw && /^\d+$/.test(genreRaw) ? Number(genreRaw) : null;
  const sortRaw = read('sort');
  const sort = MOVIE_SORTS.some((s) => s.value === sortRaw) ? (sortRaw as string) : 'popularity.desc';
  const yearRaw = read('year');
  const year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;

  let data: TMDBPaginatedResult = EMPTY;
  if (isTMDBConfigured()) {
    data = await discoverMovies({ page, genre, sort, year }).catch(() => EMPTY);
  }

  const activeGenre = genre ? String(genre) : '';
  const activeYear = year ? String(year) : '';

  return (
    <BrowseShell
      title="Movies"
      description="Browse every movie, filtered the way you like."
      items={toMediaItems(data.results, 'movie')}
      page={data.page || page}
      totalPages={data.total_pages || 0}
      totalResults={data.total_results}
      genres={MOVIE_GENRES}
      sorts={MOVIE_SORTS}
      years={YEAR_OPTIONS}
      active={{ genre: activeGenre, sort, year: activeYear }}
      gridTitle="All Movies"
    />
  );
}