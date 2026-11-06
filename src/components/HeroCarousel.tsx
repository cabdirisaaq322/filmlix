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
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!autoPlay || paused || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
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
      className="relative isolate h-[64svh] min-h-[430px] max-h-[760px] w-full overflow-hidden bg-[#141414] md:h-[85svh] md:min-h-[560px] md:max-h-[900px]"
      aria-label="Featured content"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentItem.id}
          src={backdropUrl}
          alt=""
          className="nf-billboard-art h-full w-full object-cover object-top"
          aria-hidden="true"
        />
        <div className="nf-scrim-left absolute inset-0" />
        <div className="nf-scrim-top absolute inset-x-0 top-0 h-[22%]" />
        <div className="nf-scrim-bottom absolute inset-x-0 bottom-0 h-[55%]" />
      </div>

      {/* content */}
      <div className="relative z-10 flex h-full items-end pb-[76px] md:pb-[12%]">
        <div className="nf-row-pad w-full">
          <div
            key={currentItem.id}
            className="max-w-[560px] animate-fade-up md:max-w-[46%] lg:max-w-[38%]"
          >
            <h1
              className="mb-2 text-[clamp(1.75rem,5.2vw,4.2rem)] font-bold leading-[1.02] tracking-[-0.01em] text-white md:mb-5"
              style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.55)' }}
            >
              {displayTitle}
            </h1>

            {/* metadata row — Netflix style: inline, small, separated */}
            <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-white/90 md:mb-4 md:text-[14px]">
              <span className="font-medium">{isSeries ? 'Series' : 'Film'}</span>
              {year && (
                <>
                  <span className="text-white/60">•</span>
                  <span>{year}</span>
                </>
              )}
              <span className="text-white/60">•</span>
              <span className="flex items-center gap-1">
                <span className="text-[#f5c518]" aria-hidden="true">★</span>
                {currentItem.vote_average.toFixed(1)}
              </span>
              <span className="ml-1 inline-flex h-[19px] items-center rounded-[2px] border border-white/40 px-1.5 text-[11px] font-medium leading-none text-white/80">
                HD
              </span>
            </div>

            <p
              className="mb-4 line-clamp-2 max-w-[540px] text-[13px] leading-[1.45] text-white/95 sm:text-[14px] md:mb-6 md:line-clamp-3 md:text-[16px] lg:text-[17px]"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}
            >
              {currentItem.overview || 'No description available.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={() => router.push(watchHref)}
                className="nf-btn-hero nf-focus min-h-[40px] bg-white px-5 text-[14px] text-black hover:bg-white/75 md:min-h-[44px] md:px-6 md:text-[16px]"
                aria-label={`Play ${displayTitle}`}
              >
                <Play className="h-[18px] w-[18px] fill-current md:h-5 md:w-5" aria-hidden="true" />
                Play
              </button>
              <button
                onClick={() => router.push(watchHref)}
                className="nf-btn-hero nf-focus min-h-[40px] bg-[rgba(109,109,110,0.7)] px-5 text-[14px] text-white hover:bg-[rgba(109,109,110,0.5)] md:min-h-[44px] md:px-6 md:text-[16px]"
                aria-label={`More information about ${displayTitle}`}
              >
                <Info className="h-[18px] w-[18px] md:h-5 md:w-5" aria-hidden="true" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* slide controls — bars only on phones, arrows + bars on desktop (bottom right) */}
      {items.length > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-1.5 md:hidden">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  'h-[3px] rounded-full transition-all duration-300',
                  i === currentIndex ? 'w-6 bg-white' : 'w-3 bg-white/40'
                )}
                aria-label={`Go to featured title ${i + 1}`}
                aria-current={i === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          <div className="absolute bottom-5 right-0 z-20 hidden items-center gap-2 pr-[60px] md:flex md:bottom-8">
            <button
              onClick={() => goToSlide((currentIndex - 1 + items.length) % items.length)}
              className="nf-focus mr-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition-colors hover:bg-black/70"
              aria-label="Previous featured title"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  'h-[3px] rounded-full transition-all duration-300',
                  i === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/35 hover:bg-white/60'
                )}
                aria-label={`Go to featured title ${i + 1}`}
                aria-current={i === currentIndex ? 'true' : 'false'}
              />
            ))}
            <button
              onClick={() => goToSlide((currentIndex + 1) % items.length)}
              className="nf-focus ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition-colors hover:bg-black/70"
              aria-label="Next featured title"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* maturity-style badge, mirrors Netflix's right-rail label */}
          <div className="absolute bottom-[15%] right-0 z-20 hidden pr-[60px] md:block">
            <span className="inline-flex h-[26px] items-center border-l-[3px] border-white bg-[rgba(51,51,51,0.6)] px-2.5 text-[13px] font-medium text-white">
              {isSeries ? '16+' : '16'}
            </span>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes nf-billboard-in {
          from {
            opacity: 0.6;
            transform: scale(1.04);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .nf-billboard-art {
          animation: nf-billboard-in 1100ms cubic-bezier(0.25, 0.1, 0.25, 1) both;
        }
      `}</style>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <section
      className="relative h-[64svh] min-h-[430px] max-h-[760px] w-full animate-pulse overflow-hidden bg-[#141414] md:h-[85svh] md:min-h-[560px] md:max-h-[900px]"
      aria-label="Featured content (loading)"
    >
      <div className="absolute inset-0 bg-[#1a1a1a]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
      <div className="relative z-10 flex h-full items-end pb-[14%]">
        <div className="nf-row-pad w-full">
          <div className="max-w-[560px] space-y-4 md:max-w-[38%]">
            <div className="h-11 w-4/5 rounded-sm bg-[#2a2a2a] md:h-16" />
            <div className="h-3 w-40 rounded-sm bg-[#2a2a2a]" />
            <div className="h-3 w-full rounded-sm bg-[#2a2a2a]" />
            <div className="h-3 w-3/4 rounded-sm bg-[#2a2a2a]" />
            <div className="flex gap-3 pt-3">
              <div className="h-11 w-28 rounded-[4px] bg-[#2a2a2a]" />
              <div className="h-11 w-36 rounded-[4px] bg-[#2a2a2a]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
