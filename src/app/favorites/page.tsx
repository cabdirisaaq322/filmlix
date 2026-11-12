'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Play, Trash2 } from 'lucide-react';
import { getFavoritesSnapshot, subscribeFavorites, removeFavorite, type FavoriteItem } from '@/lib/favorites';
import { getPosterUrl } from '@/lib/tmdb';

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setItems(getFavoritesSnapshot());
    return subscribeFavorites(() => setItems(getFavoritesSnapshot()));
  }, []);

  return (
    <main className="nf-row-pad min-h-screen w-full py-10 pt-28 md:pt-32">
      <header className="mb-8 space-y-2">
        <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]">Library</p>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <Heart className="h-7 w-7 text-[#e50914]" /> My List
        </h1>
        <p className="text-zinc-400">Titles you&apos;ve saved to watch later.</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-20 text-center">
          <p className="text-zinc-400">No favorites yet. Tap the + button on any title to save it.</p>
          <Link href="/" className="nf-focus fx-btn-primary mt-5 inline-flex h-10 rounded-full px-5 text-sm font-semibold">Browse titles</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="group relative">
              <Link href={`/watch/${item.type}/${item.id}`} className="block">
                <div className="aspect-[2/3] overflow-hidden rounded-xl bg-[var(--fx-surface)] ring-1 ring-white/5">
                  {item.poster_path ? (
                    <img src={getPosterUrl(item.poster_path, 'w342')} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">No image</div>
                  )}
                </div>
                <h3 className="mt-2 truncate text-sm font-semibold text-zinc-100 group-hover:text-white">{item.title}</h3>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">{item.type === 'tv' ? 'Series' : 'Movie'}</p>
              </Link>
              <button
                type="button"
                onClick={() => removeFavorite(item.type, item.id)}
                className="nf-focus absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur transition hover:bg-red-500/80 group-hover:opacity-100"
                aria-label="Remove favorite"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
