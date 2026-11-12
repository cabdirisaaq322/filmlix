'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    const page = el.clientWidth * 0.9;
    el.scrollBy({ left: direction === 'left' ? -page : page, behavior: 'smooth' });
  }, []);

  const header = (
    <div className="nf-row-pad mb-3 flex items-center justify-between gap-3 md:mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[17px] font-bold tracking-tight text-white md:text-[20px]">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="nf-focus hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-white md:inline-flex"
          >
            See all <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section className={cn('relative mb-10', className)} aria-label={`${title} (loading)`}>
        {header}
        <div className="nf-row-pad no-scrollbar flex gap-3 overflow-hidden">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="w-[34vw] min-w-[115px] max-w-[220px] shrink-0 sm:w-[24vw] md:w-[18vw] lg:w-[15vw] xl:w-[14vw]"
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
    <section className={cn('group/row relative mb-10', className)} aria-label={title}>
      {header}

      <div className="relative">
        <button
          onClick={() => scrollBy('left')}
          disabled={!scrollState.left}
          tabIndex={-1}
          aria-hidden={!scrollState.left}
          className={cn(
            'absolute bottom-0 left-1 top-0 z-30 hidden w-10 items-center justify-center rounded-r-xl text-white md:flex',
            'bg-gradient-to-r from-black/70 to-transparent opacity-0 transition-opacity duration-200',
            'group-hover/row:opacity-100 hover:from-black/90',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="no-scrollbar nf-row-pad flex gap-3 overflow-x-auto scroll-smooth pb-2"
        >
          {items.map((item, index) => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="w-[34vw] min-w-[115px] max-w-[220px] shrink-0 sm:w-[24vw] md:w-[18vw] lg:w-[15vw] xl:w-[14vw]"
            >
              <MediaCard {...item} rank={showRank ? (rankOffset ?? 0) + index + 1 : undefined} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollBy('right')}
          disabled={!scrollState.right}
          tabIndex={-1}
          aria-hidden={!scrollState.right}
          className={cn(
            'absolute bottom-0 right-1 top-0 z-30 hidden w-10 items-center justify-center rounded-l-xl text-white md:flex',
            'bg-gradient-to-l from-black/70 to-transparent opacity-0 transition-opacity duration-200',
            'group-hover/row:opacity-100 hover:from-black/90',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="h-7 w-7" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
