'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
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
  title = 'Top 10 Charts',
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
    <section className="relative mb-10" aria-label="Top 10 Charts">
      <div className="nf-row-pad mb-3 flex flex-wrap items-center gap-3 md:mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[#e50914]">
            <TrendingUp className="h-4 w-4" />
          </span>
          <h2 className="text-[17px] font-bold tracking-tight text-white md:text-[20px]">{title}</h2>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-0.5" role="tablist">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                role="tab"
                aria-selected={period === p.key}
                onClick={() => handlePeriodChange(p.key)}
                className={cn(
                  'nf-focus rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors',
                  period === p.key ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-0.5" role="tablist">
            {MEDIA_TYPES.map((m) => (
              <button
                key={m.key}
                role="tab"
                aria-selected={media === m.key}
                onClick={() => handleMediaChange(m.key)}
                className={cn(
                  'nf-focus rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors',
                  media === m.key ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {showViewAll && (
            <Link
              href={`/rankings?period=${period}&media=${media}`}
              className="nf-focus hidden items-center gap-1 text-[12px] font-semibold text-[#e50914] hover:text-[#e5e5e5] md:inline-flex"
            >
              Full chart <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      <div className="group/row relative">
        <button
          onClick={() => scroll('left')}
          tabIndex={-1}
          aria-label="Scroll left"
          className="absolute bottom-0 left-1 top-0 z-30 hidden w-10 items-center justify-center rounded-r-xl bg-gradient-to-r from-black/70 to-transparent text-white opacity-0 transition-opacity hover:from-black/90 group-hover/row:opacity-100 md:flex"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar nf-row-pad flex items-end gap-2 overflow-x-auto scroll-smooth pb-2"
        >
          {loading ? (
            <div className="flex h-52 w-full items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin text-[#e50914]" aria-hidden="true" />
              <span className="text-[13px] font-medium">Updating charts…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="w-full py-12 text-center text-[13px] text-zinc-500">
              No ranked titles available right now.
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
                  <span
                    className="nf-top10-num pointer-events-none -mr-2 self-end pb-[52px] text-[clamp(72px,8vw,130px)] transition-transform duration-300 group-hover/card:scale-105"
                    aria-hidden="true"
                  >
                    {rank}
                  </span>

                  <div className="w-[clamp(96px,11vw,160px)]">
                    <div className="nf-card relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[var(--fx-surface)] ring-1 ring-white/5">
                      <img
                        src={posterUrl}
                        alt={displayTitle}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
                        loading="lazy"
                        sizes="(max-width: 640px) 26vw, 11vw"
                      />
                    </div>

                    <p className="mt-2 line-clamp-1 text-[12.5px] font-semibold leading-tight text-zinc-100 transition-colors group-hover/card:text-white" title={displayTitle}>
                      {displayTitle}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-zinc-400">
                      {year && <span>{year}</span>}
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
          className="absolute bottom-0 right-1 top-0 z-30 hidden w-10 items-center justify-center rounded-l-xl bg-gradient-to-l from-black/70 to-transparent text-white opacity-0 transition-opacity hover:from-black/90 group-hover/row:opacity-100 md:flex"
        >
          <ChevronRight className="h-7 w-7" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
