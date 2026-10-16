'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard, MediaCardSkeleton } from './MediaCard';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/lib/tmdb';

/** @deprecated use MediaItem from '@/lib/tmdb' */
export type MediaRowItem = MediaItem;

interface MediaRowProps {
  title: string;
  items?: MediaItem[];
  href?: string;
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function MediaRow({ title, items, href, isLoading = false, skeletonCount = 6, className }: MediaRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: true });

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setScrollState({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState, items?.length]);

  const scrollBy = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollBy({ left: direction === 'left' ? -el.clientWidth * 0.85 : el.clientWidth * 0.85, behavior: 'smooth' });
    },
    []
  );

  const header = (
    <div className="flex items-center justify-between mb-3.5 px-4 sm:px-6 lg:px-8">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{title}</h2>
      {href && (
        <a
          href={href}
          className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          View All <ChevronRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <section className={cn('relative', className)} aria-label={`${title} (loading)`}>
        {header}
        <div className="flex gap-3 overflow-hidden px-4 sm:px-6 lg:px-8">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <MediaCardSkeleton key={i} className="w-[140px] sm:w-[170px] lg:w-[190px] shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section className={cn('group/row relative', className)} aria-label={title}>
      {header}

      <div className="relative">
        <button
          onClick={() => scrollBy('left')}
          disabled={!scrollState.left}
          className={cn(
            'hidden md:flex absolute left-0 top-0 bottom-8 z-20 w-12 items-center justify-center',
            'bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent text-white',
            'opacity-0 group-hover/row:opacity-100 transition-opacity duration-200',
            'disabled:opacity-0 disabled:cursor-default'
          )}
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-8 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="w-[132px] sm:w-[170px] lg:w-[190px] shrink-0"
            >
              <MediaCard {...item} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollBy('right')}
          disabled={!scrollState.right}
          className={cn(
            'hidden md:flex absolute right-0 top-0 bottom-8 z-20 w-12 items-center justify-center',
            'bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent text-white',
            'opacity-0 group-hover/row:opacity-100 transition-opacity duration-200',
            'disabled:opacity-0 disabled:cursor-default'
          )}
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </section>
  );
}