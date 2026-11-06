'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
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
    const page = el.clientWidth * 0.92;
    el.scrollBy({ left: direction === 'left' ? -page : page, behavior: 'smooth' });
  }, []);

  const header = (
    <div className="nf-row-pad group/head mb-2.5 flex items-baseline gap-2 md:mb-3">
      <h2 className="text-[clamp(15px,1.4vw,26px)] font-bold leading-tight text-[#e5e5e5] transition-colors hover:text-white">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="nf-focus ml-auto hidden shrink-0 items-center gap-0.5 text-[11px] font-semibold text-[#54b9c5] opacity-0 transition-opacity duration-200 group-hover/head:opacity-100 md:flex md:text-[12px]"
        >
          Explore All
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
      {!href && <span className="ml-auto" />}
    </div>
  );

  if (isLoading) {
    return (
      <section className={cn('relative mb-8', className)} aria-label={`${title} (loading)`}>
        {header}
        <div className="nf-row-pad no-scrollbar flex gap-[6px] overflow-hidden">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="w-[34vw] min-w-[108px] max-w-[250px] shrink-0 sm:w-[26vw] md:w-[20vw] lg:w-[16.5vw] xl:w-[15.5vw]"
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
    <section className={cn('group/row relative mb-8', className)} aria-label={title}>
      {header}

      <div className="relative">
        {/* left paddle */}
        <button
          onClick={() => scrollBy('left')}
          disabled={!scrollState.left}
          tabIndex={-1}
          aria-hidden={!scrollState.left}
          className={cn(
            'absolute bottom-0 left-0 top-0 z-30 hidden w-[4%] min-w-[40px] items-center justify-center text-white',
            'bg-black/60 opacity-0 transition-opacity duration-200 md:flex',
            'group-hover/row:opacity-100 hover:bg-black/80',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="h-8 w-8" aria-hidden="true" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="no-scrollbar nf-row-pad flex gap-[6px] overflow-x-auto scroll-smooth pb-1"
        >
          {items.map((item, index) => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="w-[34vw] min-w-[108px] max-w-[250px] shrink-0 sm:w-[26vw] md:w-[20vw] lg:w-[16.5vw] xl:w-[15.5vw]"
            >
              <MediaCard {...item} rank={showRank ? (rankOffset ?? 0) + index + 1 : undefined} />
            </div>
          ))}
        </div>

        {/* right paddle */}
        <button
          onClick={() => scrollBy('right')}
          disabled={!scrollState.right}
          tabIndex={-1}
          aria-hidden={!scrollState.right}
          className={cn(
            'absolute bottom-0 right-0 top-0 z-30 hidden w-[4%] min-w-[40px] items-center justify-center text-white',
            'bg-black/60 opacity-0 transition-opacity duration-200 md:flex',
            'group-hover/row:opacity-100 hover:bg-black/80',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="h-8 w-8" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
