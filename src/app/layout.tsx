import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'FilmFlix - Watch Movies & TV Series Free Online',
    template: '%s | FilmFlix',
  },
  description: 'Stream movies and TV series in HD. Discover trending titles, top charts, and new releases on FilmFlix.',
  keywords: ['movies', 'tv series', 'streaming', 'free movies', 'watch online', 'hd movies'],
  authors: [{ name: 'FilmFlix' }],
  creator: 'FilmFlix',
  publisher: 'FilmFlix',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://filmflix.cc',
    siteName: 'FilmFlix',
    title: 'FilmFlix - Watch Movies & TV Series Free Online',
    description: 'Stream movies and TV series in HD on FilmFlix.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FilmFlix',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FilmFlix - Watch Movies & TV Series',
    description: 'Stream movies and TV series in HD on FilmFlix.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'googlee14a5a4666db0580',
  },
  metadataBase: new URL('https://filmflix.cc'),
};

export const viewport: Viewport = {
  themeColor: '#08080c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://vidsrc.me" />
        <link rel="preconnect" href="https://www.2embed.cc" />
        <link rel="preconnect" href="https://multiembed.mov" />
        <link rel="preconnect" href="https://vidlink.pro" />
        <link rel="dns-prefetch" href="https://vidsrc.to" />
        <link rel="dns-prefetch" href="https://vidsrc.net" />
        <link rel="dns-prefetch" href="https://vidsrc.cc" />
        <link rel="preconnect" href="https://tags.adplox.com" />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#08080c] text-slate-100">
        <Navbar />
        <main className="box-border min-w-0 w-full max-w-full flex-1 pt-[54px] md:pt-[68px]">{children}</main>
        <Footer />
        <Script src="https://tags.adplox.com/p.js?z=x3cjcw3qr4" strategy="afterInteractive" />
      </body>
    </html>
  );
}
