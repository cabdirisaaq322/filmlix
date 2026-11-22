import { Suspense } from 'react';
import { Metadata } from 'next';
import { HeroCarousel, HeroCarouselSkeleton } from '@/components/HeroCarousel';
import { MediaRow } from '@/components/MediaRow';
import { ContinueWatchingRow } from '@/components/ContinueWatching';
import { Top10Rankings } from '@/components/Top10Rankings';
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
import { Compass, AlertTriangle, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FilmFlix - Watch Movies & TV Series Free Online',
  description:
    'Stream movies and TV series in HD. Discover trending titles, top charts, and new releases on FilmFlix.',
};

async function settled<T>(promise: Promise<T>): Promise<T | null> {
  try { return await promise; } catch { return null; }
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
  return <MediaRow title="Popular Series" items={toMediaItems(items, 'tv')} href="/tv" />;
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
  return <MediaRow title="Now in Theaters" items={toMediaItems(items, 'movie')} href="/movies?sort=primary_release_date.desc" />;
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
    <section className="nf-row-pad mb-12 py-2" aria-label="Top 10 loading">
      <div className="mb-4 h-7 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-60 w-36 shrink-0 animate-pulse rounded-xl bg-white/[0.06]" />
        ))}
      </div>
    </section>
  );
}

function HomeSetupNotice() {
  return (
    <div className="nf-row-pad pt-28">
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-200 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-amber-100">Setup Required: TMDB API Key</h2>
            <p className="mt-1 text-sm text-amber-200/80">
              Add <code className="rounded bg-black/40 px-2 py-0.5 font-mono text-xs text-amber-300">NEXT_PUBLIC_TMDB_API_KEY</code> to your environment and restart the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const configured = isTMDBConfigured();
  const genreSlugs = Array.from(new Set([...MOVIE_GENRES, ...TV_GENRES].map((g) => g.slug)));

  return (
    <div className="pb-20">
      {!configured && <HomeSetupNotice />}

      {configured && (
        <Suspense fallback={<HeroCarouselSkeleton />}>
          <FeaturedContent />
        </Suspense>
      )}

      {/* Telegram Section — Join Our Channel */}
      <section className="nf-row-pad mb-8 relative z-10">
        <a
          href="https://t.me/deidrasom3"
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-[600px] mx-auto mt-4 mb-4 px-[16px] py-[12px] rounded-[12px] border border-[#4a5538] bg-[#0a0a0a] hover:border-[#5a6548] transition-colors"
        >
          {/* Top Row */}
          <div className="flex items-start gap-[14px]">
            {/* Left: Blue badge */}
            <div className="flex items-center gap-3.5 rounded-[10px] bg-[#1d9bf0] px-[14px] py-[10px] shrink-0">
              <Send className="h-5 w-5 text-white" />
              <div className="text-[11px] font-bold text-white uppercase leading-[1.1]">
                TELEGRAM<br />CHANNEL
              </div>
            </div>
            {/* Right: Heading */}
            <h2 className="flex-1 min-w-0 text-[#ffffff] text-[16px] font-bold leading-[1.25]">
              Join Our Telegram Channel Now
            </h2>
          </div>
          {/* Bottom Row */}
          <div className="mt-[10px] text-[#4ade80] text-[12.5px] font-medium leading-[1.5]">
            You can ⭐ Request Movies and Series ⭐ Latest Update and News ⭐ Report Bugs and Errors…
          </div>
        </a>
      </section>

      <div className="relative z-10 mt-6 space-y-4">
        <ContinueWatchingRow />

        {configured && (
          <Suspense fallback={<TopRankingsSkeleton />}>
            <TopRankingsContent />
          </Suspense>
        )}

        {configured && <Suspense fallback={<MediaRow title="Trending Now" isLoading />}><TrendingContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Popular Movies" isLoading />}><PopularMoviesContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Popular Series" isLoading />}><PopularTVContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Top Rated Movies" isLoading />}><TopMoviesContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Top Rated Series" isLoading />}><TopTVContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Now in Theaters" isLoading />}><NowPlayingContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Coming Soon" isLoading />}><UpcomingContent /></Suspense>}
        {configured && <Suspense fallback={<MediaRow title="Airing Today" isLoading />}><AiringTodayContent /></Suspense>}

        {/* Explore Genres Section */}
        <section className="nf-row-pad mb-14 mt-8" aria-label="Browse by genre">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md md:p-8">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600/15 text-[#e50914] ring-1 ring-red-600/30">
                <Compass className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[18px] font-bold tracking-tight text-white md:text-[21px]">
                  Explore by Genre
                </h2>
                <p className="text-xs text-slate-400">Discover handpicked selections across every cinematic mood</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {genreSlugs.map((slug) => (
                <a
                  key={slug}
                  href={`/genre/${slug}`}
                  className="nf-focus rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12.5px] font-medium text-slate-300 transition-all duration-200 hover:scale-105 hover:border-red-500/40 hover:bg-red-600/15 hover:text-white"
                >
                  {slug.charAt(0).toUpperCase() + slug.slice(1)}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
