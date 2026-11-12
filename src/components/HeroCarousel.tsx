'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight, Info, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBackdropUrl } from '@/lib/tmdb';

interface HeroItem {
  id: number;
  title: string;
  name?: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
}

interface HeroCarouselProps {
  items: HeroItem[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!autoPlay || paused || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [autoPlay, paused, items.length]);

  const currentItem = items[currentIndex];
  const goToSlide = useCallback((index: number) => {
    setAutoPlay(false);
    setCurrentIndex(index);
    setTimeout(() => setAutoPlay(true), 12000);
  }, []);

  if (!currentItem) return null;

  const displayTitle = currentItem.title || currentItem.name || 'Unknown';
  const backdropUrl = getBackdropUrl(currentItem.backdrop_path, 'original');
  const watchHref = `/watch/${currentItem.media_type}/${currentItem.id}`;
  const year = currentItem.release_date?.slice(0, 4) || currentItem.first_air_date?.slice(0, 4) || '';
  const isSeries = currentItem.media_type === 'tv';

  return (
    <section
      className="relative isolate h-[70svh] min-h-[480px] max-h-[820px] w-full overflow-hidden md:h-[88svh] md:min-h-[600px]"
      aria-label="Featured content"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 z-0">
        <img
          key={currentItem.id}
          src={backdropUrl}
          alt=""
          className="nf-billboard-art h-full w-full object-cover object-top"
          aria-hidden="true"
        />
        <div className="nf-scrim-left absolute inset-0" />
        <div className="nf-scrim-top absolute inset-x-0 top-0 h-[30%]" />
        <div className="nf-scrim-bottom absolute inset-x-0 bottom-0 h-[65%]" />
      </div>

      <div className="relative z-10 flex h-full items-end pb-16 pt-28 md:pb-24 md:pt-32">
        <div className="nf-row-pad w-full">
          <div
            key={currentItem.id}
            className="max-w-[640px] animate-fade-up space-y-4 md:space-y-5"
          >
            <h1 className="text-balance text-[clamp(2rem,5.5vw,4.5rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              {displayTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-zinc-200 md:text-[14px]">
              {year && <span>{year}</span>}
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                {currentItem.vote_average.toFixed(1)}
              </span>
              <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
                HD
              </span>
            </div>

            <p className="max-w-[560px] text-[14px] leading-relaxed text-zinc-200/90 line-clamp-3 md:text-[16px]">
              {currentItem.overview || 'No description available.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => router.push(watchHref)}
                className="nf-btn-hero nf-focus fx-btn-primary"
                aria-label={`Play ${displayTitle}`}
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                Play Now
              </button>
              <button
                onClick={() => router.push(watchHref)}
                className="nf-btn-hero nf-focus fx-btn-secondary"
                aria-label={`More information about ${displayTitle}`}
              >
                <Info className="h-4 w-4" aria-hidden="true" />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-1.5 md:hidden">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'
                )}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          <div className="absolute bottom-8 right-0 z-20 hidden items-center gap-2 pr-[64px] md:flex">
            <button
              onClick={() => goToSlide((currentIndex - 1 + items.length) % items.length)}
              className="nf-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
            <button
              onClick={() => goToSlide((currentIndex + 1) % items.length)}
              className="nf-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes nf-billboard-in {
          from { opacity: 0.5; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }
        .nf-billboard-art {
          animation: nf-billboard-in 1200ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <section
      className="relative h-[70svh] min-h-[480px] max-h-[820px] w-full overflow-hidden bg-[var(--fx-bg)] md:h-[88svh] md:min-h-[600px]"
      aria-label="Featured content loading"
    >
      <div className="absolute inset-0 animate-shimmer" />
      <div className="nf-scrim-bottom absolute inset-0" />
      <div className="relative z-10 flex h-full items-end pb-16 md:pb-24">
        <div className="nf-row-pad w-full">
          <div className="max-w-[560px] space-y-4">
            <div className="h-6 w-32 rounded-full bg-white/10" />
            <div className="h-14 w-4/5 rounded-lg bg-white/10" />
            <div className="h-4 w-48 rounded bg-white/10" />
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-32 rounded-full bg-white/10" />
              <div className="h-11 w-32 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
