import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'FilmFlix - Watch Movies & TV Series Free Online',
    template: '%s | FilmFlix',
  },
  description: 'Watch thousands of movies and TV series for free. HD quality streaming with no registration required. Powered by TMDB and VidSrc.',
  keywords: ['movies', 'tv series', 'streaming', 'free movies', 'watch online', 'hd movies'],
  authors: [{ name: 'FilmFlix' }],
  creator: 'FilmFlix',
  publisher: 'FilmFlix',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://filmflix.example.com',
    siteName: 'FilmFlix',
    title: 'FilmFlix - Watch Movies & TV Series Free Online',
    description: 'Watch thousands of movies and TV series for free. HD quality streaming with no registration required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FilmFlix - Free Movie Streaming',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FilmFlix - Watch Movies & TV Series Free',
    description: 'Free HD streaming of movies and TV series.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
  metadataBase: new URL('http://localhost:3000'),
};

export const viewport: Viewport = {
  themeColor: '#b00610',
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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
      <body className="min-h-screen flex flex-col bg-[#080808] text-white">
        <script src="https://tags.adplox.com/p.js?z=x3cjcw3qr4" async></script>
        <Navbar />
        <main className="box-border min-w-0 w-full max-w-full flex-1 pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}