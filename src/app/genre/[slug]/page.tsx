import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MediaGrid } from '@/components/MediaGrid';
import { AdContainer } from '@/components/AdContainer';
import { TMDB_BASE_URL, TMDB_API_KEY, toMediaItems, type MediaItem, type TMDBMovie, type TMDBTVShow } from '@/lib/tmdb';

const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

interface GenrePageProps {
  params: Promise<{ slug: string }>;
}

export const generateStaticParams = async () => {
  return [
    { slug: 'action' },
    { slug: 'comedy' },
    { slug: 'drama' },
    { slug: 'horror' },
  ];
};

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug || '';
  const title = slugStr.charAt(0).toUpperCase() + slugStr.slice(1).replace(/-/g, ' ');

  return {
    title: `${title} Movies`,
    description: `Browse ${title} movies and TV series. Watch free HD content online.`,
  };
}



interface PageResponse {
  results?: (TMDBMovie | TMDBTVShow)[];
}

async function fetchPage(url: string): Promise<PageResponse> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    return (await res.json()) as PageResponse;
  } catch {
    return {};
  }
}

async function getGenreData(genreId: number): Promise<{ movies: MediaItem[]; tv: MediaItem[] }> {
  const endpoint = `${TMDB_BASE_URL}`;
  const auth = `api_key=${TMDB_API_KEY}&language=en-US`;
  const [movies, tv] = await Promise.all([
    fetchPage(`${endpoint}/discover/movie?${auth}&with_genres=${genreId}`),
    fetchPage(`${endpoint}/discover/tv?${auth}&with_genres=${genreId}`),
  ]);
  return {
    movies: toMediaItems(movies.results || [], 'movie').slice(0, 20),
    tv: toMediaItems(tv.results || [], 'tv').slice(0, 20),
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
    <div className="space-y-8 pb-16">
      <AdContainer slot="header" className="mx-auto max-w-7xl px-4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400">Browse {title.toLowerCase()} movies and TV series.</p>
        </header>

        <MediaGrid title={`${title} Movies`} items={movies} />

        <MediaGrid title={`${title} TV Series`} items={tv} />
      </div>

      <AdContainer slot="footer" className="mx-auto max-w-7xl px-4" />
    </div>
  );
}
