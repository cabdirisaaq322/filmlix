import { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Flame, Play, Star, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTop10Rankings, RankingPeriod, RankingMedia, getPosterUrl, getBackdropUrl } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Top 10 Most Watched — Real-Time Streaming Leaderboard',
  description:
    'Discover the top 10 most watched movies and TV series ranked today, this week, and this month. Real-time viewer popularity and charts.',
};

interface RankingsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PERIODS: { key: RankingPeriod; label: string; description: string }[] = [
  { key: 'today', label: 'Today', description: 'Most watched in the last 24 hours' },
  { key: 'week', label: 'This Week', description: 'Weekly top streaming leaderboard' },
  { key: 'month', label: 'This Month', description: 'Top monthly viewer favorites' },
];

const MEDIA_TYPES: { key: RankingMedia; label: string }[] = [
  { key: 'all', label: 'All Categories' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV Series' },
];

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
  const sp = await searchParams;
  const read = (key: string): string | undefined => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const rawPeriod = read('period');
  const period: RankingPeriod = PERIODS.some((p) => p.key === rawPeriod)
    ? (rawPeriod as RankingPeriod)
    : 'today';

  const rawMedia = read('media');
  const media: RankingMedia = MEDIA_TYPES.some((m) => m.key === rawMedia)
    ? (rawMedia as RankingMedia)
    : 'all';

  const items = await getTop10Rankings(period, media);
  const currentPeriodInfo = PERIODS.find((p) => p.key === period);

  return (
    <div className="min-h-screen pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-950/40 via-black to-black border-b border-neutral-800/80 pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
                <Trophy className="w-3.5 h-3.5" />
                <span>OFFICIAL TOP 10 CHARTS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Top 10 Most Watched
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
                {currentPeriodInfo?.description}. Ranked live by global audience engagement, daily streaming counts, and viewership momentum.
              </p>
            </div>

            {/* Timeframe & Category Selectors */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Timeframe Pills */}
              <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-lg">
                {PERIODS.map((p) => (
                  <Link
                    key={p.key}
                    href={`/rankings?period=${p.key}&media=${media}`}
                    className={cn(
                      'px-4 py-2 rounded-lg text-xs font-bold transition-all',
                      p.key === period
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>

              {/* Media Pills */}
              <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-lg">
                {MEDIA_TYPES.map((m) => (
                  <Link
                    key={m.key}
                    href={`/rankings?period=${period}&media=${m.key}`}
                    className={cn(
                      'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                      m.key === media
                        ? 'bg-neutral-800 text-red-400 border border-neutral-700'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="space-y-4">
          {items.map((item, index) => {
            const rank = item.rank || index + 1;
            const title = item.title || item.name || 'Unknown';
            const year =
              item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '—';
            const posterUrl = getPosterUrl(item.poster_path ?? null, 'w342');
            const backdropUrl = getBackdropUrl(item.backdrop_path ?? null, 'w780');

            // Podium rankings
            const isTop3 = rank <= 3;
            const rankBadgeColor =
              rank === 1
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-300'
                : rank === 2
                ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-black border-slate-200'
                : rank === 3
                ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white border-orange-400'
                : 'bg-slate-800 text-slate-300 border-slate-700';

            return (
              <article
                key={item.id}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border transition-all duration-300',
                  isTop3
                    ? 'bg-neutral-900/70 border-neutral-700/80 hover:border-red-600/80 hover:shadow-2xl hover:shadow-red-600/10'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 gap-6">
                  {/* Left: Rank Number + Poster + Metadata */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    {/* Rank Number Badge */}
                    <div className="flex-shrink-0 flex items-center justify-center w-14 sm:w-16">
                      <span
                        className={cn(
                          'text-4xl sm:text-5xl font-black italic tracking-tighter select-none font-sans',
                          rank === 1
                            ? 'text-amber-400'
                            : rank === 2
                            ? 'text-slate-300'
                            : rank === 3
                            ? 'text-orange-400'
                            : 'text-slate-600'
                        )}
                      >
                        #{rank}
                      </span>
                    </div>

                    {/* Poster Thumbnail */}
                    <Link
                      href={`/watch/${item.media_type}/${item.id}`}
                      className="relative flex-shrink-0 w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-slate-800 group/poster block"
                    >
                      <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/poster:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border',
                            rankBadgeColor
                          )}
                        >
                          {rank === 1 ? '🥇 #1 Trending' : rank === 2 ? '🥈 #2 Trending' : rank === 3 ? '🥉 #3 Trending' : `Rank #${rank}`}
                        </span>

                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase text-[10px]">
                          {item.media_type === 'movie' ? 'Movie' : 'TV Series'}
                        </span>

                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {year}
                        </span>
                      </div>

                      <Link href={`/watch/${item.media_type}/${item.id}`}>
                        <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors truncate">
                          {title}
                        </h2>
                      </Link>

                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.overview || 'Stream this title in high definition with fast servers.'}
                      </p>

                      {/* Popularity and Ratings */}
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{item.vote_average.toFixed(1)} Rating</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <TrendingUp className="w-4 h-4" />
                          <span>{item.popularity} Popularity Score</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Watch Action Button */}
                  <div className="flex-shrink-0 flex items-center md:flex-col justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <Link
                      href={`/watch/${item.media_type}/${item.id}`}
                      className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Watch Now</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
