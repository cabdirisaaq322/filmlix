'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Maximize2, ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlockedMovieIds } from '@/lib/blocklist-client';

interface VidSrcPlayerProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  imdbId?: string | null;
  season?: number;
  episode?: number;
  title?: string;
}

interface Server {
  id: string;
  name: string;
  build: (ctx: {
    type: 'movie' | 'tv';
    tmdbId: number;
    imdbId?: string | null;
    season: number;
    episode: number;
  }) => string;
}

const BLOCKLISTED_MOVIE_IDS = new Set([64689, 5038]);

const SERVERS: Server[] = [
  {
    id: 'nxsha',
    name: 'Server 1',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?server=Citadel`
        : `https://nxsha.space/embed/movie/${tmdbId}?server=Citadel`,
  },
  {
    id: 'moviesapi',
    name: 'Server 2',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://moviesapi.to/tv/${tmdbId}/${season}/${episode}`
        : `https://moviesapi.to/movie/${tmdbId}`,
  },
  {
    id: 'vidsrc-pm',
    name: 'Server 3',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidcore',
    name: 'Server 4',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidcore.org/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidsrc-party',
    name: 'Server 5',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidsrc.party/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.party/embed/movie/${tmdbId}`,
  },
  {
    id: 'smashystream',
    name: 'Server 6',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&s=${season}&e=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
  },
];

export function VidSrcPlayer({
  type,
  tmdbId,
  imdbId,
  season = 1,
  episode = 1,
  title,
}: VidSrcPlayerProps) {
  const firestoreBlockedIds = useBlockedMovieIds();
  const isTitleBlocked = BLOCKLISTED_MOVIE_IDS.has(tmdbId) || firestoreBlockedIds.includes(tmdbId);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [selectedServerId, setSelectedServerId] = useState('nxsha');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const selectedServer = SERVERS.find((s) => s.id === selectedServerId) ?? SERVERS[0];
  const src = isTitleBlocked ? null : selectedServer.build({ type, tmdbId, imdbId, season, episode });

  const handleSelectServer = useCallback((id: string) => {
    setSelectedServerId(id);
    loadedRef.current = false;
    setIsLoading(true);
    setError(null);
    setReloadNonce((n) => n + 1);
  }, []);

  const handleReload = useCallback(() => {
    loadedRef.current = false;
    setIsLoading(true);
    setError(null);
    setReloadNonce((n) => n + 1);
  }, []);

  const handleIframeLoad = () => {
    loadedRef.current = true;
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    loadedRef.current = true;
    setIsLoading(false);
    setError('Failed to load stream. Try another server.');
  };

  const closeExpanded = useCallback(() => setIsExpanded(false), []);
  const toggleExpanded = useCallback(() => setIsExpanded((p) => !p), []);

  useEffect(() => {
    if (isExpanded) {
      history.pushState({ expanded: true }, '');
    }
    const handlePopState = () => {
      if (isExpanded) setIsExpanded(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      try {
        const orientation = screen.orientation as unknown as { lock: (type: string) => Promise<void>; unlock: () => void } | undefined;
        if (orientation?.lock) orientation.lock('landscape').catch(() => {});
      } catch {}
    }
    return () => {
      try {
        const orientation = screen.orientation as unknown as { lock: (type: string) => Promise<void>; unlock: () => void } | undefined;
        orientation?.unlock?.();
      } catch {}
    };
  }, [isExpanded]);

  return (
    <div id="video-player" className="w-full min-w-0 scroll-mt-36 space-y-3 md:scroll-mt-24">
      {isExpanded && (
        <div className="fixed inset-0 z-[60] h-[100dvh] w-[100vw] overflow-hidden bg-black">
          {isTitleBlocked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
              <div className="flex flex-col items-center gap-3 p-6 text-center text-white">
                <AlertCircle className="h-10 w-10 text-red-400" />
                <p className="text-sm text-zinc-300">This title is not available for playback.</p>
              </div>
            </div>
          )}
          {!isTitleBlocked && (isLoading || !src) && !error && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black">
              <Loader2 className="h-8 w-8 animate-spin text-[#e50914]" />
            </div>
          )}
          {!isTitleBlocked && error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
              <p className="px-6 text-center text-sm text-zinc-300">{error}</p>
            </div>
          )}
          {!isTitleBlocked && src && (
            <iframe
              key={reloadNonce}
              ref={iframeRef}
              src={src}
              title={title || 'Stream'}
              className="absolute inset-0 h-full w-full border-0"
              loading="eager"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); closeExpanded(); }}
            className="absolute left-4 top-4 z-30 rounded-full border border-white/20 bg-black/60 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            aria-label="Exit fullscreen"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {!isExpanded && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Source</span>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {SERVERS.map((server) => {
                const isActive = selectedServerId === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleSelectServer(server.id)}
                    className={cn(
                      'nf-focus rounded-full px-3 py-1.5 text-[12px] font-medium transition-all',
                      isActive
                        ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/20'
                        : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {server.name}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReload}
                className="nf-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Reload stream"
                title="Reload"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={toggleExpanded}
                className="nf-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-[#e50914] hover:border-red-600 hover:text-white"
                aria-label="Expand player"
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={playerContainerRef}
            className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/40"
            style={{ position: 'relative', paddingTop: '56.25%' }}
            role="region"
            aria-label={`${title || 'Video'} player`}
          >
            {isTitleBlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <p className="text-sm text-zinc-300">This title is not available for playback.</p>
                </div>
              </div>
            )}
            {!isTitleBlocked && (isLoading || !src) && !error && (
              <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-white backdrop-blur">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e50914]" />
                <span className="text-xs font-medium text-zinc-200">Loading…</span>
              </div>
            )}
            {!isTitleBlocked && error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
                <p className="px-6 text-center text-sm text-zinc-300">{error}</p>
              </div>
            )}
            {!isTitleBlocked && src && (
              <iframe
                key={reloadNonce}
                ref={iframeRef}
                src={src}
                title={title || 'Stream'}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                loading="eager"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
