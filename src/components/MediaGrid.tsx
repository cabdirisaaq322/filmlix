'use client';

import { MediaCard, MediaCardSkeleton } from './MediaCard';

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
}

export function MediaGrid({ title, items, isLoading, skeletonCount = 12, href }: MediaGridProps) {
  if (isLoading) {
    return (
      <section className="space-y-4" aria-label={`${title} (loading)`}>
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold tracking-tight text-white md:text-[20px]">{title}</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
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
          <h2 className="text-[17px] font-bold tracking-tight text-white md:text-[20px]">{title}</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-zinc-400">
          No content available
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold tracking-tight text-white md:text-[20px]">{title}</h2>
        {href && (
          <a href={href} className="text-[12px] font-semibold text-[#e50914] hover:text-[#e5e5e5] transition-colors">
            View All →
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {items.map((item) => (
          <MediaCard key={`${item.media_type}-${item.id}`} {...item} />
        ))}
      </div>
    </section>
  );
}
