'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight, Info, Star, Sparkles } from 'lucide-react';
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
    }, 7500);
    return () => clearInterval(interval);
  }, [autoPlay, paused, items.length]);

  const currentItem = items[currentIndex];
  const goToSlide = useCallback((index: number) => {
    setAutoPlay(false);
    setCurrentIndex(index);
    setTimeout(() => setAutoPlay(true), 12000);
  }, []);

  if (!currentItem) return null;

  const displayTitle = currentItem.title || currentItem.name || 'Featured Title';
  const backdropUrl = getBackdropUrl(currentItem.backdrop_path, 'original');
  const watchHref = `/watch/${currentItem.media_type}/${currentItem.id}?mode=watch`;
  const infoHref = `/watch/${currentItem.media_type}/${currentItem.id}?mode=info`;
  const year = currentItem.release_date?.slice(0, 4) || currentItem.first_air_date?.slice(0, 4) || '';
  const isSeries = currentItem.media_type === 'tv';

  return (
    <section
      className="relative isolate h-[72svh] min-h-[520px] max-h-[860px] w-full overflow-hidden bg-[#08080c] md:h-[88svh] md:min-h-[640px]"
      aria-label="Featured Billboard"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background artwork with smooth fade & Ken Burns subtle motion */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          key={currentItem.id}
          src={backdropUrl}
          alt={displayTitle}
          className="h-full w-full object-cover object-top transition-all duration-1000 ease-out will-change-transform animate-[nf-kenburns_18s_ease-in-out_infinite]"
          aria-hidden="true"
        />
        {/* Layered cinematic scrims for flawless readability and ambient blending */}
        <div className="nf-scrim-left absolute inset-0 z-10" />
        <div className="nf-scrim-top absolute inset-x-0 top-0 h-[25%] z-10" />
        <div className="nf-scrim-bottom absolute inset-x-0 bottom-0 h-[70%] z-10" />
        {/* Subtle radial center vignette */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-radial from-transparent via-[#08080c]/30 to-[#08080c]/85" />
      </div>

      {/* Hero content cluster */}
      <div className="relative z-20 flex h-full items-end pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="nf-row-pad w-full">
          <div
            key={currentItem.id}
            className="max-w-[700px] animate-fade-up space-y-4 md:space-y-6"
          >
            {/* Spotlight label */}
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-slate-300">
                {isSeries ? 'TV Series' : 'Movie'}
              </span>
            </div>

            {/* Giant Title */}
            <h1 className="text-balance text-[clamp(2.2rem,5.5vw,4.5rem)] font-black leading-[1.03] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {displayTitle}
            </h1>

            {/* Metadata badges row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] font-medium text-slate-200 md:text-[14px]">
              {year && <span className="font-semibold text-slate-300">{year}</span>}
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                {currentItem.vote_average > 0 ? currentItem.vote_average.toFixed(1) : 'New'}
              </span>
              <span className="rounded border border-white/20 bg-black/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-200">
                4K Ultra HD
              </span>
              <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                5.1 Audio
              </span>
            </div>

            {/* Overview / Synopsis */}
            <p className="max-w-[600px] text-[14px] leading-relaxed text-slate-300/90 line-clamp-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:text-[16px]">
              {currentItem.overview || 'Stream this title in stunning high-definition with multiple streaming servers on FilmFlix.'}
            </p>

            {/* CTA action buttons */}
            <div className="flex w-full flex-nowrap items-center gap-2 pt-2 md:w-auto md:gap-3">
              <button
                onClick={() => router.push(watchHref)}
                className="nf-btn-hero nf-focus fx-btn-primary group min-w-0 flex-1 cursor-pointer gap-1.5 px-2 text-xs whitespace-nowrap md:flex-none md:gap-[10px] md:px-[26px] md:text-[15px]"
                aria-label={`Play ${displayTitle}`}
              >
                <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" aria-hidden="true" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => router.push(infoHref)}
                className="nf-btn-hero nf-focus fx-btn-secondary group min-w-0 flex-1 cursor-pointer gap-1.5 px-2 text-xs whitespace-nowrap md:flex-none md:gap-[10px] md:px-[26px] md:text-[15px]"
                aria-label={`More information about ${displayTitle}`}
              >
                <Info className="h-4 w-4 transition-transform group-hover:rotate-6" aria-hidden="true" />
                <span>More Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel slide indicators and controls */}
      {items.length > 1 && (
        <>
          {/* Mobile indicator dots */}
          <div className="absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-1.5 md:hidden">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentIndex ? 'w-6 bg-[#e50914] shadow-[0_0_8px_#e50914]' : 'w-2 bg-white/30'
                )}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          {/* Desktop controls: arrow buttons + indicator pills */}
          <div className="absolute bottom-10 right-0 z-30 hidden items-center gap-2.5 pr-[48px] md:flex">
            <button
              onClick={() => goToSlide((currentIndex - 1 + items.length) % items.length)}
              className="nf-focus flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:bg-black/70"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1.5 px-1">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === currentIndex
                      ? 'w-8 bg-[#e50914] shadow-[0_0_10px_#e50914]'
                      : 'w-2.5 bg-white/25 hover:bg-white/50'
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => goToSlide((currentIndex + 1) % items.length)}
              className="nf-focus flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:bg-black/70"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <section
      className="relative h-[72svh] min-h-[520px] max-h-[860px] w-full overflow-hidden bg-[#08080c] md:h-[88svh] md:min-h-[640px]"
      aria-label="Featured billboard loading"
    >
      <div className="absolute inset-0 animate-shimmer" />
      <div className="nf-scrim-bottom absolute inset-0" />
      <div className="relative z-10 flex h-full items-end pb-16 md:pb-24">
        <div className="nf-row-pad w-full">
          <div className="max-w-[600px] space-y-4">
            <div className="h-6 w-36 rounded-full bg-white/10" />
            <div className="h-16 w-4/5 rounded-2xl bg-white/10" />
            <div className="h-5 w-56 rounded bg-white/10" />
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="flex gap-3 pt-3">
              <div className="h-12 w-36 rounded-full bg-white/10" />
              <div className="h-12 w-36 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
