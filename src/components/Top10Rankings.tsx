'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Loader2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankedMediaItem, RankingPeriod, RankingMedia, getPosterUrl } from '@/lib/tmdb';

interface Top10RankingsProps {
  initialItems?: RankedMediaItem[];
  title?: string;
  showViewAll?: boolean;
}

const PERIODS: { key: RankingPeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const MEDIA_TYPES: { key: RankingMedia; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'Series' },
];

export function Top10Rankings({
  initialItems = [],
  title = 'Top 10 Worldwide',
  showViewAll = true,
}: Top10RankingsProps) {
  const [period, setPeriod] = useState<RankingPeriod>('today');
  const [media, setMedia] = useState<RankingMedia>('all');
  const [items, setItems] = useState<RankedMediaItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchRankings = useCallback(async (p: RankingPeriod, m: RankingMedia) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rankings?period=${p}&media=${m}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePeriodChange = (newPeriod: RankingPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    fetchRankings(newPeriod, media);
  };

  const handleMediaChange = (newMedia: RankingMedia) => {
    if (newMedia === media) return;
    setMedia(newMedia);
    fetchRankings(period, newMedia);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const page = scrollRef.current.clientWidth * 0.85;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -page : page, behavior: 'smooth' });
  };

  return (
    <section className="relative mb-14" aria-label="Top 10 Charts">
      {/* Header bar with controls */}
      <div className="nf-row-pad mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold tracking-tight text-white md:text-[22px]">{title}</h2>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md" role="tablist">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                role="tab"
                aria-selected={period === p.key}
                onClick={() => handlePeriodChange(p.key)}
                className={cn(
                  'nf-focus rounded-full px-3 py-1 text-[11.5px] font-semibold transition-all duration-200',
                  period === p.key
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Media type selector */}
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md" role="tablist">
            {MEDIA_TYPES.map((m) => (
              <button
                key={m.key}
                role="tab"
                aria-selected={media === m.key}
                onClick={() => handleMediaChange(m.key)}
                className={cn(
                  'nf-focus rounded-full px-3 py-1 text-[11.5px] font-semibold transition-all duration-200',
                  media === m.key
                    ? 'bg-gradient-to-r from-[#e50914] to-[#ff2d3b] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {showViewAll && (
            <Link
              href={`/rankings?period=${period}&media=${media}`}
              className="nf-focus group hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-semibold text-slate-300 transition-all hover:border-white/20 hover:text-white md:inline-flex"
            >
              <span>Full Leaderboard</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Carousel body with giant numbers */}
      <div className="group/row relative">
        <button
          onClick={() => scroll('left')}
          tabIndex={-1}
          aria-label="Scroll left"
          className="absolute bottom-10 left-2 top-0 z-30 hidden w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/60 text-white backdrop-blur-md shadow-2xl transition-all duration-200 hover:border-white/25 hover:bg-black/80 hover:scale-105 active:scale-95 group-hover/row:opacity-100 opacity-0 md:flex"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar nf-row-pad flex items-end gap-3.5 sm:gap-5 overflow-x-auto scroll-smooth pb-4 pt-2"
        >
          {loading ? (
            <div className="flex h-60 w-full items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-[#e50914]" aria-hidden="true" />
              <span className="text-[14px] font-medium">Updating leaderboards…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="w-full py-16 text-center text-[14px] text-slate-500">
              No ranked titles available right now.
            </div>
          ) : (
            items.map((item, index) => {
              const displayTitle = item.title || item.name || 'Unknown Title';
              const year = item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '';
              const posterUrl = getPosterUrl(item.poster_path, 'w342');
              const rank = item.rank || index + 1;

              // Rank-based gradient colors: 1=amber, 2=slate, 3=amber-orange, others=slate
              const rankClass =
                rank === 1
                  ? 'from-amber-300 via-yellow-400 to-amber-700'
                  : rank === 2
                  ? 'from-slate-100 via-slate-300 to-slate-500'
                  : rank === 3
                  ? 'from-amber-400 via-orange-500 to-amber-800'
                  : 'from-slate-400 via-slate-600 to-slate-800';

              return (
                <Link
                  key={`${item.id}-${rank}`}
                  href={`/watch/${item.media_type}/${item.id}`}
                  className="nf-focus group/card relative flex shrink-0 select-none items-end"
                  aria-label={`Rank ${rank}: ${displayTitle}`}
                >
                  {/* Giant Frosted Glass Rank Number - in front (z-20) so it is 100% visible and never hidden behind */}
                  <div className="relative z-20 flex shrink-0 items-end -mr-5 sm:-mr-7 md:-mr-8 pb-[42px] sm:pb-[52px] pointer-events-none select-none">
                    <span
                      className={cn("nf-top10-num text-[clamp(88px,9.5vw,144px)] transition-all duration-300 group-hover/card:scale-108 group-hover/card:-translate-y-1 group-hover/card:brightness-125", rankClass)}
                      aria-hidden="true"
                    >
                      {rank}
                    </span>
                  </div>

                  {/* Poster card */}
                  <div className="relative z-10 w-[clamp(115px,13vw,175px)]">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#12131c] shadow-lg transition-all duration-300 group-hover/card:-translate-y-2 group-hover/card:border-white/25 group-hover/card:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8),0_0_20px_rgba(229,9,20,0.2)]">
                      <img
                        src={posterUrl}
                        alt={displayTitle}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.06]"
                        loading="lazy"
                        sizes="(max-width: 640px) 30vw, 12vw"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 group-hover/card:opacity-70 transition-opacity" />
                    </div>

                    <p
                      className="mt-2.5 line-clamp-1 text-[13px] font-semibold text-slate-100 transition-colors group-hover/card:text-[#ff3b47]"
                      title={displayTitle}
                    >
                      {displayTitle}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                      {year && <span>{year}</span>}
                      <span className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.2 text-[9px] font-semibold uppercase text-slate-400">
                        {item.media_type === 'tv' ? 'Series' : 'Movie'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <button
          onClick={() => scroll('right')}
          tabIndex={-1}
          aria-label="Scroll right"
          className="absolute bottom-10 right-2 top-0 z-30 hidden w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/60 text-white backdrop-blur-md shadow-2xl transition-all duration-200 hover:border-white/25 hover:bg-black/80 hover:scale-105 active:scale-95 group-hover/row:opacity-100 opacity-0 md:flex"
        >
          <ChevronRight className="h-7 w-7" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
