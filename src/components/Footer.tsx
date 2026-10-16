'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '' },
  { label: 'TikTok', href: '' },
  { label: 'YouTube', href: '' },
  { label: 'X', href: '' },
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mx-2 mt-8 rounded-t-2xl border border-white/10 bg-neutral-950/75 shadow-[0_-12px_48px_rgba(37,99,235,0.1)] backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center text-2xl font-black uppercase leading-none" aria-label="FilmFlix Home">
              <span className="text-white">Film</span><span className="text-[#e50914]">Flix</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Movies and series, all in one place.
            </p>
          </div>

          <nav className="space-y-3" aria-label="Browse">
            <h4 className="font-semibold text-blue-300">Browse</h4>
            <ul className="space-y-2">
              <li><Link href="/movies" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Movies</Link></li>
              <li><Link href="/tv" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">TV Series</Link></li>
              <li><Link href="/trending" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Trending</Link></li>
              <li><Link href="/top-rated" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Top Rated</Link></li>
              <li><Link href="/genre/action" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Action</Link></li>
              <li><Link href="/genre/comedy" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Comedy</Link></li>
              <li><Link href="/genre/drama" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Drama</Link></li>
              <li><Link href="/genre/horror" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Horror</Link></li>
            </ul>
          </nav>

          <nav className="space-y-3" aria-label="Legal">
            <h4 className="font-semibold text-blue-300">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/dmca" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">DMCA Policy</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </nav>

          <div className="space-y-3" aria-label="Social media">
            <h4 className="font-semibold text-blue-300">Follow</h4>
            <ul className="space-y-2">
              {SOCIAL_LINKS.filter(({ href }) => href.trim()).map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-blue-400/15">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} FilmFlix. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}