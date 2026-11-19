'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { MediaCard, MediaCardSkeleton } from './MediaCard';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/lib/tmdb';

export type MediaRowItem = MediaItem;

interface MediaRowProps {
  title: string;
  items?: MediaItem[];
  href?: string;
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
  rankOffset?: number;
  showRank?: boolean;
}

export function MediaRow({
  title,
  items,
  href,
  isLoading = false,
  skeletonCount = 8,
  className,
  rankOffset,
  showRank = false,
}: MediaRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: true });

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setScrollState({
      left: el.scrollLeft > 8,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState, items?.length]);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const page = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === 'left' ? -page : page, behavior: 'smooth' });
  }, []);

  const header = (
    <div className="nf-row-pad mb-3.5 flex items-center justify-between gap-3 md:mb-4">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#e50914] to-[#ff4d5a]" aria-hidden="true" />
        <h2 className="text-[18px] font-bold tracking-tight text-white md:text-[21px]">
          {title}
        </h2>
      </div>

      {href && (
        <Link
          href={href}
          className="nf-focus group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-slate-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          <span>Explore All</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <section className={cn('relative mb-12', className)} aria-label={`${title} (loading)`}>
        {header}
        <div className="nf-row-pad no-scrollbar flex gap-3.5 overflow-hidden">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="w-[38vw] min-w-[130px] max-w-[220px] shrink-0 sm:w-[26vw] md:w-[19vw] lg:w-[15.5vw] xl:w-[14vw]"
            >
              <MediaCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section className={cn('group/row relative mb-12', className)} aria-label={title}>
      {header}

      <div className="relative">
        {/* Left scroll control arrow */}
        <button
          onClick={() => scrollBy('left')}
          disabled={!scrollState.left}
          tabIndex={-1}
          aria-hidden={!scrollState.left}
          className={cn(
            'absolute bottom-8 left-2 top-0 z-30 hidden w-12 items-center justify-center rounded-2xl md:flex',
            'border border-white/10 bg-black/60 text-white backdrop-blur-md shadow-2xl transition-all duration-200',
            'hover:border-white/25 hover:bg-black/80 hover:scale-105 active:scale-95',
            'opacity-0 group-hover/row:opacity-100 disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>

        {/* Horizontal scroll container */}
        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="no-scrollbar nf-row-pad flex gap-3.5 overflow-x-auto scroll-smooth pb-3"
        >
          {items.map((item, index) => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="w-[38vw] min-w-[130px] max-w-[220px] shrink-0 sm:w-[26vw] md:w-[19vw] lg:w-[15.5vw] xl:w-[14vw]"
            >
              <MediaCard {...item} rank={showRank ? (rankOffset ?? 0) + index + 1 : undefined} />
            </div>
          ))}
        </div>

        {/* Right scroll control arrow */}
        <button
          onClick={() => scrollBy('right')}
          disabled={!scrollState.right}
          tabIndex={-1}
          aria-hidden={!scrollState.right}
          className={cn(
            'absolute bottom-8 right-2 top-0 z-30 hidden w-12 items-center justify-center rounded-2xl md:flex',
            'border border-white/10 bg-black/60 text-white backdrop-blur-md shadow-2xl transition-all duration-200',
            'hover:border-white/25 hover:bg-black/80 hover:scale-105 active:scale-95',
            'opacity-0 group-hover/row:opacity-100 disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="h-7 w-7" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
