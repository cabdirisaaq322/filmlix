'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Trash2, Trophy, Film, Send, Menu, X, Sparkles, Heart } from 'lucide-react';
import { clearContinueWatching } from '@/lib/history';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' },
  { href: '/trending', label: 'New & Popular' },
  { href: '/favorites', label: 'My List' },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  const handleGenre = () => {
    const base = pathname === '/movies' || pathname === '/tv' ? pathname : '/movies';
    const qs = new URLSearchParams(window.location.search);
    qs.delete('genre');
    qs.delete('page');
    const query = qs.toString();
    closeMenu();
    router.push(query ? `${base}?${query}` : base);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear your Continue Watching list?')) {
      clearContinueWatching();
      closeMenu();
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        data-scrolled={scrolled}
        className={cn(
          'nf-header fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-white/[0.08] bg-[#08080c]/85 shadow-2xl backdrop-blur-xl'
            : 'bg-gradient-to-b from-[#08080c]/90 via-[#08080c]/40 to-transparent'
        )}
        aria-label="Main navigation"
      >
        <div className="nf-row-pad flex h-[56px] items-center justify-between gap-3 md:h-[70px] md:gap-6">
          {/* Left Brand + Nav links */}
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6 lg:gap-10">
            <Link
              href="/"
              aria-label="FilmFlix home"
              className="nf-focus group relative shrink-0 select-none whitespace-nowrap text-[17px] font-black uppercase tracking-[-0.03em] text-white transition-transform duration-200 hover:scale-[1.02] sm:text-[21px] md:text-[25px]"
            >
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Film
              </span>
              <span className="text-[#e50914] drop-shadow-[0_0_16px_rgba(229,9,20,0.65)] transition-all group-hover:drop-shadow-[0_0_22px_rgba(229,9,20,0.9)]">
                Flix
              </span>
            </Link>

            <nav
              className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:gap-2 md:gap-3 lg:gap-4"
              aria-label="Primary"
            >
              {NAV_ITEMS.map(({ href, label }, index) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'nf-focus relative whitespace-nowrap px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 sm:text-[13px] md:text-[14px]',
                      index >= 3 && 'hidden sm:inline-block',
                      active
                        ? 'font-semibold text-white'
                        : 'text-slate-300/80 hover:text-white'
                    )}
                  >
                    {label}
                    {active && (
                      <span
                        className="absolute inset-x-2 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#e50914] to-transparent shadow-[0_0_8px_rgba(229,9,20,0.8)]"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right cluster: Search bar / icon + hamburger */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <Link
              href="/search"
              aria-label="Search movies and series"
              className="nf-focus group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/[0.1] hover:text-white sm:h-10 sm:w-10"
            >
              <Search className="h-4 w-4 transition-transform group-hover:scale-110 sm:h-[18px] sm:w-[18px]" strokeWidth={2.2} />
            </Link>

            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="nf-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="nf-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/[0.1] sm:h-10 sm:w-10"
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={2.2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300',
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Slide-out Menu Drawer */}
      <aside
        id="nf-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={cn(
          'fixed inset-y-0 right-0 z-[70] flex w-[min(380px,88vw)] flex-col border-l border-white/10 bg-[#0b0c14]/95 p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/20 text-[#e50914]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[16px] font-bold tracking-tight text-white">Menu</span>
          </div>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="nf-focus flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 py-4" aria-label="Main menu">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'nf-focus flex items-center justify-between rounded-xl px-4 py-3 text-[14.5px] font-medium transition-all',
                  active
                    ? 'bg-gradient-to-r from-red-600/20 to-transparent text-white ring-1 ring-red-600/30'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                <span>{label}</span>
                {active && <span className="h-2 w-2 rounded-full bg-[#e50914] shadow-[0_0_8px_#e50914]" aria-hidden="true" />}
              </Link>
            );
          })}

          <Link
            href="/search"
            onClick={closeMenu}
            className="nf-focus flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <span>Search</span>
          </Link>

          <Link
            href="/favorites"
            onClick={closeMenu}
            className="nf-focus flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            <Heart className="h-4 w-4 text-[#e50914]" />
            <span>My List</span>
          </Link>
        </nav>

        <div className="my-2 border-t border-white/[0.08]" />

        <div className="flex flex-col gap-1 py-2">
          <Link
            href="/rankings"
            onClick={closeMenu}
            className="nf-focus flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Top 10 Charts</span>
          </Link>
          <button
            type="button"
            onClick={handleGenre}
            className="nf-focus flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            <Film className="h-4 w-4 text-slate-400" />
            <span>Browse Genres</span>
          </button>
        </div>

        <div className="my-2 border-t border-white/[0.08]" />

        <div className="flex flex-col gap-1 py-2">
          <button
            type="button"
            onClick={handleClearHistory}
            className="nf-focus flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13.5px] font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Watch History</span>
          </button>

          <a
            href="https://t.me/deidrasom3"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="nf-focus flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            <Send className="h-4 w-4 text-sky-400" />
            <span>Telegram Channel</span>
          </a>
        </div>

        <div className="mt-auto pt-6 text-[12px] text-slate-500">
          <p className="font-semibold text-slate-400">FilmFlix Ultra</p>
          <p className="mt-0.5 text-slate-500">The premier destination for movies & series.</p>
        </div>
      </aside>
    </>
  );
}
