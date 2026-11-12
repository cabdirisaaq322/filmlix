import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MediaGrid } from '@/components/MediaGrid';
import { BackButton } from '@/components/BackButton';
import { TMDB_BASE_URL, TMDB_API_KEY, toMediaItems, type MediaItem, type TMDBMovie, type TMDBTVShow, BLOCKLISTED_MOVIE_IDS } from '@/lib/tmdb';
import { getBlockedMovieIdsServer } from '@/lib/server-blocklist';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GENRE_MAP: Record<string, number> = {
  action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
  documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36,
  horror: 27, music: 10402, mystery: 9648, romance: 10749, scifi: 878,
  thriller: 53, war: 10752, western: 37,
};

interface GenrePageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug || '';
  const title = slugStr.charAt(0).toUpperCase() + slugStr.slice(1).replace(/-/g, ' ');
  return { title: `${title} Movies & Series`, description: `Browse ${title} movies and TV series on FilmFlix.` };
}

interface PageResponse { results?: (TMDBMovie | TMDBTVShow)[]; }

async function fetchPage(url: string): Promise<PageResponse> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    return (await res.json()) as PageResponse;
  } catch { return {}; }
}

async function getGenreData(genreId: number): Promise<{ movies: MediaItem[]; tv: MediaItem[] }> {
  const endpoint = `${TMDB_BASE_URL}`;
  const auth = `api_key=${TMDB_API_KEY}&language=en-US`;
  const [movies, tv] = await Promise.all([
    fetchPage(`${endpoint}/discover/movie?${auth}&with_genres=${genreId}`),
    fetchPage(`${endpoint}/discover/tv?${auth}&with_genres=${genreId}`),
  ]);
  const serverBlocked = await getBlockedMovieIdsServer().catch(() => [] as number[]);
  return {
    movies: toMediaItems(movies.results || [], 'movie').filter((item) => !BLOCKLISTED_MOVIE_IDS.includes(item.id) && !serverBlocked.includes(item.id)).slice(0, 20),
    tv: toMediaItems(tv.results || [], 'tv').filter((item) => !BLOCKLISTED_MOVIE_IDS.includes(item.id) && !serverBlocked.includes(item.id)).slice(0, 20),
  };
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = await params;
  const slugStr = slug || '';
  const slugLower = slugStr.toLowerCase();
  const genreId = GENRE_MAP[slugLower];

  if (!genreId) notFound();

  const { movies, tv } = await getGenreData(genreId);
  const title = slugLower.charAt(0).toUpperCase() + slugLower.slice(1).replace(/-/g, ' ');

  return (
    <div className="nf-row-pad w-full space-y-10 py-10 pt-28 pb-16 md:pt-32">
      <div className="space-y-4">
        <BackButton className="w-fit" />
        <header className="space-y-2">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]">Genre</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
          <p className="text-zinc-400">Browse {title.toLowerCase()} movies and TV series.</p>
        </header>
      </div>
      <MediaGrid title={`${title} Movies`} items={movies} />
      <MediaGrid title={`${title} Series`} items={tv} />
    </div>
  );
}
