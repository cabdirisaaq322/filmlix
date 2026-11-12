'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const LINK_GROUPS: { href: string; label: string; external?: boolean }[][] = [
  [
    { href: '/movies', label: 'Movies' },
    { href: '/tv', label: 'TV Series' },
    { href: '/trending', label: 'Trending' },
    { href: '/top-rated', label: 'Top Rated' },
  ],
  [
    { href: '/genre/action', label: 'Action' },
    { href: '/genre/comedy', label: 'Comedy' },
    { href: '/genre/drama', label: 'Drama' },
    { href: '/genre/horror', label: 'Horror' },
  ],
  [
    { href: '/favorites', label: 'My List' },
    { href: '/rankings', label: 'Top 10' },
    { href: '/search', label: 'Search' },
    { href: '/admin', label: 'Admin' },
  ],
  [
    { href: '/dmca', label: 'DMCA' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/contact', label: 'Contact' },
    { href: 'https://t.me/deidrasom3', label: 'Telegram', external: true },
  ],
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-12 border-t border-white/10 bg-[var(--fx-bg-raised)]">
      <div className="nf-row-pad mx-auto max-w-[1200px] py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xl font-extrabold tracking-tight text-white">
              Film<span className="text-[#e50914]">Flix</span>
            </p>
            <p className="mt-1 text-sm text-zinc-400">Movies and series, beautifully streamed.</p>
          </div>
          <p className="text-sm text-zinc-500">
            Questions? <Link href="/contact" className="nf-focus text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-white">Contact us</Link>
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {LINK_GROUPS.map((group, i) => (
            <ul key={i} className="space-y-2.5">
              {group.map(({ href, label, external }) => (
                <li key={href + label}>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nf-focus text-[13px] text-zinc-400 transition-colors hover:text-white"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="nf-focus text-[13px] text-zinc-400 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </nav>

        <div className="mt-10 border-t border-white/10 pt-6 text-[12px] leading-relaxed text-zinc-500">
          <p>© {currentYear} FilmFlix. All rights reserved.</p>
          <p className="mt-1">FilmFlix does not host any media files; streams are provided by third-party services.</p>
        </div>
      </div>
    </footer>
  );
}
