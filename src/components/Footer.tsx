'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';

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
    <footer className="mt-8 border-t border-white/10 bg-[#080808]">
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
            <h4 className="font-semibold text-white">Browse</h4>
            <ul className="space-y-2">
              <li><Link href="/movies" className="text-slate-400 hover:text-white transition-colors text-sm">Movies</Link></li>
              <li><Link href="/tv" className="text-slate-400 hover:text-white transition-colors text-sm">TV Series</Link></li>
              <li><Link href="/trending" className="text-slate-400 hover:text-white transition-colors text-sm">Trending</Link></li>
              <li><Link href="/top-rated" className="text-slate-400 hover:text-white transition-colors text-sm">Top Rated</Link></li>
              <li><Link href="/genre/action" className="text-slate-400 hover:text-white transition-colors text-sm">Action</Link></li>
              <li><Link href="/genre/comedy" className="text-slate-400 hover:text-white transition-colors text-sm">Comedy</Link></li>
              <li><Link href="/genre/drama" className="text-slate-400 hover:text-white transition-colors text-sm">Drama</Link></li>
              <li><Link href="/genre/horror" className="text-slate-400 hover:text-white transition-colors text-sm">Horror</Link></li>
            </ul>
          </nav>

          <nav className="space-y-3" aria-label="Legal">
            <h4 className="font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/dmca" className="text-slate-400 hover:text-white transition-colors text-sm">DMCA Policy</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </nav>

          <div className="space-y-3" aria-label="Social media">
            <h4 className="font-semibold text-white">Follow</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://t.me/filmflix00" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm" aria-label="Telegram">
                  <Send className="w-4 h-4" />
                  Telegram
                </a>
              </li>
              {SOCIAL_LINKS.filter(({ href }) => href.trim()).map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-sm">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
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