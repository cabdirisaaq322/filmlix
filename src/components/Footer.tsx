'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart, Send, ShieldCheck, Film } from 'lucide-react';

const LINK_GROUPS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: 'Navigation',
    links: [
      { href: '/movies', label: 'Movies' },
      { href: '/tv', label: 'TV Series' },
      { href: '/trending', label: 'Trending Titles' },
      { href: '/top-rated', label: 'Top Rated Charts' },
    ],
  },
  {
    title: 'Genres',
    links: [
      { href: '/genre/action', label: 'Action & Adventure' },
      { href: '/genre/comedy', label: 'Comedy' },
      { href: '/genre/drama', label: 'Drama' },
      { href: '/genre/horror', label: 'Horror & Thriller' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { href: '/favorites', label: 'My Watchlist' },
      { href: '/rankings', label: 'Top 10 Worldwide' },
      { href: '/search', label: 'Advanced Search' },
      { href: '/admin', label: 'Admin Portal' },
    ],
  },
  {
    title: 'Legal & Info',
    links: [
      { href: '/dmca', label: 'DMCA Notice' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/contact', label: 'Contact Support' },
      { href: 'https://t.me/filmflixoffi', label: 'Telegram Community', external: true },
    ],
  },
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative mt-20 border-t border-white/[0.08] bg-gradient-to-b from-[#08080c] via-[#0b0c14] to-[#07070a]">
      {/* Top ambient highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

      <div className="nf-row-pad mx-auto max-w-[1440px] py-14 md:py-20">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <Link href="/" className="inline-block text-2xl font-black uppercase tracking-tight text-white">
              Film<span className="text-[#e50914] drop-shadow-[0_0_14px_rgba(229,9,20,0.6)]">Flix</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              The premier streaming discovery platform for movies and television series. Watch your favorite entertainment in high-definition.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://t.me/filmflixoffi"
                target="_blank"
                rel="noopener noreferrer"
                className="nf-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-white/25 hover:bg-white/[0.1] hover:text-white"
              >
                <Send className="h-3.5 w-3.5 text-sky-400" />
                Join Telegram
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Servers Operational
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-md md:w-72">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <span>Free & Unlimited</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              No account required. Instant streaming across desktop, tablet, and mobile devices.
            </p>
          </div>
        </div>

        {/* Link navigation matrix */}
        <nav aria-label="Footer Navigation" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {LINK_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map(({ href, label, external }) => (
                  <li key={href + label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nf-focus inline-block text-[13px] text-slate-400 transition-colors duration-200 hover:text-white"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="nf-focus inline-block text-[13px] text-slate-400 transition-colors duration-200 hover:text-white"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Legal Disclaimer & Copyright */}
        <div className="mt-14 border-t border-white/[0.08] pt-8 text-xs leading-relaxed text-slate-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} FilmFlix. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Engineered with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> for cinema enthusiasts
            </p>
          </div>
          <p className="mt-2 text-[11px] text-slate-500/80">
            Disclaimer: FilmFlix does not store or host any media content on its servers. All streams and media files are provided by non-affiliated third-party providers.
          </p>
        </div>
      </div>
    </footer>
  );
}
