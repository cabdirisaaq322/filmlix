'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, History } from 'lucide-react';
import { getPosterUrl } from '@/lib/tmdb';
import {
  getContinueWatchingSnapshot,
  subscribeContinueWatching,
  SERVER_CONTINUE_SNAPSHOT,
} from '@/lib/history';
import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

export function ContinueWatchingRow() {
  const items = useSyncExternalStore(
    subscribeContinueWatching,
    getContinueWatchingSnapshot,
    () => SERVER_CONTINUE_SNAPSHOT
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 6,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 6,
    });
  }, []);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const page = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === 'left' ? -page : page, behavior: 'smooth' });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="group/row relative mb-12" aria-label="Continue Watching">
      <div className="nf-row-pad mb-3.5 flex items-center gap-2.5 md:mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/15 text-[#e50914] ring-1 ring-red-600/30">
          <History className="h-4 w-4" />
        </span>
        <h2 className="text-[18px] font-bold tracking-tight text-white md:text-[21px]">
          Jump Back In
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy('left')}
          disabled={!canScroll.left}
          tabIndex={-1}
          className={cn(
            'absolute bottom-8 left-2 top-0 z-30 hidden w-12 items-center justify-center rounded-2xl md:flex',
            'border border-white/10 bg-black/60 text-white backdrop-blur-md shadow-2xl transition-all duration-200',
            'hover:border-white/25 hover:bg-black/80 hover:scale-105 active:scale-95',
            'opacity-0 group-hover/row:opacity-100 disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="no-scrollbar nf-row-pad flex gap-3.5 overflow-x-auto scroll-smooth pb-3"
        >
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={
                item.type === 'tv'
                  ? `/watch/tv/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`
                  : `/watch/movie/${item.id}`
              }
              className="nf-focus group/card relative w-[40vw] min-w-[140px] max-w-[240px] shrink-0"
              aria-label={`Resume ${item.title}`}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.08] bg-[#12131c] shadow-lg transition-all duration-300 group-hover/card:-translate-y-1.5 group-hover/card:border-white/25 group-hover/card:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.8),0_0_16px_rgba(229,9,20,0.2)]">
                <img
                  src={getPosterUrl(item.poster_path, 'w342')}
                  alt={`${item.title} poster`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.05]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Big center play icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-transform duration-200 group-hover/card:scale-110">
                    <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                  </span>
                </div>

                {/* Glowing progress bar at bottom of card */}
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
                    <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff2d3b] shadow-[0_0_8px_#e50914]" />
                  </div>
                </div>
              </div>

              <div className="mt-2.5 px-0.5">
                <p className="line-clamp-1 text-[13.5px] font-semibold text-slate-100 transition-colors group-hover/card:text-[#ff3b47]">
                  {item.title}
                </p>
                {item.type === 'tv' ? (
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                    Season {item.season || 1} · Episode {item.episode || 1}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                    Feature Film
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scrollBy('right')}
          disabled={!canScroll.right}
          tabIndex={-1}
          className={cn(
            'absolute bottom-8 right-2 top-0 z-30 hidden w-12 items-center justify-center rounded-2xl md:flex',
            'border border-white/10 bg-black/60 text-white backdrop-blur-md shadow-2xl transition-all duration-200',
            'hover:border-white/25 hover:bg-black/80 hover:scale-105 active:scale-95',
            'opacity-0 group-hover/row:opacity-100 disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-7 w-7" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
