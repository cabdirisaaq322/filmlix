'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, Sparkles } from 'lucide-react';
import { searchMulti, getTrendingMovies, getTrendingTVShows, TMDBMovie, TMDBTVShow, BLOCKLISTED_MOVIE_IDS } from '@/lib/tmdb';
import { MediaCard } from '@/components/MediaCard';
import { useBlockedMovieIds } from '@/lib/blocklist-client';

const POPULAR_SEARCHES = ['Avengers', 'Batman', 'Breaking Bad', 'Stranger Things', 'Spider-Man', 'Wednesday', 'John Wick', 'Avatar'];

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
          setError('Failed to search. Please try again.');
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
    <div className="nf-row-pad w-full space-y-8 py-10 pt-28 md:pt-32">
      <header className="space-y-2">
        <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]">Discover</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Search</h1>
        <p className="text-zinc-400">Find movies and TV series instantly.</p>
      </header>

      <form onSubmit={handleSubmit} className="relative max-w-3xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, genres, people..."
            className="nf-input h-14 w-full rounded-2xl pl-12 pr-12 text-[15px]"
            autoFocus
            aria-label="Search"
          />
          {query && (
            <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white" aria-label="Clear search">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <button type="submit" className="nf-focus fx-btn-primary mt-4 h-11 rounded-full px-6 text-sm font-semibold disabled:opacity-50" disabled={isLoading || !query.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-label="Loading results">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 animate-pulse">
              <div className="aspect-[2/3] bg-white/5" />
              <div className="space-y-2 p-3"><div className="h-3.5 w-3/4 rounded bg-white/10" /><div className="h-3 w-1/2 rounded bg-white/10" /></div>
            </div>
          ))}
        </div>
      )}

      {hasSearched && query && !isLoading && results.length === 0 && !error && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-zinc-400">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {!hasSearched && !isLoading && results.length === 0 && (
        <div className="space-y-8">
          <section aria-label="Popular searches">
            <h2 className="mb-4 text-lg font-semibold text-white">Popular searches</h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button key={term} type="button" onClick={() => runPopularSearch(term)} className="nf-focus rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white">
                  {term}
                </button>
              ))}
            </div>
          </section>

          {trending.length > 0 && (
            <section aria-label="Trending titles">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white"><Sparkles className="h-5 w-5 text-[#e50914]" /> Trending now</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {trending.map((item) => {
                  const itemType = (item as { media_type?: string }).media_type;
                  const media_type = itemType === 'tv' ? 'tv' : 'movie';
                  const itemTitle = media_type === 'movie' ? (item as TMDBMovie).title || (item as TMDBTVShow).name : (item as TMDBTVShow).name || (item as TMDBMovie).title;
                  return (
                    <MediaCard key={`trending-${media_type}-${item.id}`} id={item.id} title={itemTitle} poster_path={item.poster_path} vote_average={item.vote_average} release_date={'release_date' in item ? item.release_date : undefined} first_air_date={'first_air_date' in item ? item.first_air_date : undefined} media_type={media_type} />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {results.length > 0 && (
        <section aria-label={`Search results for "${query}"`}>
          <h2 className="mb-4 text-lg font-semibold text-white">Results for <span className="text-[#e5e5e5]">&quot;{query}&quot;</span> <span className="text-zinc-500">({results.length})</span></h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((item) => {
              const itemType = (item as { media_type?: string }).media_type;
              const media_type = itemType === 'tv' ? 'tv' : 'movie';
              const itemTitle = media_type === 'movie' ? (item as TMDBMovie).title || (item as TMDBTVShow).name : (item as TMDBTVShow).name || (item as TMDBMovie).title;
              return (
                <MediaCard key={`${media_type}-${item.id}`} id={item.id} title={itemTitle} poster_path={item.poster_path} vote_average={item.vote_average} release_date={'release_date' in item ? item.release_date : undefined} first_air_date={'first_air_date' in item ? item.first_air_date : undefined} media_type={media_type} />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
