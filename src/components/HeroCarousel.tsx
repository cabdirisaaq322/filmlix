'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight, Info } from 'lucide-react';
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
  const router = useRouter();

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, items.length]);

  const currentItem = items[currentIndex];
  const goToSlide = useCallback((index: number) => {
    setAutoPlay(false);
    setCurrentIndex(index);
    setTimeout(() => setAutoPlay(true), 10000);
  }, []);

  if (!currentItem) return null;

  const displayTitle = currentItem.title || currentItem.name || 'Unknown';
  const backdropUrl = getBackdropUrl(currentItem.backdrop_path, 'w1280');
  const watchHref = `/watch/${currentItem.media_type}/${currentItem.id}`;

  return (
    <section className="relative h-[72svh] min-h-[380px] max-h-[800px] sm:min-h-[480px] sm:h-[75svh] md:h-[700px] lg:h-[800px] overflow-hidden bg-black" aria-label="Featured content">
      <div className="absolute inset-0 z-0">
        <img
          key={currentItem.id}
          src={backdropUrl}
          alt=""
          className="hero-backdrop w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-20 sm:pb-16 md:pb-20">
        <div key={currentItem.id} className="w-full sm:w-4/5 md:w-1/2 lg:w-2/5 space-y-4 sm:space-y-5 2xl:space-y-6 animate-fade-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-extrabold text-white leading-[1.05] drop-shadow-[0_3px_16px_rgba(0,0,0,0.75)]">
            {displayTitle}
          </h1>

          <p className="text-white/90 text-sm sm:text-base md:text-lg line-clamp-2 sm:line-clamp-3 max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {currentItem.overview || 'No description available.'}
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => router.push(watchHref)}
              className={cn(
                'group flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-base w-full sm:w-auto',
                'bg-white text-black hover:bg-white/85 transition-all duration-200',
                'shadow-lg shadow-black/30'
              )}
              aria-label={`Watch ${displayTitle}`}
            >
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Watch Now
            </button>
            <button
              onClick={() => router.push(watchHref)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-base w-full sm:w-auto bg-neutral-500/70 text-white hover:bg-neutral-500/90 transition-colors backdrop-blur-sm"
              aria-label={`More information about ${displayTitle}`}
            >
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>

      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              i === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/70'
            )}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={() => goToSlide((currentIndex - 1 + items.length) % items.length)}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full',
              'bg-slate-900/50 hover:bg-slate-800/50 text-white',
              'transition-colors backdrop-blur-sm border border-slate-800',
              'hidden md:flex'
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => goToSlide((currentIndex + 1) % items.length)}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full',
              'bg-slate-900/50 hover:bg-slate-800/50 text-white',
              'transition-colors backdrop-blur-sm border border-slate-800',
              'hidden md:flex'
            )}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <style jsx>{`
        @keyframes hero-backdrop-enter {
          from { opacity: 0.45; transform: scale(1.025); }
          to { opacity: 1; transform: scale(1); }
        }
        .hero-backdrop { animation: hero-backdrop-enter 900ms ease-out both; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 100ms; }
      `}</style>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <section className="relative h-[72svh] min-h-[380px] max-h-[800px] sm:min-h-[480px] sm:h-[75svh] md:h-[700px] lg:h-[800px] overflow-hidden animate-pulse" aria-label="Featured content (loading)">
      <div className="absolute inset-0 bg-slate-900" />
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-16 md:pb-20">
        <div className="w-full md:w-1/2 lg:w-2/5 space-y-4">
          <div className="h-6 bg-slate-800 rounded-full w-40" />
          <div className="h-12 bg-slate-800 rounded w-3/4" />
          <div className="h-12 bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-800 rounded w-1/2" />
          <div className="h-4 bg-slate-800 rounded w-1/2" />
          <div className="h-4 bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 bg-slate-800 rounded-lg w-36" />
            <div className="h-12 bg-slate-800 rounded-lg w-36" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        <div className="w-8 h-2.5 bg-white rounded-full" />
        <div className="w-2.5 h-2.5 bg-white/40 rounded-full" />
        <div className="w-2.5 h-2.5 bg-white/40 rounded-full" />
      </div>
    </section>
  );
}