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
      <section className="relative overflow-hidden border-b border-white/10 bg-[#141414] pb-6 pt-8">
        <div className="nf-row-pad w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-[2px] border border-white/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70 mb-3">
                <Trophy className="w-3.5 h-3.5" />
                <span>OFFICIAL TOP 10 CHARTS</span>
              </div>
              <h1 className="text-[clamp(1.75rem,3.2vw,3rem)] font-bold leading-tight text-white">
                Top 10 Most Watched
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] text-[#b3b3b3] sm:text-[14px]">
                {currentPeriodInfo?.description}. Ranked live by global audience engagement, daily streaming counts, and viewership momentum.
              </p>
            </div>

            {/* Timeframe & Category Selectors */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Timeframe Pills */}
              <div className="inline-flex rounded-[4px] border border-white/15 bg-[#232323] p-0.5">
                {PERIODS.map((p) => (
                  <Link
                    key={p.key}
                    href={`/rankings?period=${p.key}&media=${media}`}
                    className={cn(
                      'nf-focus rounded-[2px] px-3 py-1.5 text-[12px] font-medium transition-colors',
                      p.key === period
                        ? 'bg-white text-black'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>

              {/* Media Pills */}
              <div className="inline-flex rounded-[4px] border border-white/15 bg-[#232323] p-0.5">
                {MEDIA_TYPES.map((m) => (
                  <Link
                    key={m.key}
                    href={`/rankings?period=${period}&media=${m.key}`}
                    className={cn(
                      'nf-focus rounded-[2px] px-3 py-1.5 text-[12px] font-medium transition-colors',
                      m.key === media
                        ? 'bg-white text-black'
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
      <main className="nf-row-pad w-full mt-8">
        <div className="space-y-2.5">
          {items.map((item, index) => {
            const rank = item.rank || index + 1;
            const title = item.title || item.name || 'Unknown';
            const year =
              item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '—';
            const posterUrl = getPosterUrl(item.poster_path ?? null, 'w342');
            const backdropUrl = getBackdropUrl(item.backdrop_path ?? null, 'w780');

            // Podium rankings
            const isTop3 = rank <= 3;
            const rankBadgeColor = "bg-white/10 text-white/80 border-white/20";

            return (
              <article
                key={item.id}
                className={cn(
                  'group relative overflow-hidden rounded-[4px] border transition-colors duration-200',
                  isTop3
                    ? 'bg-[#232323] border-white/10 hover:border-white/30'
                    : 'bg-[#1c1c1c] border-white/10 hover:border-white/25 hover:bg-[#232323]'
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 gap-6">
                  {/* Left: Rank Number + Poster + Metadata */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    {/* Rank Number Badge */}
                    <div className="flex-shrink-0 flex items-center justify-center w-14 sm:w-16">
                      <span className="nf-top10-num text-[clamp(36px,3.2vw,58px)]">{rank}</span>
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
                          Trending #{rank}
                        </span>

                        <span className="text-xs px-1.5 py-0.5 rounded-[2px] bg-white/10 text-white/75 font-medium uppercase text-[10px] tracking-wider">
                          {item.media_type === 'movie' ? 'Movie' : 'TV Series'}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] font-normal text-[#8c8c8c]">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {year}
                        </span>
                      </div>

                      <Link href={`/watch/${item.media_type}/${item.id}`}>
                        <h2 className="text-[15px] sm:text-[17px] font-semibold text-white transition-colors truncate">
                          {title}
                        </h2>
                      </Link>

                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#b3b3b3] sm:text-[13px]">
                        {item.overview || 'Stream this title in high definition with fast servers.'}
                      </p>

                      {/* Popularity and Ratings */}
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{item.vote_average.toFixed(1)} Rating</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#b3b3b3] font-normal">
                          <TrendingUp className="w-4 h-4" />
                          <span>{item.popularity} Popularity Score</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Watch Action Button */}
                  <div className="flex-shrink-0 flex items-center md:flex-col justify-end gap-2 pt-2 md:pt-0 border-t border-white/10 md:border-t-0">
                    <Link
                      href={`/watch/${item.media_type}/${item.id}`}
                      className="nf-focus flex w-full items-center justify-center gap-2 rounded-[4px] bg-white px-5 py-2 text-[14px] font-medium text-black transition-colors hover:bg-white/80 md:w-auto cursor-pointer"
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
