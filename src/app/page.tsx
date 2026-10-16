import { Suspense } from 'react';
import { Metadata } from 'next';
import { HeroCarousel, HeroCarouselSkeleton } from '@/components/HeroCarousel';
import { MediaRow } from '@/components/MediaRow';
import { ContinueWatchingRow } from '@/components/ContinueWatching';
import { Top10Rankings } from '@/components/Top10Rankings';
import { AdContainer } from '@/components/AdContainer';
import {
  isTMDBConfigured,
  getTrendingAll,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getUpcomingMovies,
  getNowPlayingMovies,
  getAiringTodayTVShows,
  getTop10Rankings,
  MOVIE_GENRES,
  TV_GENRES,
  toMediaItems,
} from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'StreamFlix - Watch Movies & TV Series Free Online',
  description:
    'Stream the latest movies and TV series in HD for free. Trending titles, top-rated classics and new releases — no registration required.',
};

async function settled<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

async function FeaturedContent() {
  const trending = await settled(getTrendingAll());
  const heroItems = (trending || []).slice(0, 8).map((item) => ({
    id: item.id,
    title: 'title' in item ? item.title : item.name,
    name: 'name' in item ? item.name : undefined,
    overview: item.overview,
    backdrop_path: item.backdrop_path,
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    release_date: 'release_date' in item ? item.release_date : undefined,
    first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
    media_type: (item.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
    genre_ids: item.genre_ids || [],
  }));

  return heroItems.length > 0 ? <HeroCarousel items={heroItems} /> : null;
}

async function TopRankingsContent() {
  const items = await settled(getTop10Rankings('today', 'all'));
  return <Top10Rankings initialItems={items || []} />;
}

async function TrendingContent() {
  const items = await settled(getTrendingAll());
  return <MediaRow title="Trending Now" items={toMediaItems(items, 'movie')} href="/trending" />;
}

async function PopularMoviesContent() {
  const items = await settled(getPopularMovies());
  return <MediaRow title="Popular Movies" items={toMediaItems(items, 'movie')} href="/movies" />;
}

async function PopularTVContent() {
  const items = await settled(getPopularTVShows());
  return <MediaRow title="Popular TV Series" items={toMediaItems(items, 'tv')} href="/tv" />;
}

async function TopMoviesContent() {
  const items = await settled(getTopRatedMovies());
  return <MediaRow title="Top Rated Movies" items={toMediaItems(items, 'movie')} href="/top-rated?tab=movie" />;
}

async function TopTVContent() {
  const items = await settled(getTopRatedTVShows());
  return <MediaRow title="Top Rated Series" items={toMediaItems(items, 'tv')} href="/top-rated?tab=tv" />;
}

async function NowPlayingContent() {
  const items = await settled(getNowPlayingMovies());
  return <MediaRow title="Now Playing in Theaters" items={toMediaItems(items, 'movie')} href="/movies?sort=primary_release_date.desc" />;
}

async function UpcomingContent() {
  const items = await settled(getUpcomingMovies());
  return <MediaRow title="Coming Soon" items={toMediaItems(items, 'movie')} href="/movies?sort=primary_release_date.desc" />;
}

async function AiringTodayContent() {
  const items = await settled(getAiringTodayTVShows());
  return <MediaRow title="Airing Today" items={toMediaItems(items, 'tv')} href="/tv" />;
}

function TopRankingsSkeleton() {
  return (
    <section className="px-4 py-4 sm:px-6 lg:px-8" aria-label="Top 10 Most Watched (loading)">
      <div className="mb-5 h-7 w-56 animate-pulse rounded bg-slate-800" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-64 w-40 shrink-0 animate-pulse rounded-lg bg-slate-800" />
        ))}
      </div>
    </section>
  );
}

function HomeSetupNotice() {
  return (
    <div className="max-w-3xl mx-auto mt-10 px-6 py-6 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200">
      <h2 className="font-bold text-lg mb-2">Setup needed: TMDB API key</h2>
      <p className="text-sm leading-relaxed">
        Add your key to <code className="bg-black/40 px-1.5 py-0.5 rounded">.env.local</code> as{' '}
        <code className="bg-black/40 px-1.5 py-0.5 rounded">NEXT_PUBLIC_TMDB_API_KEY</code> then restart the dev
        server. Get a free key at{' '}
        <a
          href="https://www.themoviedb.org/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-amber-100"
        >
          themoviedb.org/settings/api
        </a>
        .
      </p>
    </div>
  );
}

export default function HomePage() {
  const configured = isTMDBConfigured();
  const genreSlugs = Array.from(new Set([...MOVIE_GENRES, ...TV_GENRES].map((g) => g.slug)));

  return (
    <div className="pb-16">
      {!configured && <HomeSetupNotice />}

      {configured && (
        <Suspense fallback={<HeroCarouselSkeleton />}>
          <FeaturedContent />
        </Suspense>
      )}

      <AdContainer slot="header" className="mx-auto max-w-7xl mt-8 px-4" />

      <div className="mt-8 space-y-10">
        <ContinueWatchingRow />

        {configured && (
          <Suspense fallback={<TopRankingsSkeleton />}>
            <TopRankingsContent />
          </Suspense>
        )}

        {configured && <Suspense fallback={<MediaRow title="Trending Now" isLoading />}><TrendingContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Popular Movies" href="/movies" isLoading />}><PopularMoviesContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Popular TV Series" href="/tv" isLoading />}><PopularTVContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Top Rated Movies" href="/top-rated?tab=movie" isLoading />}><TopMoviesContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Top Rated Series" href="/top-rated?tab=tv" isLoading />}><TopTVContent /></Suspense>}

        <AdContainer slot="footer" className="mx-auto max-w-7xl px-4" />

        {configured && <Suspense fallback={<MediaRow title="Now Playing in Theaters" isLoading />}><NowPlayingContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Coming Soon" isLoading />}><UpcomingContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Airing Today" isLoading />}><AiringTodayContent /></Suspense>}

        <section className="px-4 sm:px-6 lg:px-8" aria-label="Browse by genre">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {genreSlugs.map((slug) => (
              <a
                key={slug}
                href={`/genre/${slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-slate-900/70 border border-slate-800 text-slate-300 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-colors"
              >
                {slug.charAt(0).toUpperCase() + slug.slice(1)}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
