'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Maximize2, Minimize2, ArrowLeft, RotateCcw, AlertCircle, Server, Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlockedMovieIds } from '@/lib/blocklist-client';

interface VidSrcPlayerProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  imdbId?: string | null;
  season?: number;
  episode?: number;
  title?: string;
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
    id: 'nxsha',
    name: 'Server 1',
    badge: '1080p Ultra',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?server=Citadel`
        : `https://nxsha.space/embed/movie/${tmdbId}?server=Citadel`,
  },
  {
    id: 'moviesapi',
    name: 'Server 2',
    badge: 'HD High Speed',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://moviesapi.to/tv/${tmdbId}/${season}/${episode}`
        : `https://moviesapi.to/movie/${tmdbId}`,
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
  onNextEpisode,
  hasNextEpisode,
}: VidSrcPlayerProps) {
  const firestoreBlockedIds = useBlockedMovieIds();
  const isTitleBlocked = BLOCKLISTED_MOVIE_IDS.has(tmdbId) || firestoreBlockedIds.includes(tmdbId);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [selectedServerId, setSelectedServerId] = useState('nxsha');
  const [showServerMenu, setShowServerMenu] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const selectedServer = SERVERS.find((s) => s.id === selectedServerId) ?? SERVERS[0];
  const src = isTitleBlocked ? null : selectedServer.build({ type, tmdbId, imdbId, season, episode });

  const handleSelectServer = useCallback((id: string) => {
    setSelectedServerId(id);
    setShowServerMenu(false);
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
    <div id="video-player" className="relative w-full min-w-0 scroll-mt-24 space-y-2">
      {/* FULLSCREEN THEATER MODE (NETFLIX STYLE) */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] h-[100dvh] w-[100vw] overflow-hidden bg-black flex flex-col justify-between">
          {/* Top Overlay Bar */}
          <div className="relative z-30 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent px-6 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); closeExpanded(); }}
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

          {/* Player Frame */}
          <div className="relative flex-1 w-full h-full">
            {isTitleBlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/95">
                <div className="flex flex-col items-center gap-3 p-6 text-center text-white">
                  <AlertCircle className="h-12 w-12 text-[#e50914]" />
                  <p className="text-base font-semibold">Title is not available for streaming</p>
                </div>
              </div>
            )}

            {!isTitleBlocked && (isLoading || !src) && !error && (
              <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
                <div className="h-12 w-12 rounded-full border-4 border-red-600/20 border-t-[#e50914] animate-spin" />
                <p className="mt-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Connecting Stream</p>
              </div>
            )}

            {!isTitleBlocked && src && (
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

      {/* STANDARD CINEMA FRAME */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-white/[0.1] shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(229,9,20,0.12)]">
        {/* Aspect Ratio 16:9 Video Canvas */}
        <div
          ref={playerContainerRef}
          className="relative w-full"
          style={{ position: 'relative', paddingTop: '56.25%' }}
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

          {!isTitleBlocked && (isLoading || !src) && !error && (
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
              <div className="h-10 w-10 rounded-full border-3 border-red-600/20 border-t-[#e50914] animate-spin" />
              <p className="mt-3 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Loading {selectedServer.name}…
              </p>
            </div>
          )}

          {!isTitleBlocked && error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/95">
              <div className="flex max-w-md flex-col items-center gap-3 p-6 text-center">
                <AlertCircle className="h-8 w-8 text-amber-400" />
                <p className="text-sm text-slate-200">{error}</p>
                <button
                  onClick={() => handleSelectServer(selectedServerId === 'nxsha' ? 'moviesapi' : 'nxsha')}
                  className="nf-btn nf-btn-red text-xs mt-2"
                >
                  Switch to Backup Server
                </button>
              </div>
            </div>
          )}

          {!isTitleBlocked && src && (
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

        {/* INTEGRATED NETFLIX-STYLE STREAM CONTROL BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-[#0c0d16] px-4 py-3 sm:px-6">
          {/* Left: Stream Info & Current Source */}
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" aria-hidden="true" />
            <div className="text-xs">
              <span className="font-bold text-white">{selectedServer.name}</span>
              <span className="ml-2 font-medium text-slate-400 hidden sm:inline">({selectedServer.badge})</span>
            </div>

            {/* Quick Switch Button / Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowServerMenu((prev) => !prev)}
                className="nf-focus inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold text-slate-300 transition-all hover:border-white/25 hover:bg-white/[0.1] hover:text-white cursor-pointer"
              >
                <Server className="h-3 w-3 text-red-500" />
                <span>Switch Server</span>
              </button>

              {/* Server Dropdown Popover */}
              {showServerMenu && (
                <>
                  <div
                    onClick={() => setShowServerMenu(false)}
                    className="fixed inset-0 z-40 bg-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute left-0 bottom-full mb-2 z-50 w-56 rounded-2xl border border-white/15 bg-[#10111d] p-1.5 shadow-2xl backdrop-blur-2xl animate-fade-up">
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Streaming Sources
                    </p>
                    <div className="space-y-1">
                      {SERVERS.map((server) => {
                        const active = server.id === selectedServerId;
                        return (
                          <button
                            key={server.id}
                            type="button"
                            onClick={() => handleSelectServer(server.id)}
                            className={cn(
                              'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer',
                              active
                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                                : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                            )}
                          >
                            <span>{server.name}</span>
                            <span className="text-[10px] font-normal opacity-80">{server.badge}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Next Episode (if series), Reload, and Fullscreen */}
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

            <button
              onClick={toggleExpanded}
              className="nf-focus flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all hover:border-red-500/40 hover:bg-red-600/20 hover:text-white cursor-pointer"
              title="Theater Fullscreen"
              aria-label="Theater Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
