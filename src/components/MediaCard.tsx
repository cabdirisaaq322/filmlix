'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Plus, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPosterUrl } from '@/lib/tmdb';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { useEffect, useState } from 'react';

interface MediaCardProps {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  className?: string;
  rank?: number;
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
  className,
  rank,
}: MediaCardProps) {
  const displayTitle = title || name || 'Unknown Title';
  const year = release_date?.slice(0, 4) || first_air_date?.slice(0, 4) || '';
  const posterUrl = getPosterUrl(poster_path, 'w342');
  const router = useRouter();
  const href = `/watch/${media_type}/${id}?mode=info`;
  const playHref = `/watch/${media_type}/${id}?mode=watch`;
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(media_type, id));
  }, [media_type, id]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(toggleFavorite({ type: media_type, id, title: displayTitle, poster_path }));
  };

  return (
    <div className={cn('group/card relative flex flex-col', className)}>
      <Link
        href={href}
        className={cn(
          'nf-focus relative block aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#12131c]',
          'border border-white/[0.08] transition-all duration-300 ease-out',
          'group-hover/card:-translate-y-1.5 group-hover/card:border-white/25 group-hover/card:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.8),0_0_16px_rgba(229,9,20,0.15)]',
          'cursor-pointer will-change-transform'
        )}
        aria-label={`Watch ${displayTitle}${year ? ` (${year})` : ''}`}
      >
        {poster_path ? (
          <img
            src={posterUrl}
            alt={`${displayTitle} poster`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.05]"
            loading="lazy"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#141522] p-4 text-center">
            <span className="text-xs font-medium text-slate-500">No poster available</span>
          </div>
        )}

        {/* Big stylized rank number if this is a top ranked title */}
        {typeof rank === 'number' && (
          <span
            className="nf-top10-num pointer-events-none absolute -bottom-2 -left-1 z-10 text-[clamp(44px,5.5vw,76px)] drop-shadow-2xl"
            aria-hidden="true"
          >
            {rank}
          </span>
        )}

        {/* Ambient shadow gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-50 transition-opacity duration-300 group-hover/card:opacity-90" />

        {/* Top-right quick actions (Favorite button) */}
        <div className="absolute right-2.5 top-2.5 z-20 flex items-center gap-1.5 opacity-0 transition-all duration-200 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
          <button
            type="button"
            onClick={handleFavorite}
            className={cn(
              'nf-focus pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200',
              isFav
                ? 'border-red-500/50 bg-red-600/80 text-white shadow-lg shadow-red-600/30'
                : 'border-white/20 bg-black/60 text-white hover:border-white/40 hover:bg-black/80 hover:scale-110'
            )}
            aria-label={isFav ? `Remove ${displayTitle} from My List` : `Add ${displayTitle} to My List`}
          >
            {isFav ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>

        {/* Hover action bar at bottom of poster */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 opacity-0 transition-all duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
          <div className="pointer-events-auto flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(playHref);
              }}
              className="nf-focus flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label={`Play ${displayTitle}`}
            >
              <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
            </button>

            {vote_average > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {vote_average.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Card Info footer */}
      <div className="mt-2.5 px-0.5">
        <Link
          href={href}
          className="line-clamp-1 text-[13.5px] font-semibold text-slate-100 transition-colors duration-200 group-hover/card:text-[#ff3b47] md:text-[14px]"
          title={displayTitle}
        >
          {displayTitle}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
          {year && <span>{year}</span>}
          <span className="h-1 w-1 rounded-full bg-slate-600" aria-hidden="true" />
          <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-300">
            {media_type === 'tv' ? 'Series' : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MediaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-2.5', className)} aria-hidden="true">
      <div className="aspect-[2/3] w-full rounded-xl bg-white/[0.05] border border-white/[0.06]" />
      <div className="h-4 w-4/5 rounded-md bg-white/[0.05]" />
      <div className="h-3 w-2/5 rounded-md bg-white/[0.05]" />
    </div>
  );
}
