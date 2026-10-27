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
    <main className="min-h-screen bg-[#080808] text-white pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" /> Favorites
      </h1>
      {items.length === 0 ? (
        <p className="text-slate-400">No favorites yet. Tap the bookmark on any title to save it.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="relative group">
              <Link href={`/watch/${item.type}/${item.id}`} className="block">
                <div className="aspect-[2/3] rounded-md overflow-hidden bg-neutral-900">
                  {item.poster_path ? (
                    <img src={getPosterUrl(item.poster_path, 'w342')} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">No image</div>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-medium truncate">{item.title}</h3>
              </Link>
              <button
                type="button"
                onClick={() => removeFavorite(item.type, item.id)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove favorite"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <Link
                href={`/watch/${item.type}/${item.id}`}
                className="absolute bottom-2 left-2 bg-white/90 hover:bg-white text-black p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                aria-label="Play"
              >
                <Play className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
