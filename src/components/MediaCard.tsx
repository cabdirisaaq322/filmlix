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
  const displayTitle = title || name || 'Unknown';
  const year = release_date?.slice(0, 4) || first_air_date?.slice(0, 4) || '';
  const posterUrl = getPosterUrl(poster_path, 'w342');
  const router = useRouter();
  const href = `/watch/${media_type}/${id}`;
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
    <div className={cn('group/card relative', className)}>
      <Link
        href={href}
        className={cn(
          'nf-card nf-focus relative block aspect-[2/3] overflow-hidden rounded-xl bg-[var(--fx-surface)] ring-1 ring-white/5',
          'cursor-pointer will-change-transform'
        )}
        aria-label={`Watch ${displayTitle}${year ? ` (${year})` : ''}`}
      >
        {poster_path ? (
          <img
            src={posterUrl}
            alt={`${displayTitle} poster`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
            loading="lazy"
            sizes="(max-width: 640px) 34vw, (max-width: 1024px) 20vw, 16vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--fx-surface-2)]">
            <span className="text-xs text-zinc-500">No image</span>
          </div>
        )}

        {typeof rank === 'number' && (
          <span
            className="nf-top10-num pointer-events-none absolute -bottom-1 -left-1 z-10 text-[clamp(42px,5vw,72px)] drop-shadow-lg"
            aria-hidden="true"
          >
            {rank}
          </span>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 transition-opacity duration-300 group-hover/card:opacity-100" />

        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 opacity-0 transition-all duration-200 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
          <button
            type="button"
            onClick={handleFavorite}
            className="nf-focus pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-black/60"
            aria-label={isFav ? `Remove ${displayTitle} from My List` : `Add ${displayTitle} to My List`}
          >
            {isFav ? <Check className="h-4 w-4 text-[#e5e5e5]" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 opacity-0 transition-all duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(href);
              }}
              className="nf-focus flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105"
              aria-label={`Play ${displayTitle}`}
            >
              <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
            </button>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-2.5 px-0.5">
        <p
          className="line-clamp-1 text-[13.5px] font-semibold leading-tight text-zinc-100 transition-colors group-hover/card:text-white md:text-[14px]"
          title={displayTitle}
        >
          {displayTitle}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
          {year && <span>{year}</span>}
          <span className="rounded border border-white/10 px-1 py-px text-[9px] uppercase tracking-wide text-zinc-400">
            {media_type === 'tv' ? 'Series' : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MediaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)} aria-hidden="true">
      <div className="aspect-[2/3] rounded-xl bg-[var(--fx-surface)] ring-1 ring-white/5" />
      <div className="mt-2.5 h-3.5 w-4/5 rounded bg-[var(--fx-surface)]" />
      <div className="mt-1.5 h-3 w-2/5 rounded bg-[var(--fx-surface)]" />
    </div>
  );
}
