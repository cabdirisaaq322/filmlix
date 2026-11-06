'use client';

import { useState, useRef, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { getPosterUrl } from '@/lib/tmdb';
import {
  getContinueWatchingSnapshot,
  subscribeContinueWatching,
  SERVER_CONTINUE_SNAPSHOT,
} from '@/lib/history';
import { cn } from '@/lib/utils';

/**
 * Netflix-style "Continue Watching" row backed by localStorage history.
 * Returns nothing when the viewer has no watch history yet.
 */
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
    const page = el.clientWidth * 0.92;
    el.scrollBy({ left: direction === 'left' ? -page : page, behavior: 'smooth' });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="group/row relative mb-8" aria-label="Continue Watching">
      <div className="nf-row-pad mb-2.5 flex items-baseline md:mb-3">
        <h2 className="text-[clamp(16px,1.35vw,24px)] font-bold leading-tight tracking-[-0.015em] text-[#e5e5e5]">Continue Watching</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy('left')}
          disabled={!canScroll.left}
          tabIndex={-1}
          className={cn(
            'absolute bottom-0 left-0 top-0 z-30 hidden w-[4%] min-w-[40px] items-center justify-center bg-black/60 text-white md:flex',
            'opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-black/80',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label="Scroll continue watching left"
        >
          <ChevronLeft className="h-8 w-8" aria-hidden="true" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="no-scrollbar nf-row-pad flex gap-[6px] overflow-x-auto scroll-smooth pb-1"
        >
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={
                item.type === 'tv'
                  ? `/watch/tv/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`
                  : `/watch/movie/${item.id}`
              }
              className="nf-focus group/card relative w-[38vw] min-w-[120px] max-w-[290px] shrink-0"
              aria-label={`Resume ${item.title}`}
            >
              <div className="nf-card relative aspect-[2/3] overflow-hidden rounded-[4px] bg-[#232323]">
                <img
                  src={getPosterUrl(item.poster_path, 'w342')}
                  alt={`${item.title} poster`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover/card:opacity-100" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black">
                    <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
                  </span>
                </div>

              </div>

              <div className="mt-2 px-0.5">
                <p className="line-clamp-1 text-[13.5px] font-semibold text-[#e5e5e5] transition-colors group-hover/card:text-white md:text-[14.5px]">
                  {item.title}
                </p>
                {item.type === 'tv' && (
                  <p className="mt-1 text-[11px] leading-none text-[#b3b3b3]">
                    Series · S{item.season || 1}:E{item.episode || 1}
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
            'absolute bottom-0 right-0 top-0 z-30 hidden w-[4%] min-w-[40px] items-center justify-center bg-black/60 text-white md:flex',
            'opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-black/80',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label="Scroll continue watching right"
        >
          <ChevronRight className="h-8 w-8" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
