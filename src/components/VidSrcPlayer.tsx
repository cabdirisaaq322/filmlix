'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VidSrcPlayerProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  imdbId?: string | null;
  season?: number;
  episode?: number;
  autoPlay?: boolean;
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

// nxsha is primary (default). The rest are fallbacks.
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
  autoPlay = false,
  title,
}: VidSrcPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [selectedServerId, setSelectedServerId] = useState('nxsha');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const selectedServer = SERVERS.find((s) => s.id === selectedServerId) ?? SERVERS[0];
  const src = selectedServer.build({ type, tmdbId, imdbId, season, episode });

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerContainerRef.current?.requestFullscreen().catch(() => {});
    }
  }, []);

  return (
    <div id="video-player" className="w-full min-w-0 scroll-mt-36 space-y-3 md:scroll-mt-24">
      {/* Server selector — inline buttons like before, nxsha primary */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Server
        </span>
        <div className="flex flex-wrap gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
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
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pb-1">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleReload}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
            aria-label="Reload stream"
            title="Reload stream"
          >
            <Loader2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={playerContainerRef}
        className={cn('relative bg-black rounded-xl overflow-hidden w-full shadow-2xl border border-slate-800')}
        style={{ position: 'relative', paddingTop: '56.25%' }}
        role="region"
        aria-label={`${title || 'Video'} player`}
      >
        {(isLoading || !src) && !error && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-white shadow-lg">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            <span className="text-xs font-medium text-slate-200">Loading stream…</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 text-white p-6 text-center max-w-sm">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                <X className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm text-slate-200">{error}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={handleReload}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
                >
                  Reload
                </button>
              </div>
            </div>
          </div>
        )}

        {src && (
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
    </div>
  );
}
