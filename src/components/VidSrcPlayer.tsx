'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Loader2, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPreferredServer, setPreferredServer } from '@/lib/serverPrefs';
import { ServerSelector } from '@/components/ServerSelector';

export interface Provider {
  id: string;
  name: string;
  badge?: string;
  buildUrl: (params: {
    type: 'movie' | 'tv';
    tmdbId: number;
    imdbId?: string | null;
    season: number;
    episode: number;
    domain?: string;
  }) => string;
}

export const STREAM_PROVIDERS: Provider[] = [
  {
    id: 'vidcore',
    name: 'VidCore',
    badge: 'HD',
    buildUrl: ({ type, tmdbId, season, episode }) => {
      if (type === 'tv') {
        return `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidcore.org/embed/movie/${tmdbId}`;
    },
  },
  {
    id: 'vidsrc-party',
    name: 'VidSrc',
    badge: 'HD',
    buildUrl: ({ type, tmdbId, season, episode }) => {
      if (type === 'tv') {
        return `https://vidsrc.party/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.party/embed/movie/${tmdbId}`;
    },
  },
  {
    id: 'smashystream',
    name: 'SmashyStream',
    badge: 'HD',
    buildUrl: ({ type, tmdbId, season, episode }) => {
      if (type === 'tv') {
        return `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`;
    },
  },
];

interface VidSrcPlayerProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  imdbId?: string | null;
  season?: number;
  episode?: number;
  autoPlay?: boolean;
  title?: string;
}

export function VidSrcPlayer({
  type,
  tmdbId,
  imdbId,
  season = 1,
  episode = 1,
  autoPlay = false,
  title,
}: VidSrcPlayerProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(() => {
    const validIds = STREAM_PROVIDERS.map((p) => p.id);
    return getPreferredServer(type, tmdbId, season, episode, validIds) ?? STREAM_PROVIDERS[0].id;
  });
  const [scannerUrl, setScannerUrl] = useState<string | null>(null);
  const [scannerName, setScannerName] = useState<string>('');
  // Auto-play VidCore on load (unless a saved preference says otherwise).
  // localStorage is only available client-side after mount; reading it during
  // render would cause a hydration mismatch with the server-rendered markup.
  useEffect(() => {
    const validIds = STREAM_PROVIDERS.map((p) => p.id);
    const preferred = getPreferredServer(type, tmdbId, season, episode, validIds);
    const startId = preferred ?? STREAM_PROVIDERS[0].id;
    const startProvider = STREAM_PROVIDERS.find((p) => p.id === startId) ?? STREAM_PROVIDERS[0];
    const startUrl = startProvider.buildUrl({ type, tmdbId, imdbId, season, episode });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage (external store) on mount
    setSelectedProviderId(startId);
    setScannerUrl(startUrl);
    setScannerName(startProvider.name);
  }, [type, tmdbId, imdbId, season, episode]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const currentProvider =
    STREAM_PROVIDERS.find((p) => p.id === selectedProviderId) || STREAM_PROVIDERS[0];

  const handleServerSelect = useCallback(
    (url: string, name: string) => {
      setScannerUrl(url);
      setScannerName(name);
      loadedRef.current = false;
      setIsLoading(true);
      setError(null);
      const match = STREAM_PROVIDERS.find((p) => p.name.toLowerCase() === name.toLowerCase());
      if (match) {
        setSelectedProviderId(match.id);
        setPreferredServer(type, tmdbId, season, episode, match.id);
      }
    },
    [type, tmdbId, season, episode]
  );

  // Reset the "has loaded" ref whenever the streamed title/episode changes
  useEffect(() => {
    loadedRef.current = false;
  }, [type, tmdbId, imdbId, season, episode]);

  // Drop the loading badge quickly if the iframe silently finishes (some embeds suppress onLoad)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [selectedProviderId, type, tmdbId, imdbId, season, episode, reloadNonce]);

  const handleReload = useCallback(() => {
    loadedRef.current = false;
    setIsLoading(true);
    setError(null);
    setReloadNonce((n) => n + 1);
  }, []);

  const buildSrc = useCallback(() => {
    const url = new URL(currentProvider.buildUrl({
      type,
      tmdbId,
      imdbId,
      season,
      episode,
    }));
    if (autoPlay) url.searchParams.set('autoplay', '1');
    return url.toString();
  }, [currentProvider, type, tmdbId, imdbId, season, episode, autoPlay]);

  const handleIframeLoad = () => {
    loadedRef.current = true;
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    loadedRef.current = true;
    setIsLoading(false);
    setError(`Failed to load stream from ${currentProvider.name}. Try switching provider.`);
  };

  const switchProvider = useCallback((direction: 'next' | 'prev' | string) => {
    let nextId = direction;
    if (direction === 'next' || direction === 'prev') {
      const currentIndex = STREAM_PROVIDERS.findIndex((p) => p.id === selectedProviderId);
      const nextIndex =
        direction === 'next'
          ? (currentIndex + 1) % STREAM_PROVIDERS.length
          : (currentIndex - 1 + STREAM_PROVIDERS.length) % STREAM_PROVIDERS.length;
      nextId = STREAM_PROVIDERS[nextIndex].id;
    }
    setSelectedProviderId(nextId);
    loadedRef.current = false;
    setIsLoading(true);
    setError(null);
    // A deliberate manual server change is the trustworthy signal that the
    // previous server didn't work — remember this one for this title/episode.
    setPreferredServer(type, tmdbId, season, episode, nextId);
  }, [selectedProviderId, type, tmdbId, season, episode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Our own fullscreen — fullscreens OUR container (not the provider's internal
  // player), so it works even when the provider's own button is blocked.
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerContainerRef.current?.requestFullscreen().catch(() => {});
    }
  }, []);

  // Only a manual server pick starts a stream — nothing auto-plays
  const src = scannerUrl || '';
  const displayName = scannerUrl ? scannerName || currentProvider.name : currentProvider.name;

  return (
    <div id="video-player" className="w-full min-w-0 scroll-mt-36 space-y-3 md:scroll-mt-24">
      {/* Manual server selector — VidCore first, auto-plays on load */}
      <ServerSelector
        type={type}
        tmdbId={tmdbId}
        season={season}
        episode={episode}
        activeName={scannerName}
        onSelect={handleServerSelect}
      />
      <div className="flex flex-wrap items-center justify-end gap-2 pb-1">
        {/* Server Actions outside video player: Reload */}
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
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Frame — responsive 16:9 container, auto-scales with parent width */}
      <div
        ref={playerContainerRef}
        className={cn('relative bg-black rounded-xl overflow-hidden w-full shadow-2xl border border-slate-800')}
        style={{ position: 'relative', paddingTop: '56.25%' }}
        role="region"
        aria-label={`${title || 'Video'} player`}
      >
        {/* Loading badge — shows while the server loads */}
        {(isLoading || !src) && !error && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-white shadow-lg">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            <span className="text-xs font-medium text-slate-200">
              {!src ? currentProvider.name : displayName}
            </span>
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
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Reload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Video Iframe - sandboxed; only rendered once a server is picked */}
        {src && (
          <iframe
            key={`${selectedProviderId}-${src}-${reloadNonce}`}
            ref={iframeRef}
            src={src}
            title={`${title || 'Stream'} - ${type === 'movie' ? 'Movie' : `S${season}E${episode}`}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            loading="eager"
            referrerPolicy="no-referrer"
            // sandbox must explicitly allow fullscreen or the provider's
            // fullscreen button silently does nothing
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>
    </div>
  );
}