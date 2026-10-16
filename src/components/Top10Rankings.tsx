'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Trophy, Flame, ChevronLeft, ChevronRight, Play, Star, Calendar, ArrowRight, Loader2 } from 'lucide-react';
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
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV Shows' },
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
    if (scrollRef.current) {
      const offset = direction === 'left' ? -650 : 650;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-4" aria-label="Top 10 Most Watched">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium">
                Live Rank
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time leaderboard of what people are streaming {PERIODS.find((p) => p.key === period)?.sub.toLowerCase()}
          </p>
        </div>

        {/* Filters and Link */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Timeframe selector (Today / Week / Month) */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => handlePeriodChange(p.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                  period === p.key
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Media type selector (All / Movies / TV) */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            {MEDIA_TYPES.map((m) => (
              <button
                key={m.key}
                onClick={() => handleMediaChange(m.key)}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer',
                  media === m.key
                    ? 'bg-slate-800 text-indigo-400 font-semibold'
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
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-2 transition-colors"
            >
              <span>Full Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 cursor-pointer shadow-xl backdrop-blur-sm"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 cursor-pointer shadow-xl backdrop-blur-sm"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Items Row */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none scroll-smooth"
        >
          {loading ? (
            <div className="w-full h-64 flex items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-sm font-medium">Updating top 10 rankings...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="w-full py-12 text-center text-slate-400 text-sm">
              No ranked titles available for this category right now.
            </div>
          ) : (
            items.map((item, index) => {
              const displayTitle = item.title || item.name || 'Unknown';
              const year =
                item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || '—';
              const posterUrl = getPosterUrl(item.poster_path, 'w342');
              const rank = item.rank || index + 1;

              // Top 3 medals & gradient styles
              const rankClass =
                rank === 1
                  ? 'from-amber-300 via-yellow-400 to-amber-700'
                  : rank === 2
                  ? 'from-slate-100 via-slate-300 to-slate-500'
                  : rank === 3
                  ? 'from-amber-400 via-orange-500 to-amber-800'
                  : 'from-slate-400 via-slate-600 to-slate-800';

              const badgeColor =
                rank === 1
                  ? 'bg-amber-500 text-black border-amber-400'
                  : rank === 2
                  ? 'bg-slate-300 text-black border-slate-200'
                  : rank === 3
                  ? 'bg-orange-600 text-white border-orange-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <div
                  key={`${item.id}-${rank}`}
                  className="flex-shrink-0 flex items-end group/card cursor-pointer select-none"
                  onClick={() => {
                    window.location.href = `/watch/${item.media_type}/${item.id}`;
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.location.href = `/watch/${item.media_type}/${item.id}`;
                    }
                  }}
                  aria-label={`Rank #${rank}: ${displayTitle}`}
                >
                  {/* Big Stylized Rank Number */}
                  <div
                    className={cn(
                      'text-7xl sm:text-8xl lg:text-9xl font-black italic tracking-tighter leading-none select-none -mr-4 sm:-mr-6 z-10 font-sans pointer-events-none transition-transform duration-300 group-hover/card:scale-105',
                      'bg-gradient-to-b bg-clip-text text-transparent drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]',
                      rankClass
                    )}
                    style={{
                      WebkitTextStroke: rank > 3 ? '1.5px rgba(255,255,255,0.2)' : '2px rgba(0,0,0,0.4)',
                    }}
                  >
                    {rank}
                  </div>

                  {/* Poster & Card Body */}
                  <div className="relative w-32 sm:w-44 lg:w-48 aspect-[2/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 group-hover/card:scale-105 group-hover/card:border-indigo-500/60 group-hover/card:shadow-indigo-500/20">
                    <img
                      src={posterUrl}
                      alt={displayTitle}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover/card:opacity-95 transition-opacity" />

                    {/* Rank Badge Header */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-black tracking-wide border shadow-md flex items-center gap-1 uppercase',
                          badgeColor
                        )}
                      >
                        {rank <= 3 && <Flame className="w-3 h-3 fill-current" />}
                        #{rank}
                      </span>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-slate-700/60 rounded px-1.5 py-0.5 flex items-center gap-1 text-[11px] font-bold text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{item.vote_average.toFixed(1)}</span>
                    </div>

                    {/* Play Button Overlay on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 transform scale-75 group-hover/card:scale-100 transition-transform">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <h3
                        className="text-xs sm:text-sm font-bold text-white truncate group-hover/card:text-indigo-400 transition-colors"
                        title={displayTitle}
                      >
                        {displayTitle}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {year}
                        </span>
                        <span className="capitalize text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                          {item.media_type === 'movie' ? 'Movie' : 'Series'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
