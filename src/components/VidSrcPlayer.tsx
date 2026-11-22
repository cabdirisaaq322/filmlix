'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Loader2,
  Minimize2,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlockedMovieIds } from '@/lib/blocklist-client';

interface VidSrcPlayerProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  imdbId?: string | null;
  season?: number;
  episode?: number;
  title?: string;
  backdropUrl?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

interface StreamServer {
  id: string;
  name: string;
  badge: string;
  build: (ctx: {
    type: 'movie' | 'tv';
    tmdbId: number;
    imdbId?: string | null;
    season: number;
    episode: number;
  }) => string;
}

const BLOCKLISTED_MOVIE_IDS = new Set([64689, 5038]);

const SERVERS: StreamServer[] = [
  {
    id: 'moviesapi',
    name: 'Server 1',
    badge: 'HD High Speed',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://moviesapi.to/tv/${tmdbId}/${season}/${episode}`
        : `https://moviesapi.to/movie/${tmdbId}`,
  },
  {
    id: 'nxsha',
    name: 'Server 2',
    badge: '1080p Ultra',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?server=Citadel`
        : `https://nxsha.space/embed/movie/${tmdbId}?server=Citadel`,
  },
  {
    id: 'vidsrc-pm',
    name: 'Server 3',
    badge: 'Backup Fast',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidcore',
    name: 'Server 4',
    badge: 'Multi-Audio',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidcore.org/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidsrc-party',
    name: 'Server 5',
    badge: 'Direct Stream',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidsrc.party/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.party/embed/movie/${tmdbId}`,
  },
  {
    id: 'smashystream',
    name: 'Server 6',
    badge: 'Standard',
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
  backdropUrl,
  isPlaying: playingProp = false,
  onPlay,
  onNextEpisode,
  hasNextEpisode,
}: VidSrcPlayerProps) {
  const firestoreBlockedIds = useBlockedMovieIds();
  const isTitleBlocked = BLOCKLISTED_MOVIE_IDS.has(tmdbId) || firestoreBlockedIds.includes(tmdbId);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [selectedServerId, setSelectedServerId] = useState('moviesapi');
  const [isExpanded, setIsExpanded] = useState(false);

  const isPlaying = playingProp;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const selectedServer = SERVERS.find((s) => s.id === selectedServerId) ?? SERVERS[0];
  const src =
    isPlaying && !isTitleBlocked
      ? selectedServer.build({ type, tmdbId, imdbId, season, episode })
      : null;

  const handlePlay = useCallback(() => {
    onPlay?.();
  }, [onPlay]);

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
    setError('Playback interrupted. Switching to an alternative server is recommended.');
  };

  const closeExpanded = useCallback(() => setIsExpanded(false), []);
  const toggleExpanded = useCallback(() => setIsExpanded((p) => !p), []);

  useEffect(() => {
    if (isPlaying && !isTitleBlocked) {
      setReloadNonce((n) => n + 1);
    }
  }, [isPlaying, season, episode, isTitleBlocked]);

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

  const playerClasses = cn(
    'relative w-full bg-black border border-white/[0.1]',
    'shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(229,9,20,0.12)]',
    'md:rounded-xl md:mx-auto'
  );

  const serverButtonClasses = (active: boolean) =>
    cn(
      'flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
      active
        ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/30'
        : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/20'
    );

  return (
    <div id="video-player" className="relative w-full min-w-0 scroll-mt-24 space-y-4">
      {/* THEATER MODE */}
      {isExpanded && isPlaying && !isTitleBlocked && (
        <div className="fixed inset-0 z-[100] h-[100dvh] w-[100vw] overflow-hidden bg-black flex flex-col justify-between">
          <div className="relative z-30 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent px-6 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeExpanded();
                }}
                className="nf-focus flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
                aria-label="Exit theater mode"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-bold text-white drop-shadow">{title}</p>
                {type === 'tv' && (
                  <p className="text-xs font-medium text-slate-300">
                    Season {season} · Episode {episode}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReload}
                className="nf-focus flex h-9 items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 text-xs font-semibold text-slate-200 backdrop-blur-md hover:bg-black/90 hover:text-white"
                title="Reload Stream"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reload</span>
              </button>
              <button
                onClick={closeExpanded}
                className="nf-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-slate-200 backdrop-blur-md hover:bg-black/90 hover:text-white"
                title="Exit Fullscreen"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="relative flex-1 w-full h-full">
            {!src && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
                <div className="h-12 w-12 rounded-full border-4 border-red-600/20 border-t-[#e50914] animate-spin" />
                <p className="mt-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Connecting Stream
                </p>
              </div>
            )}
            {src && (
              <iframe
                key={reloadNonce}
                ref={iframeRef}
                src={src}
                title={title || 'Stream Player'}
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
          </div>
        </div>
      )}

      {/* PLAYER CONTAINER (16:9) */}
      <div className={playerClasses}>
        <div
          ref={playerContainerRef}
          className="relative w-full aspect-[16/9]"
          role="region"
          aria-label={`${title || 'Video'} streaming player`}
        >
          {isTitleBlocked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/95">
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="text-sm font-semibold text-slate-300">This title is currently restricted.</p>
              </div>
            </div>
          )}

          {!isPlaying && !isTitleBlocked && (
            <div className="absolute inset-0 z-10 bg-black">
              {backdropUrl && (
                <img
                  src={backdropUrl}
                  alt=""
                  className="h-full w-full object-cover object-center opacity-50"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />
              <button
                onClick={handlePlay}
                className="absolute inset-0 z-20 flex items-center justify-center"
                aria-label="Play"
              >
                <div className="flex h-18 w-18 items-center justify-center rounded-full bg-white text-black shadow-2xl">
                  <Play className="ml-1 h-8 w-8 fill-current" />
                </div>
              </button>
            </div>
          )}

          {isPlaying && !isTitleBlocked && isLoading && !error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
              <div className="h-12 w-12 rounded-full border-4 border-red-600/20 border-t-[#e50914] animate-spin" />
              <p className="mt-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
                Connecting Stream
              </p>
            </div>
          )}

          {isPlaying && !isTitleBlocked && error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/95">
              <div className="flex max-w-md flex-col items-center gap-3 p-6 text-center">
                <AlertCircle className="h-8 w-8 text-amber-400" />
                <p className="text-sm text-slate-200">{error}</p>
                <button
                  onClick={() =>
                    handleSelectServer(selectedServerId === 'moviesapi' ? 'nxsha' : 'moviesapi')
                  }
                  className="nf-focus inline-flex items-center gap-1.5 rounded-full bg-[#e50914] px-3 py-1 text-[11px] font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Switch to Backup Server
                </button>
              </div>
            </div>
          )}

          {isPlaying && !isTitleBlocked && src && (
            <iframe
              key={reloadNonce}
              ref={iframeRef}
              src={src}
              title={title || 'Stream Player'}
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
      </div>

      {/* SERVER SWITCHER BAR (directly under player) */}
      <div className="mt-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Servers:
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {SERVERS.map((server) => {
            const active = server.id === selectedServerId;
            return (
              <button
                key={server.id}
                type="button"
                onClick={() => handleSelectServer(server.id)}
                className={serverButtonClasses(active)}
              >
                <span>{server.name}</span>
                <span className="text-[10px] font-normal opacity-70">{server.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-black/40 px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" aria-hidden="true" />
          <span className="font-bold text-white">{selectedServer.name}</span>
          <span className="ml-1 font-medium text-slate-400 hidden sm:inline">
            ({selectedServer.badge})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasNextEpisode && onNextEpisode && (
            <button
              onClick={onNextEpisode}
              className="nf-focus inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.15] transition-all cursor-pointer active:scale-95"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Next Episode</span>
            </button>
          )}
            <button
              onClick={handleReload}
              className="nf-focus flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white cursor-pointer"
              title="Reload Stream"
              aria-label="Reload Stream"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
  );
}
