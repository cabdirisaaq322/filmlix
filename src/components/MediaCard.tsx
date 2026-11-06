'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Plus, Check, Star, BadgeCheck } from 'lucide-react';
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
  /** Netflix Top-10 style outlined numeral rendered over the poster. */
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
          'nf-card nf-focus relative block aspect-[2/3] overflow-hidden rounded-[4px] bg-[#232323]',
          'cursor-pointer will-change-transform'
        )}
        aria-label={`Watch ${displayTitle}${year ? ` (${year})` : ''}`}
      >
        {poster_path ? (
          <img
            src={posterUrl}
            alt={`${displayTitle} poster`}
            className="h-full w-full object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 34vw, (max-width: 1024px) 20vw, 16vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#2d2d2d]">
            <BadgeCheck className="h-10 w-10 text-[#4d4d4d]" aria-hidden="true" />
          </div>
        )}

        {/* Netflix Top-10 numeral */}
        {typeof rank === 'number' && (
          <span
            className="nf-top10-num pointer-events-none absolute bottom-[52px] left-1 z-10 text-[clamp(48px,5vw,80px)]"
            aria-hidden="true"
          >
            {rank}
          </span>
        )}

        {/* title permanently over the poster, on a bottom scrim */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-2 pb-2 pt-10">
          <h3
            className="line-clamp-2 text-[14.5px] font-bold leading-[1.18] tracking-[-0.01em] text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.95)] md:text-[16px]"
            title={displayTitle}
          >
            {displayTitle}
          </h3>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] leading-none group-hover/card:hidden">
            <span className="font-semibold text-[#46d369]">
              {vote_average > 0 ? `${Math.round(vote_average * 10)}% Match` : 'New'}
            </span>
            {year && <span className="text-white/70">{year}</span>}
            <span className="rounded-[2px] border border-white/40 px-1 py-[1px] text-[9px] font-medium uppercase text-white/80">
              HD
            </span>
          </div>

          {/* actions appear in place of the meta line on hover / focus */}
          <div className="pointer-events-auto mt-1.5 hidden items-center gap-1.5 group-hover/card:flex group-focus-visible/card:flex">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(href);
              }}
              className="nf-focus flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/80"
              aria-label={`Play ${displayTitle}`}
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleFavorite}
              className="nf-focus flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-black/40 text-white transition-colors hover:border-white"
              aria-label={isFav ? `Remove ${displayTitle} from My List` : `Add ${displayTitle} to My List`}
            >
              {isFav ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
            <span className="ml-auto flex items-center gap-1 text-[10.5px] font-medium text-white/85">
              <Star className="h-3 w-3 fill-current text-[#f5c518]" aria-hidden="true" />
              {vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function MediaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)} aria-hidden="true">
      <div className="aspect-[2/3] rounded-[4px] bg-[#232323]" />
    </div>
  );
}
