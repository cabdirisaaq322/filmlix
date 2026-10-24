'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Trash2, Trophy, Flame, Film, Heart, Zap, Calendar, Check, Search } from 'lucide-react';
import { clearContinueWatching } from '@/lib/history';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' },
  { href: '/search', label: 'Search' },
] as const;

const FILTER_GENRES = [
  { id: '28', label: 'Action', icon: Zap },
  { id: '35', label: 'Comedy', icon: Film },
  { id: '18', label: 'Drama', icon: Heart },
  { id: '27', label: 'Horror', icon: Flame },
  { id: '878', label: 'Sci-Fi', icon: Film },
  { id: '10749', label: 'Romance', icon: Heart },
  { id: '53', label: 'Thriller', icon: Zap },
] as const;

const FILTER_YEARS = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i);

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeGenre, setActiveGenre] = useState('');
  const [activeYear, setActiveYear] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    if (!menuOpen) {
      const qs = new URLSearchParams(window.location.search);
      setActiveGenre(qs.get('genre') || '');
      setActiveYear(qs.get('year') || '');
    }
    setMenuOpen((open) => !open);
  };

  const applyFilter = (key: 'genre' | 'year', value: string) => {
    const base = pathname === '/movies' || pathname === '/tv' ? pathname : '/movies';
    const qs = new URLSearchParams(window.location.search);
    if (value) qs.set(key, value);
    else qs.delete(key);
    qs.delete('page');
    const query = qs.toString();
    if (key === 'genre') setActiveGenre(value);
    else setActiveYear(value);
    setMenuOpen(false);
    router.push(query ? `${base}?${query}` : base);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Clear your Continue Watching list?')) {
      clearContinueWatching();
      setMenuOpen(false);
    }
  };

  return (
    <nav
      aria-label="Main navigation"
      className="fixed left-1/2 top-6 z-50 w-[96%] max-w-[1600px] -translate-x-1/2 rounded-full border border-white/10 bg-[rgba(30,30,30,0.85)] px-2 sm:px-8 py-2 sm:py-3 shadow-xl shadow-black/35 backdrop-blur-[12px]"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-10">
        <Link
          href="/"
          aria-label="FilmFlix home"
          className="flex shrink-0 border-r border-white/15 pr-2 sm:pr-6 py-1 text-base sm:text-2xl font-black uppercase leading-none tracking-wide sm:tracking-widest text-white whitespace-nowrap"
        >
          Film<span className="text-[#e50914]">Flix</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-10 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-w-0 max-w-full">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            const isSearch = href === '/search';
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center rounded-full px-2 sm:px-5 py-1 sm:py-2.5 text-[10px] sm:text-base font-medium transition-colors whitespace-nowrap',
                  active
                    ? 'bg-[#333333] text-white'
                    : 'text-[#cccccc] hover:text-white'
                )}
              >
                {isSearch ? (
                  <>
                    <Search className="h-4 w-4 shrink-0 block sm:hidden" aria-hidden="true" />
                    <span className="hidden sm:inline">{label}</span>
                  </>
                ) : (
                  <span>{label}</span>
                )}
              </Link>
            );
          })}
        </div>

        <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className={cn(
                'flex items-center rounded-full px-3 sm:px-5 py-1.5 sm:py-2.5 text-[10px] sm:text-base font-medium transition-colors whitespace-nowrap',
                menuOpen ? 'bg-[#333333] text-white' : 'text-[#cccccc] hover:text-white'
              )}
            >
              <Menu className="h-4 w-4" />
            </button>

            <div
              role="menu"
              aria-label="Menu"
              className={cn(
                'absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-[min(24rem,calc(100vw-2rem))] max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-[rgba(20,20,20,0.95)] p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
              )}
              aria-hidden={!menuOpen}
            >
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/45">🔥 Top 10 Trending</p>
              <div className="grid grid-cols-2 gap-1.5 mb-1">
                <Link
                  href="/rankings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-white/80 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <Trophy className="h-4 w-4 shrink-0 text-yellow-500" aria-hidden="true" />
                  <span>Top 10</span>
                </Link>
                <Link
                  href="/trending"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-white/80 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <Flame className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  <span>Trending</span>
                </Link>
              </div>

              <div className="my-2.5 border-t border-white/10" />
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/45">🎭 Genre Filter</p>
              <div className="grid grid-cols-3 gap-1.5 mb-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => applyFilter('genre', '')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all',
                    activeGenre
                      ? 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:bg-white/10 hover:text-white'
                      : 'border-red-600/50 bg-red-600/15 text-white'
                  )}
                >
                  {!activeGenre && <Check className="h-3 w-3" aria-hidden="true" />}
                  All Genres
                </button>
                {FILTER_GENRES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="menuitem"
                    onClick={() => applyFilter('genre', id)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all',
                      activeGenre === id
                        ? 'border-red-600/50 bg-red-600/15 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-white/50" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="my-2.5 border-t border-white/10" />
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/45">📅 Year Filter</p>
              <div className="grid grid-cols-4 gap-1.5 mb-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => applyFilter('year', '')}
                  className={cn(
                    'flex items-center justify-center gap-1 rounded-lg border px-1 py-2 text-xs font-medium transition-all',
                    activeYear
                      ? 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:bg-white/10 hover:text-white'
                      : 'border-red-600/50 bg-red-600/15 text-white'
                  )}
                >
                  {!activeYear && <Check className="h-3 w-3" aria-hidden="true" />}
                  Any
                </button>
                {FILTER_YEARS.map((year) => (
                  <button
                    key={year}
                    type="button"
                    role="menuitem"
                    onClick={() => applyFilter('year', String(year))}
                    className={cn(
                      'flex items-center justify-center gap-1 rounded-lg border px-1 py-2 text-xs font-medium transition-all',
                      activeYear === String(year)
                        ? 'border-red-600/50 bg-red-600/15 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Calendar className="h-3 w-3 shrink-0 text-white/40" aria-hidden="true" />
                    {year}
                  </button>
                ))}
              </div>

              <div className="my-2.5 border-t border-white/10" />
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/45">⚙️ Settings</p>
              <button
                type="button"
                role="menuitem"
                onClick={handleClearHistory}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                <Trash2 className="h-4 w-4 text-white/55" aria-hidden="true" />
                Clear Continue Watching
              </button>
            </div>
          </div>
      </div>
    </nav>
  );
}
