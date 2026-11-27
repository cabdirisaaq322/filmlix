'use client';

import { MediaCard, MediaCardSkeleton } from './MediaCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaGridProps {
  title: string;
  items?: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    media_type: 'movie' | 'tv';
  }>;
  isLoading?: boolean;
  skeletonCount?: number;
  href?: string;
  mobileScrollable?: boolean;
}

export function MediaGrid({ title, items, isLoading, skeletonCount = 12, href, mobileScrollable = false }: MediaGridProps) {
  if (isLoading) {
    return (
      <section className="space-y-4" aria-label={`${title} (loading)`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#e50914] to-[#ff4d5a]" aria-hidden="true" />
            <h2 className="text-[18px] font-bold tracking-tight text-white md:text-[21px]">{title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return (
      <section className="space-y-4" aria-label={title}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#e50914] to-[#ff4d5a]" aria-hidden="true" />
            <h2 className="text-[18px] font-bold tracking-tight text-white md:text-[21px]">{title}</h2>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] py-20 text-center text-slate-400 backdrop-blur-md">
          No titles found in this category.
        </div>
      </section>
    );
  }

  const mobileRowCount = Math.min(6, items.length);
  const mobileRows = mobileScrollable
    ? Array.from({ length: mobileRowCount }, (_, rowIndex) => {
        const start = Math.floor((rowIndex * items.length) / mobileRowCount);
        const end = Math.floor(((rowIndex + 1) * items.length) / mobileRowCount);
        return items.slice(start, end);
      })
    : [];

  return (
    <section className="space-y-5" aria-label={title}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#e50914] to-[#ff4d5a]" aria-hidden="true" />
          <h2 className="text-[18px] font-bold tracking-tight text-white md:text-[21px]">{title}</h2>
        </div>
        {href && (
          <Link
            href={href}
            className="nf-focus group flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-semibold text-slate-300 transition-all hover:border-white/20 hover:text-white"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div
        className={cn(
          mobileScrollable
            ? 'space-y-7 md:grid md:grid-cols-4 md:space-y-0 md:gap-x-3.5 md:gap-y-7 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
            : 'grid grid-cols-2 gap-x-3.5 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
        )}
      >
        {mobileScrollable
          ? mobileRows.map((rowItems, rowIndex) => (
            <div
              key={`mobile-row-${rowIndex}`}
              aria-label={`${title} row ${rowIndex + 1}`}
              className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain pb-3 md:contents"
            >
              {rowItems.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="w-[42vw] min-w-[130px] max-w-[190px] shrink-0 snap-start md:w-auto md:max-w-none md:shrink md:snap-none"
                >
                  <MediaCard {...item} />
                </div>
              ))}
            </div>
          ))
          : items.map((item) => <MediaCard key={`${item.media_type}-${item.id}`} {...item} />)}
      </div>
    </section>
  );
}
