'use client';

import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react';
import { Search, X, Film, Tv, Home, Flame, Star, Trophy, Menu, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { searchMulti } from '@/lib/tmdb';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/rankings', label: 'Top 10', icon: Trophy },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tv', label: 'TV Series', icon: Tv },
  { href: '/trending', label: 'Trending', icon: Flame },
  { href: '/top-rated', label: 'Top Rated', icon: Star },
] as const;

const MOBILE_GENRES = [
  { href: '/genre/action', label: 'Action' },
  { href: '/genre/comedy', label: 'Comedy' },
  { href: '/genre/drama', label: 'Drama' },
  { href: '/genre/horror', label: 'Horror' },
] as const;

export function Navbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: number; title: string; media_type: string; poster_path: string | null }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchMulti(value);
        setSuggestions(
          results.slice(0, 5).map((r) => ({
            id: r.id,
            title: 'title' in r ? r.title : r.name,
            media_type: 'title' in r ? 'movie' : 'tv',
            poster_path: r.poster_path,
          }))
        );
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);
  }, []);

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !query.trim()) return;
    event.preventDefault();
    setShowSuggestions(false);
    setGenresOpen(false);
    setMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !searchContainerRef.current?.contains(target) &&
        !mobileSearchContainerRef.current?.contains(target)
      ) {
        setShowSuggestions(false);
        setMobileSearchOpen(false);
        setGenresOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-2 left-2 right-2 z-50 rounded-2xl border border-white/15 bg-neutral-950/75 shadow-xl shadow-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 relative py-1" aria-label="FilmFlix Home">
              <span className="filmflix-wordmark text-white text-3xl sm:text-4xl font-black uppercase leading-none"><span>Film</span><span className="text-[#e50914]">Flix</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={true}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      active ? 'bg-white text-[#b00610]' : 'text-white/90 hover:text-white hover:bg-white/15'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((open) => !open);
                setGenresOpen(false);
                setShowSuggestions(false);
              }}
              className={cn('p-2 rounded-md transition-colors', mobileSearchOpen ? 'bg-white text-black' : 'text-white hover:bg-white/10')}
              aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
              aria-expanded={mobileSearchOpen}
              aria-controls="mobile-search-panel"
            >
              {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setGenresOpen((open) => !open);
                setMobileSearchOpen(false);
                setShowSuggestions(false);
              }}
              className={cn('p-2 rounded-md transition-colors', genresOpen ? 'bg-white text-black' : 'text-white hover:bg-white/10')}
              aria-label="Open browse menu"
              aria-expanded={genresOpen}
              aria-controls="mobile-browse-menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div ref={searchContainerRef} className="relative hidden lg:block w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search movies, series..."
                value={query}
                onKeyDown={handleSearchKeyDown}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full bg-black/30 border border-white/30 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                aria-label="Search movies and TV series"
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                aria-expanded={showSuggestions && suggestions.length > 0}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="search-suggestions"
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl z-50 animate-slide-down"
              >
                {suggestions.map((item) => (
                  <li key={`${item.media_type}-${item.id}`}>
                    <a
                      href={`/watch/${item.media_type}/${item.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors"
                      role="option"
                    >
                      {item.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                          alt=""
                          className="w-10 h-15 object-cover rounded"
                          loading="lazy"
                        />
                      )}
                      <span className="text-sm text-white truncate">{item.title}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded uppercase',
                        item.media_type === 'movie' ? 'bg-white/20 text-white' : 'bg-black/30 text-white/80'
                      )}>
                        {item.media_type === 'movie' ? 'Movie' : 'TV'}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        <div className="md:hidden border-t border-white/10 pb-2">
          <nav className="relative flex items-center gap-2 overflow-x-auto pt-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Browse on mobile">
            {[
              { href: '/movies', label: 'Movies' },
              { href: '/tv', label: 'TV Shows' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                prefetch={true}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
                className={cn(
                  'min-h-8 shrink-0 rounded px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
                  pathname.startsWith(href) ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {mobileSearchOpen && (
          <div id="mobile-search-panel" ref={mobileSearchContainerRef} className="absolute left-4 right-4 top-full z-50 rounded-md border border-white/10 bg-neutral-950 p-3 shadow-2xl md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search movies and TV..."
                value={query}
                onKeyDown={handleSearchKeyDown}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full rounded-md border border-white/20 bg-white/10 py-2.5 pl-9 pr-10 text-sm text-white placeholder-white/60 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Search movies and TV series"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="mt-2 overflow-hidden rounded-md border border-white/10" aria-label="Search suggestions">
                {suggestions.map((item) => (
                  <li key={`mobile-${item.media_type}-${item.id}`}>
                    <Link href={`/watch/${item.media_type}/${item.id}`} onClick={() => setShowSuggestions(false)} className="flex min-h-11 items-center justify-between gap-3 px-3 py-2 text-sm text-white hover:bg-white/10">
                      <span className="truncate">{item.title}</span>
                      <span className="shrink-0 text-xs text-white/60">{item.media_type === 'movie' ? 'Movie' : 'TV'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {genresOpen && (
          <div id="mobile-browse-menu" className="absolute right-4 top-full z-50 w-64 rounded-md border border-white/10 bg-neutral-950 p-3 shadow-2xl md:hidden">
            <div className="grid grid-cols-2 gap-1">
              {[
                { href: '/rankings', label: 'Top 10' },
                { href: '/trending', label: 'Trending' },
                { href: '/top-rated', label: 'Top Rated' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  onClick={() => setGenresOpen(false)}
                  aria-current={pathname.startsWith(href) ? 'page' : undefined}
                  className={cn('rounded px-2 py-2.5 text-xs font-semibold transition-colors', pathname.startsWith(href) ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10 hover:text-white')}
                >
                  {label}
                </Link>
              ))}
            </div>
            <Link
              href="/movies#browse-filters"
              onClick={() => setGenresOpen(false)}
              className="mt-2 flex min-h-11 items-center gap-2 rounded px-3 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Link>
            <p className="px-2 pb-2 pt-3 text-[11px] font-bold uppercase text-white/45">Genres</p>
            <div className="grid grid-cols-2 gap-1">
              {MOBILE_GENRES.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setGenresOpen(false)}
                  aria-current={pathname === href ? 'page' : undefined}
                  className={cn('flex min-h-11 items-center rounded px-3 py-2.5 text-sm font-semibold transition-colors', pathname === href ? 'bg-red-600 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes wordmark-glow {
          from { filter: drop-shadow(0 0 0 rgba(229, 9, 20, 0)); }
          to { filter: drop-shadow(0 0 10px rgba(229, 9, 20, 0.55)); }
        }
        .filmflix-wordmark { display: inline-block; animation: wordmark-glow 2.4s ease-in-out infinite alternate; transition: transform 200ms ease; }
        .filmflix-wordmark:hover { color: #ff4757; transform: scale(1.04); }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
      `}</style>
    </nav>
  );
}