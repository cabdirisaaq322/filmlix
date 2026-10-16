'use client';

import { MediaCard } from './MediaCard';
import { MediaCardSkeleton } from './MediaCard';

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

export function MediaGrid({ title, items, isLoading, skeletonCount = 6, href }: MediaGridProps) {
  if (isLoading) {
    return (
      <section className="space-y-4" aria-label={`${title} (loading)`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {href && (
            <a href={href} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              View All →
            </a>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="text-center py-12 text-slate-500">
          No content available
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {href && (
          <a href={href} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View All →
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {items.map((item) => (
          <MediaCard
            key={`${item.media_type}-${item.id}`}
            {...item}
          />
        ))}
      </div>
    </section>
  );
}