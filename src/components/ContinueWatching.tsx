'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
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
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const page = el.clientWidth * 0.9;
    el.scrollBy({ left: direction === 'left' ? -page : page, behavior: 'smooth' });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="group/row relative mb-10" aria-label="Continue Watching">
      <div className="nf-row-pad mb-3 flex items-center md:mb-4">
        <h2 className="text-[17px] font-bold tracking-tight text-white md:text-[20px]">Continue Watching</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy('left')}
          disabled={!canScroll.left}
          tabIndex={-1}
          className={cn(
            'absolute bottom-0 left-1 top-0 z-30 hidden w-10 items-center justify-center rounded-r-xl text-white md:flex',
            'bg-gradient-to-r from-black/70 to-transparent opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:from-black/90',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="no-scrollbar nf-row-pad flex gap-3 overflow-x-auto scroll-smooth pb-2"
        >
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={
                item.type === 'tv'
                  ? `/watch/tv/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`
                  : `/watch/movie/${item.id}`
              }
              className="nf-focus group/card relative w-[38vw] min-w-[130px] max-w-[240px] shrink-0"
              aria-label={`Resume ${item.title}`}
            >
              <div className="nf-card relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--fx-surface)] ring-1 ring-white/5">
                <img
                  src={getPosterUrl(item.poster_path, 'w342')}
                  alt={`${item.title} poster`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl">
                    <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <div className="h-1 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-1/3 rounded-full bg-[#e50914]" />
                  </div>
                </div>
              </div>

              <div className="mt-2.5 px-0.5">
                <p className="line-clamp-1 text-[13.5px] font-semibold text-zinc-100 transition-colors group-hover/card:text-white">
                  {item.title}
                </p>
                {item.type === 'tv' && (
                  <p className="mt-1 text-[11px] text-zinc-400">
                    S{item.season || 1} · E{item.episode || 1}
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
            'absolute bottom-0 right-1 top-0 z-30 hidden w-10 items-center justify-center rounded-l-xl text-white md:flex',
            'bg-gradient-to-l from-black/70 to-transparent opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:from-black/90',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-7 w-7" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
