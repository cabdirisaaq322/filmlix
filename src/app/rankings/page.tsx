import { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Play, Star, Calendar, TrendingUp, Sparkles, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTop10Rankings, RankingPeriod, RankingMedia, getPosterUrl } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Top 10 Worldwide Charts — FilmFlix',
  description: 'Discover the top 10 most watched movies and TV series ranked today, this week, and this month on FilmFlix.',
};

interface RankingsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PERIODS: { key: RankingPeriod; label: string; description: string }[] = [
  { key: 'today', label: 'Today', description: 'Most streamed titles in the last 24 hours' },
  { key: 'week', label: 'This Week', description: 'Weekly streaming leaderboard' },
  { key: 'month', label: 'This Month', description: 'Top monthly favorites worldwide' },
];

const MEDIA_TYPES: { key: RankingMedia; label: string }[] = [
  { key: 'all', label: 'All Media' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'Series' },
];

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
  const sp = await searchParams;
  const read = (key: string): string | undefined => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const rawPeriod = read('period');
  const period: RankingPeriod = PERIODS.some((p) => p.key === rawPeriod) ? (rawPeriod as RankingPeriod) : 'today';
  const rawMedia = read('media');
  const media: RankingMedia = MEDIA_TYPES.some((m) => m.key === rawMedia) ? (rawMedia as RankingMedia) : 'all';

  const items = await getTop10Rankings(period, media);
  const currentPeriodInfo = PERIODS.find((p) => p.key === period);

  return (
    <div className="min-h-screen pb-24 pt-24 md:pt-28">
      {/* Header with filters */}
      <section className="nf-row-pad mb-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                Worldwide Leaderboard
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
              Top 10 Charts
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              {currentPeriodInfo?.description}. Ranked live by viewership, rating, and audience momentum.
            </p>
          </div>

          {/* Filter Pills Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
              {PERIODS.map((p) => (
                <Link
                  key={p.key}
                  href={`/rankings?period=${p.key}&media=${media}`}
                  className={cn(
                    'nf-focus rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200',
                    p.key === period
                      ? 'bg-white text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {p.label}
                </Link>
              ))}
            </div>

            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
              {MEDIA_TYPES.map((m) => (
                <Link
                  key={m.key}
                  href={`/rankings?period=${period}&media=${m.key}`}
                  className={cn(
                    'nf-focus rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200',
                    m.key === media
                      ? 'bg-gradient-to-r from-[#e50914] to-[#ff2d3b] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Entries List */}
      <main className="nf-row-pad w-full">
        <div className="space-y-4">
          {items.map((item, index) => {
            const rank = item.rank || index + 1;
            const title = item.title || item.name || 'Unknown Title';
            const year = item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '—';
            const posterUrl = getPosterUrl(item.poster_path ?? null, 'w342');
            const isTop3 = rank <= 3;

            return (
              <article
                key={item.id}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-4 sm:p-5 backdrop-blur-md transition-all duration-300',
                  isTop3
                    ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/[0.06] via-white/[0.03] to-transparent shadow-[0_8px_24px_-8px_rgba(245,158,11,0.2)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
                    {/* Rank Number */}
                    <div className="flex w-14 shrink-0 items-center justify-center sm:w-16">
                      <span className="nf-top10-num text-[clamp(44px,5vw,72px)] drop-shadow-xl">
                        {rank}
                      </span>
                    </div>

                    {/* Poster thumbnail */}
                    <Link
                      href={`/watch/${item.media_type}/${item.id}`}
                      className="relative block h-28 w-[74px] shrink-0 overflow-hidden rounded-xl border border-white/15 bg-[#12131c] shadow-lg sm:h-32 sm:w-[85px] transition-transform duration-300 group-hover:scale-105"
                    >
                      <img
                        src={posterUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="h-6 w-6 fill-white text-white drop-shadow-md" />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                          {item.media_type === 'movie' ? 'Movie' : 'Series'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {year}
                        </span>
                        {isTop3 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <Award className="h-3 w-3" /> Podium Top {rank}
                          </span>
                        )}
                      </div>

                      <Link href={`/watch/${item.media_type}/${item.id}`}>
                        <h2 className="truncate text-[16px] font-bold text-white transition-colors group-hover:text-[#ff3b47] sm:text-[19px]">
                          {title}
                        </h2>
                      </Link>

                      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-slate-400 sm:text-[13.5px]">
                        {item.overview || 'Stream this title in high definition on FilmFlix.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {item.vote_average.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                          <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                          {item.popularity.toFixed(0)} Popularity Score
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Play Action CTA Button */}
                  <div className="shrink-0 md:pl-4">
                    <Link
                      href={`/watch/${item.media_type}/${item.id}`}
                      className="nf-focus fx-btn-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold shadow-xl md:w-auto"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Stream Now</span>
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
