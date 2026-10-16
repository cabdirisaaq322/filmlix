'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, Flame } from 'lucide-react';
import { searchMulti, getTrendingMovies, getTrendingTVShows, TMDBMovie, TMDBTVShow } from '@/lib/tmdb';
import { MediaCard } from '@/components/MediaCard';

const POPULAR_SEARCHES = ['Avengers', 'Batman', 'Breaking Bad', 'Stranger Things', 'Spider-Man', 'Wednesday', 'John Wick', 'Avatar'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<TMDBMovie | TMDBTVShow>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [trending, setTrending] = useState<Array<TMDBMovie | TMDBTVShow>>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Show trending titles so the page is never an empty void
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [movies, tv] = await Promise.all([
          getTrendingMovies().catch(() => []),
          getTrendingTVShows().catch(() => []),
        ]);
        if (!cancelled) setTrending([...movies.slice(0, 6), ...tv.slice(0, 6)]);
      } catch {
        /* offline — page still renders the form */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const performSearch = useCallback(async (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMulti(value);
        setResults(data);
      } catch {
        setError('Failed to search. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    setQuery(q);
    if (q) performSearch(q);
  }, [performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const url = `/search?q=${encodeURIComponent(query.trim())}`;
      window.history.pushState({}, '', url);
      performSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setTrending([]);
    window.history.pushState({}, '', '/search');
  };

  const runPopularSearch = (term: string) => {
    setQuery(term);
    const url = `/search?q=${encodeURIComponent(term)}`;
    window.history.pushState({}, '', url);
    performSearch(term);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
        <p className="text-slate-400">Find movies and TV series</p>
      </header>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, TV series..."
            className="w-full rounded-full border border-white/15 bg-neutral-900/80 py-4 pl-12 pr-12 text-base text-white placeholder-neutral-500 transition-all focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-lg"
            autoFocus
            aria-label="Search"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-red-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black sm:w-auto"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Search'
          )}
        </button>
      </form>

      {error && (
        <div className="text-center py-12 text-slate-400">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4" aria-label="Loading results">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 animate-pulse">
              <div className="aspect-[2/3] bg-slate-800" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {hasSearched && query && !isLoading && results.length === 0 && !error && (
        <div className="text-center py-12 text-slate-400">
          <p>No results found for &quot;{query}&quot;</p>
        </div>
      )}

      {!hasSearched && !isLoading && results.length === 0 && (
        <div className="space-y-8">
          <section aria-label="Popular searches">
            <h2 className="text-xl font-bold text-white mb-4">Popular right now</h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => runPopularSearch(term)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-slate-900/70 border border-slate-800 text-slate-300 hover:bg-red-600 hover:border-red-500 hover:text-white transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {trending.length > 0 && (
            <section aria-label="Trending titles">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                Trending today — tap to watch
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {trending.map((item) => {
                  const itemType = (item as { media_type?: string }).media_type;
                  const media_type = itemType === 'tv' ? 'tv' : 'movie';
                  const itemTitle = media_type === 'movie'
                    ? (item as TMDBMovie).title || (item as TMDBTVShow).name
                    : (item as TMDBTVShow).name || (item as TMDBMovie).title;
                  return (
                    <MediaCard
                      key={`trending-${media_type}-${item.id}`}
                      id={item.id}
                      title={itemTitle}
                      poster_path={item.poster_path}
                      vote_average={item.vote_average}
                      release_date={('release_date' in item ? item.release_date : undefined)}
                      first_air_date={('first_air_date' in item ? item.first_air_date : undefined)}
                      media_type={media_type}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {results.length > 0 && (
        <section aria-label={`Search results for "${query}"`}>
          <h2 className="text-xl font-bold text-white mb-4">
            Results for <span className="text-red-400">&quot;{query}&quot;</span> ({results.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {results.map((item) => {
              const itemType = (item as { media_type?: string }).media_type;
              const media_type = itemType === 'tv' ? 'tv' : 'movie';
              const itemTitle = media_type === 'movie'
                ? (item as TMDBMovie).title || (item as TMDBTVShow).name
                : (item as TMDBTVShow).name || (item as TMDBMovie).title;
              return (
                <MediaCard
                  key={`${media_type}-${item.id}`}
                  id={item.id}
                  title={itemTitle}
                  poster_path={item.poster_path}
                  vote_average={item.vote_average}
                  release_date={('release_date' in item ? item.release_date : undefined)}
                  first_air_date={('first_air_date' in item ? item.first_air_date : undefined)}
                  media_type={media_type}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}