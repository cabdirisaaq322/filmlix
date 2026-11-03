'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Maximize2, ArrowLeft, RotateCcw } from 'lucide-react';
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
    name: 'Naruto',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?server=Citadel`
        : `https://nxsha.space/embed/movie/${tmdbId}?server=Citadel`,
  },
  {
    id: 'moviesapi',
    name: 'Boruto',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://moviesapi.to/tv/${tmdbId}/${season}/${episode}`
        : `https://moviesapi.to/movie/${tmdbId}`,
  },
  {
    id: 'vidsrc-pm',
    name: 'Sasuke',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidcore',
    name: 'Hinata',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidcore.org/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidsrc-party',
    name: 'Sarada',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidsrc.party/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.party/embed/movie/${tmdbId}`,
  },
  {
    id: 'smashystream',
    name: 'Sakura',
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
    setError('Failed to load stream. Try reloading or switching server.');
  };

  const closeExpanded = useCallback(() => setIsExpanded(false), []);
  const toggleExpanded = useCallback(() => setIsExpanded((p) => !p), []);

  // Phone back button closes expanded view
  useEffect(() => {
    if (isExpanded) {
      history.pushState({ expanded: true }, '');
    }
    const handlePopState = () => {
      if (isExpanded) setIsExpanded(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isExpanded]);

  // Lock landscape when expanded, unlock when closed
  useEffect(() => {
    if (isExpanded) {
      try {
        const orientation = screen.orientation as unknown as { lock: (type: string) => Promise<void>; unlock: () => void } | undefined;
        if (orientation?.lock) {
          orientation.lock('landscape').catch(() => { /* not supported */ });
        }
      } catch {
        // not supported
      }
    }
    return () => {
      try {
        const orientation = screen.orientation as unknown as { lock: (type: string) => Promise<void>; unlock: () => void } | undefined;
        orientation?.unlock?.();
      } catch {
        // not supported
      }
    };
  }, [isExpanded]);

  return (
    <div id="video-player" className="w-full min-w-0 scroll-mt-36 space-y-3 md:scroll-mt-24">

      {/* ── FULLSCREEN OVERLAY ── */}
      {isExpanded && (
        <div
          className="fixed inset-0 w-[100vw] h-[100dvh] z-[60] bg-black overflow-hidden"
        >
          {isTitleBlocked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 text-white p-6 text-center max-w-sm">
                <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-red-400">🚫</span>
                </div>
                <p className="text-sm text-slate-200">This title is not available for playback.</p>
              </div>
            </div>
          )}
          {!isTitleBlocked && (isLoading || !src) && !error && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          )}
          {!isTitleBlocked && error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
              <p className="text-sm text-slate-200 px-6 text-center">{error}</p>
            </div>
          )}
          {!isTitleBlocked && src && (
            <iframe
              key={reloadNonce}
              ref={iframeRef}
              src={src}
              title={title || 'Stream'}
              className="absolute inset-0 w-full h-full border-0"
              loading="eager"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
          {/* Back button — top-left corner */}
          <button
            onClick={(e) => { e.stopPropagation(); closeExpanded(); }}
            className="absolute top-4 left-4 z-30 p-2 rounded-lg bg-black/60 text-white border border-white/20 backdrop-blur-sm transition-all hover:bg-black/80"
            aria-label="Exit fullscreen"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── NORMAL VIEW ── */}
      {!isExpanded && (
        <>
          {/* Server selector bar — Reload + Fullscreen buttons beside server chips */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Server</span>
            <div className="flex flex-1 flex-wrap gap-1.5 sm:gap-2">
              {SERVERS.map((server) => {
                const isActive = selectedServerId === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleSelectServer(server.id)}
                    title={`Play on ${server.name}`}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all sm:px-3 sm:py-1 sm:text-xs',
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                    )}
                  >
                    {server.name}
                    {isActive && <span className="ml-1 text-[10px] font-medium text-emerald-200">primary</span>}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleReload}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50 transition-all active:scale-90"
              aria-label="Reload stream"
              title="Reload stream"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleExpanded}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700/50 hover:border-indigo-500 transition-all active:scale-90"
              aria-label="Expand player"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Player — no overlay controls, clean iframe only */}
          <div
            ref={playerContainerRef}
            className="relative bg-black rounded-xl overflow-hidden w-full shadow-2xl border border-slate-800"
            style={{ position: 'relative', paddingTop: '56.25%' }}
            role="region"
            aria-label={`${title || 'Video'} player`}
          >
            {isTitleBlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-white p-6 text-center max-w-sm">
                  <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span className="text-red-400">🚫</span>
                  </div>
                  <p className="text-sm text-slate-200">This title is not available for playback.</p>
                </div>
              </div>
            )}
            {!isTitleBlocked && (isLoading || !src) && !error && (
              <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-white shadow-lg">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span className="text-xs font-medium text-slate-200">Loading stream…</span>
              </div>
            )}
            {!isTitleBlocked && error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
                <p className="text-sm text-slate-200 px-6 text-center">{error}</p>
              </div>
            )}
            {!isTitleBlocked && src && (
              <iframe
                key={reloadNonce}
                ref={iframeRef}
                src={src}
                title={title || 'Stream'}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                className="w-full h-full border-0"
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
