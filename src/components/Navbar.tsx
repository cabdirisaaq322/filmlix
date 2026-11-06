'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Trash2, Trophy, Film, Send, Menu, X } from 'lucide-react';
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

  // Netflix header: transparent over the billboard, solid #141414 once scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Drawer behaviour: Escape closes, body scroll locks while open.
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
        className="nf-header fixed inset-x-0 top-0 z-50"
        aria-label="Main navigation"
      >
        <div className="nf-row-pad flex h-[54px] items-center justify-between gap-2 md:h-[68px] md:gap-4">
          {/* left cluster: wordmark + primary nav (shown on mobile too, scrolls if tight) */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-6 lg:gap-8">
            <Link
              href="/"
              aria-label="FilmFlix home"
              className="nf-focus shrink-0 select-none whitespace-nowrap text-[15px] font-black uppercase leading-none tracking-[-0.02em] text-white transition-opacity hover:opacity-80 min-[360px]:text-[17px] sm:text-[20px] md:text-[25px]"
            >
              Film<span className="text-[#e50914]">Flix</span>
            </Link>

            <nav
              className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto min-[360px]:gap-3 md:gap-4 lg:gap-5"
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
                      'nf-focus whitespace-nowrap text-[10px] font-normal transition-colors min-[360px]:text-[11.5px] md:text-[13px] lg:text-[14px]',
                      index >= 3 && 'hidden md:inline',
                      active ? 'font-medium text-white' : 'text-[#e5e5e5] hover:text-[#b3b3b3]'
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* right cluster: search + hamburger */}
          <div className="flex shrink-0 items-center gap-0.5 md:gap-4">
            <Link
              href="/search"
              aria-label="Search titles"
              className="nf-focus flex h-8 w-8 items-center justify-center text-white transition-colors hover:text-[#b3b3b3] min-[360px]:h-9 min-[360px]:w-9 md:h-10 md:w-10"
            >
              <Search className="h-[20px] w-[20px] md:h-[22px] md:w-[22px]" aria-hidden="true" strokeWidth={1.8} />
            </Link>

            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="nf-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="nf-focus flex h-8 w-8 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10 min-[360px]:h-9 min-[360px]:w-9 md:h-10 md:w-10"
            >
              {menuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* backdrop */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300',
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* hamburger drawer */}
      <aside
        id="nf-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          'fixed inset-y-0 right-0 z-[70] flex w-[min(360px,88vw)] flex-col overflow-y-auto bg-[#0b0b0b] shadow-2xl',
          'transition-transform duration-300 ease-out',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-[15px] font-medium text-white">Browse</span>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="nf-focus flex h-9 w-9 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-col py-2" aria-label="Main menu">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'nf-focus flex items-center justify-between px-5 py-3 text-[15px] transition-colors',
                  active ? 'font-medium text-white' : 'text-[#e5e5e5] hover:bg-white/5 hover:text-white'
                )}
              >
                {label}
                {active && <span className="h-1.5 w-1.5 rounded-full bg-[#e50914]" aria-hidden="true" />}
              </Link>
            );
          })}
          <Link
            href="/search"
            onClick={closeMenu}
            className="nf-focus flex items-center gap-3 px-5 py-3 text-[15px] text-[#e5e5e5] transition-colors hover:bg-white/5 hover:text-white"
          >
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            Search
          </Link>
        </nav>

        <div className="mx-5 border-t border-white/10" />

        <div className="flex flex-col py-2">
          <Link
            href="/rankings"
            onClick={closeMenu}
            className="nf-focus flex items-center gap-3 px-5 py-3 text-[15px] text-[#e5e5e5] transition-colors hover:bg-white/5 hover:text-white"
          >
            <Trophy className="h-[18px] w-[18px]" aria-hidden="true" />
            Top 10 Leaderboard
          </Link>
          <button
            type="button"
            onClick={handleGenre}
            className="nf-focus flex w-full items-center gap-3 px-5 py-3 text-left text-[15px] text-[#e5e5e5] transition-colors hover:bg-white/5 hover:text-white"
          >
            <Film className="h-[18px] w-[18px]" aria-hidden="true" />
            Manage Genres
          </button>
        </div>

        <div className="mx-5 border-t border-white/10" />

        <div className="flex flex-col py-2">
          <button
            type="button"
            onClick={handleClearHistory}
            className="nf-focus flex w-full items-center gap-3 px-5 py-3 text-left text-[15px] text-[#e5e5e5] transition-colors hover:bg-white/5 hover:text-white"
          >
            <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
            Clear Continue Watching
          </button>
          <a
            href="https://t.me/deidrasom3"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="nf-focus flex w-full items-center gap-3 px-5 py-3 text-[15px] text-[#e5e5e5] transition-colors hover:bg-white/5 hover:text-white"
          >
            <Send className="h-[18px] w-[18px]" aria-hidden="true" />
            Telegram Channel
          </a>
        </div>

        <p className="mt-auto px-5 py-5 text-[11px] leading-relaxed text-[#6d6d6d]">
          <span className="text-[13px] font-black uppercase tracking-[-0.02em] text-white">
            Film<span className="text-[#e50914]">Flix</span>
          </span>
          <br />
          Movies and series, all in one place.
        </p>
      </aside>
    </>
  );
}
