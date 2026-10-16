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
    el.scrollBy({ left: direction === 'left' ? -el.clientWidth * 0.85 : el.clientWidth * 0.85, behavior: 'smooth' });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="group/row relative" aria-label="Continue Watching">
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl font-bold text-white">Continue Watching</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy('left')}
          disabled={!canScroll.left}
          className={cn(
            'hidden md:flex absolute left-0 top-0 bottom-8 z-20 w-12 items-center justify-center',
            'bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent text-white',
            'opacity-0 group-hover/row:opacity-100 transition-opacity duration-200',
            'disabled:opacity-0 disabled:cursor-default'
          )}
          aria-label="Scroll continue watching left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-8 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={
                item.type === 'tv'
                  ? `/watch/tv/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`
                  : `/watch/movie/${item.id}`
              }
              className="group/card w-[140px] sm:w-[170px] lg:w-[190px] shrink-0 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 transition-all"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={getPosterUrl(item.poster_path, 'w342')}
                  alt={`${item.title} poster`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <span className="bg-white/90 text-black p-3 rounded-full">
                    <Play className="w-6 h-6 ml-0.5" />
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                  {item.type === 'tv' && (
                    <p className="text-[10px] text-slate-300">
                      S{item.season || 1} • E{item.episode || 1}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scrollBy('right')}
          disabled={!canScroll.right}
          className={cn(
            'hidden md:flex absolute right-0 top-0 bottom-8 z-20 w-12 items-center justify-center',
            'bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent text-white',
            'opacity-0 group-hover/row:opacity-100 transition-opacity duration-200',
            'disabled:opacity-0 disabled:cursor-default'
          )}
          aria-label="Scroll continue watching right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </section>
  );
}