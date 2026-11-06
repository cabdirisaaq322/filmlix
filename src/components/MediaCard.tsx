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
            className="nf-top10-num pointer-events-none absolute bottom-1 left-1 z-10 text-[clamp(48px,5vw,80px)]"
            aria-hidden="true"
          >
            {rank}
          </span>
        )}

        {/* hover only: scrim + quick actions (title lives under the poster) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 group-focus-visible/card:opacity-100" />

        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex translate-y-1 items-center gap-1.5 p-2 opacity-0 transition-all duration-200 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
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
      </Link>

      {/* title + Netflix meta, under the poster */}
      <div className="mt-2 px-0.5">
        <p
          className="line-clamp-2 text-[13.5px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#e5e5e5] transition-colors group-hover/card:text-white md:text-[14.5px]"
          title={displayTitle}
        >
          {displayTitle}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] leading-none">
          <span className="font-semibold text-[#46d369]">
            {vote_average > 0 ? `${Math.round(vote_average * 10)}% Match` : 'New'}
          </span>
          {year && <span className="text-[#b3b3b3]">{year}</span>}
          <span className="rounded-[2px] border border-white/30 px-1 py-[1px] text-[9px] font-medium uppercase text-[#b3b3b3]">
            HD
          </span>
        </div>
      </div>
    </div>
  );
}

export function MediaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)} aria-hidden="true">
      <div className="aspect-[2/3] rounded-[4px] bg-[#232323]" />
      <div className="mt-2 h-3 w-4/5 rounded-sm bg-[#232323]" />
      <div className="mt-1.5 h-2.5 w-1/2 rounded-sm bg-[#232323]" />
    </div>
  );
}
