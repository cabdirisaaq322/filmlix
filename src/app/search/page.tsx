'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, TrendingUp } from 'lucide-react';
import { searchMulti, getTrendingMovies, getTrendingTVShows, TMDBMovie, TMDBTVShow, BLOCKLISTED_MOVIE_IDS } from '@/lib/tmdb';
import { MediaCard } from '@/components/MediaCard';
import { useBlockedMovieIds } from '@/lib/blocklist-client';

const POPULAR_SEARCHES = ['Avengers', 'Batman', 'Breaking Bad', 'Stranger Things', 'Spider-Man', 'Wednesday', 'John Wick', 'Avatar', 'Interstellar', 'Dune'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<TMDBMovie | TMDBTVShow>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [trending, setTrending] = useState<Array<TMDBMovie | TMDBTVShow>>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const blockedIds = useBlockedMovieIds();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [movies, tv] = await Promise.all([
          getTrendingMovies().catch(() => []),
          getTrendingTVShows().catch(() => []),
        ]);
        if (!cancelled) setTrending([...movies.slice(0, 6), ...tv.slice(0, 6)].filter((item) => !BLOCKLISTED_MOVIE_IDS.includes(item.id) && !blockedIds.includes(item.id)));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [blockedIds]);

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
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        const items = Array.isArray(data.results) ? data.results : [];
        setResults(items.filter((item: TMDBMovie | TMDBTVShow) => !BLOCKLISTED_MOVIE_IDS.includes(item.id) && !blockedIds.includes(item.id)));
      } catch {
        try {
          const directData = await searchMulti(value);
          setResults(directData.filter((item) => !BLOCKLISTED_MOVIE_IDS.includes(item.id) && !blockedIds.includes(item.id)));
        } catch {
          setError('Failed to search. Please check your connection and try again.');
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [blockedIds]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    setTimeout(() => {
      setQuery(q);
      if (q) performSearch(q);
    }, 0);
  }, [performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    window.history.pushState({}, '', '/search');
  };

  const runPopularSearch = (term: string) => {
    setQuery(term);
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(term)}`);
    performSearch(term);
  };

  return (
    <div className="nf-row-pad w-full space-y-8 py-10 pt-24 md:pt-28">
      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Search Titles
        </h1>
        <p className="text-sm text-slate-400 sm:text-base">
          Find movies, television series, and franchises across the entire library.
        </p>
      </header>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative max-w-3xl space-y-4">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, genre, actor, or franchise..."
            className="nf-input h-14 w-full rounded-2xl pl-13 pr-12 text-[15px] font-medium shadow-2xl"
            autoFocus
            aria-label="Search"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="nf-focus fx-btn-primary h-11 rounded-full px-7 text-sm font-bold shadow-lg disabled:opacity-50 cursor-pointer"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching…</span>
              </span>
            ) : (
              'Search Catalog'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-label="Loading search results">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] animate-pulse">
              <div className="aspect-[2/3] bg-white/[0.05]" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 rounded bg-white/[0.08]" />
                <div className="h-3 w-1/2 rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Fallback */}
      {hasSearched && query && !isLoading && results.length === 0 && !error && (
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] py-20 text-center text-slate-400 backdrop-blur-md">
          <p className="text-lg font-bold text-white">No titles matched &quot;{query}&quot;</p>
          <p className="mt-1 text-sm text-slate-400">Try checking spelling or searching for a broader keyword.</p>
        </div>
      )}

      {/* Default State: Popular Suggestions & Trending Now */}
      {!hasSearched && !isLoading && results.length === 0 && (
        <div className="space-y-10 pt-2">
          {/* Quick Suggestions */}
          <section aria-label="Popular searches" className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#e50914]" />
              Popular Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => runPopularSearch(term)}
                  className="nf-focus rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12.5px] font-semibold text-slate-300 transition-all duration-200 hover:scale-105 hover:border-red-500/40 hover:bg-red-600/15 hover:text-white cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Trending Titles Showcase */}
          {trending.length > 0 && (
            <section aria-label="Trending titles" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#e50914] to-[#ff4d5a]" aria-hidden="true" />
                <h2 className="text-[18px] font-bold tracking-tight text-white md:text-[21px]">
                  Trending Right Now
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {trending.map((item) => {
                  const itemType = (item as { media_type?: string }).media_type;
                  const media_type = itemType === 'tv' ? 'tv' : 'movie';
                  const itemTitle = media_type === 'movie' ? (item as TMDBMovie).title || (item as TMDBTVShow).name : (item as TMDBTVShow).name || (item as TMDBMovie).title;
                  return (
                    <MediaCard
                      key={`trending-${media_type}-${item.id}`}
                      id={item.id}
                      title={itemTitle}
                      poster_path={item.poster_path}
                      vote_average={item.vote_average}
                      release_date={'release_date' in item ? item.release_date : undefined}
                      first_air_date={'first_air_date' in item ? item.first_air_date : undefined}
                      media_type={media_type}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Active Results Grid */}
      {results.length > 0 && (
        <section aria-label={`Search results for "${query}"`} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white md:text-xl">
              Results for &quot;<span className="text-red-400">{query}</span>&quot;
              <span className="ml-2 text-sm font-normal text-slate-400">({results.length} found)</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((item) => {
              const itemType = (item as { media_type?: string }).media_type;
              const media_type = itemType === 'tv' ? 'tv' : 'movie';
              const itemTitle = media_type === 'movie' ? (item as TMDBMovie).title || (item as TMDBTVShow).name : (item as TMDBTVShow).name || (item as TMDBMovie).title;
              return (
                <MediaCard
                  key={`${media_type}-${item.id}`}
                  id={item.id}
                  title={itemTitle}
                  poster_path={item.poster_path}
                  vote_average={item.vote_average}
                  release_date={'release_date' in item ? item.release_date : undefined}
                  first_air_date={'first_air_date' in item ? item.first_air_date : undefined}
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
