import { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Play, Star, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTop10Rankings, RankingPeriod, RankingMedia, getPosterUrl } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Top 10 Charts — FilmFlix',
  description: 'Discover the top 10 most watched movies and TV series ranked today, this week, and this month.',
};

interface RankingsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PERIODS: { key: RankingPeriod; label: string; description: string }[] = [
  { key: 'today', label: 'Today', description: 'Most watched in the last 24 hours' },
  { key: 'week', label: 'This Week', description: 'Weekly streaming leaderboard' },
  { key: 'month', label: 'This Month', description: 'Top monthly favorites' },
];

const MEDIA_TYPES: { key: RankingMedia; label: string }[] = [
  { key: 'all', label: 'All' },
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
    <div className="min-h-screen pb-20 pt-28 md:pt-32">
      <section className="nf-row-pad mb-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]">
              <Trophy className="h-3.5 w-3.5" /> Top 10 Charts
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">Most Watched</h1>
            <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">{currentPeriodInfo?.description}. Ranked by popularity and engagement.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-0.5">
              {PERIODS.map((p) => (
                <Link key={p.key} href={`/rankings?period=${p.key}&media=${media}`} className={cn('nf-focus rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors', p.key === period ? 'bg-white text-black' : 'text-zinc-400 hover:text-white')}>
                  {p.label}
                </Link>
              ))}
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-0.5">
              {MEDIA_TYPES.map((m) => (
                <Link key={m.key} href={`/rankings?period=${period}&media=${m.key}`} className={cn('nf-focus rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors', m.key === media ? 'bg-white text-black' : 'text-zinc-400 hover:text-white')}>
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="nf-row-pad w-full">
        <div className="space-y-3">
          {items.map((item, index) => {
            const rank = item.rank || index + 1;
            const title = item.title || item.name || 'Unknown';
            const year = item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '—';
            const posterUrl = getPosterUrl(item.poster_path ?? null, 'w342');
            const isTop3 = rank <= 3;

            return (
              <article
                key={item.id}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-4 transition-all sm:p-5',
                  isTop3 ? 'border-white/20 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
                    <div className="flex w-14 shrink-0 items-center justify-center sm:w-16">
                      <span className="nf-top10-num text-[clamp(40px,4vw,64px)]">{rank}</span>
                    </div>

                    <Link href={`/watch/${item.media_type}/${item.id}`} className="relative block h-28 w-[74px] shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 sm:h-32 sm:w-[85px]">
                      <img src={posterUrl} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="h-7 w-7 fill-white text-white" />
                      </div>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
                          {item.media_type === 'movie' ? 'Movie' : 'Series'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400"><Calendar className="h-3.5 w-3.5" />{year}</span>
                        {isTop3 && <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">Top Pick</span>}
                      </div>

                      <Link href={`/watch/${item.media_type}/${item.id}`}>
                        <h2 className="truncate text-[16px] font-bold text-white hover:text-white sm:text-[18px]">{title}</h2>
                      </Link>

                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-zinc-400 sm:text-[13px]">
                        {item.overview || 'Stream this title in high definition.'}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-medium text-amber-300"><Star className="h-4 w-4 fill-current" />{item.vote_average.toFixed(1)}</span>
                        <span className="inline-flex items-center gap-1.5 text-zinc-400"><TrendingUp className="h-4 w-4" />{item.popularity} popularity</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 md:pl-4">
                    <Link href={`/watch/${item.media_type}/${item.id}`} className="nf-focus fx-btn-primary inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold md:w-auto">
                      <Play className="h-4 w-4 fill-current" /> Watch
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
