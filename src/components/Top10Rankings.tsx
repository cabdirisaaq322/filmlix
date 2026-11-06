'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankedMediaItem, RankingPeriod, RankingMedia, getPosterUrl } from '@/lib/tmdb';

interface Top10RankingsProps {
  initialItems?: RankedMediaItem[];
  title?: string;
  showViewAll?: boolean;
}

const PERIODS: { key: RankingPeriod; label: string; sub: string }[] = [
  { key: 'today', label: 'Today', sub: 'Most watched today' },
  { key: 'week', label: 'This Week', sub: 'Top this week' },
  { key: 'month', label: 'This Month', sub: 'Top of the month' },
];

const MEDIA_TYPES: { key: RankingMedia; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Films' },
  { key: 'tv', label: 'Series' },
];

export function Top10Rankings({
  initialItems = [],
  title = 'Top 10 Most Watched',
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
    const page = scrollRef.current.clientWidth * 0.9;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -page : page, behavior: 'smooth' });
  };

  return (
    <section className="relative mb-8" aria-label="Top 10 Most Watched">
      <div className="nf-row-pad mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 md:mb-3">
        <h2 className="text-[clamp(15px,1.4vw,26px)] font-bold leading-tight text-[#e5e5e5]">{title}</h2>

        <span className="rounded-[2px] border border-white/25 px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-wide text-white/70">
          Live
        </span>

        {/* period selector */}
        <div
          className="ml-auto flex items-center gap-0.5 rounded-[4px] border border-white/15 bg-[#232323] p-0.5"
          role="tablist"
          aria-label="Ranking period"
        >
          {PERIODS.map((p) => (
            <button
              key={p.key}
              role="tab"
              aria-selected={period === p.key}
              onClick={() => handlePeriodChange(p.key)}
              className={cn(
                'nf-focus rounded-[2px] px-2 py-1 text-[11px] font-medium transition-colors md:px-2.5 md:text-[12px]',
                period === p.key ? 'bg-white text-black' : 'text-[#b3b3b3] hover:text-white'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* media selector */}
        <div
          className="flex items-center gap-0.5 rounded-[4px] border border-white/15 bg-[#232323] p-0.5"
          role="tablist"
          aria-label="Media type"
        >
          {MEDIA_TYPES.map((m) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={media === m.key}
              onClick={() => handleMediaChange(m.key)}
              className={cn(
                'nf-focus rounded-[2px] px-2 py-1 text-[11px] font-medium transition-colors md:px-2.5 md:text-[12px]',
                media === m.key ? 'bg-white text-black' : 'text-[#b3b3b3] hover:text-white'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {showViewAll && (
          <Link
            href={`/rankings?period=${period}&media=${media}`}
            className="nf-focus hidden items-center gap-0.5 text-[11px] font-semibold text-[#54b9c5] transition-opacity hover:opacity-80 md:flex md:text-[12px]"
          >
            Full Leaderboard
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="group/row relative">
        <button
          onClick={() => scroll('left')}
          tabIndex={-1}
          aria-label="Scroll left"
          className="absolute bottom-0 left-0 top-0 z-30 hidden w-[4%] min-w-[40px] items-center justify-center bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover/row:opacity-100 md:flex"
        >
          <ChevronLeft className="h-8 w-8" aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar nf-row-pad flex items-end gap-1 overflow-x-auto scroll-smooth pb-1 md:gap-2"
        >
          {loading ? (
            <div className="flex h-52 w-full items-center justify-center gap-3 text-[#b3b3b3]">
              <Loader2 className="h-5 w-5 animate-spin text-[#e50914]" aria-hidden="true" />
              <span className="text-[13px] font-medium">Updating rankings…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="w-full py-12 text-center text-[13px] text-[#8c8c8c]">
              No ranked titles available for this category right now.
            </div>
          ) : (
            items.map((item, index) => {
              const displayTitle = item.title || item.name || 'Unknown';
              const year = item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '';
              const posterUrl = getPosterUrl(item.poster_path, 'w342');
              const rank = item.rank || index + 1;

              return (
                <Link
                  key={`${item.id}-${rank}`}
                  href={`/watch/${item.media_type}/${item.id}`}
                  className="nf-focus group/card flex shrink-0 select-none items-end"
                  aria-label={`Rank ${rank}: ${displayTitle}`}
                >
                  {/* outlined rank numeral, Netflix Top-10 treatment */}
                  <span
                    className="nf-top10-num pointer-events-none -mr-[0.06em] self-end text-[clamp(84px,9vw,150px)] transition-transform duration-300 group-hover/card:scale-105"
                    aria-hidden="true"
                  >
                    {rank}
                  </span>

                  <div className="nf-card relative aspect-[2/3] w-[clamp(92px,10.5vw,166px)] overflow-hidden rounded-[4px] bg-[#232323]">
                    <img
                      src={posterUrl}
                      alt={displayTitle}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      sizes="(max-width: 640px) 26vw, 11vw"
                    />

                    {/* title permanently over the poster */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-2 pb-2 pt-9">
                      <p
                        className="line-clamp-2 text-[13px] font-bold leading-snug text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] md:text-[14px]"
                        title={displayTitle}
                      >
                        {displayTitle}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-tight text-white/75">
                        {year && <span>{year} · </span>}
                        <span className="text-[#46d369]">{item.vote_average.toFixed(1)} ★</span>
                      </p>
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
          className="absolute bottom-0 right-0 top-0 z-30 hidden w-[4%] min-w-[40px] items-center justify-center bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover/row:opacity-100 md:flex"
        >
          <ChevronRight className="h-8 w-8" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
