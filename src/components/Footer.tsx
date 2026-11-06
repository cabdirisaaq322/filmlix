'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const LINK_GROUPS: { href: string; label: string; external?: boolean }[][] = [
  [
    { href: '/movies', label: 'Films' },
    { href: '/tv', label: 'Series' },
    { href: '/trending', label: 'New & Popular' },
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
    { href: '/dmca', label: 'DMCA Policy' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms of Use' },
    { href: '/contact', label: 'Contact Us' },
    { href: 'https://t.me/deidrasom3', label: 'Telegram', external: true },
  ],
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-6 border-t border-white/[0.08] bg-[#141414]">
      <div className="nf-row-pad mx-auto max-w-[1000px] py-10 md:py-14">
        <p className="mb-5 text-[14px] text-[#b3b3b3] md:text-[16px]">
          Questions? <Link href="/contact" className="nf-focus underline hover:text-white">Contact us</Link>
        </p>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
          {LINK_GROUPS.map((group, i) => (
            <ul key={i} className="space-y-3">
              {group.map(({ href, label, external }) => (
                <li key={href}>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nf-focus text-[12px] text-[#b3b3b3] transition-colors hover:text-white hover:underline md:text-[13px]"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="nf-focus text-[12px] text-[#b3b3b3] transition-colors hover:text-white hover:underline md:text-[13px]"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </nav>

        <p className="mt-8 text-[16px] font-black uppercase leading-none tracking-[-0.02em] text-white md:text-[18px]">
          Film<span className="text-[#e50914]">Flix</span>
        </p>

        <p className="mt-2 text-[12px] text-[#8c8c8c] md:text-[13px]">
          Movies and series, all in one place.
        </p>

        <p className="mt-1.5 text-[11px] leading-relaxed text-[#6d6d6d] md:text-[12px]">
          © {currentYear} FilmFlix. All rights reserved. FilmFlix does not host any media files; all streams are
          provided by third-party services.
        </p>
      </div>
    </footer>
  );
}
