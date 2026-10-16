'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Bookmark, Clock, Star, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPosterUrl } from '@/lib/tmdb';

interface MediaCardProps {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  quality?: 'HD' | '4K' | 'CAM';
  className?: string;
}

export function MediaCard({
  id,
  title,
  name,
  poster_path,
  vote_average,
  release_date,
  first_air_date,
  media_type,
  quality = 'HD',
  className,
}: MediaCardProps) {
  const displayTitle = title || name || 'Unknown';
  const year = release_date?.slice(0, 4) || first_air_date?.slice(0, 4) || '—';
  const posterUrl = getPosterUrl(poster_path, 'w342');
  const router = useRouter();
  const href = `/watch/${media_type}/${id}`;

  const openTitle = () => router.push(href);

  return (
    <Link
      href={href}
      className={cn(
        'group relative block bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800',
        'hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10',
        'transition-all duration-300 cursor-pointer will-change-transform',
        className
      )}
      aria-label={`Watch ${displayTitle} (${year})`}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {poster_path ? (
          <img
            src={posterUrl}
            alt={`${displayTitle} poster`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <BadgeCheck className="w-12 h-12 text-slate-600" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className={cn(
            'px-2 py-1 text-xs font-bold rounded',
            quality === '4K' ? 'bg-yellow-500 text-black' :
            quality === 'HD' ? 'bg-green-500 text-white' :
            'bg-red-500 text-white'
          )}>
            {quality}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
          <button type="button" onClick={openTitle} className="bg-white/90 hover:bg-white text-black p-2 rounded-full transition-colors" aria-label={`Play ${displayTitle}`}>
            <Play className="w-5 h-5 ml-0.5" />
          </button>
          <button type="button" onClick={openTitle} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors" aria-label={`Bookmark ${displayTitle}`}>
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-white truncate group-hover:text-indigo-400 transition-colors" title={displayTitle}>
          {displayTitle}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
            {vote_average.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {year}
          </span>
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
            media_type === 'movie' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
          )}>
            {media_type === 'movie' ? 'Movie' : 'Series'}
          </span>
        </div>
      </div>
    </Link>
  );
}

interface MediaCardSkeletonProps {
  className?: string;
}

export function MediaCardSkeleton({ className }: MediaCardSkeletonProps) {
  return (
    <article className={cn('bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 animate-pulse', className)}>
      <div className="aspect-[2/3] bg-slate-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-3 bg-slate-800 rounded w-20" />
          <div className="h-3 bg-slate-800 rounded w-16" />
          <div className="h-3 bg-slate-800 rounded w-16" />
        </div>
      </div>
    </article>
  );
}