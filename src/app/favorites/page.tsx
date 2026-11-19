'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Play, Trash2, Clapperboard, Sparkles } from 'lucide-react';
import { getFavoritesSnapshot, subscribeFavorites, removeFavorite, type FavoriteItem } from '@/lib/favorites';
import { getPosterUrl } from '@/lib/tmdb';

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setItems(getFavoritesSnapshot());
    return subscribeFavorites(() => setItems(getFavoritesSnapshot()));
  }, []);

  return (
    <main className="nf-row-pad min-h-screen w-full py-10 pt-24 md:pt-28">
      <header className="mb-8 space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-600/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-red-400" />
            Personal Collection
          </span>
          {items.length > 0 && (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold text-slate-400">
              {items.length} {items.length === 1 ? 'title' : 'titles'}
            </span>
          )}
        </div>

        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          <Heart className="h-8 w-8 text-[#e50914] fill-red-500/30 drop-shadow-[0_0_12px_rgba(229,9,20,0.6)]" />
          My Watchlist
        </h1>
        <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
          Titles you have bookmarked to stream anytime.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-24 text-center backdrop-blur-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-400 ring-1 ring-white/10">
            <Clapperboard className="h-8 w-8 text-[#e50914]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Your Watchlist is empty</h2>
          <p className="max-w-md text-sm text-slate-400 mb-6">
            Tap the + button on any movie or series to save it to your personal library for quick access.
          </p>
          <Link
            href="/"
            className="nf-focus fx-btn-primary inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-bold shadow-lg"
          >
            Explore Titles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="group/fav relative flex flex-col">
              <Link
                href={`/watch/${item.type}/${item.id}`}
                className="relative block aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#12131c] shadow-md transition-all duration-300 group-hover/fav:-translate-y-1.5 group-hover/fav:border-white/25 group-hover/fav:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.8),0_0_16px_rgba(229,9,20,0.2)]"
              >
                {item.poster_path ? (
                  <img
                    src={getPosterUrl(item.poster_path, 'w342')}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/fav:scale-[1.05]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#141522] p-4 text-center text-xs text-slate-500">
                    No image
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/fav:opacity-90 transition-opacity" />

                {/* Center play icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/fav:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-transform duration-200 group-hover/fav:scale-110">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </span>
                </div>
              </Link>

              {/* Remove from watchlist button */}
              <button
                type="button"
                onClick={() => removeFavorite(item.type, item.id)}
                className="nf-focus absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-slate-300 backdrop-blur-md opacity-0 transition-all duration-200 hover:border-red-500/50 hover:bg-red-600 hover:text-white group-hover/fav:opacity-100 cursor-pointer"
                aria-label={`Remove ${item.title} from favorites`}
                title="Remove from list"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="mt-2.5 px-0.5">
                <Link
                  href={`/watch/${item.type}/${item.id}`}
                  className="line-clamp-1 text-[13.5px] font-semibold text-slate-100 transition-colors group-hover/fav:text-[#ff3b47]"
                  title={item.title}
                >
                  {item.title}
                </Link>
                <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                  {item.type === 'tv' ? 'Series' : 'Movie'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
